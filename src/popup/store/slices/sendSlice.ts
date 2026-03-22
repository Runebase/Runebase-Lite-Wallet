// sendSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { find } from 'lodash';
import { SEND_STATE, MESSAGE_TYPE, TRANSACTION_SPEED } from '../../../constants';
import { isValidAddress, isValidAmount, isValidGasLimit, isValidGasPrice } from '../../../utils';
import Config from '../../../config';
import BigNumber from 'bignumber.js';
import { sendMessage } from '../../abstraction';
import { getNavigateFunction } from '../messageMiddleware';
import type { RootState } from '../index';
import { selectIsMainNet } from './sessionSlice';

interface RRCTokenData {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  balance?: number;
}

interface SendState {
  tokens: RRCTokenData[];
  verifiedTokens: RRCTokenData[];
  senderAddress?: string;
  receiverAddress: string;
  token?: RRCTokenData;
  amount: string;
  maxRunebaseSend?: number;
  transactionSpeed: string;
  gasLimit: number;
  gasPrice: number;
  sendState: string;
  errorMessage?: string;
}

const initialState: SendState = {
  tokens: [],
  verifiedTokens: [],
  senderAddress: undefined,
  receiverAddress: '',
  token: undefined,
  amount: '',
  maxRunebaseSend: undefined,
  transactionSpeed: TRANSACTION_SPEED.NORMAL,
  gasLimit: Config.TRANSACTION.DEFAULT_GAS_LIMIT,
  gasPrice: Config.TRANSACTION.DEFAULT_GAS_PRICE,
  sendState: SEND_STATE.INITIAL,
  errorMessage: undefined,
};

const sendSlice = createSlice({
  name: 'send',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<RRCTokenData[]>) => {
      state.tokens = action.payload;
    },
    setVerifiedTokens: (state, action: PayloadAction<RRCTokenData[]>) => {
      state.verifiedTokens = action.payload;
    },
    setSenderAddress: (state, action: PayloadAction<string | undefined>) => {
      state.senderAddress = action.payload;
    },
    setReceiverAddress: (state, action: PayloadAction<string>) => {
      state.receiverAddress = action.payload;
    },
    setToken: (state, action: PayloadAction<RRCTokenData | undefined>) => {
      state.token = action.payload;
    },
    setAmount: (state, action: PayloadAction<string>) => {
      state.amount = action.payload;
    },
    setMaxRunebaseSend: (state, action: PayloadAction<number>) => {
      const runebaseToken = state.tokens[0];
      if (runebaseToken) {
        state.maxRunebaseSend = action.payload / (10 ** runebaseToken.decimals);
      } else {
        state.maxRunebaseSend = 0;
      }
    },
    setTransactionSpeed: (state, action: PayloadAction<string>) => {
      state.transactionSpeed = action.payload;
    },
    setGasLimit: (state, action: PayloadAction<number>) => {
      state.gasLimit = action.payload;
    },
    setGasPrice: (state, action: PayloadAction<number>) => {
      state.gasPrice = action.payload;
    },
    setSendState: (state, action: PayloadAction<string>) => {
      state.sendState = action.payload;
    },
    setErrorMessage: (state, action: PayloadAction<string | undefined>) => {
      state.errorMessage = action.payload;
    },
    changeToken: (state, action: PayloadAction<string>) => {
      console.log('tokenSymbol: ', action.payload);
      const token = find(state.tokens, { symbol: action.payload });
      if (token) {
        console.log('Changing token to:', token);
        state.token = token;
      }
    },
    resetSend: () => initialState,
  },
});

// Selectors
export const selectMaxTxFee = (state: RootState): number | undefined => {
  const { gasPrice, gasLimit } = state.send;
  return gasPrice && gasLimit
    ? Number(gasLimit) * Number(gasPrice) * 1e-8 : undefined;
};

export const selectReceiverFieldError = (state: RootState): string | undefined => {
  const isMainNet = selectIsMainNet(state);
  return isValidAddress(isMainNet, state.send.receiverAddress)
    ? undefined : 'Not a valid Runebase address';
};

export const selectAmountFieldError = (state: RootState): string | undefined => {
  const maxAmount = selectMaxAmount(state);
  return maxAmount && isValidAmount(Number(state.send.amount), maxAmount) ? undefined : 'Not a valid amount';
};

export const selectGasLimitFieldError = (state: RootState): string | undefined =>
  isValidGasLimit(state.send.gasLimit) ? undefined : 'Not a valid gas limit';

