import moment from 'moment';

import RunebaseChromeController from '.';
import IController from './iController';
import { MESSAGE_TYPE } from '../../constants';
import Transaction from '../../models/Transaction';
import RRCToken from '../../models/RRCToken';
import { addressToHash160, hash160ToAddress } from '../../services/wallet';
import { addMessageListener, isExtensionEnvironment, sendMessage } from '../../popup/abstraction';
import txCacheDB, { CachedTransaction, CachedTokenTransfer } from '../../services/db/TransactionCache';
import type { ElectrumXTransaction, ElectrumXVout } from '../../services/electrumx/types';

const PAGE_SIZE = 10;
const TOKEN_PAGE_SIZE = 20;

export default class TransactionController extends IController {
  private static GET_TX_INTERVAL_MS: number = 60000;

  public transactions: Transaction[] = [];
  public tokenTransfers: any[] = [];
  public pageNum: number = 0;
  public pagesTotal?: number;
  public totalTransactions: number = 0;
  public get hasMore(): boolean {
    return !!this.pagesTotal && (this.pagesTotal > this.pageNum + 1);
  }

  // Token transfer pagination
  private allTokenTransfers: any[] = [];
  private tokenPageNum: number = 0;
  public get hasMoreTokenTransfers(): boolean {
    return this.allTokenTransfers.length > (this.tokenPageNum + 1) * TOKEN_PAGE_SIZE;
  }

  private getTransactionsInterval?: any = undefined;

  constructor(main: RunebaseChromeController) {
    super('transaction', main);

    addMessageListener(this.handleMessage);
    this.initFinished();
  }

  public addTransaction = (transaction: Transaction) => {
    this.transactions.unshift(transaction);
    this.totalTransactions += 1;
    this.sendTransactionsMessage();
  };

  public fetchFirst = async () => {
    this.pageNum = 0;
    this.tokenPageNum = 0;
    this.transactions = await this.fetchTransactions(PAGE_SIZE, 0);
    this.sendTransactionsMessage();
    await this.fetchTokenTransfers();
  };

  public fetchMore = async () => {
    this.pageNum = this.pageNum + 1;
    const txs = await this.fetchTransactions(PAGE_SIZE, this.pageNum * PAGE_SIZE);
    this.transactions = this.transactions.concat(txs);
    this.sendTransactionsMessage();
  };

  public fetchMoreTokenTransfers = () => {
    this.tokenPageNum += 1;
    this.tokenTransfers = this.allTokenTransfers.slice(
      0, (this.tokenPageNum + 1) * TOKEN_PAGE_SIZE,
    );
    this.sendTokenTransfersMessage();
  };

  public stopPolling = () => {
    if (this.getTransactionsInterval) {
      clearInterval(this.getTransactionsInterval);
      this.getTransactionsInterval = undefined;
      this.pageNum = 0;
      this.tokenPageNum = 0;
    }
  };

  /**
   * Optimized refresh: only re-resolve unconfirmed txs and the first page
   * (to pick up new txs). Confirmed txs are served from cache.
   */
  private refreshTransactions = async () => {
    // Re-fetch only first page fully (picks up new txs)
    const firstPage = await this.fetchTransactions(PAGE_SIZE, 0);

    // For remaining loaded pages, use cache for confirmed txs
    let refreshedItems: Transaction[] = [...firstPage];
    if (this.pageNum > 0) {
      for (let i = 1; i <= this.pageNum; i++) {
        const pageTxs = await this.fetchTransactions(PAGE_SIZE, i * PAGE_SIZE);
        refreshedItems = refreshedItems.concat(pageTxs);
      }
    }

    this.transactions = refreshedItems;
    this.sendTransactionsMessage();
    // Also refresh token transfers
    await this.fetchTokenTransfers();
  };

  private startPolling = async () => {
    this.fetchFirst();
    if (!this.getTransactionsInterval) {
      this.getTransactionsInterval = setInterval(() => {
        this.refreshTransactions();
      }, TransactionController.GET_TX_INTERVAL_MS);
    }
  };

  // ─── Regular Transactions ─────────────────────────────────────

