import React, { useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import {
  Button,
  Typography,
  Divider,
  Box,
  CircularProgress,
  Stack,
  Paper,
  Chip,
} from '@mui/material';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import NotificationAddIcon from '@mui/icons-material/NotificationAdd';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import moment from 'moment';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { getSelectedSuperstakerDelegations, getDelegationReadiness } from '../../store/slices/delegateSlice';
import { getNavigateFunction } from '../../store/messageMiddleware';

const SuperstakerDetail: React.FC = () => {
  const dispatch = useAppDispatch();
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const delegationInfo = useAppSelector((state) => state.session.delegationInfo);
  const selectedSuperstaker = useAppSelector((state) => state.delegate.selectedSuperstaker);
  const selectedSuperstakerDelegations = useAppSelector((state) => state.delegate.selectedSuperstakerDelegations);
  const pendingAction = useAppSelector((state) => state.session.pendingDelegationAction);
  const canDelegate = useAppSelector((state) => state.delegate.readiness?.canDelegate ?? true);
  const isPending = !!pendingAction;

  useEffect(() => {
    dispatch(getSelectedSuperstakerDelegations());
    getDelegationReadiness();
  }, []);

  if (!loggedInAccountName || !walletInfo) {
    return (
      <PageLayout hasBackButton title="Super Staker Detail">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  const navigate = getNavigateFunction();

  // Guard: redirect if no superstaker selected
  if (!selectedSuperstaker) {
    return (
      <PageLayout hasBackButton title="Super Staker Detail">
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" variant="body2">
            No superstaker selected.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate?.('/delegate')}
          >
            Back to Staking
          </Button>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout hasBackButton title="Super Staker Detail">
      {/* Superstaker Info Card */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        {/* Address */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 1.5,
          }}
        >
          {selectedSuperstaker.address}
        </Typography>

        {/* Stats */}
        <Stack spacing={0.75}>
          <InfoRow
            icon={<AppRegistrationIcon sx={{ fontSize: 18 }} color="info" />}
            label="Registered"
            value={moment(selectedSuperstaker.firstRegisteredOn).format('YYYY-MM-DD HH:mm')}
          />
          <InfoRow
            icon={<DynamicFormIcon sx={{ fontSize: 18 }} color="success" />}
            label="Blocks Produced"
            value={String(selectedSuperstaker.totalBlocksProduced)}
          />
          <InfoRow
            icon={<NotificationAddIcon sx={{ fontSize: 18 }} color="warning" />}
            label="Last Block"
            value={moment(selectedSuperstaker.lastProducedBlock).format('YYYY-MM-DD HH:mm')}
          />
          <InfoRow
            icon={<SportsScoreIcon sx={{ fontSize: 18 }} color="error" />}
            label="Score / Cycles"
            value={`${selectedSuperstaker.score} / ${selectedSuperstaker.cycles}`}
          />
        </Stack>

        {/* Note */}
        {selectedSuperstaker.note && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, fontStyle: 'italic' }}
          >
            {selectedSuperstaker.note}
          </Typography>
        )}

        {/* Action Button */}
        <Box sx={{ mt: 2 }}>
          {delegationInfo && delegationInfo.staker === selectedSuperstaker.address ? (
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              disabled={isPending || !canDelegate}
              onClick={() => navigate?.('/remove-delegation')}
            >
              Undelegate
            </Button>
          ) : delegationInfo && delegationInfo.staker !== '' ? (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              disabled={isPending || !canDelegate}
              onClick={() => navigate?.('/add-delegation')}
            >
              Change Delegate
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              disabled={isPending || !canDelegate}
              onClick={() => navigate?.('/add-delegation')}
            >
              Delegate
            </Button>
          )}
        </Box>
      </Paper>

      {/* Delegations Section */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
          Delegations
        </Typography>

        {selectedSuperstakerDelegations === undefined ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : selectedSuperstakerDelegations.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No delegations yet
          </Typography>
        ) : (
          <Stack spacing={0} divider={<Divider />}>
            {selectedSuperstakerDelegations.map((delegation: any, index: number) => (
              <Box key={index} sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label={`#${index + 1}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ minWidth: 36, fontWeight: 'bold' }}
                  />
                  <Chip
                    label={`Fee: ${delegation.fee}%`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`Block ${delegation.blockHeight}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <DetailRow label="Delegate" value={delegation.delegate} truncate />
                <DetailRow label="Staker" value={delegation.staker} truncate />
                <DetailRow label="PoD" value={delegation.PoD} truncate />
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </PageLayout>
  );
};

/** Labeled info row with icon for the superstaker stats */
const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    {icon}
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {value}
    </Typography>
  </Box>
);

/** Key-value row for delegation details with optional truncation */
const DetailRow: React.FC<{
  label: string;
  value: string;
  truncate?: boolean;
}> = ({ label, value, truncate }) => (
  <Box sx={{ display: 'flex', gap: 1, mb: 0.5, minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, minWidth: 52 }}>
      {label}:
    </Typography>
    <Typography
      variant="caption"
      sx={{
        fontWeight: 500,
        ...(truncate
          ? {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }
          : { wordBreak: 'break-word' }),
      }}
    >
      {value}
    </Typography>
  </Box>
);

export default SuperstakerDetail;
