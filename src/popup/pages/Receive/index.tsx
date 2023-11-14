import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Typography } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import QRCode from 'qrcode.react';

import styles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

@inject('store')
@observer
class Receive extends Component<WithStyles<typeof styles> & IProps, NonNullable<unknown>> {
  public render() {
    const { classes } = this.props;
    const { loggedInAccountName, info, runebaseBalanceUSD, networkBalAnnotation } = this.props.store.sessionStore;

    if (!loggedInAccountName || !info) {
      return null;
    }

    return info && (
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
  }
}

export default withStyles(styles)(Receive);
