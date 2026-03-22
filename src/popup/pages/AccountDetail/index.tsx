import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Paper,
  List,
  ListItemButton,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Skeleton,
  CircularProgress,
  Stack,
} from '@mui/material';
import { ArrowUpward, ArrowDownward, ReceiptLong, Inbox, Refresh } from '@mui/icons-material';
import { isUndefined } from 'lodash';
import { useNavigate } from 'react-router';
import PageLayout from '../../components/PageLayout';
import Transaction from '../../../models/Transaction';
import AccountInfo from '../../components/AccountInfo';
import ElectrumXStatusBar from '../../components/ElectrumXStatusBar';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  fetchMoreTxs,
  initAccountDetail,
  setActiveTabIdx,
  setSelectedTransaction,
  setShouldScrollToBottom,
  setIsLoadingMore,
} from '../../store/slices/accountDetailSlice';
import { shortenTxid } from '../../../utils';
import useStyles from './styles';
import { TOKEN_IMAGES } from '../../../constants';
import BigNumber from 'bignumber.js';
import { getImageUrl } from '../../abstraction';

const PULL_THRESHOLD = 60;

const usePullToRefresh = (onRefresh: () => void, scrollRef: React.RefObject<HTMLElement | null>) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [scrollRef]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.4, PULL_THRESHOLD * 1.5));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1000);
    } else {
      setPullDistance(0);
    }
    isPulling.current = false;
  }, [pullDistance, isRefreshing, onRefresh]);

  return { pullDistance, isRefreshing, handleTouchStart, handleTouchMove, handleTouchEnd };
};

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
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (shouldScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      dispatch(setShouldScrollToBottom(false));
    }
  }, [shouldScrollToBottom, dispatch]);

  const handleRefresh = useCallback(() => {
    initAccountDetail();
  }, []);

  const { pullDistance, isRefreshing, handleTouchStart, handleTouchMove, handleTouchEnd } =
    usePullToRefresh(handleRefresh, listRef);

  return (
    <PageLayout title="Account Detail" noPadding noScroll>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Fixed header area */}
        <Box sx={{ flexShrink: 0 }}>
          <ElectrumXStatusBar />
          <AccountInfo onRefresh={handleRefresh} />
        </Box>

        {/* Sticky tabs */}
        <Paper
          elevation={1}
          sx={{
            borderRadius: 0,
            flexShrink: 0,
            zIndex: 10,
          }}
        >
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

        {/* Pull-to-refresh indicator */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: pullDistance,
            overflow: 'hidden',
            transition: pullDistance === 0 ? 'height 0.2s ease' : 'none',
            flexShrink: 0,
          }}
        >
          {(pullDistance > 0 || isRefreshing) && (
            <Refresh
              sx={{
                fontSize: 22,
                color: pullDistance >= PULL_THRESHOLD ? 'primary.main' : 'text.secondary',
                transform: `rotate(${pullDistance * 3}deg)`,
                transition: 'color 0.15s ease',
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  from: { transform: 'rotate(0deg)' },
                  to: { transform: 'rotate(360deg)' },
                },
              }}
            />
          )}
        </Box>

        {/* Scrollable list area */}
        <List
          ref={listRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{
            flex: 1,
            px: 2,
            py: 0,
            overflowX: 'hidden',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {activeTabIdx === 0
            ? <TransactionList classes={classes} />
            : <TokenTransferList classes={classes} />
          }
          <div ref={messagesEndRef} />
        </List>
      </Box>
    </PageLayout>
  );
};

// ─── Loading Skeleton ────────────────────────────────────────

