import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router';
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
import ManageTokens from './pages/ManageTokens';
import Delegate from './pages/Delegate';
import SuperstakerDetail from './pages/SuperstakerDetail';
import AddDelegation from './pages/AddDelegation';
import AddDelegationConfirm from './pages/AddDelegationConfirm';
import RemoveDelegation from './pages/RemoveDelegation';
import RemoveDelegationConfirm from './pages/RemoveDelegationConfirm';
import VerifyMnemonic from './pages/VerifyMnemonic';
import BackupWallet from './pages/BackupWallet';
import { MESSAGE_TYPE } from '../constants';
import { isExtensionEnvironment, sendMessage } from './abstraction';
import { setNavigateFunction, setLocationRef } from './store/messageMiddleware';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { initSession, initWalletBackupInfo } from './store/slices/sessionSlice';
import { initAccountDetail, deinitAccountDetail } from './store/slices/accountDetailSlice';
import { clearUnexpectedError } from './store/slices/mainContainerSlice';

const MainContainer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const isChromeExtension = isExtensionEnvironment();

  // Update location ref synchronously on every render so the middleware
  // always knows the current path (avoids useEffect timing issues).
  setLocationRef(location);

  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const unexpectedError = useAppSelector((state) => state.mainContainer.unexpectedError);

  useEffect(() => {
    setNavigateFunction(navigate);
    initSession();
    dispatch(initWalletBackupInfo());
    return () => {
      sendMessage({ type: MESSAGE_TYPE.LOGOUT });
    };
  }, []);

  useEffect(() => {
    return () => {
      sendMessage({ type: MESSAGE_TYPE.LOGOUT });
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
    initAccountDetail();
    return () => {
      deinitAccountDetail();
    };
  }, [walletInfo]);

  useEffect(() => {
    if (isChromeExtension) {
      chrome.storage.local.get('viewMode', (data) => {
        if (data.viewMode === 'sidePanel') {
          setIsSidePanelOpen(true);
        }
      });
    }
  }, []);

  const toggleViewMode = () => {
    if (isChromeExtension) {
      const newMode = isSidePanelOpen ? 'popup' : 'sidePanel';
      setIsSidePanelOpen(!isSidePanelOpen);
      chrome.storage.local.set({ viewMode: newMode }, () => {
        if (newMode === 'sidePanel') {
          chrome.runtime.sendMessage({ type: 'TOGGLE_SIDEPANEL' });
          window.close();
        } else {
          chrome.runtime.sendMessage({ type: 'TOGGLE_POPUP' });
        }
      });
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {isChromeExtension && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
          <Button onClick={toggleViewMode}>
            {isSidePanelOpen ? 'Switch to Popup' : 'Switch to Side Panel'}
          </Button>
        </div>
      )}
      <Routes>
        <Route path="/loading" element={<Loading />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account-login" element={<AccountLogin />} />
        <Route path="/create-wallet" element={<CreateWallet />} />
        <Route path="/account-detail" element={<AccountDetail />} />
        <Route path="/save-mnemonic" element={<SaveMnemonic />} />
        <Route path="/verify-mnemonic" element={<VerifyMnemonic />} />
        <Route path="/import-wallet" element={<ImportWallet />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/send" element={<Send />} />
        <Route path="/send-confirm" element={<SendConfirm />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/delegate" element={<Delegate />} />
        <Route path="/superstaker-detail" element={<SuperstakerDetail />} />
        <Route path="/add-delegation" element={<AddDelegation />} />
        <Route path="/add-delegation-confirm" element={<AddDelegationConfirm />} />
        <Route path="/remove-delegation" element={<RemoveDelegation />} />
        <Route path="/remove-delegation-confirm" element={<RemoveDelegationConfirm />} />
        <Route path="/manage-tokens" element={<ManageTokens />} />
        <Route path="/add-token" element={<AddToken />} />
        <Route path="/backup-wallet" element={<BackupWallet />} />
      </Routes>
      <UnexpectedErrorDialog
        unexpectedError={unexpectedError}
        onClose={() => dispatch(clearUnexpectedError())}
      />
    </div>
  );
};

interface UnexpectedErrorDialogProps {
  unexpectedError?: string;
  onClose: () => void;
}

const UnexpectedErrorDialog: React.FC<UnexpectedErrorDialogProps> = ({ unexpectedError, onClose }) => (
  <Dialog open={!!unexpectedError} onClose={onClose}>
    <DialogTitle>Unexpected Error</DialogTitle>
    <DialogContent>
      <DialogContentText>{unexpectedError}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default MainContainer;
