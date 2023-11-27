import { observable, action, makeObservable } from 'mobx';
import AppStore from './AppStore';
import { MESSAGE_TYPE } from '../../constants';
import RRCToken from '../../models/RRCToken';
import Transaction from '../../models/Transaction';
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
  @observable public tokens: RRCToken[] = INIT_VALUES.tokens;
  @observable public verifiedTokens: RRCToken[] = INIT_VALUES.verifiedTokens;
  @observable public hasMore: boolean = INIT_VALUES.hasMore;
  @observable public shouldScrollToBottom: boolean = INIT_VALUES.shouldScrollToBottom;
  @observable public editTokenMode: boolean = INIT_VALUES.editTokenMode;

  private app: AppStore;

  constructor(app: AppStore) {
    makeObservable(this);
    this.app = app;
  }

  @action public init = () => {
    console.log('INIT_ACCOUNT_DETAILS_TORE');
    chrome.runtime.onMessage.addListener(this.handleMessage);
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.START_TX_POLLING });
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_RRC_TOKEN_LIST }, (response: any) => {
      this.verifiedTokens = response;
    });
  };

  public deinit = () => {
    chrome.runtime.onMessage.removeListener(this.handleMessage);
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.STOP_TX_POLLING });
  };

  public fetchMoreTxs = () => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_MORE_TXS });
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

  @action private handleMessage = (request: any) => {
    console.log('ACCOUNT DETAIL STOERE MESSAGE RECEIVED: ', request);
    switch (request.type) {
    case MESSAGE_TYPE.GET_TXS_RETURN:
      this.transactions = request.transactions;
      this.hasMore = request.hasMore;
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
