import React, { useEffect } from 'react';
import { Typography, Select, MenuItem, Box, Chip } from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';

import useStyles from './styles';
import NavBar from '../../components/NavBar';
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
import { MESSAGE_TYPE } from '../../../constants';
import { sendMessage } from '../../abstraction';

const CONNECTION_COLORS: Record<string, string> = {
  connected: '#4caf50',
  connecting: '#ff9800',
  reconnecting: '#ff9800',
  disconnected: '#f44336',
};

const Settings: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initSettings());
    sendMessage({ type: MESSAGE_TYPE.GET_ELECTRUMX_STATUS });
  }, [dispatch]);

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title="Settings" />
      <div className={classes.contentContainer}>
        <div className={classes.fieldsContainer}>
          <ElectrumXServerField classes={classes} />
          <SliField classes={classes} />
        </div>
      </div>
    </div>
  );
};

const ElectrumXServerField: React.FC<{ classes: Record<string, string> }> = ({ classes }) => {
  const electrumxStatus = useAppSelector(selectElectrumXStatus);

  const handleServerChange = (event: any) => {
    const value = event.target.value;
    if (value === -1) {
      // "Auto" mode — not switching, just a visual indicator
      // Could reconnect with auto-failover here if needed
      return;
    }
    switchElectrumXServer(value as number);
  };

  return (
    <div className={classes.fieldContainer}>
      <Heading name="ElectrumX Server" classes={classes} />
      <Box sx={{ mb: 1 }}>
        <Chip
          icon={<FiberManualRecord style={{
            color: CONNECTION_COLORS[electrumxStatus.state] || '#9e9e9e',
            fontSize: 12,
          }} />}
          label={electrumxStatus.state === 'connected'
            ? `Connected to ${electrumxStatus.serverLabel}`
            : electrumxStatus.state.charAt(0).toUpperCase() + electrumxStatus.state.slice(1)
          }
          size="small"
          variant="outlined"
        />
      </Box>
      <div className={classes.fieldContentContainer}>
        <Select
          className={classes.select}
          value={electrumxStatus.serverIndex >= 0 ? electrumxStatus.serverIndex : -1}
          onChange={handleServerChange}
        >
          <MenuItem value={-1}>
            <Typography className={classes.selectTypography}>Auto (failover)</Typography>
          </MenuItem>
          {electrumxStatus.servers.map((server, index) => (
            <MenuItem key={index} value={index}>
              <Typography className={classes.selectTypography}>
                {server.label || `${server.host}:${server.port}`}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
};

const SliField: React.FC<{ classes: Record<string, string> }> = ({ classes }) => {
  const dispatch = useAppDispatch();
  const sessionLogoutInterval = useAppSelector((state) => state.settings.sessionLogoutInterval);

  return (
    <div className={classes.fieldContainer}>
      <Heading name="Session Logout Interval" classes={classes} />
      <div className={classes.fieldContentContainer}>
        <Select
          className={classes.select}
          inputProps={{ name: 'sessionLogoutInterval', id: 'sessionLogoutInterval' }}
          value={sessionLogoutInterval}
          onChange={(event) => dispatch(changeSessionLogoutInterval(Number(event.target.value)))}
        >
          {SESSION_LOGOUT_INTERVALS.map((sli) => (
            <MenuItem key={sli.interval} value={sli.interval}>
              <Typography className={classes.selectTypography}>{sli.name}</Typography>
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
};

interface HeadingProps {
  classes: Record<string, string>;
  name: string;
}

const Heading: React.FC<HeadingProps> = ({ name }) => {
  const { classes } = useStyles();
  return (
    <Typography className={classes.fieldHeading}>{name}</Typography>
  );
};

export default Settings;
