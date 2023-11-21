import { observable, action, reaction, makeObservable } from 'mobx';

import AppStore from './AppStore';
import { MESSAGE_TYPE } from '../../constants';
import Transaction from '../../models/Transaction';
import RRCToken from '../../models/RRCToken';
import BigNumber from 'bignumber.js';

const INIT_VALUES = {
  activeTabIdx: 0,
  transactions: [],
  tokens: [],
  verifiedTokens: [],
  hasMore: false,
  shouldScrollToBottom: false,
  editTokenMode: false,
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
    reaction(
      () => this.activeTabIdx,
      () => this.activeTabIdx === 0 ? this.onTransactionTabSelected() : this.onTokenTabSelected(),
    );
  }

  @action
  public init = () => {
      chrome.runtime.onMessage.addListener(this.handleMessage);
      this.activeTabIdx === 0 ? this.onTransactionTabSelected() : this.onTokenTabSelected();
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

  private onTransactionTabSelected = () => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.START_TX_POLLING });
  };

  private onTokenTabSelected = () => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_RRC_TOKEN_LIST }, (response: any) => {
      console.log('Received token list:', response);
      this.verifiedTokens = response;
      this.tokens = [];
      this.app.sessionStore.info?.qrc20Balances.forEach((tokenInfo) => {
        const { name, symbol, decimals, balance, address } = tokenInfo;
        const newToken = new RRCToken(name, symbol, Number(decimals), address);
        const isTokenVerified = this.verifiedTokens.find(x => x.address === newToken.address);
        if (isTokenVerified) {
          newToken.balance = new BigNumber(balance).dividedBy(`1e${decimals}`).toNumber();
          this.tokens.push(newToken);
        } else {
          // TODO: Make a visible unverified token balance list
        }
      });
    });
    // chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_RRC_TOKEN_LIST }, (response: any) => {
    //   this.tokens = response;
    // });
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.STOP_TX_POLLING });
  };

  @action
  private handleMessage = (request: any) => {
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
