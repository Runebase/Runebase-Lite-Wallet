// settingsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { INTERVAL_NAMES, MESSAGE_TYPE } from '../../../constants';
import { sendMessage } from '../../abstraction';

export interface SessionLogoutIntervalItem {
  interval: number;
  name: string;
}

interface SettingsState {
  sessionLogoutInterval: number;
}

const initialState: SettingsState = {
  sessionLogoutInterval: 0,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSessionLogoutInterval: (state, action: PayloadAction<number>) => {
      state.sessionLogoutInterval = action.payload;
    },
  },
});

// Static data - no need to be in Redux state
export const SESSION_LOGOUT_INTERVALS: SessionLogoutIntervalItem[] = [
  { interval: 0, name: INTERVAL_NAMES.NONE },
  { interval: 60000, name: INTERVAL_NAMES.ONE_MIN },
  { interval: 600000, name: INTERVAL_NAMES.TEN_MIN },
  { interval: 1800000, name: INTERVAL_NAMES.THIRTY_MIN },
  { interval: 7200000, name: INTERVAL_NAMES.TWO_HOUR },
  { interval: 43200000, name: INTERVAL_NAMES.TWELVE_HOUR },
];

// Side-effect actions
export const initSettings = () => (dispatch: any) => {
  sendMessage(
    { type: MESSAGE_TYPE.GET_SESSION_LOGOUT_INTERVAL },
    (response: any) => {
      dispatch(settingsSlice.actions.setSessionLogoutInterval(response));
    },
  );
};

export const changeSessionLogoutInterval = (interval: number) => (dispatch: any) => {
  dispatch(settingsSlice.actions.setSessionLogoutInterval(interval));
  sendMessage({
    type: MESSAGE_TYPE.SAVE_SESSION_LOGOUT_INTERVAL,
    value: interval,
  });
};

export const { setSessionLogoutInterval } = settingsSlice.actions;

export default settingsSlice.reducer;
