import React from 'react';
import PageLayout from '../../components/PageLayout';
import BigNumber from 'bignumber.js';
import {
  Button,
  Divider,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  sendRemoveDelegationConfirm,
  selectDelegateButtonDisabled,
} from '../../store/slices/delegateSlice';

const RemoveDelegationConfirm: React.FC = () => {
  const dispatch = useAppDispatch();
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const gasLimit = useAppSelector((state) => state.delegate.gasLimit);
  const gasPrice = useAppSelector((state) => state.delegate.gasPrice);
  const errorMessage = useAppSelector((state) => state.delegate.errorMessage);
  const isSubmitting = useAppSelector((state) => state.delegate.isSubmitting);
  const buttonDisabled = useAppSelector(selectDelegateButtonDisabled);

  if (!loggedInAccountName || !walletInfo) {
    return (
      <PageLayout hasBackButton title="Confirm Remove Delegation">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout hasBackButton title="Confirm Remove Delegation">
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={0} divider={<Divider />}>
          <ConfirmItem label="Gas Limit" value={String(gasLimit)} />
          <ConfirmItem
            label="Gas Cost"
            value={`${new BigNumber(gasPrice ?? 0).dividedBy(1e8).toFixed(8)} RUNES`}
          />
          <ConfirmItem
            label="Gas Amount"
            value={`${new BigNumber(gasPrice ?? 0).times(gasLimit ?? 0).dividedBy(1e8).dp(8).toNumber()} RUNES`}
          />
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
          onClick={() => dispatch(sendRemoveDelegationConfirm())}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          sx={{ mt: 2 }}
        >
          {isSubmitting ? 'Confirming...' : 'Confirm Remove Delegation'}
        </Button>
      </Paper>
    </PageLayout>
  );
};

/** Confirmation detail row */
const ConfirmItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ py: 1.5 }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
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

export default RemoveDelegationConfirm;
