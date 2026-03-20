// addTokenSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { findIndex } from 'lodash';
import { MESSAGE_TYPE } from '../../../constants';
import { isValidContractAddressLength } from '../../../utils';
import { sendMessage } from '../../abstraction';
import { getNavigateFunction } from '../messageMiddleware';
import type { RootState } from '../index';
import { setShouldScrollToBottom } from './accountDetailSlice';

interface AddTokenState {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals?: number;
  getRRCTokenDetailsFailed: boolean;
}

const initialState: AddTokenState = {
  contractAddress: '',
  name: '',
  symbol: '',
  decimals: undefined,
  getRRCTokenDetailsFailed: false,
};

const addTokenSlice = createSlice({
  name: 'addToken',
  initialState,
  reducers: {
    setContractAddress: (state, action: PayloadAction<string>) => {
      state.contractAddress = action.payload;
      // Reset token details when address changes
      state.name = '';
      state.symbol = '';
      state.decimals = undefined;
      state.getRRCTokenDetailsFailed = false;
    },
    setRRCTokenDetails: (state, action: PayloadAction<{ name: string; symbol: string; decimals: number }>) => {
      state.name = action.payload.name;
      state.symbol = action.payload.symbol;
      state.decimals = action.payload.decimals;
    },
    setGetRRCTokenDetailsFailed: (state, action: PayloadAction<boolean>) => {
      state.getRRCTokenDetailsFailed = action.payload;
    },
    resetAddToken: () => initialState,
  },
});

// Selectors
export const selectContractAddressFieldError = (state: RootState): string | undefined =>
  (!!state.addToken.contractAddress
    && isValidContractAddressLength(state.addToken.contractAddress)
    && !state.addToken.getRRCTokenDetailsFailed)
    ? undefined : 'Not a valid contract address';

export const selectTokenAlreadyInListError = (state: RootState): string | undefined => {
  const index = findIndex(state.accountDetail.tokens, { address: state.addToken.contractAddress });
  return index !== -1 ? 'Token already in token list' : undefined;
};

export const selectAddTokenButtonDisabled = (state: RootState): boolean => {
  const { contractAddress, name, symbol, decimals } = state.addToken;
  return !contractAddress
    || !name
    || !symbol
    || !decimals
    || !!selectContractAddressFieldError(state)
    || !!selectTokenAlreadyInListError(state);
};

// Side-effect actions
export const validateContractAddress = (address: string) => (dispatch: any) => {
  dispatch(addTokenSlice.actions.setContractAddress(address));
  console.log('Contract address changed:', address);

  // If valid, fetch token details
  if (address && isValidContractAddressLength(address)) {
    console.log('Fetching RRC token details for:', address);
    sendMessage({
      type: MESSAGE_TYPE.GET_RRC_TOKEN_DETAILS,
      contractAddress: address,
    });
  }
};

export const addToken = () => (dispatch: any, getState: any) => {
  const state: RootState = getState();
  const { contractAddress, name, symbol, decimals } = state.addToken;
  console.log('Adding token:', { contractAddress, name, symbol, decimals });
  sendMessage({
    type: MESSAGE_TYPE.ADD_TOKEN,
    contractAddress,
    name,
    symbol,
    decimals,
  });
  const navigate = getNavigateFunction();
  navigate?.('/manage-tokens');
  dispatch(setShouldScrollToBottom(true));
  dispatch(addTokenSlice.actions.resetAddToken());
};

export const {
  setContractAddress,
  setRRCTokenDetails,
  setGetRRCTokenDetailsFailed,
  resetAddToken,
} = addTokenSlice.actions;

export default addTokenSlice.reducer;
