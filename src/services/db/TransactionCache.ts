import Dexie, { type Table } from 'dexie';

export interface RecentAddress {
  /** The receiver address — primary key */
  address: string;
  /** Wallet address that sent to this receiver */
  walletAddress: string;
  /** Epoch ms when this address was last sent to */
  lastUsedAt: number;
}

/**
 * Cached resolved transaction data.
 * Stores the expensive-to-compute fields (amount, fee) so we don't
 * need to re-fetch and re-resolve every input on each polling cycle.
 */
export interface CachedTransaction {
  /** txid — primary key */
  txid: string;
  /** Wallet address this cache entry belongs to */
  walletAddress: string;
  /** Net amount in satoshi */
  amount: number;
  /** Fee in satoshi */
  fee: number;
  /** Unix timestamp (seconds) from the tx, if known */
  time?: number;
  /** Number of confirmations at time of caching */
  confirmations: number;
  /** Block height (0 = mempool / unconfirmed) */
  height: number;
  /** Epoch ms when this entry was last written */
  cachedAt: number;
  /** True for coinstake (staking reward) transactions */
  isStake?: boolean;
}

export interface CachedTokenTransfer {
  /** Composite key: `${txid}:${logIndex}` */
  id: string;
  walletAddress: string;
  txid: string;
  logIndex: number;
  height: number;
  from: string;
  to: string;
  value: string;
  symbol: string;
  name: string;
  decimals: number;
  tokenAddress: string;
  time?: number;
  confirmations: number;
  cachedAt: number;
}

/**
 * Storage-aware Dexie database for caching transaction data.
 *
 * Keeps a capped number of entries to stay within Chrome extension
 * and mobile browser IndexedDB quotas (~5-10 MB typical).
 * MAX_TX_ENTRIES and MAX_TOKEN_ENTRIES are conservative defaults.
 */
class TransactionCacheDB extends Dexie {
  transactions!: Table<CachedTransaction, string>;
  tokenTransfers!: Table<CachedTokenTransfer, string>;
  recentAddresses!: Table<RecentAddress, string>;

  /** Max cached regular transactions per wallet */
  static MAX_TX_ENTRIES = 500;
  /** Max cached token transfer entries per wallet */
  static MAX_TOKEN_ENTRIES = 500;
  /** Max recent addresses remembered per wallet */
  static MAX_RECENT_ADDRESSES = 50;

  constructor() {
    super('RunebaseTxCache');
    this.version(1).stores({
      transactions: 'txid, walletAddress, height, cachedAt',
      tokenTransfers: 'id, walletAddress, height, cachedAt',
    });
    // v2: adds isStake column (non-indexed — filtered in-memory from capped set)
    this.version(2).stores({
      transactions: 'txid, walletAddress, height, cachedAt',
      tokenTransfers: 'id, walletAddress, height, cachedAt',
    });
    // v3: adds recentAddresses table for remembering send destinations
    this.version(3).stores({
      transactions: 'txid, walletAddress, height, cachedAt',
      tokenTransfers: 'id, walletAddress, height, cachedAt',
      recentAddresses: 'address, walletAddress, lastUsedAt',
    });
  }

  // ─── Regular Transactions ─────────────────────────────────────

  async getCachedTx(txid: string): Promise<CachedTransaction | undefined> {
    return this.transactions.get(txid);
  }

  async getCachedTxBatch(txids: string[]): Promise<Map<string, CachedTransaction>> {
    const results = await this.transactions.bulkGet(txids);
    const map = new Map<string, CachedTransaction>();
    for (const entry of results) {
      if (entry) map.set(entry.txid, entry);
    }
    return map;
  }

  async putTx(entry: CachedTransaction): Promise<void> {
    try {
      await this.transactions.put(entry);
    } catch (err) {
      console.warn('putTx failed (quota?):', err);
    }
  }

  async putTxBatch(entries: CachedTransaction[]): Promise<void> {
    try {
      await this.transactions.bulkPut(entries);
    } catch (err) {
      console.warn('putTxBatch failed (quota?):', err);
    }
  }

  /**
   * Remove oldest entries when we exceed the cap for a given wallet.
   */
  async evictOldTxs(walletAddress: string): Promise<void> {
    const count = await this.transactions
      .where('walletAddress').equals(walletAddress)
      .count();

    if (count > TransactionCacheDB.MAX_TX_ENTRIES) {
      const toRemove = count - TransactionCacheDB.MAX_TX_ENTRIES;
      const oldest = await this.transactions
        .where('walletAddress').equals(walletAddress)
        .sortBy('cachedAt');
      const keys = oldest.slice(0, toRemove).map((e) => e.txid);
      await this.transactions.bulkDelete(keys);
    }
  }

  // ─── Token Transfers ──────────────────────────────────────────

  async getCachedTokenTransfers(walletAddress: string): Promise<CachedTokenTransfer[]> {
    return this.tokenTransfers
      .where('walletAddress').equals(walletAddress)
      .toArray();
  }

  async putTokenTransferBatch(entries: CachedTokenTransfer[]): Promise<void> {
    try {
      await this.tokenTransfers.bulkPut(entries);
    } catch (err) {
      console.warn('putTokenTransferBatch failed (quota?):', err);
    }
  }

  async evictOldTokenTransfers(walletAddress: string): Promise<void> {
    const count = await this.tokenTransfers
      .where('walletAddress').equals(walletAddress)
      .count();

    if (count > TransactionCacheDB.MAX_TOKEN_ENTRIES) {
      const toRemove = count - TransactionCacheDB.MAX_TOKEN_ENTRIES;
      const oldest = await this.tokenTransfers
        .where('walletAddress').equals(walletAddress)
        .sortBy('cachedAt');
      const keys = oldest.slice(0, toRemove).map((e) => e.id);
      await this.tokenTransfers.bulkDelete(keys);
    }
  }

  // ─── Recent Addresses ─────────────────────────────────────────

  async getRecentAddresses(walletAddress: string): Promise<RecentAddress[]> {
    return this.recentAddresses
      .where('walletAddress').equals(walletAddress)
      .reverse()
      .sortBy('lastUsedAt');
  }

  async addRecentAddress(walletAddress: string, receiverAddress: string): Promise<void> {
    try {
      await this.recentAddresses.put({
        address: receiverAddress,
        walletAddress,
        lastUsedAt: Date.now(),
      });
      await this.evictOldRecentAddresses(walletAddress);
    } catch (err) {
      console.warn('addRecentAddress failed (quota?):', err);
    }
  }

  async evictOldRecentAddresses(walletAddress: string): Promise<void> {
    const entries = await this.recentAddresses
      .where('walletAddress').equals(walletAddress)
      .sortBy('lastUsedAt');

    if (entries.length > TransactionCacheDB.MAX_RECENT_ADDRESSES) {
      const toRemove = entries.length - TransactionCacheDB.MAX_RECENT_ADDRESSES;
      const keys = entries.slice(0, toRemove).map((e) => e.address);
      await this.recentAddresses.bulkDelete(keys);
    }
  }

  // ─── Cleanup ──────────────────────────────────────────────────

  async clearForWallet(walletAddress: string): Promise<void> {
    await this.transactions.where('walletAddress').equals(walletAddress).delete();
    await this.tokenTransfers.where('walletAddress').equals(walletAddress).delete();
    await this.recentAddresses.where('walletAddress').equals(walletAddress).delete();
  }

  async clearAll(): Promise<void> {
    await this.transactions.clear();
    await this.tokenTransfers.clear();
    await this.recentAddresses.clear();
  }
}

/** Singleton instance */
const txCacheDB = new TransactionCacheDB();
export default txCacheDB;
