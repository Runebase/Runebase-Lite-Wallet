import { observable, action, reaction, makeObservable } from 'mobx';
import AppStore from './AppStore';
import { MESSAGE_TYPE } from '../../constants';
import Transaction from '../../models/Transaction';
import RRCToken from '../../models/RRCToken';
import TokenTransfer from '../../models/TokenTransfer';
// import BigNumber from 'bignumber.js';

const INIT_VALUES = {
  activeTabIdx: 0,
  transactions: [],
  tokenBalanceHistory: [],
  tokens: [],
  verifiedTokens: [],
  hasMore: false,
  shouldScrollToBottom: false,
  editTokenMode: false,
  hasMoreTokenBalanceHistory: false,
};

export default class AccountDetailStore {
  @observable public activeTabIdx: number = INIT_VALUES.activeTabIdx;
  @observable public transactions: Transaction[] = INIT_VALUES.transactions;
  @observable public tokenBalanceHistory: TokenTransfer[] = INIT_VALUES.tokenBalanceHistory;
  @observable public tokens: RRCToken[] = INIT_VALUES.tokens;
  @observable public verifiedTokens: RRCToken[] = INIT_VALUES.verifiedTokens;
  @observable public hasMore: boolean = INIT_VALUES.hasMore;
  @observable public hasMoreTokenBalanceHistory: boolean = INIT_VALUES.hasMoreTokenBalanceHistory;
  @observable public shouldScrollToBottom: boolean = INIT_VALUES.shouldScrollToBottom;
  @observable public editTokenMode: boolean = INIT_VALUES.editTokenMode;

  private app: AppStore;

  constructor(app: AppStore) {
    makeObservable(this);
    this.app = app;
    reaction(
      () => this.activeTabIdx,
      () => this.activeTabIdx === 0 ? this.onTransactionTabSelected() : this.onTokenTransferTabSelected(),
    );
  }

  @action public init = () => {
    console.log('INIT_ACCOUNT_DETAILS_TORE');
    chrome.runtime.onMessage.addListener(this.handleMessage);
    this.activeTabIdx === 0 ? this.onTransactionTabSelected() : this.onTokenTransferTabSelected();
  };

  public deinit = () => {
    chrome.runtime.onMessage.removeListener(this.handleMessage);
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.STOP_TX_POLLING });
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.STOP_TOKEN_BALANCE_HISTORY_POLLING });
  };

  public fetchMoreTxs = () => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_MORE_TXS });
  };

  public fetchMoreTokenTransferHistory = () => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_MORE_TOKEN_BALANCE_HISTORY });
  };

  public onTransactionClick = (txid: string) => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_NETWORK_EXPLORER_URL }, (response: any) => {
      chrome.tabs.create({ url: `${response}/${txid}` });
    });
  };

  public removeToken = (contractAddress: string) => {
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPE.REMOVE_TOKEN,
      contractAddress,
    });
  };

  public routeToAddToken = () => {
    this.app.routerStore.push('/add-token');
  };

  private onTransactionTabSelected = () => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.START_TX_POLLING });
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.STOP_TOKEN_BALANCE_HISTORY_POLLING });
  };

  private onTokenTransferTabSelected = () => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.START_TOKEN_BALANCE_HISTORY_POLLING });
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.STOP_TX_POLLING });
  };

  @action private handleMessage = (request: any) => {
    console.log('ACCOUNT DETAIL STOERE MESSAGE RECEIVED: ', request);
    switch (request.type) {
    case MESSAGE_TYPE.GET_TXS_RETURN:
      this.transactions = request.transactions;
      this.hasMore = request.hasMore;
      break;
    case MESSAGE_TYPE.GET_TOKEN_TRANSFER_HISTORY_RETURN:
      console.log(request);
      this.tokenBalanceHistory = request.tokenTransfers;
      this.hasMoreTokenBalanceHistory = request.hasMore;
      break;
    case MESSAGE_TYPE.RRC_TOKENS_RETURN: {
      this.verifiedTokens = request.tokens;
      break;
    }
    default:
      break;
    }
  };
}
