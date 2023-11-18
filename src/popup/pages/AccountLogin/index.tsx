import React, { useEffect } from 'react';
import { Paper, Select, MenuItem, Typography, Button } from '@mui/material';
import { observer, inject } from 'mobx-react';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import Account from '../../../models/Account';
import useStyles from './styles';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const AccountLogin: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const { accountLoginStore } = store;
    const classes = useStyles();
    useEffect(() => {
      accountLoginStore.getAccounts(true);
    }, [accountLoginStore]);

    return (
      <div className={classes.root}>
        <Paper className={classes.headerContainer}>
          <NavBar hasNetworkSelector isDarkTheme title="Account Login" />
          <AccountSection {...{ classes, store }} />
        </Paper>
        <PermissionSection {...{ classes }} />
        <LoginSection {...{ classes, store }} />
      </div>
    );
  })
);

const AccountSection: React.FC<{ classes: Record<string, string>; store: AppStore }> = observer(
  ({ classes, store }) => (
    <div className={classes.accountContainer}>
      <Typography className={classes.selectAcctText}>Select account</Typography>
      <Select
        disableUnderline
        className={classes.accountSelect}
        name="accounts"
        value={store.accountLoginStore.selectedWalletName}
        onChange={(e) => {
          console.log('Selected account:', e.target.value);
          store.accountLoginStore.selectedWalletName = e.target.value;
        }}
      >
        {store.accountLoginStore.accounts.map((acct: Account, index: number) => (
          <MenuItem key={index} value={acct.name}>
            {acct.name}
          </MenuItem>
        ))}
      </Select>
      <div className={classes.createAccountContainer}>
        <Typography className={classes.orText}>or</Typography>
        <Button
          className={classes.createAccountButton}
          color="secondary"
          onClick={() => {
            console.log('Calling routeToCreateWallet');
            store.accountLoginStore.routeToCreateWallet();
          }}
        >
        Create New Wallet
        </Button>
      </div>
    </div>
  ));

const PermissionSection: React.FC<{ classes: Record<string, string> }> = ({ classes }) => (
  <div className={classes.permissionContainer}>
    {/* <Typography className={classes.permissionsHeader}>Permissions</Typography> */}
  </div>
);

const LoginSection: React.FC<{ classes: Record<string, string>; store: AppStore }> = observer(({ classes, store }) => (
  <div className={classes.loginContainer}>
    <Button
      className={classes.loginButton}
      fullWidth
      variant="contained"
      color="primary"
      onClick={() => {
        console.log('Attempting to login...');
        store.accountLoginStore.loginAccount();
      }}
    >
      Login
    </Button>
  </div>
));

export default AccountLogin;