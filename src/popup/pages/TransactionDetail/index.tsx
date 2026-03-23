import React, { useEffect } from 'react';
import {
  Typography,
  Button,
  Chip,
  Box,
  Paper,
  Stack,
  LinearProgress,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  OpenInNew,
  ContentCopy,
  ArrowUpward,
  ArrowDownward,
  ElectricBolt,
} from '@mui/icons-material';
import PageLayout from '../../components/PageLayout';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import useStyles from './styles';
import { MESSAGE_TYPE, TOKEN_IMAGES } from '../../../constants';
import { sendMessage, openUrlInNewTab, TabOpener } from '../../abstraction';
import { useSnackbar } from '../../components/SnackbarProvider';
import { getImageUrl } from '../../abstraction';
import { fetchTxDetail, setTxDetailLoading } from '../../store/slices/accountDetailSlice';
import BigNumber from 'bignumber.js';

const STAKE_MATURITY = 2000;

class BrowserTabOpener implements TabOpener {
  openUrlInNewTab(url: string): void {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  }
}

const formatSatoshi = (satoshi: number): string => {
  return new BigNumber(satoshi).dividedBy(1e8).toFixed();
};

const TransactionDetail: React.FC = () => {
  const { classes } = useStyles();
  const { showSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const tx = useAppSelector((state) => state.accountDetail.selectedTransaction);
  const txDetail = useAppSelector((state) => state.accountDetail.txDetail);
  const txDetailLoading = useAppSelector((state) => state.accountDetail.txDetailLoading);

  // Fetch full vin/vout on mount
  useEffect(() => {
    if (tx?.id) {
      dispatch(setTxDetailLoading(true));
      fetchTxDetail(tx.id);
    }
  }, [tx?.id]);

  if (!tx) {
    return (
      <PageLayout hasBackButton title="Transaction">
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No transaction selected</Typography>
        </Box>
      </PageLayout>
    );
  }

  const amount = tx.amount / 1e8;
  const fee = (tx.fee || 0) / 1e8;
  const isOutgoing = amount < 0;
  const isPositive = amount >= 0;
  const isStake = !!tx.isStake;
  const isPending = !tx.confirmations || tx.confirmations === 0;
  const isMature = isStake && tx.confirmations >= STAKE_MATURITY;

  const txLabel = isStake ? 'Staking Reward' : isOutgoing ? 'Sent' : 'Received';
  const iconColor = isStake ? 'warning.main' : isOutgoing ? 'error.main' : 'success.main';
  const amountColor = isPositive ? 'success.main' : 'error.main';

  const handleViewExplorer = () => {
    sendMessage({
      type: MESSAGE_TYPE.GET_NETWORK_EXPLORER_URL,
    }, (response: any) => {
      if (response) {
        openUrlInNewTab(`${response}/${tx.id}`, new BrowserTabOpener());
      }
    });
  };

  const handleCopyTxid = () => {
    if (tx.id) {
      navigator.clipboard.writeText(tx.id);
      showSnackbar('Transaction ID copied');
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    showSnackbar('Address copied');
  };

  const runesLogoSrc = TOKEN_IMAGES[''];

  return (
    <PageLayout hasBackButton title="Transaction">
      <Stack spacing={0} sx={{ p: 2 }}>
        {/* ── Type Header ── */}
        <Box className={classes.headerRow}>
          <Box className={classes.headerIcon}>
            {isStake
              ? <ElectricBolt sx={{ fontSize: 20, color: iconColor }} />
              : isOutgoing
                ? <ArrowUpward sx={{ fontSize: 20, color: iconColor }} />
                : <ArrowDownward sx={{ fontSize: 20, color: iconColor }} />
            }
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography className={classes.headerLabel}>
              {txLabel}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {isPending ? (
                <Chip label="Pending" color="warning" size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
              ) : (
                <Chip label="Confirmed" color="success" size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
              )}
              {!isPending && (
                <Typography className={classes.headerMeta}>
                  {tx.confirmations.toLocaleString()} confirmations
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Maturity progress for staking rewards */}
        {isStake && !isPending && !isMature && (
          <Box className={classes.maturityRow} sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.round((tx.confirmations / STAKE_MATURITY) * 100))}
              sx={{ flex: 1, height: 4, borderRadius: 2 }}
            />
            <Typography className={classes.maturityText}>
              {tx.confirmations.toLocaleString()}/{STAKE_MATURITY.toLocaleString()} mature
            </Typography>
          </Box>
        )}

        {/* ── Hero Amount Card ── */}
        <Paper variant="outlined" className={classes.amountCard}>
          <Box className={classes.amountTokenRow}>
            {runesLogoSrc && (
              <Box
                component="img"
                src={getImageUrl(runesLogoSrc)}
                alt="RUNES"
                sx={{ width: 24, height: 24 }}
              />
            )}
            <Typography className={classes.amountText} color={amountColor}>
              {isPositive ? '+' : ''}{amount} RUNES
            </Typography>
          </Box>
          {fee > 0 && (
            <Typography className={classes.headerMeta} sx={{ mt: 0.5 }}>
              Network fee: {fee} RUNES
            </Typography>
          )}
        </Paper>

        {/* ── Details Card ── */}
        <Paper variant="outlined" className={classes.detailsCard}>
          {/* Date */}
          <Box className={classes.detailRow}>
            <Typography className={classes.detailLabel}>Date</Typography>
            <Typography className={classes.detailValue}>
              {tx.timestamp || 'Unknown'}
            </Typography>
          </Box>
          <Divider />
          {/* Transaction ID */}
          <Box className={classes.detailRow} sx={{ flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography className={classes.detailLabel}>Transaction ID</Typography>
              <ContentCopy
                sx={{ fontSize: 14, cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                onClick={handleCopyTxid}
              />
            </Box>
            <Typography
              className={classes.txidValue}
              onClick={handleCopyTxid}
            >
              {tx.id}
            </Typography>
          </Box>
        </Paper>

        {/* ── Inputs ── */}
        <Paper variant="outlined" className={classes.detailsCard}>
          <Typography className={classes.transferHeader}>
            Inputs {txDetail ? `(${txDetail.inputs.length})` : ''}
          </Typography>
          {txDetailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
              <CircularProgress size={18} />
            </Box>
          ) : txDetail ? (
            txDetail.inputs.map((input: any, i: number) => (
              <Box key={i}>
                {i > 0 && <Divider sx={{ my: 0.75 }} />}
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      className={classes.addressValue}
                      sx={{ cursor: input.address !== 'Coinbase' ? 'pointer' : 'default', mb: 0 }}
                      onClick={() => input.address !== 'Coinbase' && handleCopyAddress(input.address)}
                    >
                      {input.address || 'Unknown'}
                    </Typography>
                  </Box>
                  <Typography className={classes.ioAmount}>
                    {input.value ? formatSatoshi(input.value) : '0'}
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography className={classes.headerMeta}>Failed to load</Typography>
          )}
        </Paper>

        {/* ── Outputs ── */}
        <Paper variant="outlined" className={classes.detailsCard}>
          <Typography className={classes.transferHeader}>
            Outputs {txDetail ? `(${txDetail.outputs.length})` : ''}
          </Typography>
          {txDetailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
              <CircularProgress size={18} />
            </Box>
          ) : txDetail ? (
            txDetail.outputs.map((output: any, i: number) => {
              const isContract = output.type === 'call' || output.type === 'create'
                || output.scriptHex?.length > 50;
              const label = !output.address && isContract
                ? 'Contract Call'
                : output.address || 'OP_RETURN';

              return (
                <Box key={i}>
                  {i > 0 && <Divider sx={{ my: 0.75 }} />}
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        className={classes.addressValue}
                        sx={{
                          cursor: output.address ? 'pointer' : 'default',
                          mb: 0,
                          fontStyle: !output.address ? 'italic' : 'normal',
                        }}
                        onClick={() => output.address && handleCopyAddress(output.address)}
                      >
                        {label}
                      </Typography>
                    </Box>
                    <Typography className={classes.ioAmount}>
                      {formatSatoshi(output.value)}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Typography className={classes.headerMeta}>Failed to load</Typography>
          )}
        </Paper>

        {/* ── Token Transfers ── */}
        {tx.qrc20TokenTransfers && tx.qrc20TokenTransfers.length > 0 && (
          <Paper variant="outlined" className={classes.transferCard}>
            <Typography className={classes.transferHeader}>
              Token Transfers
            </Typography>
            {tx.qrc20TokenTransfers.map((transfer: any, i: number) => {
              const tokenLogoSrc = TOKEN_IMAGES[transfer.address];
              const tokenAmount = transfer.value && transfer.decimals
                ? new BigNumber(transfer.value).dividedBy(`1e${transfer.decimals}`).toFixed()
                : transfer.value;

              return (
                <Box key={i} sx={{ mb: i < tx.qrc20TokenTransfers.length - 1 ? 1.5 : 0 }}>
                  {/* Amount row */}
                  <Box className={classes.transferAmountRow}>
                    {tokenLogoSrc && (
                      <Box
                        component="img"
                        src={getImageUrl(tokenLogoSrc)}
                        alt={transfer.symbol}
                        sx={{ width: 20, height: 20 }}
                      />
                    )}
                    <Typography className={classes.transferAmount}>
                      {tokenAmount}
                    </Typography>
                    <Typography className={classes.transferSymbol}>
                      {transfer.symbol}
                    </Typography>
                  </Box>
                  {/* From */}
                  {transfer.from && (
                    <>
                      <Typography className={classes.addressLabel}>From</Typography>
                      <Typography className={classes.addressValue}>
                        {transfer.from}
                      </Typography>
                    </>
                  )}
                  {/* To */}
                  {transfer.to && (
                    <>
                      <Typography className={classes.addressLabel}>To</Typography>
                      <Typography className={classes.addressValue}>
                        {transfer.to}
                      </Typography>
                    </>
                  )}
                  {i < tx.qrc20TokenTransfers.length - 1 && <Divider sx={{ mt: 0.75 }} />}
                </Box>
              );
            })}
          </Paper>
        )}

        {/* ── Explorer Button ── */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<OpenInNew />}
          onClick={handleViewExplorer}
          fullWidth
        >
          View on Explorer
        </Button>
      </Stack>
    </PageLayout>
  );
};

export default TransactionDetail;
