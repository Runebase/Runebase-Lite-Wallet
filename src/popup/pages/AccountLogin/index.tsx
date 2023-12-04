import React, { useEffect } from 'react';
import { Select, MenuItem, Typography, Button, Divider } from '@mui/material';
import { observer, inject } from 'mobx-react';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import Account from '../../../models/Account';
import useStyles from './styles';

interface IProps {
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
        <NavBar
          // hasNetworkSelector
          isDarkTheme
          title="Account Login"
        />
        <div className={classes.accountContainer}>
          <Typography className={classes.selectAcctText}>Select account</Typography>
          <Select
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
        </div>
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
          <Divider sx={{margin: '20px'}}>Or</Divider>
          <Button
            className={classes.loginButton}
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => {
              console.log('Calling routeToCreateWallet');
              store.accountLoginStore.routeToCreateWallet();
            }}
          >
            Create New Wallet
          </Button>
        </div>
      </div>
    );
  })
);

export default AccountLogin;