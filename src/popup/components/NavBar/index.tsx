import React, { Fragment, FC, useState } from 'react';
import {
  Typography,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import {
  Toll,
  Backup,
  Settings as SettingsIcon,
  AccountCircle,
  FiberManualRecord,
} from '@mui/icons-material';
import { ArrowBack, Settings } from '@mui/icons-material';
import cx from 'classnames';
import { useNavigate } from 'react-router';
import DropDownMenu from '../DropDownMenu';
import { useAppSelector } from '../../store/hooks';
import {
  changeNetwork,
  routeToSettings,
  routeToManageTokens,
  logout,
} from '../../store/slices/navBarSlice';
import { selectElectrumXStatus } from '../../store/slices/sessionSlice';
import QryNetwork from '../../../models/QryNetwork';
import useStyles from './styles';
import EnterPasswordDialog from '../EnterPasswordDialog';
import { MESSAGE_TYPE } from '../../../constants';

interface IProps {
  hasBackButton?: boolean;
  hasSettingsButton?: boolean;
  hasNetworkSelector?: boolean;
  isDarkTheme?: boolean;
  title: string;
}

const CONNECTION_COLORS: Record<string, string> = {
  connected: '#4caf50',
  connecting: '#ff9800',
  reconnecting: '#ff9800',
  disconnected: '#f44336',
};

const CONNECTION_LABELS: Record<string, string> = {
  connected: 'Connected',
  connecting: 'Connecting...',
  reconnecting: 'Reconnecting...',
  disconnected: 'Disconnected',
};

const NavBar: FC<IProps> = ({
  hasBackButton,
  hasSettingsButton,
  hasNetworkSelector,
  isDarkTheme,
  title,
}) => {
  const { classes } = useStyles();
  const networks = useAppSelector((state) => state.session.networks);
  const networkIndex = useAppSelector((state) => state.session.networkIndex);
  const electrumxStatus = useAppSelector(selectElectrumXStatus);

  return (
    <div className={classes.root}>
      <div className={classes.leftButtonsContainer}>
        {hasBackButton && <BackButton classes={classes} isDarkTheme={isDarkTheme} />}
        {hasSettingsButton && (
          <SettingsButton
            classes={classes}
            isDarkTheme={isDarkTheme}
            title={title}
          />
        )}
      </div>
      <div className={classes.locationContainer}>
        <Typography className={cx(classes.locationText, isDarkTheme ? 'white' : '')}>{title}</Typography>
      </div>
      {hasNetworkSelector && (
        <div className={classes.rightContainer}>
          <Tooltip
            title={`${CONNECTION_LABELS[electrumxStatus.state] || 'Unknown'}${electrumxStatus.serverLabel ? ` - ${electrumxStatus.serverLabel}` : ''}`}
            placement="bottom"
          >
            <FiberManualRecord
              className={classes.connectionDot}
              style={{ color: CONNECTION_COLORS[electrumxStatus.state] || '#9e9e9e' }}
            />
          </Tooltip>
          <DropDownMenu
            onSelect={(index: number) => changeNetwork(index)}
            selections={networks.map((net: QryNetwork) => net.name)}
            selectedIndex={networkIndex}
          />
        </div>
      )}
    </div>
  );
};

interface ISubProps {
  classes: Record<string, string>;
  isDarkTheme?: boolean;
  title?: string;
}

const BackButton: FC<ISubProps> = ({ classes, isDarkTheme }) => {
  const navigate = useNavigate();
  return (
    <IconButton
      onClick={() => navigate(-1)}
      className={classes.backIconButton}
      size="large"
    >
      <ArrowBack className={cx(classes.backButton, isDarkTheme ? 'white' : '')} />
    </IconButton>
  );
};

interface BackupWalletMenuItemProps {
  onClick: React.MouseEventHandler<HTMLLIElement>;
}
const BackupWalletMenuItem: React.FC<BackupWalletMenuItemProps> = ({ onClick }) => (
  <MenuItem onClick={onClick}>
    <ListItemIcon>
      <Backup />
    </ListItemIcon>
    Backup Wallet
  </MenuItem>
);

const SettingsButton: FC<ISubProps> = ({ classes, isDarkTheme }) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [isBackupWalletDialogOpen, setBackupWalletDialogOpen] = useState(false);
  const handleOpenBackupWalletDialog = () => setBackupWalletDialogOpen(true);
  const handleCloseBackupWalletDialog = () => setBackupWalletDialogOpen(false);

  const handleCloseMenu = () => setMenuAnchor(null);

  const handleRouteToManageTokens = () => {
    handleCloseMenu();
    routeToManageTokens();
  };

  const handleRouteToSettings = () => {
    handleCloseMenu();
    routeToSettings();
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();
  };

  const handleBackupWallet = () => {
    handleCloseMenu();
    handleOpenBackupWalletDialog();
  };

  return (
    <Fragment>
      <IconButton
        aria-owns={menuAnchor ? 'settingsMenu' : undefined}
        aria-haspopup="true"
        color="primary"
        onClick={(e) => setMenuAnchor(e.currentTarget)}
        className={classes.settingsIconButton}
        size="large"
      >
        <Settings className={cx(classes.settingsButton, isDarkTheme ? 'white' : '')} />
      </IconButton>
      <Menu
        id="settingsMenu"
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleRouteToManageTokens}>
          <ListItemIcon>
            <Toll />
          </ListItemIcon>
          Manage Tokens
        </MenuItem>
        <BackupWalletMenuItem onClick={handleBackupWallet} />
        <MenuItem onClick={handleRouteToSettings}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          Change Account
        </MenuItem>
      </Menu>

      <EnterPasswordDialog
        open={isBackupWalletDialogOpen}
        onClose={handleCloseBackupWalletDialog}
        MessageType={MESSAGE_TYPE.REQUEST_BACKUP_WALLET_INFO}
      />
    </Fragment>
  );
};

export default NavBar;
