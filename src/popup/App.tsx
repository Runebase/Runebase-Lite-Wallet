import React from 'react';
import { Provider as MobxProvider, observer } from 'mobx-react';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import { syncHistoryWithStore } from 'mobx-react-router';
import { createBrowserHistory } from 'history';

import MainContainer from './MainContainer';
import { store } from './stores/AppStore';

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
        <ThemeProvider theme={theme}>
          <MainContainer history={history} />
        </ThemeProvider>
      </MobxProvider>
    );
  }
}

export default App;
