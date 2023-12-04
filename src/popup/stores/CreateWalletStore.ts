import { observable, action, computed, reaction, makeObservable, extendObservable } from 'mobx';
import { isEmpty } from 'lodash';

import AppStore from './AppStore';
import { MESSAGE_TYPE } from '../../constants';
import { sendMessage } from '../abstraction';

const INIT_VALUES = {
  walletName: '',
  walletNameTaken: false,
};

export default class CreateWalletStore {
  @observable public walletName: string = INIT_VALUES.walletName;
  @observable public walletNameTaken: boolean = INIT_VALUES.walletNameTaken;
  @computed public get walletNameError(): string | undefined {
    return this.walletNameTaken ? 'Wallet name is taken' : undefined;
  }
  @computed
  public get error(): boolean {
    const isError = isEmpty(this.walletName) || !!this.walletNameError;
    return isError;
  }
  @computed public get showBackButton(): boolean {
    return !isEmpty(this.app.accountLoginStore.accounts);
  }

  private app: AppStore;

  constructor(app: AppStore) {
    makeObservable(this);
    this.app = app;

    extendObservable(this, {
      isEmpty,  // make isEmpty observable
    });

    reaction(
      () => this.walletName,
      (newWalletName) => {
        console.log(`Wallet name changed: ${newWalletName}`);

        // Send a message to the background script to validate wallet name
        sendMessage(
          {
            type: MESSAGE_TYPE.VALIDATE_WALLET_NAME,
            name: newWalletName,
          }, (response: any) => {
            console.log(`Wallet name taken: ${response}`);
            this.setWalletNameTaken(response);
          }
        );
      }
    );
  }

  @action public reset = () => {
    console.log('Resetting CreateWalletStore');
    Object.assign(this, INIT_VALUES);
  };

  @action public routeToSaveMnemonic = () => {
    console.log('Routing to SaveMnemonic');
    this.app?.navigate?.('/save-mnemonic');
  };

  @action public routeToImportWallet = () => {
    console.log('Routing to ImportWallet');
    this.app?.navigate?.('/import-wallet');
  };

  @action public updateWalletName = (newWalletName: string) => {
    this.walletName = newWalletName;
  };

  @action public setWalletNameTaken = (isTaken: boolean) => {
    this.walletNameTaken = isTaken;
  };

  @action public handleEnterPress = () => {
    if (this.walletName) {
      this.routeToSaveMnemonic();
    }
  };
}
