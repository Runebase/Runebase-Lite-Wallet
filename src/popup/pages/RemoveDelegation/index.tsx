import React from 'react';
import PageLayout from '../../components/PageLayout';
import GasLimitField from '../../components/GasLimitField';
import GasPriceField from '../../components/GasPriceField';
import { Button, Box, CircularProgress, Stack } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { handleEnterPress } from '../../../utils';
import { useAppSelector } from '../../store/hooks';
import {
  routeToRemoveDelegationConfirm,
  selectDelegateButtonDisabled,
} from '../../store/slices/delegateSlice';

const RemoveDelegation: React.FC = () => {
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const buttonDisabled = useAppSelector(selectDelegateButtonDisabled);

  if (!loggedInAccountName || !walletInfo) {
    return (
      <PageLayout hasBackButton title="Remove Delegation">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  const onEnterPress = (event: React.KeyboardEvent) => {
    handleEnterPress(event, () => {
      if (!buttonDisabled) {
        routeToRemoveDelegationConfirm();
      }
    });
  };

  return (
    <PageLayout hasBackButton title="Remove Delegation">
      <Stack spacing={2}>
        <GasLimitField source="delegate" onEnterPress={onEnterPress} />
        <GasPriceField source="delegate" onEnterPress={onEnterPress} />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={buttonDisabled}
          onClick={() => routeToRemoveDelegationConfirm()}
          endIcon={<SendIcon />}
        >
          Remove Delegation
        </Button>
      </Stack>
    </PageLayout>
  );
};

export default RemoveDelegation;
