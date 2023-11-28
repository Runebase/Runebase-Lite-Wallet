import { observable, action, makeObservable } from 'mobx';
import { MESSAGE_TYPE } from '../../constants';
import AppStore from './AppStore';
import { SuperStaker, SuperStakerArray } from '../../types';
import { RunebaseInfo } from 'runebasejs-wallet';

const INIT_VALUES = {
  superstakers: undefined as SuperStakerArray | undefined,
  selectedSuperstaker: undefined as SuperStaker | undefined,
  selectedSuperstakerDelegations: undefined as RunebaseInfo.IGetSuperStakerDelegations | undefined,
};

export default class DelegateStore {
  @observable public superstakers?: SuperStakerArray = INIT_VALUES.superstakers;
  @observable public selectedSuperstaker?: SuperStaker = INIT_VALUES.selectedSuperstaker;
  @observable public selectedSuperstakerDelegations?:
    RunebaseInfo.IGetSuperStakerDelegations = INIT_VALUES.selectedSuperstakerDelegations;

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

  @action public setSelectedSuperStaker = (superstaker?: SuperStaker) => {
    this.selectedSuperstaker = superstaker;
    console.log(this.selectedSuperstaker);
  };

  @action public getSelectedSuperstakerDelegations = () => {
    if (this.selectedSuperstaker) {
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPE.GET_SUPERSTAKER_DELEGATIONS,
        address: this.selectedSuperstaker.address,
      });
    }
  };

  @action public undelegate = () => {
    // this.sendState = SEND_STATE.SENDING;
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPE.SEND_UNDELEGATE,
    });
  };

  @action public delegate = () => {

  };

  @action private setSuperStakers = (
    superstakers: SuperStakerArray
  ) => {
    this.superstakers = superstakers;
  };

  @action public setSuperStakerDelegations = (
    selectedSuperstakerDelegations?: RunebaseInfo.IGetSuperStakerDelegations
  ) => {
    this.selectedSuperstakerDelegations = selectedSuperstakerDelegations;
    console.log(selectedSuperstakerDelegations);
  };

  @action private handleMessage = (request: any) => {
    switch (request.type) {
    case MESSAGE_TYPE.GET_SUPERSTAKERS_RETURN:
      this.setSuperStakers(request.superstakers);
      break;
    case MESSAGE_TYPE.GET_SUPERSTAKER_DELEGATIONS_RETURN:
      console.log('GET_SUPERSTAKER_DELEGATIONS_RETURN: ', request);
      this.setSuperStakerDelegations(request.superstakerDelegations);
      break;
    default:
      break;
    }
  };
}