const TransactionSkeleton: React.FC = () => (
  <Stack spacing={1} sx={{ p: 2 }}>
    {[1, 2, 3].map((i) => (
      <Box key={i} sx={{ display: 'flex', gap: 2, py: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height={16} />
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="50%" height={16} />
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Skeleton variant="text" width={80} height={20} />
        </Box>
      </Box>
    ))}
  </Stack>
);

// ─── Empty State ────────────────────────────────────────────

const EmptyState: React.FC<{ message: string; icon?: React.ReactNode }> = ({ message, icon }) => (
  <Box sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
    {icon || <Inbox sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />}
    <Typography color="text.secondary" variant="body2">
      {message}
    </Typography>
  </Box>
);

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
  const isLoading = useAppSelector((state) => state.accountDetail.isLoading);
  const isLoadingMore = useAppSelector((state) => state.accountDetail.isLoadingMore);
  const walletAddress = useAppSelector(
    (state) => state.session.walletInfo?.address,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleTxClick = (tx: Transaction) => {
    dispatch(setSelectedTransaction(tx));
    navigate('/transaction-detail');
  };

  const handleLoadMore = () => {
    dispatch(setIsLoadingMore(true));
    fetchMoreTxs();
  };

  if (isLoading && transactions.length === 0) {
    return <TransactionSkeleton />;
  }

  if (transactions.length === 0) {
    return <EmptyState message="No transactions yet" icon={<ReceiptLong sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />} />;
  }

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
          <ListItemButton
            divider
            key={id}
            className={classes.listItem}
            onClick={() => handleTxClick(tx)}
          >
            <Box className={classes.directionIcon}>
              {isOutgoing
                ? <ArrowUpward sx={{ fontSize: 18, color: 'error.main' }} />
                : <ArrowDownward sx={{ fontSize: 18, color: 'success.main' }} />
              }
            </Box>
            <div className={classes.txInfoContainer}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                {pending ? (
                  <Typography className={classes.txState} color="warning.main">
                    pending
                  </Typography>
                ) : (
                  <Typography className={classes.txState} color="success.main">
                    {confirmations} conf.
                  </Typography>
                )}
                <Typography className={classes.txTime} color="text.secondary">
                  {timestamp || ''}
                </Typography>
              </Box>
              <Typography className={classes.txId}>
                {shortenTxid(id)}
              </Typography>
            </div>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Box sx={{ width: '100%' }}>
                <AmountInfo
                  classes={classes}
                  amount={amountCoins}
                  token={{ symbol: 'RUNES', address: '' }}
                />
              </Box>
              {isOutgoing && feeCoins > 0 && (
                <Typography variant="caption" color="text.secondary">
                  fee: {feeCoins} RUNES
                </Typography>
              )}
              {filteredTransfers && filteredTransfers.length > 0 &&
                filteredTransfers.map((tokenTransfer, index) => (
                  <Box key={index} sx={{ width: '100%' }}>
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
            </Box>
          </ListItemButton>
        );
      })}
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        {hasMore && (
          <Button
            color="primary"
            size="small"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            startIcon={isLoadingMore ? <CircularProgress size={16} /> : undefined}
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </Button>
        )}
      </Box>
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
  const isLoading = useAppSelector((state) => state.accountDetail.isLoading);
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

  if (isLoading && (!tokenTransfers || tokenTransfers.length === 0)) {
    return <TransactionSkeleton />;
  }

  if (!tokenTransfers || tokenTransfers.length === 0) {
    return <EmptyState message="No token transfers found" icon={<ReceiptLong sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />} />;
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
          <ListItemButton
            divider
            key={`${transfer.id}-${index}`}
            className={classes.listItem}
            onClick={() => handleClick(transfer)}
          >
            <Box className={classes.directionIcon}>
              {isIncoming
                ? <ArrowDownward sx={{ fontSize: 18, color: 'success.main' }} />
                : <ArrowUpward sx={{ fontSize: 18, color: 'error.main' }} />
              }
            </Box>
            <div className={classes.txInfoContainer}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                {transfer.confirmations === 0 ? (
                  <Typography className={classes.txState} color="warning.main">
                    pending
                  </Typography>
                ) : (
                  <Typography className={classes.txState} color="success.main">
                    {transfer.confirmations} conf.
                  </Typography>
                )}
                <Typography className={classes.txTime} color="text.secondary">
                  {transfer.timestamp}
                </Typography>
              </Box>
              <Typography className={classes.txId}>
                {shortenTxid(transfer.id)}
              </Typography>
            </div>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <div className={classes.tokenContainer}>
                <Typography
                  className={classes.tokenAmount}
                  color={isIncoming ? 'success.main' : 'error.main'}
                >
                  {isIncoming ? '+' : '-'}{amount}
                </Typography>
                <Box className={classes.tokenTypeContainer}>
                  {tokenLogoSrc && (
                    <Box
                      component="img"
                      src={getImageUrl(tokenLogoSrc)}
                      alt={transfer.symbol}
                      sx={{ width: 18, height: 18 }}
                    />
                  )}
                  <Typography className={classes.tokenType}>
                    {transfer.symbol}
                  </Typography>
                </Box>
              </div>
              <Typography variant="caption" color="text.secondary">
                {isIncoming ? 'from' : 'to'}:{' '}
                {shortenTxid(isIncoming ? transfer.from : transfer.to)}
              </Typography>
            </Box>
          </ListItemButton>
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
          color={isPositive ? 'success.main' : 'error.main'}
        >
          {formatAmount(amount)}
        </Typography>
        <Box className={classes.tokenTypeContainer}>
          {tokenLogoSrc && (
            <Box
              component="img"
              src={getImageUrl(tokenLogoSrc)}
              alt={token.symbol}
              sx={{ width: 18, height: 18 }}
            />
          )}
          <Typography className={classes.tokenType}>
            {token.symbol}
          </Typography>
        </Box>
      </div>
    </div>
  );
};

export default AccountDetail;
