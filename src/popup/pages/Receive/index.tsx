import React, { useState } from 'react';
import { observer, inject } from 'mobx-react';
import { Typography, Button, Grid } from '@mui/material';
import QRCode from 'qrcode.react';

import useStyles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';

interface IProps {
  store: AppStore;
}

const Receive: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const { loggedInAccountName, walletInfo } = store.sessionStore;
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
  })
);

export default Receive;
