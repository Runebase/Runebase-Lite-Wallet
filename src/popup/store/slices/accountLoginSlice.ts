// accountLoginSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isEmpty } from 'lodash';
import { MESSAGE_TYPE } from '../../../constants';
import { sendMessage } from '../../abstraction';
import { getNavigateFunction } from '../messageMiddleware';
interface AccountLoginState {
  selectedWalletName: string;
  accounts: any[];
  validatesNetwork: boolean;
  isLoading: boolean;
}

const initialState: AccountLoginState = {
  selectedWalletName: '',
  accounts: [],
  validatesNetwork: false,
  isLoading: true,
};

const accountLoginSlice = createSlice({
  name: 'accountLogin',
  initialState,
  reducers: {
    setSelectedWalletName: (state, action: PayloadAction<string>) => {
      state.selectedWalletName = action.payload;
    },
    setAccounts: (state, action: PayloadAction<any[]>) => {
      state.accounts = action.payload;
      state.isLoading = false;
      if (!isEmpty(action.payload)) {
        state.selectedWalletName = action.payload[0].name;
      }
    },
    setValidatesNetwork: (state, action: PayloadAction<boolean>) => {
      state.validatesNetwork = action.payload;
    },
    resetAccountLogin: (state) => {
      state.selectedWalletName = initialState.selectedWalletName;
      state.validatesNetwork = initialState.validatesNetwork;
    },
  },
});

// Side-effect actions
export const getAccounts = (validatesNetwork: boolean = false) => (dispatch: any) => {
  dispatch(accountLoginSlice.actions.setValidatesNetwork(validatesNetwork));
  sendMessage({ type: MESSAGE_TYPE.GET_ACCOUNTS });
};

export const loginAccount = () => (_dispatch: any, getState: any) => {
  const { accountLogin } = getState();
  const navigate = getNavigateFunction();
  navigate?.('/loading');
  sendMessage({
    type: MESSAGE_TYPE.ACCOUNT_LOGIN,
    selectedWalletName: accountLogin.selectedWalletName,
  });
};

export const routeToCreateWallet = () => {
  const navigate = getNavigateFunction();
  navigate?.('/create-wallet');
};

export const {
  setSelectedWalletName,
  setAccounts,
  setValidatesNetwork,
  resetAccountLogin,
} = accountLoginSlice.actions;

export default accountLoginSlice.reducer;
