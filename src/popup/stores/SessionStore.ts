import { observable, action, computed, makeObservable } from 'mobx';
import { RunebaseInfo } from 'runebasejs-wallet';
import { isUndefined } from 'lodash';

import { MESSAGE_TYPE, NETWORK_NAMES } from '../../constants';
import QryNetwork from '../../models/QryNetwork';

const INIT_VALUES = {
  networkIndex: 0,
  loggedInAccountName: undefined,
  walletInfo: undefined,
  runebaseUSD: undefined,
  blockchainInfo: {
    height: 0,
    supply: 0,
    circulatingSupply: 0,
    netStakeWeight: 0,
    feeRate: 0,
    dgpInfo: {
      maxBlockSize: 0,
      minGasPrice: 0,
      blockGasLimit: 0,
    }
  },
  delegationInfo: {
    staker: '',
    fee: 0,
    blockHeight: 0,
    PoD: '',
    verified: false,
  }
};

export default class SessionStore {
  @observable public networkIndex: number = INIT_VALUES.networkIndex;
  @observable public networks: QryNetwork[] = [];
  @observable public loggedInAccountName?: string = INIT_VALUES.loggedInAccountName;
  @observable public walletInfo?: RunebaseInfo.IGetAddressInfo = INIT_VALUES.walletInfo;
  @observable public blockchainInfo?: RunebaseInfo.IGetBlockchainInfo = INIT_VALUES.blockchainInfo;
  @observable public delegationInfo?: RunebaseInfo.IGetAddressDelegation = INIT_VALUES.delegationInfo;

  @computed public get runebaseBalanceUSD() {
    return isUndefined(this.runebaseUSD) ? 'Loading...' : `(~$${this.runebaseUSD})`;
  }

  @computed public get networkName() {
    return this.networks[this.networkIndex]?.name;
  }

  @computed public get isMainNet() {
    return this.networkName === NETWORK_NAMES.MAINNET;
  }

  private runebaseUSD?: number = INIT_VALUES.runebaseUSD;

  constructor() {
    makeObservable(this);
    chrome.runtime.onMessage.addListener(this.handleMessage);

    console.log('Sending message to get networks');
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_NETWORKS }, (response: any) => {
      console.log('Received networks:', response);
      this.networks = response;
    });

    console.log('Sending message to get network index');
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_NETWORK_INDEX }, (response: any) => {
      console.log('Received network index:', response);
      if (response !== undefined) {
        this.networkIndex = response;
      }
    });
  }

  @action public init = () => {
    console.log('Initializing SessionStore');

    console.log('Sending message to get logged-in account name');
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME }, (response: any) => {
      console.log('Received logged-in account name:', response);
      this.setLoggedInAccountName(response);
    });

    console.log('Sending message to get blockchain info');
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_BLOCKCHAIN_INFO }, (response: any) => {
      console.log('Received blockchain info:', response);
      this.setBlockchainInfo(response);
    });

    console.log('Sending message to get wallet info');
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_WALLET_INFO }, (response: any) => {
      console.log('Received wallet info:', response);
      this.setWalletInfo(response);
    });

    console.log('Sending message to get wallet delegation info');
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_DELEGATION_INFO });

    console.log('Sending message to get RUNEBASE USD');
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_RUNEBASE_USD }, (response: any) => {
      console.log('Received RUNEBASE USD:', response);
      this.setRunebaseUSD(response);
    });
  };

  @action private handleMessage = (request: any) => {
    console.log('Session Store Received message:', request);
    switch (request.type) {
    case MESSAGE_TYPE.CHANGE_NETWORK_SUCCESS:
      console.log('Changing network success. New network index:', request.networkIndex);
      this.setNetworkIndex(request.networkIndex);
      break;
    case MESSAGE_TYPE.ACCOUNT_LOGIN_SUCCESS:
      console.log('Account login success. Initializing SessionStore');
      this.init();
      break;
    case MESSAGE_TYPE.GET_WALLET_INFO_RETURN:
      console.log('Received wallet info (return):', request.info);
      this.setWalletInfo(request.info);
      break;
    case MESSAGE_TYPE.GET_DELEGATION_INFO_RETURN:
      console.log(request);
      console.log('Received wallet delegation info (return):', request.delegationInfo);
      this.setDelegationInfo(request.delegationInfo);
      break;
    case MESSAGE_TYPE.GET_BLOCKCHAIN_INFO_RETURN:
      console.log('Received blockchain info (return):', request.blockchainInfo);
      this.setBlockchainInfo(request.blockchainInfo);
      break;
    case MESSAGE_TYPE.GET_RUNEBASE_USD_RETURN:
      console.log('Received RUNEBASE USD (return):', request.runebaseUSD);
      this.setRunebaseUSD(request.runebaseUSD);
      break;
    default:
      break;
    }
  };

  @action private setNetworkIndex = (index: number) => {
    this.networkIndex = index;
  };

  @action private setLoggedInAccountName = (name: string) => {
    this.loggedInAccountName = name;
  };

  @action private setBlockchainInfo = (blockchainInfo: RunebaseInfo.IGetBlockchainInfo) => {
    this.blockchainInfo = blockchainInfo;
    console.log('sessionStore.blockchainInfo: ', this.blockchainInfo);
  };
  @action private setWalletInfo = (walletInfo: RunebaseInfo.IGetAddressInfo) => {
    // INFO OBJECT
    // {
    //   'balance': '497300000',
    //   'totalReceived': '500000000',
    //   'totalSent': '2700000',
    //   'unconfirmed': '0',
    //   'staking': '0',
    //   'mature': '0',
    //   'qrc20Balances': [
    //     {
    //       'address': '4a344d24f909e4cb4ee667371d67cdfca432d0c8',
    //       'addressHex': '4a344d24f909e4cb4ee667371d67cdfca432d0c8',
    //       'name': 'Dust',
    //       'symbol': 'Dust',
    //       'decimals': 8,
    //       'balance': '500000000',
    //       'unconfirmed': {
    //         'received': '0',
    //         'sent': '0'
    //       }
    //     }
    //   ],
    //   'qrc721Balances': [],
    //   'ranking': 1811,
    //   'transactionCount': 5,
    //   'blocksMined': 0,
    //   'address': 'RrEjaBEW1dVKR4XesrsgwiZ9U2HPq5ziK5'
    // }
    this.walletInfo = walletInfo;
  };

  @action private setRunebaseUSD = (usd: number) => {
    this.runebaseUSD = usd;
  };

  @action private setDelegationInfo = (delegationInfo: RunebaseInfo.IGetAddressDelegation) => {
    this.delegationInfo = delegationInfo;
  };
}
