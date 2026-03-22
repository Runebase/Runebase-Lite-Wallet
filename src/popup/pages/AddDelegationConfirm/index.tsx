import React from 'react';
import {
  Button,
  Typography,
  Paper,
  Divider,
  Box,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import PageLayout from '../../components/PageLayout';
import BigNumber from 'bignumber.js';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  sendDelegationConfirm,
  selectDelegateButtonDisabled,
} from '../../store/slices/delegateSlice';

const AddDelegationConfirm: React.FC = () => {
  const dispatch = useAppDispatch();
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const selectedSuperstaker = useAppSelector((state) => state.delegate.selectedSuperstaker);
  const delegationFee = useAppSelector((state) => state.delegate.delegationFee);
  const signedPoD = useAppSelector((state) => state.delegate.signedPoD);
  const errorMessage = useAppSelector((state) => state.delegate.errorMessage);
  const isSubmitting = useAppSelector((state) => state.delegate.isSubmitting);
  const gasLimit = useAppSelector((state) => state.delegate.gasLimit);
  const gasPrice = useAppSelector((state) => state.delegate.gasPrice);
  const buttonDisabled = useAppSelector(selectDelegateButtonDisabled);

  if (!loggedInAccountName || !walletInfo || !selectedSuperstaker) {
    return (
      <PageLayout hasBackButton title="Confirm Delegation">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (!signedPoD) {
    return (
      <PageLayout hasBackButton title="Confirm Delegation">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Signing proof of delegation...
          </Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout hasBackButton title="Confirm Delegation">
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={0} divider={<Divider />}>
          <ConfirmItem label="SuperStaker" value={signedPoD.superStakerAddress} />
          <ConfirmItem label="Delegator" value={signedPoD.delegatorAddress} />
          <ConfirmItem label="Fee" value={`${delegationFee}%`} />
          <ConfirmItem label="Gas Limit" value={String(gasLimit)} />
          <ConfirmItem
            label="Gas Cost"
            value={`${new BigNumber(gasPrice ?? 0).dividedBy(1e8).toFixed(8)} RUNES`}
          />
          <ConfirmItem
            label="Gas Amount"
            value={`${new BigNumber(gasPrice ?? 0).times(gasLimit ?? 0).dividedBy(1e8).dp(8).toNumber()} RUNES`}
          />
          <ConfirmItem label="PoD" value={signedPoD.podMessage} />
        </Stack>

        {errorMessage && (
          <Typography color="error" variant="body2" sx={{ mt: 1.5 }}>
            {errorMessage}
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={buttonDisabled || isSubmitting}
          onClick={() => dispatch(sendDelegationConfirm())}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          sx={{ mt: 2 }}
        >
          {isSubmitting ? 'Confirming...' : 'Confirm Delegation'}
        </Button>
      </Paper>
    </PageLayout>
  );
};

/** Confirmation detail row */
const ConfirmItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ py: 1.5 }}>
    <Typography variant="caption" color="text.secondary" fontWeight="bold">
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        wordBreak: 'break-word',
        mt: 0.25,
      }}
    >
      {value}
    </Typography>
  </Box>
);

export default AddDelegationConfirm;
