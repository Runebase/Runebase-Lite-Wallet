import React from 'react';
import PageLayout from '../../components/PageLayout';
import GasLimitField from '../../components/GasLimitField';
import GasPriceField from '../../components/GasPriceField';
import DisabledSuperstakerAddressField from '../../components/DisabledSuperstakerAddressField';
import DelegationFeeField from '../../components/DelegationFeeField';
import { handleEnterPress } from '../../../utils';
import { Button, Box, CircularProgress, Stack, TextField, FormControl } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  routeToAddDelegationConfirm,
  selectDelegateButtonDisabled,
  setCustomSuperstakerAddress,
} from '../../store/slices/delegateSlice';

const AddDelegation: React.FC = () => {
  const dispatch = useAppDispatch();
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const buttonDisabled = useAppSelector(selectDelegateButtonDisabled);
  const selectedSuperstaker = useAppSelector((state) => state.delegate.selectedSuperstaker);
  const customSuperstakerAddress = useAppSelector((state) => state.delegate.customSuperstakerAddress);

  const isCustomMode = !selectedSuperstaker && !!customSuperstakerAddress;
  const hasAddress = !!selectedSuperstaker?.address || !!customSuperstakerAddress.trim();
  const isDisabled = buttonDisabled || !hasAddress;

  if (!loggedInAccountName || !walletInfo) {
    return (
      <PageLayout hasBackButton title="Add Delegation">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  const onEnterPress = (event: React.KeyboardEvent) => {
    handleEnterPress(event, () => {
      if (!isDisabled) {
        dispatch(routeToAddDelegationConfirm());
      }
    });
  };

  return (
    <PageLayout hasBackButton title="Add Delegation">
      <Stack spacing={2}>
        {isCustomMode ? (
          <FormControl fullWidth>
            <TextField
              fullWidth
              label="Super Staker Address"
              type="text"
              value={customSuperstakerAddress}
              onChange={(e) => dispatch(setCustomSuperstakerAddress(e.target.value))}
              placeholder="Enter Runebase address"
            />
          </FormControl>
        ) : (
          <DisabledSuperstakerAddressField />
        )}
        <DelegationFeeField />
        <GasLimitField source="delegate" onEnterPress={onEnterPress} />
        <GasPriceField source="delegate" onEnterPress={onEnterPress} />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={isDisabled}
          onClick={() => dispatch(routeToAddDelegationConfirm())}
          endIcon={<SendIcon />}
        >
          Add Delegation
        </Button>
      </Stack>
    </PageLayout>
  );
};

export default AddDelegation;
