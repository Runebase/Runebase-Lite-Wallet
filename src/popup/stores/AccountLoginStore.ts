import { observable, action, reaction, makeObservable } from 'mobx';
import { isEmpty } from 'lodash';

import AppStore from './AppStore';
import { MESSAGE_TYPE } from '../../constants';
import Account from '../../models/Account';
import { addMessageListener, isExtensionEnvironment, sendMessage } from '../abstraction';

const INIT_VALUES = {
  selectedWalletName: '',
  validatesNetwork: false,
};

export default class AccountLoginStore {
  @observable public selectedWalletName: string = INIT_VALUES.selectedWalletName;
  @observable public accounts: Account[] = [];
  @observable public validatesNetwork: boolean = INIT_VALUES.validatesNetwork;

  private app: AppStore;
  private selectedWalletNetworkIndex: number;

  constructor(app: AppStore) {
    makeObservable(this);
    addMessageListener(this.handleMessage);
    this.app = app;
    this.selectedWalletNetworkIndex = this.app.sessionStore.networkIndex;

    // Set the default selected account on the login page.
    reaction(
      () => this.app.sessionStore.networkIndex,
      () => {
        console.log('Network index changed:', this.app.sessionStore.networkIndex);
        this.getAccounts();
      },
    );
  }

  /**
   * @param {boolean} andValidateNetwork: when set to true, disallows being on a network without
   * accounts. This is desirable on the accountLogin page as it ensures a valid state
   * where the displayed accounts matches the network. This is not desirable when
   * creating the first account for a network.
   */
  @action public getAccounts = (validatesNetwork: boolean = false) => {
    this.validatesNetwork = validatesNetwork;
    sendMessage({ type: MESSAGE_TYPE.GET_ACCOUNTS });
  };

  /**
   * In some rare instances, the user can navigate to the AccountLogin page while on a
   * network that does not have accounts.
   * Ex: Import testnet wallet
   *    -> on AccountLogin page switch to mainnet (must do this without having imported a mainnet acct)
   *    -> takes you to the CreateWallet page
   *    -> navigate back to AccountLogin page
   * Without the validateNetwork method below this would show the testnet accounts even
   * though we are on mainnet, and is an invalid application state so we resolve it by
   * changing the network to that of the selectedWallet.
   */
  public validateNetwork = () => {
    if (this.app.sessionStore.networkIndex !== this.selectedWalletNetworkIndex) {
      this.app.navBarStore.changeNetwork(this.selectedWalletNetworkIndex);
    }
  };

  @action public setSelectedWallet = () => {
    if (!isEmpty(this.accounts)) {
      this.selectedWalletName = this.accounts[0].name;
      this.selectedWalletNetworkIndex = this.app.sessionStore.networkIndex;
    }
  };

  @action public loginAccount = () => {
    console.log('Logging in account:', this.selectedWalletName);
    this.app?.navigate?.('/loading');
    sendMessage({
      type: MESSAGE_TYPE.ACCOUNT_LOGIN,
      selectedWalletName: this.selectedWalletName,
    });
  };

  @action public routeToCreateWallet = () => {
    console.log('Routing to create wallet');
    this.app?.navigate?.('/create-wallet');
  };

  @action public reset = () => {
    console.log('Resetting account login store');
    Object.assign(this, INIT_VALUES);
  };
  @action private handleMessage = (request: any) => {
    const requestData = isExtensionEnvironment() ? request : request.data;
    switch (requestData.type) {
    case MESSAGE_TYPE.GET_ACCOUNTS_RETURN:
      this.accounts = requestData.accounts;
      if (!isEmpty(requestData.accounts)) {
        console.log('Received accounts:', requestData.accounts);
        this.accounts = requestData.accounts;
        this.setSelectedWallet();
      } else {
        if (this.validatesNetwork) {
          console.log('No accounts received. Validating network.');
          this.validateNetwork();
        }
      }
      break;

    default:
      break;
    }
  };
}
