import React, { useState } from 'react';
import { observer, inject } from 'mobx-react';
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
import AppStore from '../../stores/AppStore';

interface IProps {
  store?: AppStore;
  MessageType: string;
  open: boolean; // New prop for controlling the dialog's open state
  onClose: () => void; // New prop for handling the dialog's close event
}

const EnterPasswordDialog: React.FC<IProps> = inject('store')(
  observer(({
    store,
    MessageType = '',
    open, onClose
  }) => {
    const [showPassword, setShowPassword] = useState(false);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const loginStore = store?.loginStore;

    const handleClose = () => {
      onClose(); // Notify the parent component that the dialog should be closed
    };

    const loginFunction = () => {
      loginStore?.loginRequest(MessageType);
      onClose(); // Close the dialog after login
    };

    const handleTogglePasswordVisibility = () => {
      setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
      <>
        <Dialog
          fullScreen={fullScreen}
          open={open} // Controlled externally
          onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
          maxWidth="xs" // Set maxWidth to 'xs' or 'sm' as needed
          style={{ overflowY: 'hidden' }} // Set overflowY to 'hidden'
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
              value={loginStore?.password || ''}
              onChange={(event) => loginStore?.setPassword(event.target.value)}
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
        {loginStore && <ErrorDialog loginStore={loginStore} />}
      </>
    );
  })
);

const ErrorDialog: React.FC<{
  loginStore: any;
}> = observer(({ loginStore }) => {
  return (
    <Dialog open={!!loginStore.invalidPassword} onClose={() => (loginStore.invalidPassword = undefined)}>
      <DialogTitle>Invalid Password</DialogTitle>
      <DialogContent>
        <DialogContentText>You have entered an invalid password. Please try again.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => (loginStore.invalidPassword = undefined)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default EnterPasswordDialog;
