import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Chip,
  Divider,
  LinearProgress,
  TextField,
  Typography,
  Skeleton,
  Stack,
  Paper,
} from '@mui/material';
import {
  ElectricBolt,
  HourglassBottom,
  LinkOff,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import BigNumber from 'bignumber.js';
import PageLayout from '../../components/PageLayout';
import SuperStakerCard from '../../components/SuperstakerCard';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  getSuperstakers,
  getDelegationReadiness,
  setSelectedSuperStaker,
  setSuperStakerDelegations,
  setCustomSuperstakerAddress,
  setIsLoading,
} from '../../store/slices/delegateSlice';
import { shortenTxid } from '../../../utils';

// ─── Loading Skeleton ────────────────────────────────────────

const DelegateSkeleton: React.FC = () => (
  <Stack spacing={1.5} sx={{ p: 1.5 }}>
    {[1, 2, 3].map((i) => (
      <Paper key={i} variant="outlined" sx={{ p: 2 }}>
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={16} />
        <Skeleton variant="text" width="40%" height={16} />
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Skeleton variant="rounded" width={80} height={28} />
          <Skeleton variant="rounded" width={80} height={28} />
        </Box>
      </Paper>
    ))}
  </Stack>
);

// ─── My Delegation Card ──────────────────────────────────────

const MyDelegationCard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const delegationInfo = useAppSelector((state) => state.session.delegationInfo);
  const pendingAction = useAppSelector((state) => state.session.pendingDelegationAction);
  const superstakers = useAppSelector((state) => state.delegate.superstakers);
  const canDelegate = useAppSelector((state) => state.delegate.readiness?.canDelegate ?? true);

  const hasDelegation = delegationInfo?.staker && delegationInfo.staker !== '';
  const isPending = !!pendingAction;

  if (isPending) {
    const label = pendingAction.type === 'remove'
      ? 'Removing delegation...'
      : pendingAction.type === 'change'
        ? 'Changing delegation...'
        : 'Adding delegation...';
    return (
      <Paper variant="outlined" sx={{ p: 2, m: 1.5, mb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="warning.main" fontWeight={500}>
            {label}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Waiting for confirmation on the blockchain
        </Typography>
      </Paper>
    );
  }

  if (!hasDelegation) {
    return (
      <Paper variant="outlined" sx={{ p: 2, m: 1.5, mb: 0 }}>
        <Typography variant="body2" color="text.secondary">
          Not currently delegating. Select a super staker below or use a custom address.
        </Typography>
      </Paper>
    );
  }

  const handleUndelegate = () => {
    // Find matching superstaker from list (if available) for the selected state
    const matchingStaker = superstakers?.find((s: any) => s.address === delegationInfo.staker);
    if (matchingStaker) {
      dispatch(setSelectedSuperStaker(matchingStaker));
    } else {
      dispatch(setSelectedSuperStaker(undefined));
    }
    navigate('/remove-delegation');
  };

  const handleViewSuperstaker = () => {
    const matchingStaker = superstakers?.find((s: any) => s.address === delegationInfo.staker);
    if (matchingStaker) {
      dispatch(setSelectedSuperStaker(matchingStaker));
      navigate('/superstaker-detail');
    }
  };

  const isInList = superstakers?.some((s: any) => s.address === delegationInfo.staker);

  return (
    <Paper variant="outlined" sx={{ p: 2, m: 1.5, mb: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
        <ElectricBolt sx={{ fontSize: 18, color: 'warning.main' }} />
        <Typography variant="subtitle2" fontWeight="bold">
          My Delegation
        </Typography>
        <Chip label="Active" size="small" color="success" variant="outlined" sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }} />
      </Box>

      <Stack spacing={0.5} sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 72 }}>
            Staker
          </Typography>
          <Typography variant="caption" fontWeight={500} sx={{ wordBreak: 'break-all' }}>
            {shortenTxid(delegationInfo.staker)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 72 }}>
            Fee
          </Typography>
          <Typography variant="caption" fontWeight={500}>
            {delegationInfo.fee}%
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 72 }}>
            Since Block
          </Typography>
          <Typography variant="caption" fontWeight={500}>
            {delegationInfo.blockHeight}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          disabled={!canDelegate}
          startIcon={<LinkOff sx={{ fontSize: 16 }} />}
          onClick={handleUndelegate}
          sx={{ flex: 1 }}
        >
          Undelegate
        </Button>
        {isInList && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleViewSuperstaker}
            sx={{ flex: 1 }}
          >
            View Staker
          </Button>
        )}
      </Box>
    </Paper>
  );
};

// ─── Custom Staker Input ─────────────────────────────────────

