import { observable, action, makeObservable } from 'mobx';
import { MESSAGE_TYPE } from '../../constants';
import AppStore from './AppStore';
import { SuperStakerArray } from '../../types';

const INIT_VALUES = {
  superstakers: undefined as SuperStakerArray | undefined
};

export default class DelegateStore {
  @observable public superstakers?: SuperStakerArray = INIT_VALUES.superstakers;

  private app: AppStore;

  constructor(app: AppStore) {
    makeObservable(this);
    this.app = app;
    console.log(this.app);
    chrome.runtime.onMessage.addListener(this.handleMessage);
  }

  @action public getSuperstakers = () => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_SUPERSTAKERS });
  };

  @action public undelegate = () => {
    // this.sendState = SEND_STATE.SENDING;
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPE.SEND_UNDELEGATE,
    });
  };

  @action public delegate = () => {

  };

  @action private handleMessage = (request: any) => {
    switch (request.type) {
    case MESSAGE_TYPE.GET_SUPERSTAKERS_RETURN:
      this.setSuperStakers(request.superstakers);
      break;
    default:
      break;
    }
  };

  @action private setSuperStakers = (superstakers: SuperStakerArray) => {
    this.superstakers = superstakers;
    console.log(this.superstakers);
  };
}
