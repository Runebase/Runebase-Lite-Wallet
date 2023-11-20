import React, { useState, useEffect } from 'react';
import { RunebaseInfo } from 'runebasejs-wallet';
import { observer, inject } from 'mobx-react';
import { Typography, Button, Box, Divider } from '@mui/material';
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
      <Typography className={classes.address}>{info.address}</Typography>
      <Divider />
      <Box className={classes.amountContainer}>
        <img
          style={{
            height: '24px',
            width: '24px'
          }}
          src={chrome.runtime.getURL('images/runes.png')}
          alt={'Runes'}
        />
        <Typography className={classes.tokenAmount}>{info.balance / 1e8}</Typography>
        <Typography className={classes.token}>RUNES</Typography>
        {hasRightArrow && <KeyboardArrowRight className={classes.rightArrow} />}
        <Typography className={classes.balanceUSD}>{`(~${runebaseBalanceUSD})`}</Typography>
      </Box>

      {info.qrc20Balances.map((
        token: RunebaseInfo.IRrc20Balance,
        index: number
      ) => (
        <>
          <Divider />
          <Box key={index} className={`${classes.amountContainer} ${classes.tokenContainer}`}>
            <Typography className={classes.tokenAmount}>{token.balance / 10 ** token.decimals}</Typography>
            <Typography className={classes.token}>{token.symbol}</Typography>
          </Box>
        </>
      ))}
      <Divider />

      <Box
        className={classes.actionButtonsContainer}
        sx={{
          mt: 1,
        }}
      >
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
      </Box>
    </div>
  );
};

export default inject('store')(observer(AccountInfo));

