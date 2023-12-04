import React, { useEffect } from 'react';
import { observer, inject } from 'mobx-react';
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
import AccountDetail from './pages/AccountDetail';
import Send from './pages/Send';
import Receive from './pages/Receive';
import SendConfirm from './pages/SendConfirm';
import AddToken from './pages/AddToken';
import AppStore from './stores/AppStore';
import { MESSAGE_TYPE } from '../constants';
import MainContainerStore from './stores/MainContainerStore';
import ManageTokens from './pages/ManageTokens';
import Delegate from './pages/Delegate';
import SuperstakerDetail from './pages/SuperstakerDetail';
import AddDelegation from './pages/AddDelegation';
import AddDelegationConfirm from './pages/AddDelegationConfirm';
import RemoveDelegation from './pages/RemoveDelegation';
import RemoveDelegationConfirm from './pages/RemoveDelegationConfirm';
import { sendMessage } from './abstraction';
import VerifyMnemonic from './pages/VerifyMnemonic';

interface IProps {
  history: any; // Replace with the appropriate type for your history
  store: AppStore;
}

const MainContainer: React.FC<IProps> = inject('store')(observer(({ history, store }) => {
  useEffect(() => {
    return () => {
      sendMessage({
        type: MESSAGE_TYPE.LOGOUT,
      }, () => {});
    };
  }, []);

  const { accountDetailStore, sessionStore, loginStore } = store;

  useEffect(() => {
    store?.sessionStore.init();
  }, []);
  useEffect(() => {

  }, [
    loginStore,
    loginStore.hasAccounts,
  ]);

  useEffect(() => {
    accountDetailStore.init();
    return () => {
      accountDetailStore.deinit();
    };
  }, [
    accountDetailStore,
    sessionStore.walletInfo
  ]);


  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Router history={history || createBrowserHistory()}>
        <Switch>
          <Route exact path="/loading" component={Loading} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/account-login" component={AccountLogin} />
          <Route exact path="/create-wallet" component={CreateWallet} />
          <Route exact path="/account-detail" component={AccountDetail} />
          <Route exact path="/save-mnemonic" component={SaveMnemonic} />
          <Route exact path="/verify-mnemonic" component={VerifyMnemonic} />
          <Route exact path="/import-wallet" component={ImportWallet} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/send" component={Send} />
          <Route exact path="/send-confirm" component={SendConfirm} />
          <Route exact path="/receive" component={Receive} />
          <Route exact path="/delegate" component={Delegate} />
          <Route exact path="/superstaker-detail" component={SuperstakerDetail} />
          <Route exact path="/add-delegation" component={AddDelegation} />
          <Route exact path="/add-delegation-confirm" component={AddDelegationConfirm} />
          <Route exact path="/remove-delegation" component={RemoveDelegation} />
          <Route exact path="/remove-delegation-confirm" component={RemoveDelegationConfirm} />
          <Route exact path="/manage-tokens" component={ManageTokens} />
          <Route exact path="/add-token" component={AddToken} />
        </Switch>
      </Router>
      <UnexpectedErrorDialog mainContainerStore={store.mainContainerStore} />
    </div>
  );
}));

interface UnexpectedErrorDialogProps {
  mainContainerStore: MainContainerStore; // Replace with the appropriate type for your store
}

const UnexpectedErrorDialog: React.FC<UnexpectedErrorDialogProps> = observer(({ mainContainerStore }) => (
  <Dialog
    open={!!mainContainerStore.unexpectedError}
    onClose={() => mainContainerStore.unexpectedError = undefined}
  >
    <DialogTitle>Unexpected Error</DialogTitle>
    <DialogContent>
      <DialogContentText>{mainContainerStore.unexpectedError}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => mainContainerStore.unexpectedError = undefined} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
));

export default MainContainer;
