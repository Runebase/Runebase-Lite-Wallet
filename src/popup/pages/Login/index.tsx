import React, { useEffect, Fragment } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
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
    useEffect(() => {
      store.loginStore.init();
    }, [store.loginStore]);

    const { loginStore } = store;
    const { hasAccounts, matchError, error } = loginStore;

    return (
      <div className={classes.root}>
        <Logo />
        <div className={classes.fieldContainer}>
          <PasswordInput
            classNames={classes.passwordField}
            autoFocus={true}
            placeholder="Password"
            onChange={(e: any) => (loginStore.password = e.target.value)}
            onEnterPress={loginStore.login}
          />
          {!hasAccounts && (
            <Fragment>
              <PasswordInput
                classNames={classes.passwordField}
                placeholder="Confirm password"
                error={!!matchError}
                errorText={matchError}
                onChange={(e: any) => (loginStore.confirmPassword = e.target.value)}
                onEnterPress={loginStore.login}
              />
              <Typography className={classes.masterPwNote}>
                This will serve as your master password and will be saved when you create or import your first wallet.
              </Typography>
            </Fragment>
          )}
        </div>
        <Button
          className={classes.loginButton}
          fullWidth
          variant="contained"
          color="primary"
          disabled={error}
          onClick={loginStore.login}
        >
          Login
        </Button>
        <ErrorDialog {...{ store }} />
      </div>
    );
  })
);

const ErrorDialog: React.FC<{ store: { loginStore: any } }> = observer(({ store }) => (
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
));

export default Login;
