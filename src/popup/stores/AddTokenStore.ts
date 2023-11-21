import { observable, computed, action, reaction, makeObservable } from 'mobx';
import { findIndex } from 'lodash';

import AppStore from './AppStore';
import { MESSAGE_TYPE } from '../../constants';
import { isValidContractAddressLength } from '../../utils';

const INIT_VALUES = {
  contractAddress: '',
  name: '',
  symbol: '',
  decimals: undefined,
  getRRCTokenDetailsFailed: false,
};

export default class AddTokenStore {
  @observable public contractAddress?: string = INIT_VALUES.contractAddress;
  @observable public name?: string = INIT_VALUES.name;
  @observable public symbol?: string = INIT_VALUES.symbol;
  @observable public decimals?: number = INIT_VALUES.decimals;
  @observable public getRRCTokenDetailsFailed?: boolean = INIT_VALUES.getRRCTokenDetailsFailed;
  @computed public get contractAddressFieldError(): string | undefined {
    return (!!this.contractAddress
      && isValidContractAddressLength(this.contractAddress)
      && !this.getRRCTokenDetailsFailed)
      ? undefined : 'Not a valid contract address';
  }
  @computed public get buttonDisabled(): boolean {
    return !this.contractAddress
      || !this.name
      || !this.symbol
      || !this.decimals
      || !!this.contractAddressFieldError
      || !!this.tokenAlreadyInListError;
  }
  @computed public get tokenAlreadyInListError(): string | undefined {
    // Check if the token is already in the list
    const index = findIndex(this.app.accountDetailStore.tokens, { address: this.contractAddress });
    return (index !== -1 ? 'Token already in token list' : undefined );
  }

  private app: AppStore;

  constructor(app: AppStore) {
    makeObservable(this);
    this.app = app;
    this.setInitValues();

    reaction(
      () => this.contractAddress,
      () => {
        console.log('Contract address changed:', this.contractAddress);
        this.resetTokenDetails();
        // If valid contract address, send rpc call to fetch other contract details
        if (this.contractAddress && !this.contractAddressFieldError) {
          console.log('Fetching RRC token details for:', this.contractAddress);
          chrome.runtime.sendMessage({
            type: MESSAGE_TYPE.GET_RRC_TOKEN_DETAILS,
            contractAddress: this.contractAddress
          });
        }
      },
    );
  }

  public addToken = () => {
    console.log('Adding token:', {
      contractAddress: this.contractAddress,
      name: this.name,
      symbol: this.symbol,
      decimals: this.decimals,
    });
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPE.ADD_TOKEN,
      contractAddress: this.contractAddress,
      name: this.name,
      symbol: this.symbol,
      decimals: this.decimals,
    });
    this.app.routerStore.push('/account-detail');
    this.app.accountDetailStore.shouldScrollToBottom = true;
    this.setInitValues();
  };

  @action
  public init = () => {
      chrome.runtime.onMessage.addListener(this.handleMessage);
    };

  @action
  private setInitValues = () => {
      this.contractAddress = INIT_VALUES.contractAddress;
      this.resetTokenDetails();
    };

  @action
  public setContractAddress = (value: string) => {
      this.contractAddress = value;
    };

  @action
  private resetTokenDetails = () => {
      this.name = INIT_VALUES.name;
      this.symbol = INIT_VALUES.symbol;
      this.decimals = INIT_VALUES.decimals;
      this.getRRCTokenDetailsFailed = INIT_VALUES.getRRCTokenDetailsFailed;
    };

  @action
  private handleMessage = (request: any) => {
      switch (request.type) {
      case MESSAGE_TYPE.RRC_TOKEN_DETAILS_RETURN:
        if (request.isValid) {
          const { name, symbol, decimals } = request.token;
          console.log('Received RRC token details:', { name, symbol, decimals });
          this.name = name;
          this.symbol = symbol;
          this.decimals = decimals;
        } else {
          console.log('RRC token details request failed');
          this.getRRCTokenDetailsFailed = true;
        }
        break;
      default:
        break;
      }
    };
}
