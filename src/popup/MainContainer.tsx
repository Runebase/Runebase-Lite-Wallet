import React, { useEffect, useState } from 'react';
import { observer, inject } from 'mobx-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
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
import BackupWallet from './pages/BackupWallet';

interface IProps {
  store: AppStore;
}

const MainContainer: React.FC<IProps> = inject('store')(observer(({ store }) => {
  const { accountDetailStore, sessionStore } = store;
  const location = useLocation();
  const navigate = useNavigate();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    store.setNavigate(navigate);
    sessionStore.init();
    return () => {
      sendMessage({
        type: MESSAGE_TYPE.LOGOUT,
      });
    };
  }, []);
  useEffect(() => {
    return () => {
      sendMessage({
        type: MESSAGE_TYPE.LOGOUT,
      });
    };
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      sendMessage({ type: MESSAGE_TYPE.REFRESH_SESSION_TIMER });
    } else {
      setIsInitialLoad(false);
    }
  }, [location]);

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
      <Routes>
        <Route path="/loading" element={<Loading />} />
        <Route path="/login" element={<Login store={store} />} />
        <Route path="/account-login" element={<AccountLogin store={store} />} />
        <Route path="/create-wallet" element={<CreateWallet store={store} />} />
        <Route path="/account-detail" element={<AccountDetail store={store} />} />
        <Route path="/save-mnemonic" element={<SaveMnemonic store={store} />} />
        <Route path="/verify-mnemonic" element={<VerifyMnemonic store={store} />} />
        <Route path="/import-wallet" element={<ImportWallet store={store} />} />
        <Route path="/settings" element={<Settings store={store} />} />
        <Route path="/send" element={<Send store={store} />} />
        <Route path="/send-confirm" element={<SendConfirm store={store} />} />
        <Route path="/receive" element={<Receive store={store} />} />
        <Route path="/delegate" element={<Delegate store={store} />} />
        <Route path="/superstaker-detail" element={<SuperstakerDetail store={store} />} />
        <Route path="/add-delegation" element={<AddDelegation store={store} />} />
        <Route path="/add-delegation-confirm" element={<AddDelegationConfirm store={store} />} />
        <Route path="/remove-delegation" element={<RemoveDelegation store={store} />} />
        <Route path="/remove-delegation-confirm" element={<RemoveDelegationConfirm store={store} />} />
        <Route path="/manage-tokens" element={<ManageTokens store={store} />} />
        <Route path="/add-token" element={<AddToken store={store} />} />
        <Route path="/backup-wallet" element={<BackupWallet store={store} />} />
      </Routes>
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
