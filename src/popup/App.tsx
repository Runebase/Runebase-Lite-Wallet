import React from 'react';
import { Provider as MobxProvider, observer } from 'mobx-react';
import { ThemeProvider, Theme, StyledEngineProvider, createTheme } from '@mui/material/styles';
import { syncHistoryWithStore } from 'mobx-react-router';
import { createBrowserHistory } from 'history';

import MainContainer from './MainContainer';
import { store } from './stores/AppStore';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
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

interface IState {}

@observer
class App extends React.Component<IProps, IState> {
  public render() {
    return (
      <MobxProvider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <MainContainer history={history} />
          </ThemeProvider>
        </StyledEngineProvider>
      </MobxProvider>
    );
  }
}

export default App;
