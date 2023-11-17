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
    const { loggedInAccountName, info, runebaseBalanceUSD, networkBalAnnotation } = store.sessionStore;
    if (!loggedInAccountName || !info) {
      return null;
    }

    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Receive" />
        <div className={classes.contentContainer}>
          <Typography className={classes.accountName}>{loggedInAccountName}</Typography>
          <Typography className={classes.accountAddress}>{info.addrStr}</Typography>
          <div className={classes.amountContainer}>
            <Typography className={classes.tokenAmount}>{info.balance}</Typography>
            <Typography className={classes.token}>RUNES</Typography>
          </div>
          <Typography className={classes.currencyValue}>{`${runebaseBalanceUSD} ${networkBalAnnotation}`}</Typography>
          <div className={classes.qrCodeContainer}>
            <QRCode value={info!.addrStr} />
          </div>
        </div>
      </div>
    );
  })
);

export default Receive;
