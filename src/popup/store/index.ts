// src/popup/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { messageMiddleware } from './messageMiddleware';

import sessionReducer from './slices/sessionSlice';
import loginReducer from './slices/loginSlice';
import navBarReducer from './slices/navBarSlice';
import createWalletReducer from './slices/createWalletSlice';
import saveMnemonicReducer from './slices/saveMnemonicSlice';
import accountLoginReducer from './slices/accountLoginSlice';
import importReducer from './slices/importSlice';
import settingsReducer from './slices/settingsSlice';
import accountDetailReducer from './slices/accountDetailSlice';
import sendReducer from './slices/sendSlice';
import delegateReducer from './slices/delegateSlice';
import addTokenReducer from './slices/addTokenSlice';
import mainContainerReducer from './slices/mainContainerSlice';

const store = configureStore({
  reducer: {
    session: sessionReducer,
    login: loginReducer,
    navBar: navBarReducer,
    createWallet: createWalletReducer,
    saveMnemonic: saveMnemonicReducer,
    accountLogin: accountLoginReducer,
    import: importReducer,
    settings: settingsReducer,
    accountDetail: accountDetailReducer,
    send: sendReducer,
    delegate: delegateReducer,
    addToken: addTokenReducer,
    mainContainer: mainContainerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(messageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
