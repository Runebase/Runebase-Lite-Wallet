import { observable, action, computed, makeObservable } from 'mobx';
import { RunebaseInfo } from 'runebasejs-wallet';
import { isUndefined } from 'lodash';

import { MESSAGE_TYPE, NETWORK_NAMES } from '../../constants';
import QryNetwork from '../../models/QryNetwork';
import { addMessageListener, isExtensionEnvironment, sendMessage } from '../abstraction';
import AppStore from './AppStore';

interface WalletBackupInfo {
  address: string;
  privateKey: string;
}

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
  },
  walletBackupInfo: {
    address: '',
    privateKey: '',
  }
};

export default class SessionStore {
  @observable public networkIndex: number = INIT_VALUES.networkIndex;
  @observable public networks: QryNetwork[] = [];
  @observable public loggedInAccountName?: string = INIT_VALUES.loggedInAccountName;
  @observable public walletInfo?: RunebaseInfo.IGetAddressInfo = INIT_VALUES.walletInfo;
  @observable public blockchainInfo?: RunebaseInfo.IGetBlockchainInfo = INIT_VALUES.blockchainInfo;
  @observable public delegationInfo?: RunebaseInfo.IGetAddressDelegation = INIT_VALUES.delegationInfo;
  @observable public walletBackupInfo: WalletBackupInfo = INIT_VALUES.walletBackupInfo;

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
  private app: AppStore;

  constructor(app: AppStore) {
    makeObservable(this);
    this.app = app;
    addMessageListener(this.handleMessage);
    sendMessage({ type: MESSAGE_TYPE.GET_NETWORKS });
    sendMessage({ type: MESSAGE_TYPE.GET_NETWORK_INDEX });
  }

  @action public init = () => {
    sendMessage({ type: MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME });
    sendMessage({ type: MESSAGE_TYPE.GET_BLOCKCHAIN_INFO });
    sendMessage({ type: MESSAGE_TYPE.GET_WALLET_INFO });
    sendMessage({ type: MESSAGE_TYPE.GET_DELEGATION_INFO });
    sendMessage({ type: MESSAGE_TYPE.GET_RUNEBASE_USD });
  };

  @action public setWalletBackupInfo = (
    address: string,
    privateKey: string,
  ) => {
    this.walletBackupInfo = {
      address,
      privateKey,
    };
  };

  @action public initWalletBackupInfo = () => {
    this.walletBackupInfo = {
      address: '',
      privateKey: '',
    };
  };

  @action private handleMessage = (request: any) => {
    const requestData = isExtensionEnvironment() ? request : request.data;
    switch (requestData.type) {
    case MESSAGE_TYPE.REQUEST_BACKUP_WALLET_INFO_RETURN:
      this.setWalletBackupInfo(requestData.address, requestData.privateKey);
      this.app?.navigate?.('/backup-wallet');
      break;
    case MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME_RETURN:
      this.setLoggedInAccountName(requestData.accountName);
      break;
    case MESSAGE_TYPE.GET_NETWORK_INDEX_RETURN:
      this.setNetworkIndex(requestData.networkIndex);
      break;
    case MESSAGE_TYPE.GET_NETWORKS_RETURN:
      console.log('setting networks: ', requestData.networks);
      this.networks = requestData.networks;
      break;
    case MESSAGE_TYPE.CHANGE_NETWORK_SUCCESS:
      console.log('Changing network success. New network index:', requestData.networkIndex);
      this.setNetworkIndex(requestData.networkIndex);
      break;
    case MESSAGE_TYPE.ACCOUNT_LOGIN_SUCCESS:
      console.log('Account login success. Initializing SessionStore');
      this.init();
      break;
    case MESSAGE_TYPE.GET_WALLET_INFO_RETURN:
      console.log('Received wallet info (return):', requestData.info);
      this.setWalletInfo(requestData.info);
      break;
    case MESSAGE_TYPE.GET_DELEGATION_INFO_RETURN:
      console.log('Received wallet delegation info (return):', requestData.delegationInfo);
      this.setDelegationInfo(requestData.delegationInfo);
      break;
    case MESSAGE_TYPE.GET_BLOCKCHAIN_INFO_RETURN:
      console.log('Received blockchain info (return):', requestData.blockchainInfo);
      this.setBlockchainInfo(requestData.blockchainInfo);
      break;
    case MESSAGE_TYPE.GET_RUNEBASE_USD_RETURN:
      console.log('Received RUNEBASE USD (return):', requestData.runebaseUSD);
      this.setRunebaseUSD(requestData.runebaseUSD);
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
