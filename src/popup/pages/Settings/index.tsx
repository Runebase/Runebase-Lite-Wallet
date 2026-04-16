import React, { useEffect, useState } from 'react';
import {
  Typography,
  Select,
  MenuItem,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { FiberManualRecord, DarkMode, LightMode, Backup, AccountCircle } from '@mui/icons-material';

import PageLayout from '../../components/PageLayout';
import EnterPasswordDialog from '../../components/EnterPasswordDialog';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  initSettings,
  changeSessionLogoutInterval,
  SESSION_LOGOUT_INTERVALS,
} from '../../store/slices/settingsSlice';
import {
  selectElectrumXStatus,
  switchElectrumXServer,
} from '../../store/slices/sessionSlice';
import { logout } from '../../store/slices/navBarSlice';
import { MESSAGE_TYPE } from '../../../constants';
import { sendMessage } from '../../abstraction';
import { useColorMode } from '../../ColorModeContext';
import { extensionInfoProvider } from '../../abstraction';

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initSettings());
    sendMessage({ type: MESSAGE_TYPE.GET_ELECTRUMX_STATUS });
  }, [dispatch]);

  return (
    <PageLayout title="Settings">
      <Stack spacing={2}>
        <AppearanceField />
        <ElectrumXServerField />
        <SliField />
        <BackupWalletField />
        <ChangeAccountField />
        <AboutField />
      </Stack>
    </PageLayout>
  );
};

const AppearanceField: React.FC = () => {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Appearance
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={mode === 'dark'}
            onChange={toggleColorMode}
            icon={<LightMode sx={{ fontSize: 20 }} />}
            checkedIcon={<DarkMode sx={{ fontSize: 20 }} />}
          />
        }
        label={mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
      />
    </Paper>
  );
};

const ElectrumXServerField: React.FC = () => {
  const electrumxStatus = useAppSelector(selectElectrumXStatus);

  const handleServerChange = (event: any) => {
    const value = event.target.value;
    if (value === -1) {
      return;
    }
    switchElectrumXServer(value as number);
  };

  const connectionColor = electrumxStatus.state === 'connected' ? 'success'
    : electrumxStatus.state === 'disconnected' ? 'error'
      : 'warning';

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
        ElectrumX Server
      </Typography>
      <Box sx={{ mb: 1.5 }}>
        <Chip
          icon={<FiberManualRecord sx={{ fontSize: 14 }} />}
          color={connectionColor}
          label={electrumxStatus.state === 'connected'
            ? `Connected to ${electrumxStatus.serverLabel}`
            : electrumxStatus.state.charAt(0).toUpperCase() + electrumxStatus.state.slice(1)
          }
          size="small"
          variant="outlined"
          aria-label={`Connection status: ${electrumxStatus.state}`}
        />
      </Box>
      <Select
        fullWidth
        value={electrumxStatus.serverIndex >= 0 ? electrumxStatus.serverIndex : -1}
        onChange={handleServerChange}
        aria-label="Select ElectrumX server"
      >
        <MenuItem value={-1}>Auto (failover)</MenuItem>
        {electrumxStatus.servers.map((server, index) => (
          <MenuItem key={index} value={index}>
            {server.label || `${server.host}:${server.port}`}
          </MenuItem>
        ))}
      </Select>
    </Paper>
  );
};

const SliField: React.FC = () => {
  const dispatch = useAppDispatch();
  const sessionLogoutInterval = useAppSelector((state) => state.settings.sessionLogoutInterval);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Session Logout Interval
      </Typography>
      <Select
        fullWidth
        inputProps={{ name: 'sessionLogoutInterval', id: 'sessionLogoutInterval' }}
        value={sessionLogoutInterval}
        onChange={(event) => dispatch(changeSessionLogoutInterval(Number(event.target.value)))}
        aria-label="Select session logout interval"
      >
        {SESSION_LOGOUT_INTERVALS.map((sli) => (
          <MenuItem key={sli.interval} value={sli.interval}>
            {sli.name}
          </MenuItem>
        ))}
      </Select>
    </Paper>
  );
};

const BackupWalletField: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Backup Wallet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Export your wallet seed phrase. You will need your master password.
      </Typography>
      <Button
        variant="outlined"
        startIcon={<Backup />}
        onClick={() => setDialogOpen(true)}
        size="small"
      >
        Backup Wallet
      </Button>
      <EnterPasswordDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        MessageType={MESSAGE_TYPE.REQUEST_BACKUP_WALLET_INFO}
      />
    </Paper>
  );
};

const ChangeAccountField: React.FC = () => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
      Account
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
      Switch to a different wallet account.
    </Typography>
    <Button
      variant="outlined"
      startIcon={<AccountCircle />}
      onClick={() => logout()}
      size="small"
    >
      Change Account
    </Button>
  </Paper>
);

const AboutField: React.FC = () => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
      About
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Runebase Lite Wallet v{extensionInfoProvider.getVersion()}
    </Typography>
  </Paper>
);

export default Settings;
