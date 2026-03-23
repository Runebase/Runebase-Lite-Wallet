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
  txDetail: { inputs: any[]; outputs: any[] } | null;
  txDetailLoading: boolean;
  tokens: any[];
  verifiedTokens: any[];
  hasMore: boolean;
  hasMoreTokenTransfers: boolean;
  shouldScrollToBottom: boolean;
  editTokenMode: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isLoadingMoreTokenTransfers: boolean;
}

const initialState: AccountDetailState = {
  activeTabIdx: 0,
  transactions: [],
  tokenTransfers: [],
  selectedTransaction: null,
  txDetail: null,
  txDetailLoading: false,
  tokens: [],
  verifiedTokens: [],
  hasMore: false,
  hasMoreTokenTransfers: false,
  shouldScrollToBottom: false,
  editTokenMode: false,
  isLoading: true,
  isLoadingMore: false,
  isLoadingMoreTokenTransfers: false,
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
      // Clear previous detail when selecting a new tx
      state.txDetail = null;
      state.txDetailLoading = false;
    },
    setTxDetail: (state, action: PayloadAction<{ inputs: any[]; outputs: any[] } | null>) => {
      state.txDetail = action.payload;
      state.txDetailLoading = false;
    },
    setTxDetailLoading: (state, action: PayloadAction<boolean>) => {
      state.txDetailLoading = action.payload;
    },
    setTokenTransfers: (state, action: PayloadAction<any[]>) => {
      state.tokenTransfers = action.payload;
      state.isLoading = false;
      state.isLoadingMoreTokenTransfers = false;
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
    setHasMoreTokenTransfers: (state, action: PayloadAction<boolean>) => {
      state.hasMoreTokenTransfers = action.payload;
    },
    setIsLoadingMoreTokenTransfers: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMoreTokenTransfers = action.payload;
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

export const fetchTxDetail = (txid: string) => {
  sendMessage({ type: MESSAGE_TYPE.GET_TX_DETAIL, txid });
};

export const fetchMoreTokenTxs = () => {
  sendMessage({ type: MESSAGE_TYPE.GET_MORE_TOKEN_TXS });
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
  setHasMoreTokenTransfers,
  setShouldScrollToBottom,
  setEditTokenMode,
  setIsLoading,
  setIsLoadingMore,
  setIsLoadingMoreTokenTransfers,
  setTxDetail,
  setTxDetailLoading,
} = accountDetailSlice.actions;

export default accountDetailSlice.reducer;
