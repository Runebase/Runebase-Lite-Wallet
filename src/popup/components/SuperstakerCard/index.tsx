import React from 'react';
import {
  Typography,
  Paper,
  Button,
  Box,
  CircularProgress,
  Stack,
} from '@mui/material';
import { IGetAddressDelegation } from '../../../services/wallet/types';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import NotificationAddIcon from '@mui/icons-material/NotificationAdd';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import moment from 'moment';
import { SuperStaker } from '../../../types';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedSuperStaker, setCustomSuperstakerAddress } from '../../store/slices/delegateSlice';

interface SuperStakerCardProps {
  superstaker: SuperStaker;
  delegationInfo: IGetAddressDelegation | undefined;
  canDelegate?: boolean;
}

const SuperStakerCard: React.FC<SuperStakerCardProps> = ({
  superstaker,
  delegationInfo,
  canDelegate = true,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const pendingAction = useAppSelector((state) => state.session.pendingDelegationAction);

  const handleDelegate = () => {
    dispatch(setSelectedSuperStaker(superstaker));
    dispatch(setCustomSuperstakerAddress(''));
    navigate('/add-delegation');
  };

  const handleUndelegate = () => {
    dispatch(setSelectedSuperStaker(superstaker));
    navigate('/remove-delegation');
  };

  const handleDetails = () => {
    dispatch(setSelectedSuperStaker(superstaker));
    navigate('/superstaker-detail');
  };

  const isDelegatedToThis = delegationInfo && delegationInfo.staker === superstaker.address;
  const isDelegatedToOther = delegationInfo && delegationInfo.staker !== '' && !isDelegatedToThis;
  const isPending = !!pendingAction;
  const isPendingForThis = isPending && pendingAction.stakerAddress === superstaker.address;

  return (
    <Paper
      variant="outlined"
      sx={{
        width: '100%',
        p: 2,
      }}
    >
      {/* Address */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 'bold',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          mb: 1,
        }}
      >
        {superstaker.address}
      </Typography>

      {/* Stats with labels */}
      <Stack spacing={0.5} sx={{ mb: 1 }}>
        <InfoRow
          icon={<AppRegistrationIcon sx={{ fontSize: 16 }} color="info" />}
          label="Registered"
          value={moment(superstaker.firstRegisteredOn).format('YYYY-MM-DD')}
        />
        <InfoRow
          icon={<DynamicFormIcon sx={{ fontSize: 16 }} color="success" />}
          label="Blocks"
          value={String(superstaker.totalBlocksProduced)}
        />
        <InfoRow
          icon={<NotificationAddIcon sx={{ fontSize: 16 }} color="warning" />}
          label="Last Block"
          value={moment(superstaker.lastProducedBlock).format('YYYY-MM-DD')}
        />
        <InfoRow
          icon={<SportsScoreIcon sx={{ fontSize: 16 }} color="error" />}
          label="Score / Cycles"
          value={`${superstaker.score} / ${superstaker.cycles}`}
        />
      </Stack>

      {/* Note */}
      {superstaker.note && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mb: 1,
            fontStyle: 'italic',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {superstaker.note}
        </Typography>
      )}

      {/* Buttons */}
      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
        {isPendingForThis ? (
          <Button
            variant="contained"
            color="warning"
            size="small"
            disabled
            startIcon={<CircularProgress size={14} />}
            sx={{ flex: 1 }}
          >
            Confirming...
          </Button>
        ) : isDelegatedToThis ? (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            disabled={isPending || !canDelegate}
            onClick={handleUndelegate}
            sx={{ flex: 1 }}
          >
            Undelegate
          </Button>
        ) : isDelegatedToOther ? (
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={isPending || !canDelegate}
            onClick={handleDelegate}
            sx={{ flex: 1 }}
          >
            Change Delegate
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={isPending || !canDelegate}
            onClick={handleDelegate}
            sx={{ flex: 1 }}
          >
            Delegate
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={handleDetails}
          sx={{ flex: 1 }}
        >
          Details
        </Button>
      </Box>
    </Paper>
  );
};

/** Compact info row with icon and label */
const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    {icon}
    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 72, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography variant="caption" sx={{ fontWeight: 500 }}>
      {value}
    </Typography>
  </Box>
);

export default SuperStakerCard;
