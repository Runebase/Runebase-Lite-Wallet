import React from 'react';
import { Provider as MobxProvider, observer } from 'mobx-react';
import { ThemeProvider, Theme, StyledEngineProvider, createTheme } from '@mui/material/styles';
import { syncHistoryWithStore } from 'mobx-react-router';
import { createBrowserHistory } from 'history';

import MainContainer from './MainContainer';
import { store } from './stores/AppStore';

declare module '@mui/styles/defaultTheme' {
  interface DefaultTheme extends Theme {}
}

// Sync history with MobX router
const browserHistory = createBrowserHistory();
const history = syncHistoryWithStore(browserHistory, store.routerStore);
history.push('/login');

const theme = createTheme();

interface IProps {
  port: chrome.runtime.Port;
}

const App: React.FC<IProps> = observer(() => (
  <MobxProvider store={store}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <MainContainer history={history} store={store} />
      </ThemeProvider>
    </StyledEngineProvider>
  </MobxProvider>
));

export default App;
