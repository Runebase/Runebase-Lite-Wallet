import React from 'react';
import {
  Typography,
  Divider,
  Button,
  Chip,
  Box,
  Stack,
} from '@mui/material';
import {
  OpenInNew,
  ContentCopy,
} from '@mui/icons-material';
import PageLayout from '../../components/PageLayout';
import { useAppSelector } from '../../store/hooks';
import useStyles from './styles';
import { MESSAGE_TYPE } from '../../../constants';
import { sendMessage, openUrlInNewTab, TabOpener } from '../../abstraction';
import { useSnackbar } from '../../components/SnackbarProvider';

const formatAmount = (satoshi: number): string => {
  const coins = satoshi / 1e8;
  if (coins > 0) return `+${coins}`;
  return `${coins}`;
};

class BrowserTabOpener implements TabOpener {
  openUrlInNewTab(url: string): void {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  }
}

const TransactionDetail: React.FC = () => {
  const { classes } = useStyles();
  const { showSnackbar } = useSnackbar();
  const tx = useAppSelector((state) => state.accountDetail.selectedTransaction);

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

  return (
    <PageLayout hasBackButton title="Transaction">
      <Stack spacing={0} sx={{ p: 2 }}>
        {/* Status */}
        <div className={classes.section}>
          <Typography className={classes.label}>Status</Typography>
          {tx.confirmations > 0 ? (
            <Chip
              label={`Confirmed (${tx.confirmations})`}
              color="success"
              size="small"
              variant="outlined"
            />
          ) : (
            <Chip
              label="Pending"
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
        </div>

        <Divider />

        {/* Amount */}
        <div className={classes.sectionAfterDivider}>
          <Typography className={classes.label}>Amount</Typography>
          <Typography
            variant="h5"
            className={isPositive
              ? classes.amountPositive
              : classes.amountNegative}
          >
            {formatAmount(tx.amount)} RUNES
          </Typography>
        </div>

        {/* Fee */}
        {isOutgoing && fee > 0 && (
          <div className={classes.section}>
            <Typography className={classes.label}>Network Fee</Typography>
            <Typography className={classes.feeText}>
              {fee} RUNES
            </Typography>
          </div>
        )}

        <Divider />

        {/* Date */}
        <div className={classes.sectionAfterDivider}>
          <Typography className={classes.label}>Date</Typography>
          <Typography className={classes.value}>
            {tx.timestamp || 'Unknown'}
          </Typography>
        </div>

        <Divider />

        {/* Transaction ID */}
        <div className={classes.sectionAfterDivider}>
          <Typography className={classes.label}>Transaction ID</Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Typography
              className={classes.txidText}
              onClick={handleCopyTxid}
              title="Click to copy"
            >
              {tx.id}
            </Typography>
            <ContentCopy
              sx={{ fontSize: 14, cursor: 'pointer', mt: 0.3, flexShrink: 0 }}
              onClick={handleCopyTxid}
            />
          </Box>
        </div>

        {/* Token transfers */}
        {tx.qrc20TokenTransfers && tx.qrc20TokenTransfers.length > 0 && (
          <>
            <Divider />
            <div className={classes.sectionAfterDivider}>
              <Typography className={classes.label}>Token Transfers</Typography>
              {tx.qrc20TokenTransfers.map((transfer: any, i: number) => (
                <Box key={i} sx={{ mb: 1 }}>
                  <Typography className={classes.value}>
                    {transfer.value && transfer.decimals
                      ? `${Number(transfer.value) / (10 ** transfer.decimals)} ${transfer.symbol}`
                      : `${transfer.value} ${transfer.symbol}`
                    }
                  </Typography>
                  <Typography className={classes.feeText} sx={{ wordBreak: 'break-all' }}>
                    {transfer.from} → {transfer.to}
                  </Typography>
                </Box>
              ))}
            </div>
          </>
        )}

        {/* Explorer button */}
        <Button
          className={classes.explorerButton}
          variant="outlined"
          size="small"
          startIcon={<OpenInNew />}
          onClick={handleViewExplorer}
          fullWidth
          sx={{ mt: 2 }}
        >
          View on Explorer
        </Button>
      </Stack>
    </PageLayout>
  );
};

export default TransactionDetail;
