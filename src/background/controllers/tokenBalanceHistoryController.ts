import { RunebaseInfo } from 'runebasejs-wallet';
import moment from 'moment';

import RunebaseChromeController from '.';
import IController from './iController';
import { MESSAGE_TYPE } from '../../constants';
import TokenTransfer from '../../models/TokenTransfer';

export default class TokenBalanceHistoryController extends IController {
  private static GET_TX_INTERVAL_MS: number = 60000;

  public tokenTransfers: TokenTransfer[] = [];
  public pageNum: number = 0;
  public pagesTotal?: number;
  public totalTokenTransfers?: number;
  public get hasMore(): boolean {
    return !!this.pagesTotal && (this.pagesTotal > this.pageNum + 1);
  }

  private getTokenTransferHistoryInterval?: any = undefined;

  constructor(main: RunebaseChromeController) {
    super('transaction', main);

    chrome.runtime.onMessage.addListener(this.handleMessage);
    this.initFinished();
  }

  /*
  * Fetches the first page of transactions.
  */
  public fetchFirst = async () => {
    this.tokenTransfers = await this.fetchTokenTransferHistory(
      10, // Limit
      0, // Offset
    );
    this.sendTokenTransfersMessage();
  };

  /*
  * Fetches the more transactions based on pageNum.
  */
  public fetchMore = async () => {
    this.pageNum = this.pageNum + 1;
    const tokenTransfers = await this.fetchTokenTransferHistory(
      10,
      this.pageNum * 10,
    );
    this.tokenTransfers = this.tokenTransfers.concat(tokenTransfers);
    this.sendTokenTransfersMessage();
  };

  /*
  * Stops polling for the periodic info updates.
  */
  public stopPolling = () => {
    if (this.getTokenTransferHistoryInterval) {
      clearInterval(this.getTokenTransferHistoryInterval);
      this.getTokenTransferHistoryInterval = undefined;
      this.pageNum = 0;
    }
  };

  // TODO: if a new transaction comes in, the transactions on a page will shift(ie if 1 page has 10 transactions,
  // transaction number 10 shifts to page2), and the bottom most transaction would disappear from the list.
  // Need to add some additional logic to keep the bottom most transaction displaying.
  private refreshTransactions = async () => {
    let refreshedItems: TokenTransfer[] = [];
    for (let i = 0; i <= this.pageNum; i++) {
      refreshedItems = refreshedItems.concat(
        await this.fetchTokenTransferHistory(
          10, // Limit
          i * 10 // Offset
        )
      );
    }
    this.tokenTransfers = refreshedItems;
    this.sendTokenTransfersMessage();
  };

  /*
  * Starts polling for periodic info updates.
  */
  private startPolling = async () => {
    this.fetchFirst();
    if (!this.getTokenTransferHistoryInterval) {
      this.getTokenTransferHistoryInterval = setInterval(() => {
        this.refreshTransactions();
      }, TokenBalanceHistoryController.GET_TX_INTERVAL_MS);
    }
  };

  /*
  * Fetches the transactions of the current wallet instance.
  * @param pageNum The page of transactions to fetch.
  * @return The Transactions array.
  */
  private fetchTokenTransferHistory = async (
    limit: number = 10,
    offset: number = 0
  ): Promise<TokenTransfer[]> => {
    if (!this.main.account.loggedInAccount
      || !this.main.account.loggedInAccount.wallet
      || !this.main.account.loggedInAccount.wallet.qjsWallet
    ) {
      console.error('Cannot get transactions without wallet instance.');
      return [];
    }

    const wallet = this.main.account.loggedInAccount.wallet.qjsWallet;
    // assert.containsAllKeys(rawTxs, ["transactions", "totalCount"])
    const {
      totalCount,
      transactions
    } =  await wallet.getTokenBalanceHistory(
      undefined,
      limit,
      offset,
    );
    // this.pagesTotal = pagesTotal;
    this.totalTokenTransfers = totalCount;

    return transactions.map((tokenTransfer: RunebaseInfo.ITokenBalanceHistoryInfo) => {
      const {
        blockHash,
        blockHeight,
        id,
        timestamp,
        tokens,
      } = tokenTransfer;

      return new TokenTransfer({
        id: id,
        timestamp: moment(new Date(timestamp * 1000)).format('MM-DD-YYYY, HH:mm'),
        // confirmations: confirmations || 0, // Adjust based on your logic for confirmations
        blockHash: blockHash,
        blockHeight: blockHeight,
        tokens: tokens,
      });
    });
  };

  /*
  * Sends the message after fetching transactions.
  */
  private sendTokenTransfersMessage = () => {
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPE.GET_TOKEN_TRANSFER_HISTORY_RETURN,
      tokenTransfers: this.tokenTransfers,
      hasMore: this.hasMore,
    });
  };

  private handleMessage = (request: any) => {
    try {
      switch (request.type) {
      case MESSAGE_TYPE.START_TOKEN_BALANCE_HISTORY_POLLING:
        this.startPolling();
        break;
      case MESSAGE_TYPE.STOP_TOKEN_BALANCE_HISTORY_POLLING:
        this.stopPolling();
        break;
      case MESSAGE_TYPE.GET_MORE_TOKEN_BALANCE_HISTORY:
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
