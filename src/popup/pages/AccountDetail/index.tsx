import React, { useEffect, useRef } from 'react';
import {
  Paper,
  List,
  ListItem,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import { KeyboardArrowRight } from '@mui/icons-material';
import cx from 'classnames';
import { isUndefined } from 'lodash';
import { useNavigate } from 'react-router';
import NavBar from '../../components/NavBar';
import Transaction from '../../../models/Transaction';
import AccountInfo from '../../components/AccountInfo';
import ElectrumXStatusBar from '../../components/ElectrumXStatusBar';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  fetchMoreTxs,
  setActiveTabIdx,
  setSelectedTransaction,
  setShouldScrollToBottom,
} from '../../store/slices/accountDetailSlice';
import { shortenTxid } from '../../../utils';
import useStyles from './styles';
import { TOKEN_IMAGES } from '../../../constants';
import BigNumber from 'bignumber.js';
import { getImageUrl } from '../../abstraction';

const AccountDetail: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const activeTabIdx = useAppSelector(
    (state) => state.accountDetail.activeTabIdx,
  );
  const shouldScrollToBottom = useAppSelector(
    (state) => state.accountDetail.shouldScrollToBottom,
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      dispatch(setShouldScrollToBottom(false));
    }
  }, [shouldScrollToBottom, dispatch]);

  return (
    <div className={classes.root}>
      <div className={classes.contentContainer}>
        <Paper className={classes.accountDetailPaper} elevation={2}>
          <NavBar hasSettingsButton title="Account Detail" />
          <ElectrumXStatusBar />
          <AccountInfo />
        </Paper>
        <Paper className={classes.tabsPaper} elevation={1}>
          <Tabs
            value={activeTabIdx}
            onChange={(_, idx) => dispatch(setActiveTabIdx(idx))}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Transactions" className={classes.tab} />
            <Tab label="Token Transfers" className={classes.tab} />
          </Tabs>
        </Paper>
        <List className={classes.list}>
          {activeTabIdx === 0
            ? <TransactionList classes={classes} />
            : <TokenTransferList classes={classes} />
          }
        </List>
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────

const formatAmount = (amount: number | undefined): string => {
  if (isUndefined(amount)) return '...';
  if (amount > 0) return `+${amount}`;
  return `${amount}`;
};

// ─── Regular Transactions Tab ─────────────────────────────────

const TransactionList: React.FC<{
  classes: Record<string, string>;
}> = ({ classes }) => {
  const transactions = useAppSelector(
    (state) => state.accountDetail.transactions,
  );
  const hasMore = useAppSelector((state) => state.accountDetail.hasMore);
  const walletAddress = useAppSelector(
    (state) => state.session.walletInfo?.address,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleTxClick = (tx: Transaction) => {
    dispatch(setSelectedTransaction(tx));
    navigate('/transaction-detail');
  };

  return (
    <div>
      {transactions.map((tx: Transaction) => {
        const {
          id, pending, confirmations, timestamp,
          amount, fee, qrc20TokenTransfers,
        } = tx;
        const filteredTransfers = qrc20TokenTransfers?.filter(
          (t) => t.to === walletAddress || t.from === walletAddress,
        );
        const amountCoins = amount / 1e8;
        const feeCoins = (fee || 0) / 1e8;
        const isOutgoing = amount < 0;

        return (
          <ListItem
            divider
            key={id}
            className={classes.listItem}
            onClick={() => handleTxClick(tx)}
          >
            <div className={classes.txInfoContainer}>
              {pending ? (
                <Typography className={cx(classes.txState, 'pending')}>
                  pending
                </Typography>
              ) : (
                <Typography className={classes.txState}>
                  {`${confirmations} confirmations`}
                </Typography>
              )}
              <Typography className={classes.txId}>
                {`txid: ${shortenTxid(id)}`}
              </Typography>
              <Typography className={classes.txTime}>
                {timestamp || '01-01-2018 00:00'}
              </Typography>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Box style={{ width: '100%' }}>
                <AmountInfo
                  classes={classes}
                  amount={amountCoins}
                  token={{ symbol: 'RUNES', address: '' }}
                />
              </Box>
              {isOutgoing && feeCoins > 0 && (
                <Typography
                  sx={{ fontSize: '0.65rem', color: 'text.secondary' }}
                >
                  fee: {feeCoins} RUNES
                </Typography>
              )}
              {filteredTransfers && filteredTransfers.length > 0 &&
                filteredTransfers.map((tokenTransfer, index) => (
                  <Box key={index} style={{ width: '100%' }}>
                    <AmountInfo
                      classes={classes}
                      amount={
                        tokenTransfer.to === walletAddress
                          ? new BigNumber(tokenTransfer.value || '0')
                            .dividedBy(`1e${tokenTransfer.decimals}`)
                            .toNumber()
                          : new BigNumber(tokenTransfer.value || '0')
                            .dividedBy(`-1e${tokenTransfer.decimals}`)
                            .toNumber()
                      }
                      token={{
                        symbol: tokenTransfer.symbol || '',
                        address: tokenTransfer.address || '',
                      }}
                    />
                  </Box>
                ))}
            </div>
            <div>
              <KeyboardArrowRight className={classes.arrowRight} />
            </div>
          </ListItem>
        );
      })}
      <div className={cx(classes.bottomButtonWrap, 'center')}>
        {hasMore && (
          <Button
            className={classes.bottomButton}
            color="primary"
            size="small"
            onClick={fetchMoreTxs}
          >
            Load More
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Token Transfers Tab ──────────────────────────────────────

const TokenTransferList: React.FC<{
  classes: Record<string, string>;
}> = ({ classes }) => {
  const tokenTransfers = useAppSelector(
    (state) => state.accountDetail.tokenTransfers,
  );
  const walletAddress = useAppSelector(
    (state) => state.session.walletInfo?.address,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleClick = (transfer: any) => {
    dispatch(setSelectedTransaction({
      id: transfer.id,
      timestamp: transfer.timestamp,
      confirmations: transfer.confirmations,
      amount: 0,
      qrc20TokenTransfers: [{
        address: transfer.tokenAddress,
        name: transfer.name,
        symbol: transfer.symbol,
        decimals: transfer.decimals,
        from: transfer.from,
        to: transfer.to,
        value: transfer.value,
      }],
    }));
    navigate('/transaction-detail');
  };

  if (!tokenTransfers || tokenTransfers.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          No token transfers found
        </Typography>
      </Box>
    );
  }

  return (
    <div>
      {tokenTransfers.map((transfer: any, index: number) => {
        const isIncoming = transfer.to === walletAddress;
        const amount = new BigNumber(transfer.value || '0')
          .dividedBy(`1e${transfer.decimals}`)
          .toNumber();
        const tokenLogoSrc = TOKEN_IMAGES[transfer.tokenAddress];

        return (
          <ListItem
            divider
            key={`${transfer.id}-${index}`}
            className={classes.listItem}
            onClick={() => handleClick(transfer)}
          >
            <div className={classes.txInfoContainer}>
              {transfer.confirmations === 0 ? (
                <Typography className={cx(classes.txState, 'pending')}>
                  pending
                </Typography>
              ) : (
                <Typography className={classes.txState}>
                  {`${transfer.confirmations} confirmations`}
                </Typography>
              )}
              <Typography className={classes.txId}>
                {`txid: ${shortenTxid(transfer.id)}`}
              </Typography>
              <Typography className={classes.txTime}>
                {transfer.timestamp}
              </Typography>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={classes.tokenContainer}>
                <Typography
                  className={classes.tokenAmount}
                  style={{
                    color: isIncoming ? '#4caf50' : '#f44336',
                  }}
                >
                  {isIncoming ? '+' : '-'}{amount}
                </Typography>
                <div
                  className={classes.tokenTypeContainer}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {tokenLogoSrc && (
                    <img
                      style={{ height: '18px', width: '18px' }}
                      src={getImageUrl(tokenLogoSrc)}
                      alt={transfer.symbol}
                    />
                  )}
                  <Typography className={classes.tokenType}>
                    {transfer.symbol}
                  </Typography>
                </div>
              </div>
              <Typography
                sx={{ fontSize: '0.6rem', color: 'text.secondary' }}
              >
                {isIncoming ? 'from' : 'to'}:{' '}
                {shortenTxid(isIncoming ? transfer.from : transfer.to)}
              </Typography>
            </div>
            <div>
              <KeyboardArrowRight className={classes.arrowRight} />
            </div>
          </ListItem>
        );
      })}
    </div>
  );
};

// ─── AmountInfo Component ─────────────────────────────────────

const AmountInfo: React.FC<{
  classes: Record<string, string>;
  amount: number | undefined;
  token: { address: string; symbol: string };
}> = ({ classes, amount, token }) => {
  const tokenLogoSrc = TOKEN_IMAGES[token.address];
  const isPositive = amount !== undefined && amount >= 0;
  return (
    <div>
      <div className={classes.tokenContainer}>
        <Typography
          className={classes.tokenAmount}
          style={{ color: isPositive ? '#4caf50' : '#f44336' }}
        >
          {formatAmount(amount)}
        </Typography>
        <div
          className={classes.tokenTypeContainer}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {tokenLogoSrc && (
            <img
              style={{ height: '18px', width: '18px' }}
              src={getImageUrl(tokenLogoSrc)}
              alt={token.symbol}
            />
          )}
          <Typography className={classes.tokenType}>
            {token.symbol}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
