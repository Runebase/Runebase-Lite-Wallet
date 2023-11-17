import { observable, action, computed, makeObservable } from 'mobx';
import { Insight } from 'runebasejs-wallet';
import { isUndefined } from 'lodash';

import { MESSAGE_TYPE, NETWORK_NAMES } from '../../constants';
import QryNetwork from '../../models/QryNetwork';

const INIT_VALUES = {
  networkIndex: 0,
  loggedInAccountName: undefined,
  info: undefined,
  runebaseUSD: undefined,
};

export default class SessionStore {
  @observable public networkIndex: number = INIT_VALUES.networkIndex;
  @observable public networks: QryNetwork[] = [];
  @observable public loggedInAccountName?: string = INIT_VALUES.loggedInAccountName;
  @observable public info?: Insight.IGetInfo = INIT_VALUES.info;
  @computed public get runebaseBalanceUSD() {
    return isUndefined(this.runebaseUSD) ? 'Loading...' : `$${this.runebaseUSD} USD`;
  }
  @computed public get networkName() {
    return this.networks[this.networkIndex].name;
  }
  @computed public get isMainNet() {
    return this.networkName === NETWORK_NAMES.MAINNET;
  }
  @computed public get networkBalAnnotation() {
    return this.isMainNet ? '' : `(${this.networkName}, no value)`;
  }

  private runebaseUSD?: number = INIT_VALUES.runebaseUSD;

  constructor() {
    makeObservable(this);
    chrome.runtime.onMessage.addListener(this.handleMessage);

    console.log('Sending message to get networks'); // Add this log statement
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_NETWORKS }, (response: any) => {
      console.log('Received networks:', response); // Add this log statement
      this.networks = response;
    });

    console.log('Sending message to get network index'); // Add this log statement
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_NETWORK_INDEX }, (response: any) => {
      console.log('Received network index:', response); // Add this log statement
      if (response !== undefined) {
        this.networkIndex = response;
      }
    });
  }

  @action
  public init = () => {
      console.log('Initializing SessionStore'); // Add this log statement
      console.log('Sending message to get logged-in account name'); // Add this log statement
      chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME }, (response: any) => {
        console.log('Received logged-in account name:', response); // Add this log statement
        this.loggedInAccountName = response;
      });

      console.log('Sending message to get wallet info'); // Add this log statement
      chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_WALLET_INFO }, (response: any) => {
        console.log('Received wallet info:', response); // Add this log statement
        this.info = response;
      });

      console.log('Sending message to get RUNEBASE USD'); // Add this log statement
      chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_RUNEBASE_USD }, (response: any) => {
        console.log('Received RUNEBASE USD:', response); // Add this log statement
        this.runebaseUSD = response;
      });
    };

  @action
  private handleMessage = (request: any) => {
      console.log('Session Store Received message:', request); // Add this log statement

      switch (request.type) {
      case MESSAGE_TYPE.CHANGE_NETWORK_SUCCESS:
        console.log('Changing network success. New network index:', request.networkIndex); // Add this log statement
        this.networkIndex = request.networkIndex;
        break;
      case MESSAGE_TYPE.ACCOUNT_LOGIN_SUCCESS:
        console.log('Account login success. Initializing SessionStore'); // Add this log statement
        this.init();
        break;
      case MESSAGE_TYPE.GET_WALLET_INFO_RETURN:
        console.log('Received wallet info (return):', request.info); // Add this log statement
        this.info = request.info;
        break;
      case MESSAGE_TYPE.GET_RUNEBASE_USD_RETURN:
        console.log('Received RUNEBASE USD (return):', request.runebaseUSD); // Add this log statement
        this.runebaseUSD = request.runebaseUSD;
        break;
      default:
        break;
      }
    };
}
