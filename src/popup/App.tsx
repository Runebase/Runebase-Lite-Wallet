import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import MainContainer from './MainContainer';
import store from './store';
import { MemoryRouter } from 'react-router';
import theme from './theme';

interface IProps {
  port: chrome.runtime.Port;
}

const App: React.FC<IProps> = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/login']}>
          <MainContainer />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
