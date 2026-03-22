// importSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isEmpty } from 'lodash';
import { MESSAGE_TYPE, IMPORT_TYPE } from '../../../constants';
import { isValidPrivateKey } from '../../../utils';
import { sendMessage } from '../../abstraction';
import { getNavigateFunction } from '../messageMiddleware';
import type { RootState } from '../index';

interface ImportState {
  accountName: string;
  walletNameTaken: boolean;
  importMnemonicPrKeyFailed: boolean;
  importType: string;
  mnemonic: string[];
  privateKey: string;
}

const initialState: ImportState = {
  accountName: '',
  walletNameTaken: false,
  importMnemonicPrKeyFailed: false,
  importType: IMPORT_TYPE.MNEMONIC,
  mnemonic: Array.from({ length: 12 }, () => ''),
  privateKey: '',
};

const importSlice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    setAccountName: (state, action: PayloadAction<string>) => {
      state.accountName = action.payload;
    },
    setWalletNameTaken: (state, action: PayloadAction<boolean>) => {
      state.walletNameTaken = action.payload;
    },
    setImportMnemonicPrKeyFailed: (state, action: PayloadAction<boolean>) => {
      state.importMnemonicPrKeyFailed = action.payload;
    },
    setImportType: (state, action: PayloadAction<string>) => {
      state.importType = action.payload;
    },
    setMnemonic: (state, action: PayloadAction<string[]>) => {
      state.mnemonic = action.payload;
    },
    setPrivateKey: (state, action: PayloadAction<string>) => {
      state.privateKey = action.payload;
    },
    resetImport: (state) => {
      const tempImportType = state.importType;
      Object.assign(state, {
        ...initialState,
        mnemonic: Array.from({ length: 12 }, () => ''),
        importType: tempImportType,
      });
    },
  },
});

// Selectors
export const selectWalletNameError = (state: RootState): string | undefined =>
  state.import.walletNameTaken ? 'Wallet name is taken' : undefined;

export const selectPrivateKeyError = (state: RootState): string | undefined => {
  if (state.import.importType === IMPORT_TYPE.PRIVATE_KEY) {
    return isValidPrivateKey(state.import.privateKey) ? undefined : 'Not a valid private key';
  }
  return undefined;
};

export const selectPrivateKeyPageError = (state: RootState): boolean => {
  const { privateKey, accountName, walletNameTaken } = state.import;
  const walletNameError = walletNameTaken ? 'Wallet name is taken' : undefined;
  const privateKeyError = state.import.importType === IMPORT_TYPE.PRIVATE_KEY
    ? (isValidPrivateKey(privateKey) ? undefined : 'Not a valid private key')
    : undefined;
  return [privateKey, accountName].some(isEmpty)
    || !!walletNameError || !!privateKeyError || accountName.length < 1;
};

export const selectMnemonicPageError = (state: RootState): boolean => {
  const { mnemonic, accountName, walletNameTaken } = state.import;
  const isMnemonicValid = mnemonic.length === 12 && mnemonic.every((word: string) => word.length > 0);
  const walletNameError = walletNameTaken ? 'Wallet name is taken' : undefined;
  return !isMnemonicValid || !!walletNameError || accountName.length < 1;
};

// Side-effect actions
export const validateImportWalletName = (name: string) => (dispatch: any) => {
  dispatch(importSlice.actions.setAccountName(name));
  sendMessage(
    { type: MESSAGE_TYPE.VALIDATE_WALLET_NAME, name },
    (response: any) => {
      dispatch(importSlice.actions.setWalletNameTaken(response));
    },
  );
};

export const importPrivateKey = () => (dispatch: any, getState: any) => {
  const state: RootState = getState();
  if (!selectPrivateKeyPageError(state)) {
    const navigate = getNavigateFunction();
    navigate?.('/loading');
    sendMessage({
      type: MESSAGE_TYPE.IMPORT_PRIVATE_KEY,
      accountName: state.import.accountName,
      mnemonicPrivateKey: state.import.privateKey,
    });
  }
};

export const importSeedPhrase = () => (dispatch: any, getState: any) => {
  const state: RootState = getState();
  if (!selectMnemonicPageError(state)) {
    const navigate = getNavigateFunction();
    navigate?.('/loading');
    sendMessage({
      type: MESSAGE_TYPE.IMPORT_MNEMONIC,
      accountName: state.import.accountName,
      mnemonicPrivateKey: state.import.mnemonic.join(' '),
    });
  }
};

export const cancelImport = () => {
  const navigate = getNavigateFunction();
  navigate?.(-1);
};

export const {
  setAccountName,
  setWalletNameTaken,
  setImportMnemonicPrKeyFailed,
  setImportType,
  setMnemonic,
  setPrivateKey,
  resetImport,
} = importSlice.actions;

export default importSlice.reducer;
