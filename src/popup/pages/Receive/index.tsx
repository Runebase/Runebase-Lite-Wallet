import React from 'react';
import { observer, inject } from 'mobx-react';
import { Typography } from '@mui/material';
import QRCode from 'qrcode.react';

import useStyles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const Receive: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const { loggedInAccountName, walletInfo, runebaseBalanceUSD } = store.sessionStore;
    if (!loggedInAccountName || !walletInfo) {
      return null;
    }

    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Receive" />
        <div className={classes.contentContainer}>
          <Typography className={classes.accountName}>{loggedInAccountName}</Typography>
          <Typography className={classes.accountAddress}>{walletInfo.address}</Typography>
          <div className={classes.amountContainer}>
            <Typography className={classes.tokenAmount}>{Number(walletInfo.balance) / 1e8}</Typography>
            <Typography className={classes.token}>RUNES</Typography>
          </div>
          <Typography className={classes.currencyValue}>{`~${runebaseBalanceUSD}`}</Typography>
          <div className={classes.qrCodeContainer}>
            <QRCode value={walletInfo!.address} />
          </div>
        </div>
      </div>
    );
  })
);

export default Receive;
