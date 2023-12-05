import { observable, action, makeObservable } from 'mobx';

import { MESSAGE_TYPE } from '../../../constants';
import AppStore from '../AppStore';
import { sendMessage } from '../../abstraction';

const INIT_VALUES = {
  settingsMenuAnchor: null,
};

export default class NavBarStore {
  @observable public settingsMenuAnchor?: Element | null = INIT_VALUES.settingsMenuAnchor;

  private app: AppStore;

  constructor(app: AppStore) {
    makeObservable(this);
    this.app = app;
  }

  @action public reset = () => {
    Object.assign(this, INIT_VALUES);
  };

  @action public changeNetwork = (index: number) => {
    console.log('CALLED CHANGENETWORK to INDEX', index);
    sendMessage({ type: MESSAGE_TYPE.CHANGE_NETWORK, networkIndex: index });
  };

  @action public routeToSettings = () => {
    this.reset();
    this.app?.navigate?.('/settings');
  };

  @action public routeToManageTokens = () => {
    this.reset();
    this.app?.navigate?.('/manage-tokens');
  };

  @action public logout = () => {
    this.reset();
    this.app?.navigate?.('/loading');
    sendMessage({ type: MESSAGE_TYPE.LOGOUT });
  };
}
