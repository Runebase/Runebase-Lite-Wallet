import React, { FC, useState } from 'react';
import {
  Typography,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  FiberManualRecord,
  ViewSidebar,
  Widgets,
} from '@mui/icons-material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useAppSelector } from '../../store/hooks';
import { selectElectrumXStatus, selectBlockchainHeight } from '../../store/slices/sessionSlice';
import useStyles from './styles';
import { isExtensionEnvironment } from '../../abstraction';

interface IProps {
  hasBackButton?: boolean;
  isDarkTheme?: boolean;
  title: string;
}

const CONNECTION_LABELS: Record<string, string> = {
  connected: 'Online',
  connecting: 'Connecting',
  reconnecting: 'Reconnecting',
  disconnected: 'Offline',
};

const getConnectionColor = (state: string): 'success' | 'warning' | 'error' | 'disabled' => {
  switch (state) {
  case 'connected': return 'success';
  case 'connecting':
  case 'reconnecting': return 'warning';
  case 'disconnected': return 'error';
  default: return 'disabled';
  }
};

const NavBar: FC<IProps> = ({
  hasBackButton,
  isDarkTheme,
  title,
}) => {
  const { classes } = useStyles();
  const electrumxStatus = useAppSelector(selectElectrumXStatus);
  const blockHeight = useAppSelector(selectBlockchainHeight);
  const isChromeExtension = isExtensionEnvironment();

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      className={classes.appBar}
    >
      <Toolbar variant="dense" className={classes.toolbar} disableGutters>
        <div className={classes.leftContainer}>
          {hasBackButton && <BackButton isDarkTheme={isDarkTheme} />}
          {blockHeight > 0 && (
            <Tooltip title={`Block #${blockHeight.toLocaleString()}`} placement="bottom">
              <Typography variant="caption" className={classes.blockHeight}>
                <Widgets className={classes.blockIcon} />
                {blockHeight.toLocaleString()}
              </Typography>
            </Tooltip>
          )}
        </div>
        <Typography
          className={classes.locationText}
          variant="subtitle1"
          component="h1"
          noWrap
        >
          {title}
        </Typography>
        <div className={classes.rightContainer}>
          <Tooltip
            title={`${CONNECTION_LABELS[electrumxStatus.state] || 'Unknown'}${electrumxStatus.serverLabel ? ` - ${electrumxStatus.serverLabel}` : ''}`}
            placement="bottom"
          >
            <FiberManualRecord
              className={classes.connectionDot}
              color={getConnectionColor(electrumxStatus.state)}
            />
          </Tooltip>
          {isChromeExtension && <SidePanelToggle />}
        </div>
      </Toolbar>
    </AppBar>
  );
};

interface ISubProps {
  isDarkTheme?: boolean;
}

const BackButton: FC<ISubProps> = ({ isDarkTheme }) => {
  const navigate = useNavigate();
  return (
    <IconButton
      onClick={() => navigate(-1)}
      aria-label="Go back"
      size="medium"
      color={isDarkTheme ? 'inherit' : 'default'}
    >
      <ArrowBack />
    </IconButton>
  );
};

const SidePanelToggle: FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  React.useEffect(() => {
    chrome.storage.local.get('viewMode', (data) => {
      if (data.viewMode === 'sidePanel') {
        setIsSidePanelOpen(true);
      }
    });
  }, []);

  const toggleViewMode = () => {
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
  };

  return (
    <Tooltip title={isSidePanelOpen ? 'Switch to Popup' : 'Switch to Side Panel'}>
      <IconButton size="small" onClick={toggleViewMode} color="primary">
        <ViewSidebar fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default NavBar;
