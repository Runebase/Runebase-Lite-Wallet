import React, { useState } from 'react';
import { Typography, Paper, Button, Snackbar } from '@mui/material';

import PageLayout from '../../components/PageLayout';
import useStyles from './styles';
import Loading from '../../components/Loading';
import { useAppSelector } from '../../store/hooks';

const BackupWallet: React.FC = () => {
  const { classes } = useStyles();
  const walletBackupInfo = useAppSelector((state) => state.session.walletBackupInfo);
  const [isCopySnackbarOpen, setIsCopySnackbarOpen] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(walletBackupInfo.privateKey);
    setIsCopySnackbarOpen(true);
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
      <PageLayout hasBackButton title="">
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
      </PageLayout>
    );
  }
};

export default BackupWallet;
