import { observable, action, makeObservable } from 'mobx';
import AppStore from './AppStore';
import { MESSAGE_TYPE } from '../../constants';
import RRCToken from '../../models/RRCToken';
import Transaction from '../../models/Transaction';
import { addMessageListener, isExtensionEnvironment, openUrlInNewTab, removeMessageListener, sendMessage, TabOpener } from '../abstraction';
import { parseJsonOrFallback } from '../../utils';
// import BigNumber from 'bignumber.js';

// Chrome-specific implementation for opening tabs
class ChromeTabOpener implements TabOpener {
  openUrlInNewTab(url: string): void {
    chrome.tabs.create({ url });
  }
}

// Web-compatible implementation for opening tabs
class WebTabOpener implements TabOpener {
  openUrlInNewTab(url: string): void {
    // Implement your web-specific logic for opening a new tab
    // For example, you might use window.open or another method
    window.open(url, '_blank');
  }
}


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
    addMessageListener(this.handleMessage);
    sendMessage({ type: MESSAGE_TYPE.START_TX_POLLING }, () => {});
    sendMessage({ type: MESSAGE_TYPE.GET_RRC_TOKEN_LIST }, () => {});
  };

  public deinit = () => {
    removeMessageListener(this.handleMessage);
    sendMessage({ type: MESSAGE_TYPE.STOP_TX_POLLING }, () => {});
  };

  public fetchMoreTxs = () => {
    sendMessage({ type: MESSAGE_TYPE.GET_MORE_TXS }, () => {});
  };

  public handleNetworkExplorerResponse(response: any, txid: string, tabOpener: TabOpener): void {
    if (response) {
      const url = `${response}/${txid}`;
      openUrlInNewTab(url, tabOpener);
    } else {
      console.error('Error: Invalid response for network explorer URL.');
    }
  }


  public onTransactionClick = (txid: string) => {
    sendMessage({
      type: MESSAGE_TYPE.GET_NETWORK_EXPLORER_URL,
    }, (response: any) => {
      // Determine the environment and use the appropriate tab opener
      const tabOpener = typeof chrome !== 'undefined' ? new ChromeTabOpener() : new WebTabOpener();
      this.handleNetworkExplorerResponse(response, txid, tabOpener);
    });
  };

  public removeToken = (contractAddress: string) => {
    sendMessage({
      type: MESSAGE_TYPE.REMOVE_TOKEN,
      contractAddress,
    }, () => {});
  };

  public routeToAddToken = () => {
    this.app?.navigate?.('/add-token');
  };

  @action private handleMessage = (request: any) => {
    const requestData = isExtensionEnvironment() ? request : request.data;
    try {
      switch (requestData.type) {
      case MESSAGE_TYPE.GET_TXS_RETURN:
        console.log('GET_TXS_RETURN', requestData);
        this.transactions = parseJsonOrFallback(requestData.transactions);
        this.hasMore = requestData.hasMore;
        break;
      case MESSAGE_TYPE.RRC_TOKENS_RETURN: {
        console.log('RRC_TOKENS_RETURN', requestData);
        this.verifiedTokens = parseJsonOrFallback(requestData.tokens);
        break;
      }
      default:
        break;
      }
    } catch (err) {
      console.error(err);
    }
  };
}
