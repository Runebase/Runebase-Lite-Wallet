// Login.tsx
import React, { useEffect, useCallback, Fragment } from 'react';
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
import PasswordInput from '../../components/PasswordInput';
import Logo from '../../components/Logo';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setPassword,
  setConfirmPassword,
  setAlgorithm,
  setInvalidPassword,
  resetLoginForm,
  refreshHasAccounts,
  attemptSessionRestore,
  selectMatchError,
  selectLoginError,
} from '../../store/slices/loginSlice';
import { MESSAGE_TYPE } from '../../../constants';
import { sendMessage } from '../../abstraction';
import { getNavigateFunction } from '../../store/messageMiddleware';
import useStyles from './styles';

const Login: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();

  const hasAccounts = useAppSelector((state) => state.login.hasAccounts);
  const password = useAppSelector((state) => state.login.password);
  const algorithm = useAppSelector((state) => state.login.algorithm);
  const invalidPassword = useAppSelector((state) => state.login.invalidPassword);
  const matchError = useAppSelector(selectMatchError);
  const error = useAppSelector(selectLoginError);

  useEffect(() => {
    refreshHasAccounts();
    attemptSessionRestore();
  }, []);

  useEffect(() => {}, [hasAccounts]);

  const handleLogin = useCallback(() => {
    if (error) return;
    console.log('handleLogin: sending LOGIN with password length:', password.length, 'algorithm:', algorithm);
    const navigate = getNavigateFunction();
    navigate?.('/loading');
    sendMessage({
      type: MESSAGE_TYPE.LOGIN,
      password,
      algorithm,
    });
    dispatch(resetLoginForm());
  }, [error, password, algorithm, dispatch]);

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch(setPassword(e.target.value))}
            onEnterPress={handleLogin}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch(setConfirmPassword(e.target.value))}
                onEnterPress={handleLogin}
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
                  value={algorithm}
                  label="Security Algorithm"
                  onChange={(e: SelectChangeEvent) => dispatch(setAlgorithm(e.target.value))}
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
        onClick={handleLogin}
      >
        Login
      </Button>
      <ErrorDialog />
    </div>
  );
};

const ErrorDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const invalidPassword = useAppSelector((state) => state.login.invalidPassword);

  return (
    <Dialog open={!!invalidPassword} onClose={() => dispatch(setInvalidPassword(undefined))}>
      <DialogTitle>Invalid Password</DialogTitle>
      <DialogContent>
        <DialogContentText>You have entered an invalid password. Please try again.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(setInvalidPassword(undefined))} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Login;
