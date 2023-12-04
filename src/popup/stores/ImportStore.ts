import { observable, action, computed, reaction, makeObservable } from 'mobx';
import { isEmpty } from 'lodash';

import AppStore from './AppStore';
import { isValidPrivateKey } from '../../utils';
import { MESSAGE_TYPE, IMPORT_TYPE } from '../../constants';
import { sendMessage } from '../abstraction';

const INIT_VALUES = {
  privateKey: '',
  mnemonic: [],
  accountName: '',
  walletNameTaken: false,
  importMnemonicPrKeyFailed: false,
  importType: IMPORT_TYPE.MNEMONIC,
};

export default class ImportStore {
  // User input field, could be mnemonic or privateKey, depending on importType
  @observable public accountName: string = INIT_VALUES.accountName;
  @observable public walletNameTaken: boolean = INIT_VALUES.walletNameTaken;
  @observable public importMnemonicPrKeyFailed: boolean = INIT_VALUES.importMnemonicPrKeyFailed;
  @observable public importType: string = INIT_VALUES.importType;
  @observable public mnemonic: Array<string> = Array.from({ length: 12 }, () => '');
  @observable public privateKey: string = INIT_VALUES.privateKey;

  @computed public get walletNameError(): string | undefined {
    return this.walletNameTaken ? 'Wallet name is taken' : undefined;
  }
  @computed public get privateKeyPageError(): boolean {
    return [this.privateKey, this.accountName].some(isEmpty)
      || !!this.walletNameError || !!this.privateKeyError || this.accountName.length < 1;
  }
  @computed public get privateKeyError(): string | undefined {
    if (this.importType === IMPORT_TYPE.PRIVATE_KEY) {
      return isValidPrivateKey(this.privateKey) ? undefined : 'Not a valid private key';
    } else {
      return undefined;
    }
  }

  @computed public get mnemonicPageError(): boolean {
    const isMnemonicValid = this.mnemonic.length === 12 && this.mnemonic.every(word => word.length > 0);
    console.log('isMnemonicValid: ', isMnemonicValid);
    return !isMnemonicValid || !!this.walletNameError || this.accountName.length < 1;
  }

  private app: AppStore;

  constructor(app: AppStore) {
    makeObservable(this);
    this.app = app;

    reaction(
      () => this.accountName,
      () => {
        console.log('Account name changed:', this.accountName);
        sendMessage(
          {
            type: MESSAGE_TYPE.VALIDATE_WALLET_NAME,
            name: this.accountName,
          },
          (response: any) => {
            console.log('Wallet name validation response:', response);
            this.setWalletNameTaken(response);
          },
        );
      },
    );
  }

  @action public setWalletNameTaken = (walletNameTaken: boolean) => {
    this.walletNameTaken = walletNameTaken;
  };

  @action public changeImportType = (type: string) => {
    console.log('Import type changed:', type);
    this.importType = type;
  };

  @action public reset = () => {
    console.log('Resetting import store');
    const tempImportType = this.importType;
    Object.assign(this, INIT_VALUES);
    this.importType = tempImportType;
  };

  @action public importPrivateKey = () => {
    if (!this.privateKeyPageError) {
      console.log('Importing private key');
      this.app?.navigate?.('/loading');
      sendMessage({
        type: MESSAGE_TYPE.IMPORT_PRIVATE_KEY,
        accountName: this.accountName,
        mnemonicPrivateKey: this.privateKey,
      });
    }
  };

  @action public importSeedPhrase = () => {
    if (!this.mnemonicPageError) {
      console.log('Importing seed phrase');
      this.app?.navigate?.('/loading');
      sendMessage({
        type: MESSAGE_TYPE.IMPORT_MNEMONIC,
        accountName: this.accountName,
        mnemonicPrivateKey: this.mnemonic.join(' '),
      });
    }
  };

  @action public cancelImport = () => {
    this.app?.navigate?.(-1);
  };
  @action public setPrivateKey = (
    privateKey: string,
  ) => {
    this.privateKey = privateKey;
  };
  @action public setMnemonic = (
    mnemonic: Array<string>,
  ) => {
    this.mnemonic = mnemonic;
    console.log(this.mnemonic);
  };
  @action public setAccountName = (
    accountName: string,
  ) => {
    this.accountName = accountName;
  };
}
