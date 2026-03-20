import React, { useState } from 'react';
import { Typography, Button, Grid } from '@mui/material';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

import useStyles from './styles';
import NavBar from '../../components/NavBar';
import { useAppSelector } from '../../store/hooks';

const Receive: React.FC = () => {
  const { classes } = useStyles();
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);

  if (!loggedInAccountName || !walletInfo) {
    return null;
  }

  const [copySuccess, setCopySuccess] = useState<null | string>(null);

  function copyToClipboard() {
    navigator.clipboard.writeText(String(walletInfo?.address));
    setCopySuccess('Copied!');
    setTimeout(() => {
      setCopySuccess(null);
    }, 5000);
  }

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title="Receive" />
      <Grid
        container
        direction="column"
        alignItems="center"
        spacing={2}
      >
        <Grid item>
          <Typography className={classes.accountName}>{loggedInAccountName}</Typography>
        </Grid>
        <Grid item>
          <div className={classes.qrCodeContainer}>
            <QRCode value={walletInfo!.address} />
          </div>
        </Grid>
        <Grid item>
          <Typography className={classes.accountAddress}>{walletInfo.address}</Typography>
        </Grid>
        <Grid item>
          <Button
            variant='contained'
            color="primary"
            onClick={copyToClipboard}
          >
            Copy
          </Button>
        </Grid>
        {copySuccess && (
          <Grid item>
            <Typography gutterBottom variant='caption'>{copySuccess}</Typography>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default Receive;
