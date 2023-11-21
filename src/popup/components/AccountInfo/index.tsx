import React, { useState, useEffect } from 'react';
import { RunebaseInfo } from 'runebasejs-wallet';
import { observer, inject } from 'mobx-react';
import { Typography, Button, Box, Divider, Grid } from '@mui/material';
import { KeyboardArrowRight } from '@mui/icons-material';
import AppStore from '../../stores/AppStore';
import useStyles from './styles';
import SendIcon from '@mui/icons-material/Send';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import { TOKEN_IMAGES } from '../../../constants';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StarIcon from '@mui/icons-material/Star';

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
    setInfo(store?.sessionStore.walletInfo || null);
    setRunebaseBalanceUSD(store?.sessionStore.runebaseBalanceUSD);
    // setNetworkBalAnnotation(store?.sessionStore.networkBalAnnotation || null);
  }, [
    store,
    store?.sessionStore.loggedInAccountName,
    store?.sessionStore.runebaseBalanceUSD,
    store?.sessionStore.walletInfo,
    store?.accountDetailStore.verifiedTokens,
    store?.sessionStore.blockchainInfo,
    store?.accountDetailStore.tokenBalanceHistory
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
      <Grid container>
        <Grid item xs={6}>
          <Typography
            variant="subtitle2"
            gutterBottom
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <StarIcon style={{ marginRight: '5px' }} />
            #{info.ranking}
          </Typography>
        </Grid>
      </Grid>
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
      ) => {
        const isVerifiedToken = store?.accountDetailStore.verifiedTokens.find(x => x.address === token.address);
        const tokenLogoSrc = TOKEN_IMAGES[token.address];
        if (isVerifiedToken) {
          return (
            <>
              <Divider />
              <Box
                key={index}
                className={`${classes.amountContainer} ${!tokenLogoSrc ? classes.tokenContainer : ''}`}
              >
                {
                  tokenLogoSrc && (
                    <img
                      style={{
                        height: '24px',
                        width: '24px'
                      }}
                      src={chrome.runtime.getURL(tokenLogoSrc)}
                      alt={token.symbol}
                    />
                  )
                }
                <Typography className={classes.tokenAmount}>
                  {Number(token.balance) / (10 ** Number(token.decimals))}
                </Typography>
                <Typography className={classes.token}>{token.symbol}</Typography>
              </Box>
            </>
          );
        }
        return null;
      })}
      <Divider />

      <Box
        className={classes.actionButtonsContainer}
        sx={{
          mt: 1,
          mb: 1,
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
      <Grid container>
        <Grid item xs={6}>
          <Typography
            variant="subtitle2"
            gutterBottom
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ReceiptLongIcon style={{ marginRight: '5px' }} />
            {info.transactionCount}
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

export default inject('store')(observer(AccountInfo));

