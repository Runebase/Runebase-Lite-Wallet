// sessionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isUndefined } from 'lodash';
import { MESSAGE_TYPE, NETWORK_NAMES } from '../../../constants';
import { sendMessage } from '../../abstraction';
import type { RootState } from '../index';

interface WalletBackupInfo {
  address: string;
  privateKey: string;
}

interface SessionState {
  networkIndex: number;
  networks: any[];
  loggedInAccountName?: string;
  walletInfo?: any;
  blockchainInfo?: any;
  delegationInfo?: any;
  runebaseUSD?: number;
  walletBackupInfo: WalletBackupInfo;
}

const initialState: SessionState = {
  networkIndex: 0,
  networks: [],
  loggedInAccountName: undefined,
  walletInfo: undefined,
  blockchainInfo: {
    height: 0,
    supply: 0,
    circulatingSupply: 0,
    netStakeWeight: 0,
    feeRate: 0,
    dgpInfo: {
      maxBlockSize: 0,
      minGasPrice: 0,
      blockGasLimit: 0,
    },
  },
  delegationInfo: {
    staker: '',
    fee: 0,
    blockHeight: 0,
    PoD: '',
    verified: false,
  },
  runebaseUSD: undefined,
  walletBackupInfo: {
    address: '',
    privateKey: '',
  },
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setNetworkIndex: (state, action: PayloadAction<number>) => {
      state.networkIndex = action.payload;
    },
    setNetworks: (state, action: PayloadAction<any[]>) => {
      state.networks = action.payload;
    },
    setLoggedInAccountName: (state, action: PayloadAction<string>) => {
      state.loggedInAccountName = action.payload;
    },
    setWalletInfo: (state, action: PayloadAction<any>) => {
      state.walletInfo = action.payload;
    },
    setBlockchainInfo: (state, action: PayloadAction<any>) => {
      state.blockchainInfo = action.payload;
      console.log('sessionSlice.blockchainInfo: ', action.payload);
    },
    setDelegationInfo: (state, action: PayloadAction<any>) => {
      state.delegationInfo = action.payload;
    },
    setRunebaseUSD: (state, action: PayloadAction<number>) => {
      state.runebaseUSD = action.payload;
    },
    setWalletBackupInfo: (state, action: PayloadAction<WalletBackupInfo>) => {
      state.walletBackupInfo = action.payload;
    },
    initWalletBackupInfo: (state) => {
      state.walletBackupInfo = { address: '', privateKey: '' };
    },
  },
});

// Selectors
export const selectRunebaseBalanceUSD = (state: RootState) =>
  isUndefined(state.session.runebaseUSD) ? 'Loading...' : `(~$${state.session.runebaseUSD})`;

export const selectNetworkName = (state: RootState) =>
  state.session.networks[state.session.networkIndex]?.name;

export const selectIsMainNet = (state: RootState) =>
  selectNetworkName(state) === NETWORK_NAMES.MAINNET;

export const {
  setNetworkIndex,
  setNetworks,
  setLoggedInAccountName,
  setWalletInfo,
  setBlockchainInfo,
  setDelegationInfo,
  setRunebaseUSD,
  setWalletBackupInfo,
  initWalletBackupInfo,
} = sessionSlice.actions;

// Side-effect function (not a reducer — just sends messages to background)
export const initSession = () => {
  sendMessage({ type: MESSAGE_TYPE.GET_NETWORKS });
  sendMessage({ type: MESSAGE_TYPE.GET_NETWORK_INDEX });
  sendMessage({ type: MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME });
  sendMessage({ type: MESSAGE_TYPE.GET_BLOCKCHAIN_INFO });
  sendMessage({ type: MESSAGE_TYPE.GET_WALLET_INFO });
  sendMessage({ type: MESSAGE_TYPE.GET_DELEGATION_INFO });
  sendMessage({ type: MESSAGE_TYPE.GET_RUNEBASE_USD });
};

// Lighter version called after account login success — networks/index already loaded
export const refreshSession = () => {
  sendMessage({ type: MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME });
  sendMessage({ type: MESSAGE_TYPE.GET_BLOCKCHAIN_INFO });
  sendMessage({ type: MESSAGE_TYPE.GET_WALLET_INFO });
  sendMessage({ type: MESSAGE_TYPE.GET_DELEGATION_INFO });
  sendMessage({ type: MESSAGE_TYPE.GET_RUNEBASE_USD });
};

export default sessionSlice.reducer;