  private fetchTransactions = async (
    limit: number = PAGE_SIZE,
    offset: number = 0
  ): Promise<Transaction[]> => {
    if (
      !this.main.account.loggedInAccount ||
      !this.main.account.loggedInAccount.wallet
    ) {
      console.error('Cannot get transactions without a wallet instance.');
      return [];
    }

    const wallet = this.main.account.loggedInAccount.wallet;
    const electrumx = this.main.network.electrumx;
    if (!electrumx) {
      console.error('ElectrumX not connected.');
      return [];
    }

    const walletAddress = wallet.address;

    const { totalCount, transactions } = await wallet.getTransactionHistory(
      electrumx,
      limit,
      offset,
    );

    this.totalTransactions = totalCount;
    this.pagesTotal = Math.ceil(totalCount / PAGE_SIZE);

    const now = Date.now();
    const result: Transaction[] = [];
    const toCache: CachedTransaction[] = [];

    for (const tx of transactions) {
      result.push(new Transaction({
        id: tx.txid,
        timestamp: tx.time
          ? moment(new Date(tx.time * 1000)).format('MM-DD-YYYY, HH:mm')
          : moment().format('MM-DD-YYYY, HH:mm'),
        confirmations: tx.confirmations || 0,
        amount: tx.amount,
        fee: tx.fee,
        isStake: tx.isStake || false,
      }));

      // Cache confirmed txs to Dexie
      toCache.push({
        txid: tx.txid,
        walletAddress,
        amount: tx.amount,
        fee: tx.fee,
        time: tx.time,
        confirmations: tx.confirmations || 0,
        height: tx.height || 0,
        cachedAt: now,
        isStake: tx.isStake || false,
      });
    }

    // Write cache in background (don't block UI)
    if (toCache.length > 0) {
      txCacheDB.putTxBatch(toCache)
        .then(() => txCacheDB.evictOldTxs(walletAddress))
        .catch((err) => console.warn('TX cache write failed:', err));
    }

    return result;
  };

  // ─── Token Transfers ──────────────────────────────────────────

