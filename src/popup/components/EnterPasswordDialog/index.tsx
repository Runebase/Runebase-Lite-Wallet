import React, { useState } from 'react';
import {
  Button,
  DialogContentText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setPassword, setInvalidPassword } from '../../store/slices/loginSlice';
import { sendMessage } from '../../abstraction';
import { getNavigateFunction } from '../../store/messageMiddleware';
import { MESSAGE_TYPE } from '../../../constants';

interface IProps {
  MessageType: string;
  open: boolean;
  onClose: () => void;
}

const EnterPasswordDialog: React.FC<IProps> = ({
  MessageType = '',
  open,
  onClose,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const password = useAppSelector((state) => state.login.password);
  const algorithm = useAppSelector((state) => state.login.algorithm);
  const invalidPassword = useAppSelector((state) => state.login.invalidPassword);

  const handleClose = () => {
    onClose();
  };

  const loginFunction = () => {
    console.log(`Attempting loginRequest with MESSAGE_TYPE.${MessageType}`);
    if (MessageType === MESSAGE_TYPE.REQUEST_BACKUP_WALLET_INFO) {
      const navigate = getNavigateFunction();
      navigate?.('/backup-wallet');
    }
    sendMessage({
      type: MessageType,
      password,
      algorithm,
    });
    dispatch(setPassword(''));
    onClose();
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        maxWidth="xs"
        style={{ overflowY: 'hidden' }}
      >
        <DialogTitle id="responsive-dialog-title">
          Please enter your master password
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password || ''}
            onChange={(event) => dispatch(setPassword(event.target.value))}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePasswordVisibility}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={loginFunction} autoFocus>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default EnterPasswordDialog;
