// LoginStore.ts
import { observable, computed, action, makeObservable, runInAction } from 'mobx';
import { isEmpty } from 'lodash';

import AppStore from './AppStore';
import { MESSAGE_TYPE, RESPONSE_TYPE } from '../../constants';
import { addMessageListener, isExtensionEnvironment, sendMessage } from '../abstraction';

const INIT_VALUES = {
  hasAccounts: false,
  password: '',
  confirmPassword: '',
  invalidPassword: undefined,
  algorithm: 'PBKDF2',
};

export default class LoginStore {
  @observable public hasAccounts: boolean = INIT_VALUES.hasAccounts;
  @observable public password: string = INIT_VALUES.password;
  @observable public algorithm: string = INIT_VALUES.algorithm;
  @observable public confirmPassword: string = INIT_VALUES.confirmPassword;
  @observable public invalidPassword?: boolean = INIT_VALUES.invalidPassword;
  @computed public get matchError(): string | undefined {
    return this.getMatchError();
  }
  @computed public get error(): boolean {
    const matchError = this.getMatchError();
    return (!this.hasAccounts && !!matchError) || isEmpty(this.password);
  }

  private app: AppStore;

  constructor(app: AppStore) {
    makeObservable(this);
    this.app = app;
    addMessageListener(this.handleMessage);
    sendMessage({ type: MESSAGE_TYPE.HAS_ACCOUNTS }, () => {});


    // Attempt to restore session
    sendMessage({ type: MESSAGE_TYPE.RESTORE_SESSION }, action((response: any) => {
      console.log('Received restore session response:', response);

      if (response === RESPONSE_TYPE.RESTORING_SESSION) {
        runInAction(() => {
          this.app?.navigate?.('/loading');
        });
      }
    }));
  }

  @action public init = () => {
    console.log('LoginStore init method called');
    runInAction(() => {
      this.password = INIT_VALUES.password;
      this.confirmPassword = INIT_VALUES.confirmPassword;
    });
  };

  @action public login = () => {
    if (this.error === false) {
      console.log('Attempting login...');
      runInAction(() => {
        this.app?.navigate?.('/loading');
      });
      sendMessage({ type: MESSAGE_TYPE.LOGIN, password: this.password, algorithm: this.algorithm }, () => {});
    }
  };

  private getMatchError = (): string | undefined => {
    let error;
    if (this.password !== this.confirmPassword) {
      error = 'Passwords do not match.';
    }
    return error;
  };
  @action private handleMessage = (request: any) => {
    const requestData = isExtensionEnvironment() ? request : request.data;
    switch (requestData.type) {
    case MESSAGE_TYPE.HAS_ACCOUNTS_RETURN:
      this.hasAccounts = requestData.hasAccounts;
      break;
    case MESSAGE_TYPE.RESTORING_SESSION_RETURN:
      this.app?.navigate?.('/loading');
      break;

    default:
      break;
    }
  };
}
