// delegateSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MESSAGE_TYPE } from '../../../constants';
import { isValidDelegationFee, isValidGasLimit, isValidGasPrice } from '../../../utils';
import { sendMessage } from '../../abstraction';
import { getNavigateFunction } from '../messageMiddleware';
import type { RootState } from '../index';

export interface DelegationReadiness {
  canDelegate: boolean;
  matureBalance: number;    // satoshis
  immatureBalance: number;  // satoshis
  blocksUntilMature?: number;
  currentHeight?: number;
}

interface DelegateState {
  superstakers?: any[];
  selectedSuperstaker?: any;
  selectedSuperstakerDelegations?: any;
  customSuperstakerAddress: string;
  delegationFee: number;
  signedPoD?: any;
  errorMessage?: string;
  gasLimit: number;
  gasPrice: number;
  isLoading: boolean;
  isSubmitting: boolean;
  readiness?: DelegationReadiness;
}

const DELEGATION_GAS_LIMIT_DEFAULT = 2500000;
const DELEGATION_GAS_PRICE_DEFAULT = 8000;

const initialState: DelegateState = {
  superstakers: undefined,
  selectedSuperstaker: undefined,
  selectedSuperstakerDelegations: undefined,
  customSuperstakerAddress: '',
  delegationFee: 10,
  signedPoD: undefined,
  errorMessage: undefined,
  gasLimit: DELEGATION_GAS_LIMIT_DEFAULT,
  gasPrice: DELEGATION_GAS_PRICE_DEFAULT,
  isLoading: false,
  isSubmitting: false,
};

const delegateSlice = createSlice({
  name: 'delegate',
  initialState,
  reducers: {
    setSuperStakers: (state, action: PayloadAction<any[]>) => {
      state.superstakers = action.payload;
      state.isLoading = false;
    },
    setSelectedSuperStaker: (state, action: PayloadAction<any>) => {
      state.selectedSuperstaker = action.payload;
    },
    setSuperStakerDelegations: (state, action: PayloadAction<any>) => {
      state.selectedSuperstakerDelegations = action.payload;
    },
    setDelegationFee: (state, action: PayloadAction<number>) => {
      state.delegationFee = action.payload;
    },
    setSignedPoD: (state, action: PayloadAction<any>) => {
      state.signedPoD = action.payload;
    },
    setDelegateErrorMessage: (state, action: PayloadAction<string | undefined>) => {
      state.errorMessage = action.payload;
      state.isSubmitting = false;
    },
    setGasLimit: (state, action: PayloadAction<number>) => {
      state.gasLimit = action.payload;
    },
    setGasPrice: (state, action: PayloadAction<number>) => {
      state.gasPrice = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIsSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    setCustomSuperstakerAddress: (state, action: PayloadAction<string>) => {
      state.customSuperstakerAddress = action.payload;
    },
    setDelegationReadiness: (state, action: PayloadAction<DelegationReadiness | undefined>) => {
      state.readiness = action.payload;
    },
  },
});

// Selectors
export const selectGasLimitFieldError = (state: RootState): string | undefined =>
  isValidGasLimit(state.delegate.gasLimit) ? undefined : 'Not a valid gas limit';

export const selectGasPriceFieldError = (state: RootState): string | undefined =>
  isValidGasPrice(state.delegate.gasPrice) ? undefined : 'Not a valid gas price';

export const selectDelegationFeeFieldError = (state: RootState): string | undefined =>
  isValidDelegationFee(state.delegate.delegationFee) ? undefined : 'Not a valid delegation fee';

export const selectDelegateButtonDisabled = (state: RootState): boolean =>
  !state.delegate.delegationFee || !!selectDelegationFeeFieldError(state);

// Side-effect actions
export const getSuperstakers = () => {
  sendMessage({ type: MESSAGE_TYPE.GET_SUPERSTAKERS }, () => {});
};

export const getDelegationReadiness = () => {
  sendMessage({ type: MESSAGE_TYPE.GET_DELEGATION_READINESS }, () => {});
};

export const getSuperstaker = (address: string) => {
  sendMessage({ type: MESSAGE_TYPE.GET_SUPERSTAKER, address }, () => {});
};

export const getSelectedSuperstakerDelegations = () => (_dispatch: any, getState: any) => {
  const state: RootState = getState();
  const { selectedSuperstaker } = state.delegate;
  if (selectedSuperstaker) {
    sendMessage({
      type: MESSAGE_TYPE.GET_SUPERSTAKER_DELEGATIONS,
      address: selectedSuperstaker.address,
    }, () => {});
  }
};

export const routeToAddDelegationConfirm = () => (_dispatch: any, getState: any) => {
  const state: RootState = getState();
  const { selectedSuperstaker, customSuperstakerAddress } = state.delegate;
  const address = selectedSuperstaker?.address || customSuperstakerAddress;
  if (address) {
    sendMessage({
      type: MESSAGE_TYPE.SIGN_POD,
      superStakerAddress: address,
    }, () => {});
    const navigate = getNavigateFunction();
    navigate?.('/add-delegation-confirm');
  }
};

export const routeToRemoveDelegationConfirm = () => {
  const navigate = getNavigateFunction();
  navigate?.('/remove-delegation-confirm');
};

export const sendDelegationConfirm = () => (dispatch: any, getState: any) => {
  const state: RootState = getState();
  const { signedPoD, delegationFee, gasLimit, gasPrice } = state.delegate;
  const stringifiedSignedPoD = JSON.stringify(signedPoD);
  dispatch(delegateSlice.actions.setIsSubmitting(true));
  sendMessage({
    type: MESSAGE_TYPE.SEND_DELEGATION_CONFIRM,
    signedPoD: stringifiedSignedPoD,
    fee: delegationFee,
    gasLimit: Number(gasLimit),
    gasPrice: Number(gasPrice),
  }, () => {});
};

export const sendRemoveDelegationConfirm = () => (dispatch: any, getState: any) => {
  const state: RootState = getState();
  const { gasLimit, gasPrice } = state.delegate;
  dispatch(delegateSlice.actions.setIsSubmitting(true));
  sendMessage({
    type: MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM,
    gasLimit: Number(gasLimit),
    gasPrice: Number(gasPrice),
  }, () => {});
};

export const DELEGATION_FEE_RECOMMENDED = 10;
export const DELEGATION_GAS_LIMIT_RECOMMENDED = DELEGATION_GAS_LIMIT_DEFAULT;
export const DELEGATION_GAS_PRICE_RECOMMENDED = DELEGATION_GAS_PRICE_DEFAULT;

export const {
  setSuperStakers,
  setSelectedSuperStaker,
  setSuperStakerDelegations,
  setCustomSuperstakerAddress,
  setDelegationFee,
  setSignedPoD,
  setDelegateErrorMessage,
  setDelegationReadiness,
  setGasLimit,
  setGasPrice,
  setIsLoading,
  setIsSubmitting,
} = delegateSlice.actions;

export default delegateSlice.reducer;
