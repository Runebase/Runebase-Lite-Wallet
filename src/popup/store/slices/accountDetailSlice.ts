// accountDetailSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MESSAGE_TYPE } from '../../../constants';
import {
  sendMessage,
} from '../../abstraction';
import { getNavigateFunction } from '../messageMiddleware';

interface AccountDetailState {
  activeTabIdx: number;
  transactions: any[];
  tokenTransfers: any[];
  selectedTransaction: any | null;
  tokens: any[];
  verifiedTokens: any[];
  hasMore: boolean;
  shouldScrollToBottom: boolean;
  editTokenMode: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
}

const initialState: AccountDetailState = {
  activeTabIdx: 0,
  transactions: [],
  tokenTransfers: [],
  selectedTransaction: null,
  tokens: [],
  verifiedTokens: [],
  hasMore: false,
  shouldScrollToBottom: false,
  editTokenMode: false,
  isLoading: true,
  isLoadingMore: false,
};

const accountDetailSlice = createSlice({
  name: 'accountDetail',
  initialState,
  reducers: {
    setActiveTabIdx: (state, action: PayloadAction<number>) => {
      state.activeTabIdx = action.payload;
    },
    setTransactions: (state, action: PayloadAction<any[]>) => {
      state.transactions = action.payload;
      state.isLoading = false;
      state.isLoadingMore = false;
    },
    setSelectedTransaction: (state, action: PayloadAction<any | null>) => {
      state.selectedTransaction = action.payload;
    },
    setTokenTransfers: (state, action: PayloadAction<any[]>) => {
      state.tokenTransfers = action.payload;
      state.isLoading = false;
    },
    setTokens: (state, action: PayloadAction<any[]>) => {
      state.tokens = action.payload;
    },
    setVerifiedTokens: (state, action: PayloadAction<any[]>) => {
      state.verifiedTokens = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setShouldScrollToBottom: (state, action: PayloadAction<boolean>) => {
      state.shouldScrollToBottom = action.payload;
    },
    setEditTokenMode: (state, action: PayloadAction<boolean>) => {
      state.editTokenMode = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIsLoadingMore: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMore = action.payload;
    },
  },
});

// Side-effect actions
export const initAccountDetail = () => {
  sendMessage({ type: MESSAGE_TYPE.START_TX_POLLING });
  sendMessage({ type: MESSAGE_TYPE.GET_RRC_TOKEN_LIST });
  sendMessage({ type: MESSAGE_TYPE.GET_DELEGATION_INFO });
};

export const deinitAccountDetail = () => {
  sendMessage({ type: MESSAGE_TYPE.STOP_TX_POLLING });
};

export const fetchMoreTxs = () => {
  sendMessage({ type: MESSAGE_TYPE.GET_MORE_TXS });
};

export const removeToken = (contractAddress: string) => {
  sendMessage({
    type: MESSAGE_TYPE.REMOVE_TOKEN,
    contractAddress,
  });
};

export const routeToAddToken = () => {
  const navigate = getNavigateFunction();
  navigate?.('/add-token');
};

export const {
  setActiveTabIdx,
  setTransactions,
  setSelectedTransaction,
  setTokenTransfers,
  setTokens,
  setVerifiedTokens,
  setHasMore,
  setShouldScrollToBottom,
  setEditTokenMode,
  setIsLoading,
  setIsLoadingMore,
} = accountDetailSlice.actions;

export default accountDetailSlice.reducer;
