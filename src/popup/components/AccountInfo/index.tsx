import React, { Fragment } from 'react';
import { RunebaseInfo } from 'runebasejs-wallet';
import { Typography, Button, Box, Divider, Grid } from '@mui/material';
import { KeyboardArrowRight } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectRunebaseBalanceUSD } from '../../store/slices/sessionSlice';
import { getSuperstaker } from '../../store/slices/delegateSlice';
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
  hasRightArrow?: boolean;
}

const AccountInfo: React.FC<IProps> = ({ hasRightArrow }) => {
  const { classes } = useStyles();
  const navigate = useNavigate();

  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const delegationInfo = useAppSelector((state) => state.session.delegationInfo);
  const runebaseBalanceUSD = useAppSelector(selectRunebaseBalanceUSD);
  const verifiedTokens = useAppSelector((state) => state.accountDetail.verifiedTokens);

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
      navigate(location);
    }
  };

  if (!loggedInAccountName || !walletInfo) {
    return null;
  }

  console.log('Rendering AccountInfo:', walletInfo);

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
        delegationInfo?.staker && (
          <Typography
            variant="subtitle2"
            gutterBottom
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ElectricBoltIcon style={{ marginRight: '5px', color: '#FFD700' }} />
            <span
              style={{
                color: 'blue',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'text-decoration 0.3s ease',
              }}
              onClick={() => {
                getSuperstaker(delegationInfo?.staker || '');
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
        #{walletInfo.ranking}
      </Typography>
      <Typography
        variant="subtitle2"
        gutterBottom
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <CallReceivedIcon />
        {walletInfo.address}
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
        <Typography className={classes.tokenAmount}>{walletInfo.balance / 1e8}</Typography>
        <Typography className={classes.token}>RUNES</Typography>
        {hasRightArrow && <KeyboardArrowRight className={classes.rightArrow} />}
        <Typography className={classes.balanceUSD}>{`${runebaseBalanceUSD}`}</Typography>
      </Box>

      {walletInfo.qrc20Balances.map((
        token: RunebaseInfo.IRrc20Balance,
        index: number
      ) => {
        const isVerifiedToken = verifiedTokens.find((x: any) => x.address === token.address);
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
            {walletInfo.transactionCount}
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

export default AccountInfo;
