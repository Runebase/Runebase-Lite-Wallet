import React from 'react';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import GasLimitField from '../../components/GasLimitField';
import GasPriceField from '../../components/GasPriceField';
import DisabledSuperstakerAddressField from '../../components/DisabledSuperstakerAddressField';
import DelegationFeeField from '../../components/DelegationFeeField';
import { handleEnterPress } from '../../../utils';
import { Button } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  routeToAddDelegationConfirm,
  selectDelegateButtonDisabled,
} from '../../store/slices/delegateSlice';

const AddDelegation: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const buttonDisabled = useAppSelector(selectDelegateButtonDisabled);

  if (!loggedInAccountName || !walletInfo) return null;

  const onEnterPress = (event: React.KeyboardEvent) => {
    handleEnterPress(event, () => {
      if (!buttonDisabled) {
        dispatch(routeToAddDelegationConfirm());
      }
    });
  };

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title="Add Delegation" />
      <div className={classes.contentContainer}>
        <DisabledSuperstakerAddressField />
        <DelegationFeeField />
        <GasLimitField source="delegate" onEnterPress={onEnterPress} />
        <GasPriceField source="delegate" onEnterPress={onEnterPress} />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={buttonDisabled}
          onClick={() => dispatch(routeToAddDelegationConfirm())}
          endIcon={<SendIcon />}
        >
          Add Delegation
        </Button>
      </div>
    </div>
  );
};

export default AddDelegation;
