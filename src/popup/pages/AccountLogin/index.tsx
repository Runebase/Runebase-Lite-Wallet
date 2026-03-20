import React, { useEffect } from 'react';
import { Select, MenuItem, Typography, Button, Divider } from '@mui/material';
import NavBar from '../../components/NavBar';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  getAccounts,
  loginAccount,
  routeToCreateWallet,
  setSelectedWalletName,
} from '../../store/slices/accountLoginSlice';
import useStyles from './styles';

const AccountLogin: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();

  const selectedWalletName = useAppSelector((state) => state.accountLogin.selectedWalletName);
  const accounts = useAppSelector((state) => state.accountLogin.accounts);

  useEffect(() => {
    dispatch(getAccounts(true));
  }, [dispatch]);

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
          value={selectedWalletName}
          onChange={(e) => {
            console.log('Selected account:', e.target.value);
            dispatch(setSelectedWalletName(e.target.value as string));
          }}
        >
          {accounts.map((acct: any, index: number) => (
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
            dispatch(loginAccount());
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
            routeToCreateWallet();
          }}
        >
          Create New Wallet
        </Button>
      </div>
    </div>
  );
};

export default AccountLogin;
