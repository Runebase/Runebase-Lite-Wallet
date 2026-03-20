// saveMnemonicSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateMnemonic } from 'bip39';
import { Buffer } from 'buffer';
import { MESSAGE_TYPE } from '../../../constants';
import { sendMessage } from '../../abstraction';
import { getNavigateFunction } from '../messageMiddleware';

globalThis.Buffer = Buffer;

interface SaveMnemonicState {
  mnemonic: string[];
  walletName: string;
}

const initialState: SaveMnemonicState = {
  mnemonic: [],
  walletName: '',
};

const saveMnemonicSlice = createSlice({
  name: 'saveMnemonic',
  initialState,
  reducers: {
    setMnemonic: (state, action: PayloadAction<string[]>) => {
      state.mnemonic = action.payload;
    },
    generateNewMnemonic: (state) => {
      state.mnemonic = generateMnemonic().split(' ');
      console.log('Generated mnemonic:', state.mnemonic);
    },
    setWalletName: (state, action: PayloadAction<string>) => {
      state.walletName = action.payload;
    },
    resetSaveMnemonic: () => {
      console.log('Resetting save mnemonic store');
      return initialState;
    },
  },
});

// Side-effect actions
export const createWallet = () => (dispatch: any, getState: any) => {
  const { saveMnemonic } = getState();
  console.log('Creating wallet');
  const navigate = getNavigateFunction();
  navigate?.('/loading');
  sendMessage({
    type: MESSAGE_TYPE.IMPORT_MNEMONIC,
    accountName: saveMnemonic.walletName,
    mnemonicPrivateKey: saveMnemonic.mnemonic.join(' '),
  });
};

export const saveToFile = () => (dispatch: any, getState: any) => {
  const { saveMnemonic } = getState();
  console.log('Saving Wallet To File');
  sendMessage({
    type: MESSAGE_TYPE.SAVE_TO_FILE,
    accountName: saveMnemonic.walletName,
    mnemonicPrivateKey: saveMnemonic.mnemonic.join(' '),
  });
};

export const {
  setMnemonic,
  generateNewMnemonic,
  setWalletName,
  resetSaveMnemonic,
} = saveMnemonicSlice.actions;

export default saveMnemonicSlice.reducer;
