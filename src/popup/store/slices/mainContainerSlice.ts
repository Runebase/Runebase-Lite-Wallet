// mainContainerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MainContainerState {
  unexpectedError?: string;
}

const initialState: MainContainerState = {
  unexpectedError: undefined,
};

const mainContainerSlice = createSlice({
  name: 'mainContainer',
  initialState,
  reducers: {
    setUnexpectedError: (state, action: PayloadAction<string | undefined>) => {
      state.unexpectedError = action.payload;
    },
    clearUnexpectedError: (state) => {
      state.unexpectedError = undefined;
    },
  },
});

export const { setUnexpectedError, clearUnexpectedError } = mainContainerSlice.actions;

export default mainContainerSlice.reducer;
