// navBarSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { MESSAGE_TYPE } from '../../../constants';
import { sendMessage } from '../../abstraction';
import { getNavigateFunction } from '../messageMiddleware';

interface NavBarState {
  settingsMenuOpen: boolean;
}

const initialState: NavBarState = {
  settingsMenuOpen: false,
};

const navBarSlice = createSlice({
  name: 'navBar',
  initialState,
  reducers: {
    openSettingsMenu: (state) => {
      state.settingsMenuOpen = true;
    },
    closeSettingsMenu: (state) => {
      state.settingsMenuOpen = false;
    },
    reset: () => initialState,
  },
});

// Side-effect actions
export const changeNetwork = (index: number) => {
  console.log('CALLED CHANGENETWORK to INDEX', index);
  sendMessage({ type: MESSAGE_TYPE.CHANGE_NETWORK, networkIndex: index });
};

export const routeToSettings = () => {
  const navigate = getNavigateFunction();
  navigate?.('/settings');
};

export const routeToManageTokens = () => {
  const navigate = getNavigateFunction();
  navigate?.('/manage-tokens');
};

export const logout = () => {
  const navigate = getNavigateFunction();
  navigate?.('/loading');
  sendMessage({ type: MESSAGE_TYPE.LOGOUT });
};

export const { openSettingsMenu, closeSettingsMenu, reset } = navBarSlice.actions;

export default navBarSlice.reducer;
