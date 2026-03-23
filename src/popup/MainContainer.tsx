import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router';
import {
  Dialog,
  Button,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Send as SendIcon,
  CallReceived,
  ElectricBolt,
  Settings as SettingsIcon,
} from '@mui/icons-material';
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
import TransactionDetail from './pages/TransactionDetail';
import { MESSAGE_TYPE } from '../constants';
import { isExtensionEnvironment, sendMessage } from './abstraction';
import { setNavigateFunction, setLocationRef } from './store/messageMiddleware';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { initSession, initWalletBackupInfo, selectElectrumXStatus } from './store/slices/sessionSlice';
import { initAccountDetail, deinitAccountDetail } from './store/slices/accountDetailSlice';
import { clearUnexpectedError } from './store/slices/mainContainerSlice';

const BOTTOM_NAV_ROUTES = [
  { path: '/account-detail', label: 'Wallet', icon: <AccountBalanceWallet /> },
  { path: '/send', label: 'Send', icon: <SendIcon /> },
  { path: '/receive', label: 'Receive', icon: <CallReceived /> },
  { path: '/delegate', label: 'Stake', icon: <ElectricBolt /> },
  { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

// Pages where the bottom nav should be hidden (pre-login / onboarding flows)
const HIDE_BOTTOM_NAV_PATHS = ['/loading', '/login', '/account-login', '/create-wallet', '/save-mnemonic', '/verify-mnemonic', '/import-wallet'];

const MainContainer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update location ref synchronously on every render so the middleware
  // always knows the current path (avoids useEffect timing issues).
  setLocationRef(location);

  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const unexpectedError = useAppSelector((state) => state.mainContainer.unexpectedError);
  const electrumxStatus = useAppSelector(selectElectrumXStatus);

  const isConnecting = electrumxStatus.state === 'connecting' || electrumxStatus.state === 'reconnecting';
  const showBottomNav = !!loggedInAccountName && !!walletInfo && !HIDE_BOTTOM_NAV_PATHS.includes(location.pathname);

  // Map sub-pages to their parent nav tab so the correct icon stays highlighted
  const getActiveNavPath = (pathname: string): string => {
    if (['/send-confirm'].includes(pathname)) return '/send';
    if (['/delegate', '/superstaker-detail', '/add-delegation', '/add-delegation-confirm', '/remove-delegation', '/remove-delegation-confirm'].includes(pathname)) return '/delegate';
    if (['/manage-tokens', '/add-token', '/backup-wallet', '/transaction-detail'].includes(pathname)) return '/account-detail';
    // For exact matches or unknown sub-pages, return as-is (Wallet/Send/Receive/Settings will match directly)
    return pathname;
  };

  useEffect(() => {
    setNavigateFunction(navigate);
    initSession();
    dispatch(initWalletBackupInfo());
    return () => {
      // In extension mode, the popup unmounts every time it's closed.
      // The background session controller handles the lifecycle via
      // port connect/disconnect, so don't send LOGOUT here — it would
      // force a full re-login and ElectrumX reconnect on every open.
      if (!isExtensionEnvironment()) {
        sendMessage({ type: MESSAGE_TYPE.LOGOUT });
      }
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    if (!isInitialLoad) {
      sendMessage({ type: MESSAGE_TYPE.REFRESH_SESSION_TIMER });
      scrollRef.current?.scrollTo(0, 0);
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

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Global connecting indicator */}
      {isConnecting && (
        <LinearProgress
          color="warning"
          sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, height: 3 }}
        />
      )}

      <Box ref={scrollRef} sx={{ flex: 1, overflow: 'auto' }}>
        <Box
          key={location.pathname}
          sx={{
            height: '100%',
            animation: 'pageFadeIn 150ms ease-out',
            '@keyframes pageFadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
        >
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
            <Route path="/transaction-detail" element={<TransactionDetail />} />
          </Routes>
        </Box>
      </Box>

      {showBottomNav && (
        <Paper
          elevation={3}
          sx={{
            flexShrink: 0,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <BottomNavigation
            value={getActiveNavPath(location.pathname)}
            onChange={(_, newPath) => navigate(newPath)}
            showLabels
            sx={{
              bgcolor: 'background.paper',
              pb: 'env(safe-area-inset-bottom, 0px)',
              '& .MuiBottomNavigationAction-root': {
                minWidth: 0,
                px: 0.5,
                py: 0,
                margin: 0,
                '& .MuiSvgIcon-root': {
                  margin: 0,
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  '&.Mui-selected': {
                    fontSize: '0.8rem',
                  },
                  '@media (max-width: 359px)': {
                    fontSize: 0,
                  },
                },
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            {BOTTOM_NAV_ROUTES.map((route) => (
              <BottomNavigationAction
                key={route.path}
                value={route.path}
                label={route.label}
                icon={route.icon}
                aria-label={route.label}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      <UnexpectedErrorDialog
        unexpectedError={unexpectedError}
        onClose={() => dispatch(clearUnexpectedError())}
      />
    </Box>
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
