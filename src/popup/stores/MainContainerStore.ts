import { action, observable, makeObservable } from 'mobx';

import AppStore from './AppStore';
import { MESSAGE_TYPE } from '../../constants';

export default class MainContainerStore {
  @observable public unexpectedError?: string = undefined;

  private app: AppStore;

  constructor(app: AppStore) {
    makeObservable(this);
    this.app = app;
    chrome.runtime.onMessage.addListener(this.handleMessage);
  }

  @action
  private handleMessage = (request: any) => {
      console.log('MainContainer Store Received message:', request);

      const { loginStore, importStore, routerStore }: any = this.app;
      switch (request.type) {
      case MESSAGE_TYPE.SAVE_SEED_TO_FILE_RETURN: {
        const blob = new Blob([request.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = request.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        break;
      }
      case MESSAGE_TYPE.ROUTE_LOGIN:
        console.log('Routing to login page');
        routerStore.push('/login');
        break;

      case MESSAGE_TYPE.ACCOUNT_LOGIN_SUCCESS:
        console.log('Account login success. Routing to home page');
        routerStore.push('/home');
        break;

      case MESSAGE_TYPE.LOGIN_FAILURE:
        console.log('Login failure. Setting invalid password and routing to login page');
        loginStore.invalidPassword = true;
        routerStore.push('/login');
        break;

      case MESSAGE_TYPE.LOGIN_SUCCESS_WITH_ACCOUNTS:
        console.log('Login success with accounts. Routing to account login page');
        routerStore.push('/account-login');
        break;

      case MESSAGE_TYPE.LOGIN_SUCCESS_NO_ACCOUNTS:
        console.log('Login success with no accounts. Routing to create wallet page');
        routerStore.push('/create-wallet');
        break;

      case MESSAGE_TYPE.IMPORT_MNEMONIC_PRKEY_FAILURE:
        console.log('Import mnemonic/prkey failure. Setting importMnemonicPrKeyFailed and going back');
        importStore.importMnemonicPrKeyFailed = true;
        routerStore.goBack();
        break;

      case MESSAGE_TYPE.UNEXPECTED_ERROR:
        console.log('Received unexpected error:', request.error);
        if (routerStore.location.pathname === '/loading') {
          console.log('Going back from loading page');
          routerStore.goBack();
        }
        this.unexpectedError = request.error;
        break;

      default:
        break;
      }
    };
}