const CustomStakerSection: React.FC<{ canDelegate: boolean }> = ({ canDelegate }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showInput, setShowInput] = useState(false);
  const [address, setAddress] = useState('');

  const handleDelegate = () => {
    if (!address.trim()) return;
    dispatch(setSelectedSuperStaker(undefined));
    dispatch(setCustomSuperstakerAddress(address.trim()));
    navigate('/add-delegation');
  };

  if (!showInput) {
    return (
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<PersonAdd sx={{ fontSize: 16 }} />}
          onClick={() => setShowInput(true)}
        >
          Custom Staker Address
        </Button>
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mx: 1.5, mb: 1.5 }}>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        Custom Super Staker
      </Typography>
      <TextField
        fullWidth
        size="small"
        label="Super Staker Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter Runebase address"
        sx={{ mb: 1.5 }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          disabled={!address.trim() || !canDelegate}
          onClick={handleDelegate}
          sx={{ flex: 1 }}
        >
          Delegate
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => { setShowInput(false); setAddress(''); }}
          sx={{ flex: 1 }}
        >
          Cancel
        </Button>
      </Box>
    </Paper>
  );
};

// ─── UTXO Maturity Banner ────────────────────────────────────

const UtxoMaturityBanner: React.FC<{
  readiness: {
    canDelegate: boolean;
    matureBalance: number;
    immatureBalance: number;
    blocksUntilMature?: number;
    currentHeight?: number;
  };
}> = ({ readiness }) => {
  const { canDelegate, matureBalance, immatureBalance, blocksUntilMature } = readiness;
  const matureRunes = new BigNumber(matureBalance).dividedBy(1e8).toFixed(2);
  const immatureRunes = new BigNumber(immatureBalance).dividedBy(1e8).toFixed(2);

  // Estimate time: Runebase block time ~32s (4x faster than QTUM's 128s)
  const estimatedMinutes = blocksUntilMature ? Math.ceil((blocksUntilMature * 32) / 60) : undefined;
  const timeStr = estimatedMinutes
    ? estimatedMinutes >= 60
      ? `~${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`
      : `~${estimatedMinutes}m`
    : undefined;

  // Progress: how far along the nearest immature UTXO is toward maturity (out of 2000 blocks)
  const STAKE_MATURITY = 2000;
  const progress = blocksUntilMature !== undefined
    ? Math.round(((STAKE_MATURITY - blocksUntilMature) / STAKE_MATURITY) * 100)
    : undefined;

  return (
    <Alert
      severity={canDelegate ? 'info' : 'warning'}
      icon={<HourglassBottom sx={{ fontSize: 20 }} />}
      sx={{ mx: 1.5, mt: 1 }}
    >
      <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
        {canDelegate ? 'Staking rewards maturing' : 'Cannot delegate yet — rewards still maturing'}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="div">
        Spendable: {matureRunes} RUNES{!canDelegate ? ' (need ~200 RUNES for gas)' : ''}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 1 }}>
        Maturing: {immatureRunes} RUNES (staking rewards)
      </Typography>
      {blocksUntilMature !== undefined && blocksUntilMature > 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={progress ?? 0}
              sx={{ flex: 1, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" fontWeight={500} sx={{ flexShrink: 0 }}>
              {progress}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Next mature in {blocksUntilMature.toLocaleString()} blocks{timeStr ? ` (${timeStr})` : ''}
          </Typography>
        </>
      )}
    </Alert>
  );
};

// ─── Main Delegate Page ──────────────────────────────────────

const Delegate: React.FC = () => {
  const dispatch = useAppDispatch();
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const delegationInfo = useAppSelector((state) => state.session.delegationInfo);
  const superstakers = useAppSelector((state) => state.delegate.superstakers);
  const isLoading = useAppSelector((state) => state.delegate.isLoading);
  const readiness = useAppSelector((state) => state.delegate.readiness);

  useEffect(() => {
    dispatch(setSelectedSuperStaker(undefined));
    dispatch(setSuperStakerDelegations(undefined));
    dispatch(setCustomSuperstakerAddress(''));
    dispatch(setIsLoading(true));
    getSuperstakers();
    getDelegationReadiness();
  }, []);

  if (!loggedInAccountName || !walletInfo) {
    return (
      <PageLayout title="Delegate">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout hasBackButton title="Delegate" noPadding>
      {/* My Delegation status — always visible (uses on-chain data, not API) */}
      <MyDelegationCard />

      {/* UTXO maturity info */}
      {readiness && readiness.immatureBalance > 0 && (
        <UtxoMaturityBanner readiness={readiness} />
      )}

      <Divider sx={{ my: 1 }} />

      {/* Custom staker input */}
      <CustomStakerSection canDelegate={readiness?.canDelegate ?? true} />

      {/* Superstaker list from centralized API */}
      {isLoading ? (
        <DelegateSkeleton />
      ) : superstakers && superstakers.length > 0 ? (
        <Stack spacing={1.5} sx={{ px: 1.5, pb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
            Available Super Stakers
          </Typography>
          {superstakers.map((superstaker) => (
            <SuperStakerCard
              key={superstaker.address}
              superstaker={superstaker}
              delegationInfo={delegationInfo}
              canDelegate={readiness?.canDelegate ?? true}
            />
          ))}
        </Stack>
      ) : (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" variant="body2">
            No superstakers available from server
          </Typography>
          <Typography color="text.secondary" variant="caption">
            You can still delegate using a custom staker address above
          </Typography>
        </Box>
      )}
    </PageLayout>
  );
};

export default Delegate;
