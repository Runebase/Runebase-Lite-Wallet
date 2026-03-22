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
  CircularProgress,
  Stack,
  LinearProgress,
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
  setIsLoggingIn,
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

const getPasswordStrength = (password: string): { score: number; label: string; color: 'error' | 'warning' | 'info' | 'success' } => {
  if (!password) return { score: 0, label: '', color: 'error' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 20, label: 'Weak', color: 'error' };
  if (score <= 2) return { score: 40, label: 'Fair', color: 'warning' };
  if (score <= 3) return { score: 60, label: 'Good', color: 'info' };
  if (score <= 4) return { score: 80, label: 'Strong', color: 'success' };
  return { score: 100, label: 'Very Strong', color: 'success' };
};

const PasswordStrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress
        variant="determinate"
        value={strength.score}
        color={strength.color}
        sx={{ height: 4, borderRadius: 2 }}
      />
      <Typography variant="caption" color={`${strength.color}.main`} sx={{ mt: 0.25, display: 'block' }}>
        {strength.label}
      </Typography>
    </Box>
  );
};

const Login: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();

  const hasAccounts = useAppSelector((state) => state.login.hasAccounts);
  const password = useAppSelector((state) => state.login.password);
  const algorithm = useAppSelector((state) => state.login.algorithm);
  const isLoggingIn = useAppSelector((state) => state.login.isLoggingIn);
  const matchError = useAppSelector(selectMatchError);
  const error = useAppSelector(selectLoginError);

  useEffect(() => {
    refreshHasAccounts();
    attemptSessionRestore();
  }, []);

  const handleLogin = useCallback(() => {
    if (error) return;
    dispatch(setIsLoggingIn(true));
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
    <Box className={classes.root}>
      <Box className={classes.centerGroup}>
        <Logo />
        <Stack spacing={1.5} sx={{ mt: 1.5, width: '100%' }}>
          <PasswordInput
            autoFocus={true}
            placeholder="Password"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch(setPassword(e.target.value))}
            onEnterPress={handleLogin}
          />
          {!hasAccounts && (
            <Fragment>
              <PasswordStrengthBar password={password} />
              <PasswordInput
                placeholder="Confirm password"
                error={!!matchError}
                errorText={matchError}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch(setConfirmPassword(e.target.value))}
                onEnterPress={handleLogin}
              />
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
              <Typography variant="caption" color="text.secondary">
                This will serve as your master password and will be saved when you create or import your first wallet.
              </Typography>
            </Fragment>
          )}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={error || isLoggingIn}
            onClick={handleLogin}
            startIcon={isLoggingIn ? <CircularProgress size={20} color="inherit" aria-label="Logging in" /> : undefined}
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
        </Stack>
      </Box>
      <ErrorDialog />
    </Box>
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
