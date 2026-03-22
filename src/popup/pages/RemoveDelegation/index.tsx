import React from 'react';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import GasLimitField from '../../components/GasLimitField';
import GasPriceField from '../../components/GasPriceField';
import { Button } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { handleEnterPress } from '../../../utils';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  routeToRemoveDelegationConfirm,
  selectDelegateButtonDisabled,
} from '../../store/slices/delegateSlice';

const RemoveDelegation: React.FC = () => {
  const { classes } = useStyles();
  const _dispatch = useAppDispatch();
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const buttonDisabled = useAppSelector(selectDelegateButtonDisabled);

  if (!loggedInAccountName || !walletInfo) return null;

  const onEnterPress = (event: React.KeyboardEvent) => {
    handleEnterPress(event, () => {
      if (!buttonDisabled) {
        routeToRemoveDelegationConfirm();
      }
    });
  };

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title="Remove Delegation" />
      <div className={classes.contentContainer}>
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
      </div>
    </div>
  );
};

export default RemoveDelegation;
