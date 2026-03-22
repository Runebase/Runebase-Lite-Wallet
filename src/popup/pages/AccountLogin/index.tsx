import React, { useEffect } from 'react';
import {
  Select,
  MenuItem,
  Typography,
  Button,
  Divider,
  Skeleton,
  Stack,
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
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
  const isLoading = useAppSelector((state) => state.accountLogin.isLoading);

  useEffect(() => {
    dispatch(getAccounts(true));
  }, [dispatch]);

  return (
    <PageLayout title="Account Login">
      <div className={classes.accountContainer}>
        <Typography className={classes.selectAcctText}>Select account</Typography>
        {isLoading ? (
          <Stack spacing={1}>
            <Skeleton variant="rounded" height={44} />
          </Stack>
        ) : (
          <Select
            className={classes.accountSelect}
            name="accounts"
            value={selectedWalletName}
            onChange={(e) => {
              dispatch(setSelectedWalletName(e.target.value as string));
            }}
          >
            {accounts.map((acct: any, index: number) => (
              <MenuItem key={index} value={acct.name}>
                {acct.name}
              </MenuItem>
            ))}
          </Select>
        )}
      </div>
      <div className={classes.loginContainer}>
        <Button
          className={classes.loginButton}
          fullWidth
          variant="contained"
          color="primary"
          disabled={isLoading || !selectedWalletName}
          onClick={() => dispatch(loginAccount())}
        >
          Login
        </Button>
        <Divider sx={{ my: 2.5, mx: 2.5 }}>Or</Divider>
        <Button
          className={classes.loginButton}
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => routeToCreateWallet()}
        >
          Create New Wallet
        </Button>
      </div>
    </PageLayout>
  );
};

export default AccountLogin;
