// Login.tsx
import React, { useEffect, Fragment } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputLabel,
  MenuItem,
  FormControl,
  Box,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { observer, inject } from 'mobx-react';
import PasswordInput from '../../components/PasswordInput';
import Logo from '../../components/Logo';
import AppStore from '../../stores/AppStore';
import useStyles from './styles';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const Login: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const { loginStore } = store;
    const { hasAccounts, matchError, error } = loginStore;

    useEffect(() => {
      loginStore.init();
    }, [loginStore]);
    useEffect(() => { }, [hasAccounts]);

    const handlePasswordChange = (e: any) => {
      loginStore.password = e.target.value;
    };

    const handleConfirmPasswordChange = (e: any) => {
      loginStore.confirmPassword = e.target.value;
    };

    return (
      <div className={classes.root}>
        <Logo />
        <div className={classes.fieldContainer}>
          <Box
            sx={{
              mb: 1,
            }}
          >
            <PasswordInput
              autoFocus={true}
              placeholder="Password"
              onChange={handlePasswordChange}
              onEnterPress={loginStore.login}
            />
          </Box>
          {!hasAccounts && (
            <Fragment>
              <Box
                sx={{
                  mb: 1,
                }}
              >
                <PasswordInput
                  placeholder="Confirm password"
                  error={!!matchError}
                  errorText={matchError}
                  onChange={handleConfirmPasswordChange}
                  onEnterPress={loginStore.login}
                />
              </Box>
              <Box
                sx={{
                  mb: 1,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel id="security-algo-select-label">Security Algorithm</InputLabel>
                  <Select
                    labelId="security-algo-select-label"
                    id="security-algo-select"
                    value={loginStore.algorithm}
                    label="Security Algorithm"
                    onChange={(e: SelectChangeEvent) => (loginStore.algorithm = e.target.value)}
                  >
                    <MenuItem value={'PBKDF2'}>PBKDF2 (Fast, less secure)</MenuItem>
                    <MenuItem value={'Scrypt'}>Scrypt (Slow, more secure)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Typography className={classes.masterPwNote}>
                This will serve as your master password and will be saved when you create or import your first wallet.
              </Typography>
            </Fragment>
          )}
        </div>
        <Button
          sx={{
            mt: 1,
          }}
          className={classes.loginButton}
          fullWidth
          variant="contained"
          color="primary"
          disabled={error}
          onClick={() => {
            loginStore.login();
          }}
        >
          Login
        </Button>
        <ErrorDialog {...{ store }} />
      </div>
    );
  })
);

const ErrorDialog: React.FC<{ store: { loginStore: any } }> = observer(({ store }) => {
  return (
    <Dialog open={!!store.loginStore.invalidPassword} onClose={() => (store.loginStore.invalidPassword = undefined)}>
      <DialogTitle>Invalid Password</DialogTitle>
      <DialogContent>
        <DialogContentText>You have entered an invalid password. Please try again.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => (store.loginStore.invalidPassword = undefined)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default Login;
