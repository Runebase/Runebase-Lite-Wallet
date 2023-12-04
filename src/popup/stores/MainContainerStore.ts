import { action, observable, makeObservable } from 'mobx';

import AppStore from './AppStore';
import { MESSAGE_TYPE } from '../../constants';
import { addMessageListener, isExtensionEnvironment, saveFile } from '../abstraction';
import currentPathManager from '../CurrentPathManager';

export default class MainContainerStore {
  @observable public unexpectedError?: string = undefined;

  private app: AppStore;

  constructor(app: AppStore) {
    makeObservable(this);
    this.app = app;
    addMessageListener(this.handleMessage);
  }

  @action private handleMessage = (request: any) => {
    const requestData = isExtensionEnvironment() ? request : request.data;
    const { loginStore, importStore }: any = this.app;
    switch (requestData.type) {
    case MESSAGE_TYPE.SAVE_SEED_TO_FILE_RETURN: {
      const content = requestData.content;
      const filename = requestData.filename;
      saveFile(content, filename);
      break;
    }
    case MESSAGE_TYPE.ROUTE_LOGIN:
      console.log('Routing to login page');
      this.app?.navigate?.('/login');
      break;

    case MESSAGE_TYPE.ACCOUNT_LOGIN_SUCCESS:
      console.log('Account login success. Routing to home page');
      this.app?.navigate?.('/account-detail');
      break;

    case MESSAGE_TYPE.LOGIN_FAILURE:
      console.log('Login failure. Setting invalid password and routing to login page');
      loginStore.invalidPassword = true;
      this.app?.navigate?.('/login');
      break;

    case MESSAGE_TYPE.LOGIN_SUCCESS_WITH_ACCOUNTS:
      console.log('Login success with accounts. Routing to account login page');
      this.app?.navigate?.('/account-login');
      break;

    case MESSAGE_TYPE.LOGIN_SUCCESS_NO_ACCOUNTS:
      console.log('Login success with no accounts. Routing to create wallet page');
      this.app?.navigate?.('/create-wallet');
      break;

    case MESSAGE_TYPE.IMPORT_MNEMONIC_PRKEY_FAILURE:
      console.log('Import mnemonic/prkey failure. Setting importMnemonicPrKeyFailed and going back');
      importStore.importMnemonicPrKeyFailed = true;
      this.app?.navigate?.(-1);
      break;

    case MESSAGE_TYPE.UNEXPECTED_ERROR:{
      console.log('Received unexpected error:', requestData.error);
      const currentPathname = currentPathManager.getPath();
      if (currentPathname === '/loading') {
        console.log('Going back from loading page');
        this.app?.navigate?.(-1);
      }
      this.unexpectedError = requestData.error;}
      break;

    default:
      break;
    }
  };
}
