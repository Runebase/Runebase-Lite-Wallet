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

  // Event callbacks
  public onConnected?: (server: ElectrumXServerConfig) => void;
  public onDisconnected?: (reason?: string) => void;
  public onError?: (error: Error) => void;
  public onServerChanged?: (server: ElectrumXServerConfig) => void;

  constructor(servers: ElectrumXServerConfig[]) {
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
   */
  async connect(preferredIndex?: number): Promise<void> {
    this._state = 'connecting';

    // Build ordered list: preferred first, then the rest
    const indices: number[] = [];
    if (preferredIndex !== undefined && preferredIndex >= 0 && preferredIndex < this.servers.length) {
      indices.push(preferredIndex);
    }
    for (let i = 0; i < this.servers.length; i++) {
      if (!indices.includes(i)) indices.push(i);
    }

    for (const idx of indices) {
      try {
        await this.connectToServer(idx);
        return;
      } catch (err) {
        console.warn(`ElectrumX: Failed to connect to ${this.servers[idx].host}:${this.servers[idx].port}:`, err);
      }
    }

    this._state = 'disconnected';
    throw new Error('Failed to connect to any ElectrumX server');
  }

  /**
   * Manually switch to a specific server by index.
   */
  async switchServer(index: number): Promise<void> {
    if (index < 0 || index >= this.servers.length) {
      throw new Error(`Invalid server index: ${index}`);
    }

    if (this.activeClient) {
      await this.activeClient.disconnect();
      this.activeClient = null;
    }

    await this.connectToServer(index);
    this.onServerChanged?.(this.servers[index]);
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
      // Try to reconnect/failover
      await this.failover();
    }

    try {
      return await this.activeClient!.request(method, params);
    } catch (_err) {
      console.warn(`ElectrumX: Request failed (${method}), attempting failover...`);
      await this.failover();
      // Retry once on new connection
      return await this.activeClient!.request(method, params);
    }
  }

  private async connectToServer(index: number): Promise<void> {
    const config = this.servers[index];
    const client = new ElectrumXClient(config);

    client.onDisconnected = (reason) => {
      console.warn(`ElectrumX: Disconnected from ${config.host}: ${reason}`);
      if (this._state === 'connected') {
        this._state = 'reconnecting';
        this.onDisconnected?.(reason);
        // Auto-failover
        this.failover().catch((err) => {
          console.error('ElectrumX: Failover failed:', err);
          this._state = 'disconnected';
        });
      }
    };

    client.onError = (error) => {
      this.onError?.(error);
    };

    await client.connect();

    // Negotiate protocol version
    await client.request('server.version', ['RunebaseLiteWallet', this.protocolVersion]);

    // Success - set as active
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
    this._state = 'reconnecting';

    // Try all servers except the current one
    for (let i = 0; i < this.servers.length; i++) {
      const idx = (this.activeServerIndex + 1 + i) % this.servers.length;
      try {
        await this.connectToServer(idx);
        console.log(`ElectrumX: Failover to ${this.servers[idx].host}:${this.servers[idx].port}`);
        this.onServerChanged?.(this.servers[idx]);
        return;
      } catch (_err) {
        console.warn(`ElectrumX: Failover attempt to ${this.servers[idx].host} failed`);
      }
    }

    this._state = 'disconnected';
    throw new Error('All ElectrumX servers unavailable');
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
