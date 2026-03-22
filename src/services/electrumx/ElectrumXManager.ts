// ElectrumX Multi-Server Manager with failover and manual server selection
import ElectrumXClient from './ElectrumXClient';
import {
  ElectrumXServerConfig,
  ElectrumXBalance,
  ElectrumXUtxo,
  ElectrumXHistoryItem,
  ElectrumXTransaction,
  ElectrumXContractCallResult,
  ElectrumXTokenInfo,
  ElectrumXEventHistoryItem,
  ElectrumXPaginatedHistory,
  ElectrumXServerFeatures,
  ElectrumXHeaderNotification,
  SubscriptionCallback,
} from './types';

export type ManagerState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export default class ElectrumXManager {
  private servers: ElectrumXServerConfig[];
  private activeClient: ElectrumXClient | null = null;
  private activeServerIndex = -1;
  private _state: ManagerState = 'disconnected';
  private subscriptionRegistry: Array<{ method: string; callback: SubscriptionCallback }> = [];
  private protocolVersion: [string, string] = ['1.4', '1.4.2'];
  // Prevents concurrent connect/failover attempts
  private connectingPromise: Promise<void> | null = null;
  // Cooldown: don't retry failover within this window after a failure
  private lastFailoverFailedAt = 0;
  private static FAILOVER_COOLDOWN_MS = 15000;
  // Auto-reconnect timer
  private autoReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private static AUTO_RECONNECT_DELAY_MS = 3000;

  // Event callbacks
  public onConnected?: (server: ElectrumXServerConfig) => void;
  public onDisconnected?: (reason?: string) => void;
  public onError?: (error: Error) => void;
  public onServerChanged?: (server: ElectrumXServerConfig) => void;

  constructor(servers: ElectrumXServerConfig[]) {
    console.log('[BUILD-CHECK] ElectrumXManager v2 loaded');
    if (servers.length === 0) {
      throw new Error('At least one server must be provided');
    }
    this.servers = [...servers];
  }

  get state(): ManagerState {
    return this._state;
  }

  get currentServer(): ElectrumXServerConfig | null {
    return this.activeServerIndex >= 0 ? this.servers[this.activeServerIndex] : null;
  }

  get serverList(): ElectrumXServerConfig[] {
    return [...this.servers];
  }

  get currentServerIndex(): number {
    return this.activeServerIndex;
  }

  /**
   * Connect to the first available server in the list.
   * If preferredIndex is given, try that server first.
   * Concurrent calls share the same connection attempt.
   */
  async connect(preferredIndex?: number): Promise<void> {
    // If a connection attempt is already in progress, wait for it
    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    this.connectingPromise = this.doConnect(preferredIndex);
    try {
      await this.connectingPromise;
    } finally {
      this.connectingPromise = null;
    }
  }

  private async doConnect(preferredIndex?: number): Promise<void> {
    this._state = 'connecting';

    const indices: number[] = [];
    if (
      preferredIndex !== undefined
      && preferredIndex >= 0
      && preferredIndex < this.servers.length
    ) {
      indices.push(preferredIndex);
    }
    for (let i = 0; i < this.servers.length; i++) {
      if (!indices.includes(i)) indices.push(i);
    }

    const failures: string[] = [];
    for (const idx of indices) {
      try {
        await this.connectToServer(idx);
        return;
      } catch (_err) {
        failures.push(this.servers[idx].label
          || this.servers[idx].host);
      }
    }

    this._state = 'disconnected';
    console.warn(
      `ElectrumX: All servers failed: ${failures.join(', ')}`,
    );
    throw new Error('Failed to connect to any ElectrumX server');
  }

  /**
   * Manually switch to a specific server by index.
   * Keeps the old connection alive until the new one succeeds,
   * so a failed switch doesn't leave the user disconnected.
   */
  async switchServer(index: number): Promise<void> {
    if (index < 0 || index >= this.servers.length) {
      throw new Error(`Invalid server index: ${index}`);
    }

    const previousClient = this.activeClient;
    const previousIndex = this.activeServerIndex;

    try {
      // Connect to new server first (connectToServer will disconnect
      // the old activeClient internally once the new one succeeds)
      await this.connectToServer(index);
      this.onServerChanged?.(this.servers[index]);
    } catch (_err) {
      // New server failed — restore previous connection if we had one
      if (previousClient && previousClient.state === 'connected') {
        this.activeClient = previousClient;
        this.activeServerIndex = previousIndex;
        this._state = 'connected';
        this.reattachSubscriptions();
      }
      const serverLabel = this.servers[index].label || `${this.servers[index].host}:${this.servers[index].port}`;
      const restoredMsg = previousClient && previousClient.state === 'connected'
        ? ` Staying connected to ${this.servers[previousIndex].label || 'previous server'}.`
        : '';
      throw new Error(`Could not connect to ${serverLabel}. The server may be offline or unreachable.${restoredMsg}`);
    }
  }

  /**
   * Add a new server to the list.
   */
  addServer(server: ElectrumXServerConfig): number {
    this.servers.push(server);
    return this.servers.length - 1;
  }

  /**
   * Remove a server from the list. Cannot remove the active server.
   */
  removeServer(index: number): void {
    if (index === this.activeServerIndex) {
      throw new Error('Cannot remove the currently active server');
    }
    this.servers.splice(index, 1);
    if (this.activeServerIndex > index) {
      this.activeServerIndex--;
    }
  }

  async disconnect(): Promise<void> {
    this.cancelAutoReconnect();
    if (this.activeClient) {
      await this.activeClient.disconnect();
      this.activeClient = null;
    }
    this.activeServerIndex = -1;
    this._state = 'disconnected';
  }

  // ─── ElectrumX API Methods ───────────────────────────────────────

  async getBalance(scripthash: string): Promise<ElectrumXBalance> {
    return await this.call('blockchain.scripthash.get_balance', [scripthash]) as ElectrumXBalance;
  }

  async listUnspent(scripthash: string): Promise<ElectrumXUtxo[]> {
    return await this.call('blockchain.scripthash.listunspent', [scripthash]) as ElectrumXUtxo[];
  }

  async getHistory(scripthash: string): Promise<ElectrumXHistoryItem[]> {
    return await this.call('blockchain.scripthash.get_history', [scripthash]) as ElectrumXHistoryItem[];
  }

  /**
   * Paginated history. Returns { items, total } where total is the full
   * confirmed history count and items is the requested page.
   * Server caps limit at 200 per request.
   */
  async getHistoryPaginated(
    scripthash: string,
    limit: number,
    offset: number,
  ): Promise<ElectrumXPaginatedHistory<ElectrumXHistoryItem>> {
    return await this.call('blockchain.scripthash.get_history', [
      scripthash, limit, offset,
    ]) as ElectrumXPaginatedHistory<ElectrumXHistoryItem>;
  }

  async getMempool(scripthash: string): Promise<ElectrumXHistoryItem[]> {
    return await this.call('blockchain.scripthash.get_mempool', [scripthash]) as ElectrumXHistoryItem[];
  }

  async getTransaction(txHash: string, verbose = true): Promise<ElectrumXTransaction | string> {
    return await this.call('blockchain.transaction.get', [txHash, verbose]) as ElectrumXTransaction | string;
  }

  async broadcastTransaction(rawTx: string): Promise<string> {
    return await this.call('blockchain.transaction.broadcast', [rawTx]) as string;
  }

  async estimateFee(blocks: number): Promise<number> {
    return await this.call('blockchain.estimatefee', [blocks]) as number;
  }

  async relayFee(): Promise<number> {
    return await this.call('blockchain.relayfee') as number;
  }

  async getBlockHeader(height: number): Promise<string> {
    return await this.call('blockchain.block.header', [height]) as string;
  }

  async contractCall(
    address: string,
    data: string,
    sender = '',
  ): Promise<ElectrumXContractCallResult> {
    return await this.call('blockchain.contract.call', [address, data, sender]) as ElectrumXContractCallResult;
  }

  async getTransactionReceipt(txid: string): Promise<unknown> {
    // Note: method name has typo in ElectrumX Runebase implementation
    return await this.call('blochchain.transaction.get_receipt', [txid]);
  }

  async getTokenInfo(tokenAddress: string): Promise<ElectrumXTokenInfo> {
    return await this.call('blockchain.token.get_info', [tokenAddress]) as ElectrumXTokenInfo;
  }

  async getContractEventHistory(
    hash160: string,
    contractAddr: string,
    topic: string,
  ): Promise<ElectrumXEventHistoryItem[]> {
    return await this.call('blockchain.contract.event.get_history', [hash160, contractAddr, topic]) as ElectrumXEventHistoryItem[];
  }

  /**
   * Paginated contract event history. Returns { items, total }.
   * Server caps limit at 200 per request.
   */
  async getContractEventHistoryPaginated(
    hash160: string,
    contractAddr: string,
    topic: string,
    limit: number,
    offset: number,
  ): Promise<ElectrumXPaginatedHistory<ElectrumXEventHistoryItem>> {
    return await this.call('blockchain.contract.event.get_history', [
      hash160, contractAddr, topic, limit, offset,
    ]) as ElectrumXPaginatedHistory<ElectrumXEventHistoryItem>;
  }

  async getServerFeatures(): Promise<ElectrumXServerFeatures> {
    return await this.call('server.features') as ElectrumXServerFeatures;
  }

  async getServerBanner(): Promise<string> {
    return await this.call('server.banner') as string;
  }

  // ─── Subscriptions ───────────────────────────────────────────────

  async subscribeScripthash(scripthash: string, callback: SubscriptionCallback): Promise<string | null> {
    this.registerSubscription('blockchain.scripthash.subscribe', callback);
    return await this.call('blockchain.scripthash.subscribe', [scripthash]) as string | null;
  }

  async unsubscribeScripthash(scripthash: string): Promise<boolean> {
    return await this.call('blockchain.scripthash.unsubscribe', [scripthash]) as boolean;
  }

  async subscribeHeaders(callback: SubscriptionCallback): Promise<ElectrumXHeaderNotification> {
    this.registerSubscription('blockchain.headers.subscribe', callback);
    return await this.call('blockchain.headers.subscribe') as ElectrumXHeaderNotification;
  }

  async subscribeContractEvent(
    hash160: string,
    contractAddr: string,
    topic: string,
    callback: SubscriptionCallback,
  ): Promise<string | null> {
    this.registerSubscription('blockchain.contract.event.subscribe', callback);
    return await this.call('blockchain.contract.event.subscribe', [hash160, contractAddr, topic]) as string | null;
  }

  // ─── Internal ────────────────────────────────────────────────────

  private async call(method: string, params: unknown[] = []): Promise<unknown> {
    if (!this.activeClient || this.activeClient.state !== 'connected') {
      // Attempt failover before failing — this handles the case where the
      // server went offline and a poll/data request arrives before or
      // during the auto-reconnect timer.
      await this.failover();
    }

    return await this.activeClient!.request(method, params);
  }

  private async connectToServer(index: number): Promise<void> {
    const config = this.servers[index];
    const client = new ElectrumXClient(config);

    client.onDisconnected = (reason) => {
      console.warn(`ElectrumX: Disconnected from ${config.host}: ${reason}`);
      if (this.activeClient === client && this._state === 'connected') {
        this._state = 'disconnected';
        this.onDisconnected?.(reason);
        this.scheduleAutoReconnect();
      }
    };

    client.onError = (error) => {
      this.onError?.(error);
    };

    await client.connect();

    // Negotiate protocol version
    await client.request('server.version', ['RunebaseLiteWallet', this.protocolVersion]);

    // Success - set as active
    this.cancelAutoReconnect();
    if (this.activeClient) {
      await this.activeClient.disconnect();
    }
    this.activeClient = client;
    this.activeServerIndex = index;
    this._state = 'connected';

    // Re-register subscriptions on the new connection
    this.reattachSubscriptions();

    this.onConnected?.(config);
  }

  private async failover(): Promise<void> {
    // If a connection attempt is already in progress, wait for it
    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    // Don't retry if we recently failed — prevents rapid reconnect spam
    const elapsed = Date.now() - this.lastFailoverFailedAt;
    if (elapsed < ElectrumXManager.FAILOVER_COOLDOWN_MS) {
      throw new Error('All ElectrumX servers unavailable (cooldown)');
    }

    this.connectingPromise = this.doFailover();
    try {
      await this.connectingPromise;
      // Success — reset cooldown
      this.lastFailoverFailedAt = 0;
    } catch (err) {
      this.lastFailoverFailedAt = Date.now();
      throw err;
    } finally {
      this.connectingPromise = null;
    }
  }

  private async doFailover(): Promise<void> {
    this._state = 'reconnecting';

    for (let i = 0; i < this.servers.length; i++) {
      const idx = (this.activeServerIndex + 1 + i) % this.servers.length;
      try {
        await this.connectToServer(idx);
        this.onServerChanged?.(this.servers[idx]);
        return;
      } catch (_err) {
        console.warn(
          `ElectrumX: Failover to ${this.servers[idx].host} failed`,
        );
      }
    }

    this._state = 'disconnected';
    throw new Error('All ElectrumX servers unavailable');
  }

  private scheduleAutoReconnect(): void {
    // Don't stack multiple timers
    if (this.autoReconnectTimer) return;

    console.log(`ElectrumX: Auto-reconnect in ${ElectrumXManager.AUTO_RECONNECT_DELAY_MS}ms`);
    this.autoReconnectTimer = setTimeout(async () => {
      this.autoReconnectTimer = null;
      // Only reconnect if still disconnected (not manually reconnected)
      if (this._state !== 'disconnected') return;

      try {
        await this.failover();
        console.log(`ElectrumX: Auto-reconnected to ${this.currentServer?.host}`);
      } catch (_err) {
        console.warn('ElectrumX: Auto-reconnect failed, will retry');
        this.scheduleAutoReconnect();
      }
    }, ElectrumXManager.AUTO_RECONNECT_DELAY_MS);
  }

  private cancelAutoReconnect(): void {
    if (this.autoReconnectTimer) {
      clearTimeout(this.autoReconnectTimer);
      this.autoReconnectTimer = null;
    }
  }

  private registerSubscription(method: string, callback: SubscriptionCallback): void {
    this.subscriptionRegistry.push({ method, callback });
    this.activeClient?.subscribe(method, callback);
  }

  private reattachSubscriptions(): void {
    for (const { method, callback } of this.subscriptionRegistry) {
      this.activeClient?.subscribe(method, callback);
    }
  }
}
