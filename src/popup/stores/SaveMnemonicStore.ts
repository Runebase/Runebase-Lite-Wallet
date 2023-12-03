import { observable, action, makeObservable } from 'mobx';
import { generateMnemonic } from 'bip39';
import { Buffer } from 'buffer';

import AppStore from './AppStore';
import { MESSAGE_TYPE } from '../../constants';
import { sendMessage } from '../abstraction';

globalThis.Buffer = Buffer;

const INIT_VALUES = {
  mnemonic: '',
  walletName: '',
};

export default class SaveMnemonicStore {
  @observable public mnemonic: string = INIT_VALUES.mnemonic;
  @observable public walletName: string = INIT_VALUES.walletName;

  private app: AppStore;

  constructor(app: AppStore) {
    makeObservable(this);
    this.app = app;
  }

  @action
  public generateMnemonic = () => {
      this.mnemonic = generateMnemonic();
      console.log('Generated mnemonic:', this.mnemonic);
    };

  @action
  public updateWalletName = (newWalletName: string) => {
      this.walletName = newWalletName;
    };

  @action
  public reset = () => {
      console.log('Resetting save mnemonic store');
      Object.assign(this, INIT_VALUES);
    };

  public createWallet = (saveFile: boolean) => {
    console.log('Creating wallet');
    this.app.routerStore.push('/loading');
    sendMessage({
      type: saveFile ? MESSAGE_TYPE.SAVE_TO_FILE : MESSAGE_TYPE.IMPORT_MNEMONIC,
      accountName: this.walletName,
      mnemonicPrivateKey: this.mnemonic,
    });
  };
}
