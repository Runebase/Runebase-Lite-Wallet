import React, { Fragment, FC, useState } from 'react';
import { inject, observer } from 'mobx-react';
import {
  Typography,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon
} from '@mui/material';
import {
  Toll,
  Backup,
  Settings as SettingsIcon,
  AccountCircle,
} from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import { ArrowBack, Settings } from '@mui/icons-material';
import cx from 'classnames';
import DropDownMenu from '../DropDownMenu';
import AppStore from '../../stores/AppStore';
import QryNetwork from '../../../models/QryNetwork';
import styles from './styles';
import EnterPasswordDialog from '../EnterPasswordDialog';
import { MESSAGE_TYPE } from '../../../constants';
interface IProps {
  classes: Record<string, string>;
  store?: AppStore;
  hasBackButton?: boolean;
  hasSettingsButton?: boolean;
  hasNetworkSelector?: boolean;
  isDarkTheme?: boolean;
  title: string;
}

const NavBar: FC<IProps> = inject('store')(observer((props: IProps) => {
  const {
    classes,
    hasBackButton,
    hasSettingsButton,
    hasNetworkSelector,
    isDarkTheme,
    title,
    store: { navBarStore, sessionStore },
  }: any = props;

  return (
    <div className={classes.root}>
      <div className={classes.leftButtonsContainer}>
        {hasBackButton && <BackButton {...props} />}
        {hasSettingsButton && <SettingsButton {...props} />}
      </div>
      <div className={classes.locationContainer}>
        <Typography className={cx(classes.locationText, isDarkTheme ? 'white' : '')}>{title}</Typography>
      </div>
      {hasNetworkSelector && (
        <DropDownMenu
          onSelect={navBarStore.changeNetwork}
          selections={sessionStore.networks.map((net: QryNetwork) => net.name)}
          selectedIndex={sessionStore.networkIndex}
        />
      )}
    </div>
  );
}));

const BackButton: FC<IProps> = ({ classes, isDarkTheme, store: { navigate } }: any) => (
  <IconButton
    onClick={() => navigate?.(-1)}
    className={classes.backIconButton}
    size="large">
    <ArrowBack className={cx(classes.backButton, isDarkTheme ? 'white' : '')} />
  </IconButton>
);
interface BackupWalletMenuItemProps {
  onClick: React.MouseEventHandler<HTMLLIElement>; // Change the type here
}
const BackupWalletMenuItem: React.FC<BackupWalletMenuItemProps> = ({ onClick }) => (
  <MenuItem onClick={onClick}>
    <ListItemIcon>
      <Backup />
    </ListItemIcon>
    Backup Wallet
  </MenuItem>
);

const SettingsButton: FC<IProps> = observer(({ classes, store, isDarkTheme }) => {
  const navBarStore = store?.navBarStore;
  if (!navBarStore) return null;
  const [isBackupWalletDialogOpen, setBackupWalletDialogOpen] = useState(false);
  const handleOpenBackupWalletDialog = () => setBackupWalletDialogOpen(true);
  const handleCloseBackupWalletDialog = () => setBackupWalletDialogOpen(false);

  return (
    <Fragment>
      <IconButton
        aria-owns={navBarStore.settingsMenuAnchor ? 'settingsMenu' : undefined}
        aria-haspopup="true"
        color="primary"
        onClick={(e) => navBarStore.settingsMenuAnchor = e.currentTarget}
        className={classes.settingsIconButton}
        size="large"
      >
        <Settings className={cx(classes.settingsButton, isDarkTheme ? 'white' : '')} />
      </IconButton>
      <Menu
        id="settingsMenu"
        anchorEl={navBarStore.settingsMenuAnchor}
        open={Boolean(navBarStore.settingsMenuAnchor)}
        onClose={() => navBarStore.settingsMenuAnchor = undefined}
      >
        <MenuItem onClick={navBarStore.routeToManageTokens}>
          <ListItemIcon>
            <Toll />
          </ListItemIcon>
          Manage Tokens
        </MenuItem>
        <BackupWalletMenuItem onClick={handleOpenBackupWalletDialog} />
        <MenuItem onClick={navBarStore.routeToSettings}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={navBarStore.logout}>
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
});

export default withStyles(styles)(NavBar);