// createWalletSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isEmpty } from 'lodash';
import { MESSAGE_TYPE } from '../../../constants';
import { sendMessage } from '../../abstraction';
import type { RootState } from '../index';
import { getNavigateFunction } from '../messageMiddleware';

interface CreateWalletState {
  walletName: string;
  walletNameTaken: boolean;
}

const initialState: CreateWalletState = {
  walletName: '',
  walletNameTaken: false,
};

const createWalletSlice = createSlice({
  name: 'createWallet',
  initialState,
  reducers: {
    setWalletName: (state, action: PayloadAction<string>) => {
      state.walletName = action.payload;
    },
    setWalletNameTaken: (state, action: PayloadAction<boolean>) => {
      state.walletNameTaken = action.payload;
    },
    resetCreateWallet: () => {
      console.log('Resetting CreateWalletStore');
      return initialState;
    },
  },
});

// Selectors
export const selectWalletNameError = (state: RootState): string | undefined =>
  state.createWallet.walletNameTaken ? 'Wallet name is taken' : undefined;

export const selectCreateWalletError = (state: RootState): boolean => {
  const { walletName, walletNameTaken } = state.createWallet;
  return isEmpty(walletName) || walletNameTaken;
};

export const selectShowBackButton = (state: RootState): boolean =>
  !isEmpty(state.accountLogin.accounts);

// Side-effect actions
export const validateWalletName = (name: string) => (dispatch: any) => {
  dispatch(createWalletSlice.actions.setWalletName(name));
  console.log(`Wallet name changed: ${name}`);
  sendMessage(
    { type: MESSAGE_TYPE.VALIDATE_WALLET_NAME, name },
    (response: any) => {
      console.log(`Wallet name taken: ${response}`);
      dispatch(createWalletSlice.actions.setWalletNameTaken(response));
    },
  );
};

export const routeToSaveMnemonic = () => {
  console.log('Routing to SaveMnemonic');
  const navigate = getNavigateFunction();
  navigate?.('/save-mnemonic');
};

export const routeToImportWallet = () => {
  console.log('Routing to ImportWallet');
  const navigate = getNavigateFunction();
  navigate?.('/import-wallet');
};

export const { setWalletName, setWalletNameTaken, resetCreateWallet } = createWalletSlice.actions;

export default createWalletSlice.reducer;
