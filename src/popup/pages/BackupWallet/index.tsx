// BackupWallet.js
import React, { useEffect, useState } from 'react';
import { Typography, Paper, Button, Snackbar } from '@mui/material';
import { inject, observer } from 'mobx-react';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import useStyles from './styles';
import Loading from '../../components/Loading';

interface IProps {
  store: AppStore;
}

const BackupWallet: React.FC<IProps> = ({ store }) => {
  const classes = useStyles();
  const { walletBackupInfo } = store.sessionStore;
  const [isCopySnackbarOpen, setIsCopySnackbarOpen] = useState(false);

  useEffect(() => {}, [
    walletBackupInfo,
    walletBackupInfo.address,
  ]);

  const handleCopyClick = () => {
    // Copy to clipboard
    navigator.clipboard.writeText(walletBackupInfo.privateKey);

    // Show the "Copy complete" snackbar
    setIsCopySnackbarOpen(true);

    // Close the snackbar after 2 seconds
    setTimeout(() => {
      setIsCopySnackbarOpen(false);
    }, 2000);
  };

  const handleSnackbarClose = () => {
    setIsCopySnackbarOpen(false);
  };

  if (walletBackupInfo.address === '') {
    return <Loading />;
  } else {
    return (
      <div className={classes.root}>
        <NavBar hasBackButton title={''} />
        <Paper className={classes.topContainer}>
          <Typography variant="h6" className={classes.walletCreatedHeader}>
            Backup Wallet
          </Typography>
          <Typography variant="subtitle1" className={classes.title}>
            Address
          </Typography>
          <Typography variant="body1" className={classes.content}>
            {walletBackupInfo.address}
          </Typography>
          <Typography variant="subtitle1" className={classes.title}>
            Private Key (WIF)
          </Typography>
          <Typography variant="body1" className={classes.content}>
            {walletBackupInfo.privateKey}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleCopyClick}>
              Copy Private Key
          </Button>
        </Paper>

        <Snackbar
          open={isCopySnackbarOpen}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          message="Copy Complete"
        />
      </div>
    );
  }

};

export default inject('store')(observer(BackupWallet));
