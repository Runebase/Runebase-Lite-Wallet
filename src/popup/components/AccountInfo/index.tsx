import React, { Fragment, useState } from 'react';
import {
  Typography,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Collapse,
  Tooltip,
} from '@mui/material';
import { KeyboardArrowRight, SwapHoriz, Toll, Refresh, ContentCopy, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useAppSelector } from '../../store/hooks';
import { selectRunebaseBalanceUSD } from '../../store/slices/sessionSlice';
import { logout } from '../../store/slices/navBarSlice';
import { getSuperstaker } from '../../store/slices/delegateSlice';
import { useSnackbar } from '../SnackbarProvider';
import useStyles from './styles';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import { TOKEN_IMAGES } from '../../../constants';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StarIcon from '@mui/icons-material/Star';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import { getImageUrl } from '../../abstraction';
import BigNumber from 'bignumber.js';

interface IProps {
  hasRightArrow?: boolean;
  onRefresh?: () => void;
}

const AccountInfo: React.FC<IProps> = ({ hasRightArrow, onRefresh }) => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [showAddress, setShowAddress] = useState(false);

  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const delegationInfo = useAppSelector((state) => state.session.delegationInfo);
  const pendingDelegationAction = useAppSelector((state) => state.session.pendingDelegationAction);
  const runebaseBalanceUSD = useAppSelector(selectRunebaseBalanceUSD);
  const verifiedTokens = useAppSelector((state) => state.accountDetail.verifiedTokens);

  if (!loggedInAccountName || !walletInfo) {
    return null;
  }

  const formattedBalance = new BigNumber(walletInfo.balance).dividedBy(1e8).toFixed();

  const copyAddress = () => {
    navigator.clipboard.writeText(String(walletInfo.address));
    showSnackbar('Address copied to clipboard');
  };

  return (
    <Box sx={{ px: 2 }}>
      {/* Account name + meta row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5, mb: 0.5 }}>
        <Chip
          icon={<SwapHoriz />}
          label={loggedInAccountName}
          onClick={() => logout()}
          size="small"
          variant="outlined"
          aria-label="Switch account"
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {pendingDelegationAction ? (
            <Tooltip title="Delegation confirming...">
              <Chip
                icon={<CircularProgress size={12} />}
                label="Confirming"
                size="small"
                variant="outlined"
                color="warning"
                sx={{ fontSize: '0.65rem', height: 22 }}
              />
            </Tooltip>
          ) : delegationInfo?.staker && (
            <Tooltip title="Visit my superstaker">
              <IconButton size="small" onClick={() => getSuperstaker(delegationInfo?.staker || '')} aria-label="Visit my superstaker">
                <ElectricBoltIcon sx={{ fontSize: 18, color: 'warning.main' }} />
              </IconButton>
            </Tooltip>
          )}
          <Chip
            icon={<StarIcon sx={{ fontSize: 14 }} />}
            label={`#${walletInfo.ranking}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 24 }}
          />
          {onRefresh && (
            <IconButton size="small" onClick={onRefresh} aria-label="Refresh">
              <Refresh sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Collapsible address */}
      <Box
        onClick={() => setShowAddress(!showAddress)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          py: 0.5,
          '&:hover': { bgcolor: 'action.hover' },
          borderRadius: 1,
          px: 0.5,
          mx: -0.5,
        }}
      >
        <CallReceivedIcon sx={{ mr: 0.5, fontSize: 14, flexShrink: 0, color: 'text.secondary' }} aria-hidden="true" />
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          {showAddress ? 'Hide address' : 'Show address'}
        </Typography>
        {showAddress ? <ExpandLess sx={{ fontSize: 16, color: 'text.secondary' }} /> : <ExpandMore sx={{ fontSize: 16, color: 'text.secondary' }} />}
      </Box>
      <Collapse in={showAddress}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            py: 0.5,
            px: 0.5,
          }}
        >
          <Box
            component="code"
            sx={{
              wordBreak: 'break-all',
              fontFamily: 'Roboto Mono, monospace',
              fontSize: '0.7rem',
              flex: 1,
              color: 'text.secondary',
            }}
          >
            {walletInfo.address}
          </Box>
          <IconButton size="small" onClick={copyAddress} aria-label="Copy address">
            <ContentCopy sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Collapse>

      <Divider />

      {/* RUNES balance - hero display */}
      <Paper
        elevation={0}
        sx={{
          py: 2,
          px: 1.5,
          my: 1.5,
          bgcolor: 'action.hover',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src={getImageUrl('images/runes.png')}
            alt="Runes"
            sx={{ width: 36, height: 36 }}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                {formattedBalance}
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                RUNES
              </Typography>
              {hasRightArrow && <KeyboardArrowRight sx={{ fontSize: 22, alignSelf: 'center' }} aria-hidden="true" />}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {runebaseBalanceUSD}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Token balances */}
      {(verifiedTokens || []).map((
        token: { address: string; balance: number; decimals: number; name: string; symbol: string },
        index: number
      ) => {
        const tokenLogoSrc = TOKEN_IMAGES[token.address];
        return (
          <Fragment key={index}>
            <Box className={classes.amountContainer} sx={{ py: 0.75 }}>
              {tokenLogoSrc ? (
                <Box
                  component="img"
                  src={getImageUrl(tokenLogoSrc)}
                  alt={token.symbol}
                  sx={{ width: 24, height: 24 }}
                />
              ) : (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    borderRadius: 0.5,
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                >
                  {token.symbol?.[0]}
                </Box>
              )}
              <Typography className={classes.tokenAmount}>
                {token.balance ?? 0}
              </Typography>
              <Typography className={classes.token}>{token.symbol}</Typography>
            </Box>
            {index < (verifiedTokens || []).length - 1 && <Divider />}
          </Fragment>
        );
      })}

      {(verifiedTokens || []).length > 0 && <Divider sx={{ mt: 0.5 }} />}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptLongIcon sx={{ mr: 0.25, fontSize: 14 }} aria-hidden="true" />
            {walletInfo.transactionCount} txs
          </Typography>
          <Chip
            icon={<Toll />}
            label="Manage Tokens"
            onClick={() => navigate('/manage-tokens')}
            size="small"
            variant="outlined"
            aria-label="Manage tokens"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AccountInfo;
