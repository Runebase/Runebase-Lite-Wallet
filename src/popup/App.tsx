import React from 'react';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import MainContainer from './MainContainer';
import store from './store';
import { MemoryRouter } from 'react-router';
import { ColorModeProvider } from './ColorModeContext';
import SnackbarProvider from './components/SnackbarProvider';

interface IProps {
  port: chrome.runtime.Port;
}

const App: React.FC<IProps> = () => {
  return (
    <Provider store={store}>
      <ColorModeProvider>
        <CssBaseline />
        <SnackbarProvider>
          <MemoryRouter initialEntries={['/login']}>
            <MainContainer />
          </MemoryRouter>
        </SnackbarProvider>
      </ColorModeProvider>
    </Provider>
  );
};

export default App;
