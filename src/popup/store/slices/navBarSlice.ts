// navBarSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { MESSAGE_TYPE } from '../../../constants';
import { sendMessage } from '../../abstraction';
import { getNavigateFunction } from '../messageMiddleware';

const navBarSlice = createSlice({
  name: 'navBar',
  initialState: {},
  reducers: {
    reset: () => ({}),
  },
});

// Side-effect actions
export const changeNetwork = (index: number) => {
  sendMessage({ type: MESSAGE_TYPE.CHANGE_NETWORK, networkIndex: index });
};

export const logout = () => {
  const navigate = getNavigateFunction();
  navigate?.('/loading');
  sendMessage({ type: MESSAGE_TYPE.LOGOUT });
};

export const { reset } = navBarSlice.actions;

export default navBarSlice.reducer;
