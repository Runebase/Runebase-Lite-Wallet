import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Typography, Button } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import { KeyboardArrowRight } from '@mui/icons-material';

import styles from './styles';
import AppStore from '../../stores/AppStore';

interface IProps {
  classes: Record<string, string>;
  store?: AppStore;
  hasRightArrow?: boolean;
}

@inject('store')
@observer
class AccountInfo extends Component<WithStyles<typeof styles> & IProps, {}> {
  public handleClick = (id: string, event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    const locations: Record<string, string> = {
      mainCard: '/account-detail',
      sendButton: '/send',
      receiveButton: '/receive',
    };

    const location = locations[id];

    if (location) {
      this.props.store!.routerStore.push(location);
    }
  };

  public render() {
    const { classes, hasRightArrow } = this.props;
    const { loggedInAccountName, info, runebaseBalanceUSD, networkBalAnnotation } = this.props.store!.sessionStore;

    if (!loggedInAccountName || !info) {
      return null;
    }

    return (
      <div className={classes.root}>
        <Typography className={classes.acctName}>{loggedInAccountName}</Typography>
        <Typography className={classes.address}>{info.addrStr}</Typography>
        <div className={classes.amountContainer}>
          <Typography className={classes.tokenAmount}>{info.balance}</Typography>
          <Typography className={classes.token}>RUNES</Typography>
          {hasRightArrow && <KeyboardArrowRight className={classes.rightArrow} />}
        </div>
        <Typography className={classes.balanceUSD}>{`${runebaseBalanceUSD} ${networkBalAnnotation}`}</Typography>
        <div className={classes.actionButtonsContainer}>
          <Button
            id="sendButton"
            color="secondary"
            variant="contained"
            size="small"
            className={classes.actionButton}
            onClick={(e) => this.handleClick('sendButton', e)}
          >
            Send
          </Button>
          <Button
            id="receiveButton"
            color="secondary"
            variant="contained"
            size="small"
            className={classes.actionButton}
            onClick={(e) => this.handleClick('receiveButton', e)}
          >
            Receive
          </Button>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(AccountInfo);
