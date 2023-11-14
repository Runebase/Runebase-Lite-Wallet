import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Router, Route, Switch } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { createBrowserHistory } from 'history';

import Loading from './components/Loading';
import Login from './pages/Login';
import CreateWallet from './pages/CreateWallet';
import SaveMnemonic from './pages/SaveMnemonic';
import ImportWallet from './pages/ImportWallet';
import AccountLogin from './pages/AccountLogin';
import Settings from './pages/Settings';
import Home from './pages/Home';
import AccountDetail from './pages/AccountDetail';
import Send from './pages/Send';
import Receive from './pages/Receive';
import SendConfirm from './pages/SendConfirm';
import AddToken from './pages/AddToken';
import AppStore from './stores/AppStore';
import { MESSAGE_TYPE } from '../constants';

interface IProps {
  history: any; // Replace with the appropriate type for your history
  store?: AppStore;
}

@inject('store')
@observer
export default class MainContainer extends Component<IProps, NonNullable<unknown>> {
  public componentDidMount() {
    this.props.store!.mainContainerStore.init();
  }

  public componentWillUnmount() {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.LOGOUT });
  }

  public render() {
    const { history }: any = this.props;

    return (
      <div style={{ width: '100%', height: '100%' }}>
         <Router history={history || createBrowserHistory()}>
          <Switch>
            <Route exact path="/loading" component={Loading} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/account-login" component={AccountLogin} />
            <Route exact path="/home" component={Home} />
            <Route exact path="/create-wallet" component={CreateWallet} />
            <Route exact path="/account-detail" component={AccountDetail} />
            <Route exact path="/save-mnemonic" component={SaveMnemonic} />
            <Route exact path="/import-wallet" component={ImportWallet} />
            <Route exact path="/settings" component={Settings} />
            <Route exact path="/send" component={Send} />
            <Route exact path="/send-confirm" component={SendConfirm} />
            <Route exact path="/receive" component={Receive} />
            <Route exact path="/add-token" component={AddToken} />
          </Switch>
        </Router>
        <UnexpectedErrorDialog />
      </div>
    );
  }
}

const UnexpectedErrorDialog: React.FC<any> = inject('store')(observer(({ store: { mainContainerStore } }) => (
  <Dialog
    open={!!mainContainerStore.unexpectedError}
    onClose={() => mainContainerStore.unexpectedError = undefined}>
    <DialogTitle>Unexpected Error</DialogTitle>
    <DialogContent>
      <DialogContentText>{ mainContainerStore.unexpectedError }</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => mainContainerStore.unexpectedError = undefined} color="primary">Close</Button>
    </DialogActions>
  </Dialog>
)));
