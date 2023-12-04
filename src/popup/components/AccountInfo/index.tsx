import React, { useState, useEffect, Fragment } from 'react';
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
import PersonIcon from '@mui/icons-material/Person';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import { getImageUrl } from '../../abstraction';

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
    console.log('walletInfo: ', store?.sessionStore.walletInfo);
    console.log('useEffect - store:', store);
    setLoggedInAccountName(store?.sessionStore.loggedInAccountName || null);
    setInfo(store?.sessionStore.walletInfo || null);
    setRunebaseBalanceUSD(store?.sessionStore.runebaseBalanceUSD);
    // setNetworkBalAnnotation(store?.sessionStore.networkBalAnnotation || null);
  }, [
    store?.sessionStore.loggedInAccountName,
    store?.sessionStore.runebaseBalanceUSD,
    store?.sessionStore.walletInfo,
    store?.accountDetailStore.verifiedTokens,
    store?.sessionStore.blockchainInfo,
    store?.accountDetailStore.transactions,
    store?.sessionStore.walletInfo?.qrc20Balances,
    store?.sessionStore.delegationInfo?.staker
  ]);

  const handleClick = (id: string, event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    console.log('Button Clicked:', id);

    const locations: Record<string, string> = {
      mainCard: '/account-detail',
      sendButton: '/send',
      receiveButton: '/receive',
      delegateButton: '/delegate',
    };

    const location = locations[id];

    if (location) {
      store?.navigate?.(location);
    }
  };

  if (!loggedInAccountName || !info) {
    return null;
  }

  console.log('Rendering AccountInfo:', info);

  return (
    <div className={classes.root}>
      <Typography
        variant="subtitle2"
        gutterBottom
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <PersonIcon style={{ marginRight: '5px' }} />
        {loggedInAccountName}
      </Typography>
      {
        store?.sessionStore.delegationInfo?.staker && (
          <Typography
            variant="subtitle2"
            gutterBottom
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ElectricBoltIcon style={{ marginRight: '5px', color: '#FFD700' }} />
            <span
              style={{
                color: 'blue', // Set the text color to blue to mimic a hyperlink
                textDecoration: 'none', // Add an underline
                cursor: 'pointer', // Change the cursor to a pointer to indicate interactivity
                transition: 'text-decoration 0.3s ease', // Add a smooth transition effect
              }}
              onClick={() => {
                store?.delegateStore.getSuperstaker(store?.sessionStore.delegationInfo?.staker || '');
              }}
              onMouseEnter={(event) => (event.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(event) => (event.currentTarget.style.textDecoration = 'none')}
            >
              Visit my superstaker
            </span>
          </Typography>
        )
      }
      <Typography
        variant="subtitle2"
        gutterBottom
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <StarIcon style={{ marginRight: '5px' }} />
        #{info.ranking}
      </Typography>
      <Typography
        variant="subtitle2"
        gutterBottom
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <CallReceivedIcon />
        {info.address}
      </Typography>
      <Divider />
      <Box className={classes.amountContainer}>
        <img
          style={{
            height: '24px',
            width: '24px'
          }}
          src={getImageUrl('images/runes.png')}
          alt={'Runes'}
        />
        <Typography className={classes.tokenAmount}>{info.balance / 1e8}</Typography>
        <Typography className={classes.token}>RUNES</Typography>
        {hasRightArrow && <KeyboardArrowRight className={classes.rightArrow} />}
        <Typography className={classes.balanceUSD}>{`${runebaseBalanceUSD}`}</Typography>
      </Box>

      {info.qrc20Balances.map((
        token: RunebaseInfo.IRrc20Balance,
        index: number
      ) => {
        const isVerifiedToken = store?.accountDetailStore.verifiedTokens.find(x => x.address === token.address);
        const tokenLogoSrc = TOKEN_IMAGES[token.address];
        if (isVerifiedToken) {
          return (
            <Fragment
              key={index}
            >
              <Divider />
              <Box
                className={`${classes.amountContainer} ${!tokenLogoSrc ? classes.tokenContainer : ''}`}
              >
                {
                  tokenLogoSrc && (
                    <img
                      style={{
                        height: '24px',
                        width: '24px'
                      }}
                      src={getImageUrl(tokenLogoSrc)}
                      alt={token.symbol}
                    />
                  )
                }
                <Typography className={classes.tokenAmount}>
                  {Number(token.balance) / (10 ** Number(token.decimals))}
                </Typography>
                <Typography className={classes.token}>{token.symbol}</Typography>
              </Box>
            </Fragment>
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
          id="delegateButton"
          color="primary"
          variant="contained"
          size="small"
          startIcon={<ElectricBoltIcon style={{ color: '#FFD700' }}/>}
          className={classes.actionButton}
          onClick={(e) => handleClick('delegateButton', e)}
        >
          Delegate
        </Button>
      </Box>
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

