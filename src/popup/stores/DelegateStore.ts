import { observable, action, makeObservable, computed } from 'mobx';
import { MESSAGE_TYPE } from '../../constants';
import AppStore from './AppStore';
import { PodReturnResult, SuperStaker, SuperStakerArray } from '../../types';
import { RunebaseInfo } from 'runebasejs-wallet';
import { isValidDelegationFee, isValidGasLimit, isValidGasPrice } from '../../utils';
import { addMessageListener, isExtensionEnvironment, sendMessage } from '../abstraction';



const INIT_VALUES = {
  superstakers: undefined as SuperStakerArray | undefined,
  selectedSuperstaker: undefined as SuperStaker | undefined,
  selectedSuperstakerDelegations: undefined as RunebaseInfo.IGetSuperStakerDelegations | undefined,
  delegationFeeRecommendedAmount: 10 as number,
  signedPoD: undefined as PodReturnResult | undefined,
  errorMessage: undefined,
  gasLimitRecommendedAmount: 2500000,
  gasPriceRecommendedAmount: 80,
};

export default class DelegateStore {
  @observable public superstakers?: SuperStakerArray = INIT_VALUES.superstakers;
  @observable public selectedSuperstaker?: SuperStaker = INIT_VALUES.selectedSuperstaker;
  @observable public selectedSuperstakerDelegations?:
    RunebaseInfo.IGetSuperStakerDelegations = INIT_VALUES.selectedSuperstakerDelegations;
  @observable public delegationFee: number = INIT_VALUES.delegationFeeRecommendedAmount;
  public delegationFeeRecommendedAmount: number = INIT_VALUES.delegationFeeRecommendedAmount;
  @observable public signedPoD?: PodReturnResult | undefined = INIT_VALUES.signedPoD;
  @observable public errorMessage?: string = INIT_VALUES.errorMessage;
  public gasLimitRecommendedAmount: number = INIT_VALUES.gasLimitRecommendedAmount;
  public gasPriceRecommendedAmount: number = INIT_VALUES.gasPriceRecommendedAmount;
  @observable public gasLimit: number = INIT_VALUES.gasLimitRecommendedAmount;
  @observable public gasPrice: number = INIT_VALUES.gasPriceRecommendedAmount;

  private app: AppStore;

  constructor(app: AppStore) {
    makeObservable(this);
    this.app = app;
    addMessageListener(this.handleMessage);
  }

  @computed public get gasLimitFieldError(): string | undefined {
    return isValidGasLimit(this.gasLimit) ? undefined : 'Not a valid gas limit';
  }
  @computed public get gasPriceFieldError(): string | undefined {
    return isValidGasPrice(this.gasPrice) ? undefined : 'Not a valid gas price';
  }

  @computed public get buttonDisabled(): boolean {
    const isButtonDisabled = !this.delegationFee || !!this.delegationFeeFieldError;
    return isButtonDisabled;
  }

  @computed public get delegationFeeFieldError(): string | undefined {
    return isValidDelegationFee(this.delegationFee) ? undefined : 'Not a valid delegation fee';
  }

  @action public setDelegationFee = (delegationFee: number) => {
    this.delegationFee = delegationFee;
  };

  @action public getSuperstakers = () => {
    sendMessage({ type: MESSAGE_TYPE.GET_SUPERSTAKERS }, () => {});
  };

  @action public getSuperstaker = (
    address: string,
  ) => {
    sendMessage({ type: MESSAGE_TYPE.GET_SUPERSTAKER, address: address, }, () => {});
  };

  @action public setSelectedSuperStaker = (superstaker?: SuperStaker) => {
    this.selectedSuperstaker = superstaker;
  };

  @action public getSelectedSuperstakerDelegations = () => {
    if (this.selectedSuperstaker) {
      sendMessage({
        type: MESSAGE_TYPE.GET_SUPERSTAKER_DELEGATIONS,
        address: this.selectedSuperstaker.address,
      }, () => {});
    }
  };

  @action public routeToAddDelegationConfirm = () => {
    if (this.selectedSuperstaker) {
      sendMessage({
        type: MESSAGE_TYPE.SIGN_POD,
        superStakerAddress: this.selectedSuperstaker.address,
      }, () => {});
      this.app.routerStore.push('/add-delegation-confirm');
    }
  };
  @action public routeToRemoveDelegationConfirm = () => {
    this.app.routerStore.push('/remove-delegation-confirm');
  };

  @action public sendDelegationConfirm = () => {
    sendMessage({
      type: MESSAGE_TYPE.SEND_DELEGATION_CONFIRM,
      signedPoD: this.signedPoD,
      fee: this.delegationFee,
      gasLimit: Number(this.gasLimit),
      gasPrice: Number(this.gasPrice * 1e-8),
    }, () => {});
  };

  @action public sendRemoveDelegationConfirm = () => {
    sendMessage({
      type: MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM,
      gasLimit: Number(this.gasLimit),
      gasPrice: Number(this.gasPrice * 1e-8),
    }, () => {});
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

  @action private setProofOfDelegationMessage = (
    signedPod: PodReturnResult
  ) => {
    this.signedPoD = signedPod;
  };

  @action public setGasLimit = (gasLimit: number) => {
    this.gasLimit = gasLimit;
  };
  @action public setGasPrice = (gasPrice: number) => {
    this.gasPrice = gasPrice;
  };

  @action private handleMessage = (request: any) => {
    const requestData = isExtensionEnvironment() ? request : request.data;
    switch (requestData.type) {
    case MESSAGE_TYPE.GET_SUPERSTAKERS_RETURN:
      console.log('GET_SUPERSTAKERS_RETURN: ', requestData);
      this.setSuperStakers(requestData.superstakers);
      break;
    case MESSAGE_TYPE.GET_SUPERSTAKER_RETURN:
      console.log('GET_SUPERSTAKER_RETURN: ', requestData);
      this.setSelectedSuperStaker(requestData.superstaker);
      this.app.routerStore.push('/superstaker-detail');
      break;
    case MESSAGE_TYPE.GET_SUPERSTAKER_DELEGATIONS_RETURN:
      console.log('GET_SUPERSTAKER_DELEGATIONS_RETURN: ', requestData);
      this.setSuperStakerDelegations(requestData.superstakerDelegations);
      break;
    case MESSAGE_TYPE.SIGN_POD_RETURN:
      console.log('SIGN_POD_RETURN: ', requestData);
      this.setProofOfDelegationMessage(requestData.result);
      break;
    case MESSAGE_TYPE.SEND_DELEGATION_CONFIRM_SUCCESS:
      console.log('SEND_DELEGATION_CONFIRM_SUCCESS:', requestData);
      this.app.routerStore.push('/account-detail');
      break;
    case MESSAGE_TYPE.SEND_DELEGATION_CONFIRM_FAILURE:
      console.log('SEND_DELEGATION_CONFIRM_FAILURE:', requestData);
      this.errorMessage = requestData.error.message;
      break;
    case MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM_SUCCESS:
      console.log('SEND_REMOVE_DELEGATION_CONFIRM_SUCCESS:', requestData);
      this.app.routerStore.push('/account-detail');
      break;
    case MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM_FAILURE:
      console.log('SEND_DELEGATION_CONFIRM_FAILURE:', requestData);
      this.errorMessage = requestData.error.message;
      break;
    default:
      break;
    }
  };
}
