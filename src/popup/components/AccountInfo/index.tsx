import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { Typography, Button } from '@mui/material';
import { KeyboardArrowRight } from '@mui/icons-material';
import AppStore from '../../stores/AppStore';
import useStyles from './styles';
import SendIcon from '@mui/icons-material/Send';
import CallReceivedIcon from '@mui/icons-material/CallReceived';

interface IProps {
  store?: AppStore;
  hasRightArrow?: boolean;
}

const AccountInfo: React.FC<IProps> = ({ hasRightArrow, store }) => {
  const classes = useStyles();
  const [loggedInAccountName, setLoggedInAccountName] = useState<string | null>(null);
  const [info, setInfo] = useState<any | null>(null);
  const [runebaseBalanceUSD, setRunebaseBalanceUSD] = useState<string | undefined>(undefined);
  // const [networkBalAnnotation, setNetworkBalAnnotation] = useState<string | null>(null);

  useEffect(() => {
    console.log('useEffect - store:', store);
    setLoggedInAccountName(store?.sessionStore.loggedInAccountName || null);
    setInfo(store?.sessionStore.info || null);
    setRunebaseBalanceUSD(store?.sessionStore.runebaseBalanceUSD);
    // setNetworkBalAnnotation(store?.sessionStore.networkBalAnnotation || null);
  }, [
    store,
    store?.sessionStore.loggedInAccountName,
    store?.sessionStore.runebaseBalanceUSD,
    store?.sessionStore.info,
  ]);

  const handleClick = (id: string, event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    console.log('Button Clicked:', id);

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

  console.log('Rendering AccountInfo:', loggedInAccountName, info);

  return (
    <div className={classes.root}>
      <Typography className={classes.acctName}>{loggedInAccountName}</Typography>
      <Typography className={classes.address}>{info.addrStr}</Typography>
      <div className={classes.amountContainer}>
        <Typography className={classes.tokenAmount}>{info.balance}</Typography>
        <Typography className={classes.token}>RUNES</Typography>
        {hasRightArrow && <KeyboardArrowRight className={classes.rightArrow} />}
      </div>
      <Typography className={classes.balanceUSD}>{`~${runebaseBalanceUSD}`}</Typography>
      <div className={classes.actionButtonsContainer}>
        <Button
          id="receiveButton"
          color="primary"
          variant="contained"
          size="small"
          startIcon={<CallReceivedIcon />}
          className={classes.actionButton}
          onClick={(e) => handleClick('receiveButton', e)}
        >
          Receive
        </Button>
        <Button
          id="sendButton"
          color="primary"
          variant="contained"
          size="small"
          startIcon={<SendIcon />}
          className={classes.actionButton}
          onClick={(e) => handleClick('sendButton', e)}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default inject('store')(observer(AccountInfo));