export const selectGasPriceFieldError = (state: RootState): string | undefined =>
  isValidGasPrice(state.send.gasPrice) ? undefined : 'Not a valid gas price';

export const selectButtonDisabled = (state: RootState): boolean => {
  const receiverFieldError = selectReceiverFieldError(state);
  const amountFieldError = selectAmountFieldError(state);
  return !state.send.senderAddress || !!receiverFieldError || !state.send.token || !!amountFieldError;
};

export const selectMaxAmount = (state: RootState): number | undefined => {
  const { token, maxRunebaseSend } = state.send;
  if (token) {
    if (token.symbol === 'RUNES') {
      console.log('Calculating max RUNES amount:', maxRunebaseSend);
      return maxRunebaseSend;
    }
    console.log('Calculating max token amount:', token.balance);
    return token.balance;
  }
  console.log('No token selected. Returning undefined.');
  return undefined;
};

// Side-effect actions
export const initSend = () => (dispatch: any, getState: any) => {
  const state: RootState = getState();
  const walletInfo = state.session.walletInfo;

  const tokens: RRCTokenData[] = [];

  sendMessage({ type: MESSAGE_TYPE.GET_RRC_TOKEN_LIST }, (response: any) => {
    const verifiedTokens = response || [];
    dispatch(sendSlice.actions.setVerifiedTokens(verifiedTokens));

    // Build token list from verifiedTokens (tokenController data)
    // Balance is already in human-readable form (divided by decimals)
    for (const t of verifiedTokens) {
      tokens.push({
        name: t.name,
        symbol: t.symbol,
        decimals: Number(t.decimals),
        address: t.address,
        balance: t.balance ?? 0,
      });
    }

    const runesToken: RRCTokenData = {
      name: 'Runebase Token',
      symbol: 'RUNES',
      decimals: 8,
      address: '',
      balance: walletInfo
        ? new BigNumber(walletInfo.balance).dividedBy(1e8).toNumber()
        : undefined,
    };

    const allTokens = [runesToken, ...tokens];
    dispatch(sendSlice.actions.setTokens(allTokens));
    dispatch(sendSlice.actions.setToken(runesToken));
    dispatch(sendSlice.actions.setSenderAddress(walletInfo?.address));
  });

  sendMessage({ type: MESSAGE_TYPE.GET_MAX_RUNEBASE_SEND });
};

export const routeToSendConfirm = () => {
  const navigate = getNavigateFunction();
  navigate?.('/send-confirm');
};

export const executeSend = () => (dispatch: any, getState: any) => {
  const state: RootState = getState();
  const { token, receiverAddress, amount, transactionSpeed, gasLimit, gasPrice } = state.send;

  if (!token) return;

  dispatch(sendSlice.actions.setSendState(SEND_STATE.SENDING));

  if (token.symbol === 'RUNES') {
    console.log('Sending RUNES:', { receiverAddress, amount: Number(amount), transactionSpeed });
    sendMessage({
      type: MESSAGE_TYPE.SEND_TOKENS,
      receiverAddress,
      amount: Number(amount),
      transactionSpeed,
    });
  } else {
    console.log('Sending RRC tokens:', {
      receiverAddress,
      amount: Number(amount),
      token,
      gasLimit: Number(gasLimit),
      gasPrice: Number(gasPrice),
    });
    sendMessage({
      type: MESSAGE_TYPE.SEND_RRC_TOKENS,
      receiverAddress,
      amount: Number(amount),
      token,
      gasLimit: Number(gasLimit),
      gasPrice: Number(gasPrice),
    });
  }
};

export const TRANSACTION_SPEEDS = [TRANSACTION_SPEED.SLOW, TRANSACTION_SPEED.NORMAL, TRANSACTION_SPEED.FAST];
export const GAS_LIMIT_RECOMMENDED = Config.TRANSACTION.DEFAULT_GAS_LIMIT;
export const GAS_PRICE_RECOMMENDED = Config.TRANSACTION.DEFAULT_GAS_PRICE;

export const {
  setTokens,
  setVerifiedTokens,
  setSenderAddress,
  setReceiverAddress,
  setToken,
  setAmount,
  setMaxRunebaseSend,
  setTransactionSpeed,
  setGasLimit,
  setGasPrice,
  setSendState,
  setErrorMessage,
  changeToken,
  resetSend,
} = sendSlice.actions;

export default sendSlice.reducer;
