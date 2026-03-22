import moment from 'moment';

import RunebaseChromeController from '.';
import IController from './iController';
import { MESSAGE_TYPE } from '../../constants';
import Transaction from '../../models/Transaction';
import RRCToken from '../../models/RRCToken';
import { addressToHash160, hash160ToAddress } from '../../services/wallet';
import { addMessageListener, isExtensionEnvironment, sendMessage } from '../../popup/abstraction';

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

  private getTransactionsInterval?: any = undefined;

  constructor(main: RunebaseChromeController) {
    super('transaction', main);

    addMessageListener(this.handleMessage);
    this.initFinished();
  }
  public addTransaction = (transaction: Transaction) => {
    this.transactions.unshift(transaction);
    this.totalTransactions += 1;
    console.log('new transactions after adding: ', this.transactions);
    this.sendTransactionsMessage();
  };

  public fetchFirst = async () => {
    this.transactions = await this.fetchTransactions(10, 0);
    this.sendTransactionsMessage();
    // Also fetch token transfers
    await this.fetchTokenTransfers();
  };

  public fetchMore = async () => {
    this.pageNum = this.pageNum + 1;
    const txs = await this.fetchTransactions(10, this.pageNum * 10);
    this.transactions = this.transactions.concat(txs);
    this.sendTransactionsMessage();
  };

  public stopPolling = () => {
    if (this.getTransactionsInterval) {
      clearInterval(this.getTransactionsInterval);
      this.getTransactionsInterval = undefined;
      this.pageNum = 0;
    }
  };

  private refreshTransactions = async () => {
    let refreshedItems: Transaction[] = [];
    for (let i = 0; i <= this.pageNum; i++) {
      refreshedItems = refreshedItems.concat(
        await this.fetchTransactions(10, i * 10)
      );
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
    limit: number = 10,
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

    const { totalCount, transactions } = await wallet.getTransactionHistory(
      electrumx,
      limit,
      offset,
    );

    this.totalTransactions = totalCount;

    return transactions.map((tx) => new Transaction({
      id: tx.txid,
      timestamp: tx.time
        ? moment(new Date(tx.time * 1000)).format('MM-DD-YYYY, HH:mm')
        : moment().format('MM-DD-YYYY, HH:mm'),
      confirmations: tx.confirmations || 0,
      amount: tx.amount,
      fee: tx.fee,
    }));
  };

  // ─── Token Transfers ──────────────────────────────────────────

  /**
   * Fetch QRC20 Transfer events for all tracked tokens.
   * Events are fetched via blockchain.contract.event.get_history,
   * then decoded from transaction receipts.
   * Sorted newest first (highest block height / lowest confirmations first).
   */
  private fetchTokenTransfers = async () => {
    const wallet = this.main.account.loggedInAccount?.wallet;
    const electrumx = this.main.network.electrumx;
    const tokens = this.main.token.tokens;
    if (!wallet || !electrumx || !tokens || tokens.length === 0) {
      this.tokenTransfers = [];
      this.sendTokenTransfersMessage();
      return;
    }

    const network = this.main.network.runebaseNetwork;
    const walletAddress = wallet.address;
    const walletHash160 = addressToHash160(walletAddress);
    const transferTopic =
      'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

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

    for (const token of tokens) {
      try {
        const events = await electrumx.getContractEventHistory(
          walletHash160,
          token.address,
          transferTopic,
        );
        if (!events || events.length === 0) continue;

        for (const event of events) {
          try {
            const transfer = await this.decodeTransferEvent(
              event, token, network, transferTopic,
            );
            if (transfer) {
              allTransfers.push(transfer);
            }
          } catch (err) {
            console.warn(
              `Failed to decode token event ${event.tx_hash}:`, err,
            );
          }
        }
      } catch (err) {
        console.warn(
          `Failed to fetch token history for ${token.symbol}:`, err,
        );
      }
    }

    // Sort newest first (highest height first, 0 = mempool goes to top)
    allTransfers.sort((a, b) => {
      if (a.height === 0 && b.height !== 0) return -1;
      if (b.height === 0 && a.height !== 0) return 1;
      return b.height - a.height;
    });

    this.tokenTransfers = allTransfers;
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
      default:
        break;
      }
    } catch (err) {
      console.error(err);
      this.main.displayErrorOnPopup(err as any);
    }
  };
}
