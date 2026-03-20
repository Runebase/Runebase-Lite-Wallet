// loginSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isEmpty } from 'lodash';
import { MESSAGE_TYPE, RESPONSE_TYPE } from '../../../constants';
import { sendMessage } from '../../abstraction';
import type { RootState } from '../index';
import { getNavigateFunction } from '../messageMiddleware';

interface LoginState {
  hasAccounts: boolean;
  password: string;
  confirmPassword: string;
  invalidPassword?: boolean;
  algorithm: string;
}

const initialState: LoginState = {
  hasAccounts: false,
  password: '',
  confirmPassword: '',
  invalidPassword: undefined,
  algorithm: 'PBKDF2',
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setHasAccounts: (state, action: PayloadAction<boolean>) => {
      state.hasAccounts = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    setConfirmPassword: (state, action: PayloadAction<string>) => {
      state.confirmPassword = action.payload;
    },
    setAlgorithm: (state, action: PayloadAction<string>) => {
      state.algorithm = action.payload;
    },
    setInvalidPassword: (state, action: PayloadAction<boolean | undefined>) => {
      state.invalidPassword = action.payload;
    },
    resetLoginForm: (state) => {
      console.log('LoginSlice init method called');
      state.password = initialState.password;
      state.confirmPassword = initialState.confirmPassword;
    },
  },
});

// Selectors
export const selectMatchError = (state: RootState): string | undefined => {
  const { password, confirmPassword } = state.login;
  return password !== confirmPassword ? 'Passwords do not match.' : undefined;
};

export const selectLoginError = (state: RootState): boolean => {
  const { hasAccounts, password } = state.login;
  const matchError = selectMatchError(state);
  return (!hasAccounts && !!matchError) || isEmpty(password);
};

// Side-effect actions

// Safe to call on every Login mount — just refreshes the hasAccounts flag
export const refreshHasAccounts = () => {
  sendMessage({ type: MESSAGE_TYPE.HAS_ACCOUNTS });
};

// Must only run ONCE at app startup (like the old LoginStore constructor).
// If called again after a failed login, the background still has a passwordHash
// set (even though it's wrong), so RESTORE_SESSION would incorrectly succeed.
let sessionRestoreAttempted = false;
export const attemptSessionRestore = () => {
  if (sessionRestoreAttempted) return;
  sessionRestoreAttempted = true;

  sendMessage({ type: MESSAGE_TYPE.HAS_ACCOUNTS });
  sendMessage({ type: MESSAGE_TYPE.RESTORE_SESSION }, (response: any) => {
    console.log('Received restore session response:', response);
    if (response === RESPONSE_TYPE.RESTORING_SESSION) {
      const navigate = getNavigateFunction();
      navigate?.('/loading');
    }
  });
};

export const {
  setHasAccounts,
  setPassword,
  setConfirmPassword,
  setAlgorithm,
  setInvalidPassword,
  resetLoginForm,
} = loginSlice.actions;

export default loginSlice.reducer;
