import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { Typography, Button } from '@mui/material';
import { KeyboardArrowRight } from '@mui/icons-material';
import AppStore from '../../stores/AppStore';
import useStyles from './styles';

interface IProps {
  store?: AppStore;
  hasRightArrow?: boolean;
}

const AccountInfo: React.FC<IProps> = ({ hasRightArrow, store }) => {
  const classes = useStyles();
  const [loggedInAccountName, setLoggedInAccountName] = useState<string | null>(null);
  const [info, setInfo] = useState<any | null>(null);
  const [runebaseBalanceUSD, setRunebaseBalanceUSD] = useState<string | undefined>(undefined);
  const [networkBalAnnotation, setNetworkBalAnnotation] = useState<string | null>(null);

  useEffect(() => {
    // Assuming there is some logic to set the state values from the store.
    // Replace the following lines with the actual logic from your class component.
    setLoggedInAccountName(store?.sessionStore.loggedInAccountName || null);
    setInfo(store?.sessionStore.info || null);
    setRunebaseBalanceUSD(store?.sessionStore.runebaseBalanceUSD);
    setNetworkBalAnnotation(store?.sessionStore.networkBalAnnotation || null);
  }, [store]);

  const handleClick = (id: string, event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    const locations: Record<string, string> = {
      mainCard: '/account-detail',
      sendButton: '/send',
      receiveButton: '/receive',
    };

    const location = locations[id];

    if (location) {
      store?.routerStore.push(location);
    }
  };

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
          onClick={(e) => handleClick('sendButton', e)}
        >
          Send
        </Button>
        <Button
          id="receiveButton"
          color="secondary"
          variant="contained"
          size="small"
          className={classes.actionButton}
          onClick={(e) => handleClick('receiveButton', e)}
        >
          Receive
        </Button>
      </div>
    </div>
  );
};

export default inject('store')(observer(AccountInfo));