  /**
   * Fetch QRC20 Transfer events for all tracked tokens.
   * Uses Dexie cache for confirmed transfers to avoid redundant RPC calls.
   * Only re-decodes unconfirmed (mempool) events and newly seen events.
   */
  private fetchTokenTransfers = async () => {
    const wallet = this.main.account.loggedInAccount?.wallet;
    const electrumx = this.main.network.electrumx;
    const tokens = this.main.token.tokens;
    if (!wallet || !electrumx || !tokens || tokens.length === 0) {
      this.allTokenTransfers = [];
      this.tokenTransfers = [];
      this.sendTokenTransfersMessage();
      return;
    }

    const network = this.main.network.runebaseNetwork;
    const walletAddress = wallet.address;
    const walletHash160 = addressToHash160(walletAddress);
    const transferTopic =
      'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

    // Load existing cache into a lookup map
    let cachedMap = new Map<string, CachedTokenTransfer>();
    try {
      const cached = await txCacheDB.getCachedTokenTransfers(walletAddress);
      for (const entry of cached) {
        cachedMap.set(entry.id, entry);
      }
    } catch {
      cachedMap = new Map();
    }

    const allTransfers: Array<{
      id: string;
      timestamp: string;
      confirmations: number;
      height: number;
      from: string;
      to: string;
      value: string;
      symbol: string;
      name: string;
      decimals: number;
      tokenAddress: string;
    }> = [];

    const newCacheEntries: CachedTokenTransfer[] = [];
    const now = Date.now();

    for (const token of tokens) {
      try {
        const events = await electrumx.getContractEventHistory(
          walletHash160,
          token.address,
          transferTopic,
        );
        if (!events || events.length === 0) continue;

        // Batch: collect events that need decoding vs those from cache
        const toDecode: Array<{ tx_hash: string; height: number; log_index: number }> = [];
        const fromCache: typeof allTransfers = [];

        for (const event of events) {
          const cacheKey = `${event.tx_hash}:${event.log_index}`;
          const cached = cachedMap.get(cacheKey);

          // Use cache if confirmed (height > 0) and we have a cached entry
          if (cached && event.height > 0 && cached.height > 0) {
            fromCache.push({
              id: cached.txid,
              timestamp: cached.time
                ? moment(new Date(cached.time * 1000)).format('MM-DD-YYYY, HH:mm')
                : moment().format('MM-DD-YYYY, HH:mm'),
              confirmations: cached.confirmations,
              height: cached.height,
              from: cached.from,
              to: cached.to,
              value: cached.value,
              symbol: cached.symbol,
              name: cached.name,
              decimals: cached.decimals,
              tokenAddress: cached.tokenAddress,
            });
          } else {
            toDecode.push(event);
          }
        }

        allTransfers.push(...fromCache);

        // Batch-decode remaining events (unconfirmed or newly seen)
        // Process in parallel batches of 5 to avoid overwhelming the server
        for (let i = 0; i < toDecode.length; i += 5) {
          const batch = toDecode.slice(i, i + 5);
          const results = await Promise.allSettled(
            batch.map((event) =>
              this.decodeTransferEvent(event, token, network, transferTopic)
            ),
          );
          for (let j = 0; j < results.length; j++) {
            const result = results[j];
            if (result.status === 'fulfilled' && result.value) {
              allTransfers.push(result.value);
              // Cache confirmed entries
              const event = batch[j];
              if (event.height > 0) {
                newCacheEntries.push({
                  id: `${event.tx_hash}:${event.log_index}`,
                  walletAddress,
                  txid: event.tx_hash,
                  logIndex: event.log_index,
                  height: event.height,
                  from: result.value.from,
                  to: result.value.to,
                  value: result.value.value,
                  symbol: result.value.symbol,
                  name: result.value.name,
                  decimals: result.value.decimals,
                  tokenAddress: result.value.tokenAddress,
                  time: result.value.timestamp
                    ? moment(result.value.timestamp, 'MM-DD-YYYY, HH:mm').unix()
                    : undefined,
                  confirmations: result.value.confirmations,
                  cachedAt: now,
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn(
          `Failed to fetch token history for ${token.symbol}:`, err,
        );
      }
    }

    // Write new cache entries in background
    if (newCacheEntries.length > 0) {
      txCacheDB.putTokenTransferBatch(newCacheEntries)
        .then(() => txCacheDB.evictOldTokenTransfers(walletAddress))
        .catch((err) => console.warn('Token transfer cache write failed:', err));
    }

    // Sort newest first (highest height first, 0 = mempool goes to top)
    allTransfers.sort((a, b) => {
      if (a.height === 0 && b.height !== 0) return -1;
      if (b.height === 0 && a.height !== 0) return 1;
      return b.height - a.height;
    });

    this.allTokenTransfers = allTransfers;
    // Apply pagination: show first N pages
    this.tokenTransfers = allTransfers.slice(
      0, (this.tokenPageNum + 1) * TOKEN_PAGE_SIZE,
    );
    this.sendTokenTransfersMessage();
  };

  /**
   * Decode a single Transfer event from its tx receipt.
   */
  private decodeTransferEvent = async (
    event: { tx_hash: string; height: number; log_index: number },
    token: RRCToken,
    network: any,
    transferTopic: string,
  ) => {
    const electrumx = this.main.network.electrumx;
    if (!electrumx) return null;

    const receipt = await electrumx.getTransactionReceipt(
      event.tx_hash,
    ) as any;

    // Receipt is an array of contract calls
    const calls = Array.isArray(receipt) ? receipt : [receipt];
    for (const call of calls) {
      const logs = call?.log || [];
      for (const log of logs) {
        const topics = log.topics || [];
        if (topics[0] !== transferTopic) continue;
        if (log.address !== token.address) continue;

        const fromH160 = topics[1]?.substring(24, 64);
        const toH160 = topics[2]?.substring(24, 64);
        const value = log.data
          ? BigInt('0x' + log.data).toString()
          : '0';

        let fromAddr = '';
        let toAddr = '';
        try {
          if (fromH160 && fromH160 !== '0'.repeat(40)) {
            fromAddr = hash160ToAddress(fromH160, network);
          }
        } catch { /* mint */ }
        try {
          if (toH160 && toH160 !== '0'.repeat(40)) {
            toAddr = hash160ToAddress(toH160, network);
          }
        } catch { /* burn */ }

        // Get timestamp from verbose tx
        let timestamp = moment().format('MM-DD-YYYY, HH:mm');
        let confirmations = 0;
        try {
          const verboseTx = await electrumx.getTransaction(
            event.tx_hash, true,
          ) as any;
          if (verboseTx?.time) {
            timestamp = moment(new Date(verboseTx.time * 1000))
              .format('MM-DD-YYYY, HH:mm');
          }
          confirmations = verboseTx?.confirmations || 0;
        } catch { /* use defaults */ }

        return {
          id: event.tx_hash,
          timestamp,
          confirmations,
          height: event.height,
          from: fromAddr,
          to: toAddr,
          value,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          tokenAddress: token.address,
        };
      }
    }
    return null;
  };

  // ─── Transaction Detail (on-demand vin/vout) ─────────────────

  /**
   * Fetch full transaction details including resolved inputs and outputs.
   * Inputs require fetching the referenced previous transactions to get
   * the address and value (ElectrumX vin only provides txid + vout index).
   */
  private fetchTxDetail = async (txid: string) => {
    const electrumx = this.main.network.electrumx;
    if (!electrumx) {
      sendMessage({ type: MESSAGE_TYPE.GET_TX_DETAIL_RETURN, detail: null }, () => {});
      return;
    }

    try {
      const raw = await electrumx.getTransaction(txid, true);
      if (typeof raw === 'string' || !raw) {
        sendMessage({ type: MESSAGE_TYPE.GET_TX_DETAIL_RETURN, detail: null }, () => {});
        return;
      }
      const tx = raw as ElectrumXTransaction;

      const getVoutAddress = (vout: ElectrumXVout): string =>
        vout.scriptPubKey?.address || vout.scriptPubKey?.addresses?.[0] || '';

      // ── Resolve outputs (already have address + value) ──
      const outputs = (tx.vout || []).map((vout) => ({
        address: getVoutAddress(vout),
        value: Math.round(Number(vout.value || 0) * 1e8), // satoshi
        index: vout.n,
        type: vout.scriptPubKey?.type || '',
        scriptHex: vout.scriptPubKey?.hex || '',
      }));

      // ── Resolve inputs (need to fetch previous txs) ──
      const prevTxids = [...new Set(
        (tx.vin || [])
          .filter((vin) => vin.txid) // skip coinbase inputs
          .map((vin) => vin.txid),
      )];

      const prevTxMap = new Map<string, ElectrumXTransaction>();
      if (prevTxids.length > 0) {
        const results = await Promise.allSettled(
          prevTxids.map((id) => electrumx.getTransaction(id, true)),
        );
        results.forEach((result, idx) => {
          if (result.status === 'fulfilled' && typeof result.value !== 'string') {
            prevTxMap.set(prevTxids[idx], result.value as ElectrumXTransaction);
          }
        });
      }

      const inputs = (tx.vin || []).map((vin) => {
        if (!vin.txid) {
          // Coinbase input
          return { address: 'Coinbase', value: 0, prevTxid: '', prevIndex: 0 };
        }
        const prevTx = prevTxMap.get(vin.txid);
        const prevVout = prevTx?.vout?.[vin.vout];
        return {
          address: prevVout ? getVoutAddress(prevVout) : '',
          value: prevVout ? Math.round(Number(prevVout.value || 0) * 1e8) : 0,
          prevTxid: vin.txid,
          prevIndex: vin.vout,
        };
      });

      sendMessage({
        type: MESSAGE_TYPE.GET_TX_DETAIL_RETURN,
        detail: JSON.stringify({ inputs, outputs }),
      }, () => {});
    } catch (err) {
      console.error('fetchTxDetail failed:', err);
      sendMessage({ type: MESSAGE_TYPE.GET_TX_DETAIL_RETURN, detail: null }, () => {});
    }
  };

  // ─── Messaging ────────────────────────────────────────────────

  private sendTransactionsMessage = () => {
    const stringified = this.transactions.map(
      (transaction) => ({ ...transaction }),
    );
    sendMessage({
      type: MESSAGE_TYPE.GET_TXS_RETURN,
      transactions: JSON.stringify(stringified),
      hasMore: this.hasMore,
    }, () => {});
  };

  private sendTokenTransfersMessage = () => {
    sendMessage({
      type: MESSAGE_TYPE.GET_TOKEN_TXS_RETURN,
      tokenTransfers: JSON.stringify(this.tokenTransfers),
      hasMoreTokenTransfers: this.hasMoreTokenTransfers,
    }, () => {});
  };

  private handleMessage = (request: any) => {
    const requestData = isExtensionEnvironment() ? request : request.data;
    try {
      switch (requestData.type) {
      case MESSAGE_TYPE.START_TX_POLLING:
        this.startPolling();
        break;
      case MESSAGE_TYPE.STOP_TX_POLLING:
        this.stopPolling();
        break;
      case MESSAGE_TYPE.GET_MORE_TXS:
        this.fetchMore();
        break;
      case MESSAGE_TYPE.GET_MORE_TOKEN_TXS:
        this.fetchMoreTokenTransfers();
        break;
      case MESSAGE_TYPE.GET_TX_DETAIL:
        this.fetchTxDetail(requestData.txid);
        break;
      default:
        break;
      }
    } catch (err) {
      this.main.displayErrorOnPopup(err as any);
    }
  };
}
