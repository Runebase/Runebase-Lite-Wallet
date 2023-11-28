import React, { useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import GasLimitField from '../../components/GasLimitField';
import GasPriceField from '../../components/GasPriceField';
import { handleEnterPress } from '../../../utils';
import { Button } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import DisabledSuperstakerAddressField from '../../components/DisabledSuperstakerAddressField';
import DelegationFeeField from '../../components/DelegationFeeField';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const AddDelegation: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const { sessionStore, delegateStore, routerStore } = store;
    const { loggedInAccountName, walletInfo } = sessionStore;
    if (!loggedInAccountName || !walletInfo) return null;

    useEffect(() => { }, [
      delegateStore.delegationFee
    ]);

    const onEnterPress = (event: React.KeyboardEvent) => {
      handleEnterPress(event, () => {
        if (!delegateStore.buttonDisabled) {
          routerStore.push('/add-delegation-confirm');
        }
      });
    };


    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Add Delegation" />
        <div className={classes.contentContainer}>
          <DisabledSuperstakerAddressField delegateStore={delegateStore} />
          <DelegationFeeField delegateStore={delegateStore} />
          <GasLimitField onEnterPress={onEnterPress} sendStore={delegateStore} />
          <GasPriceField onEnterPress={onEnterPress} sendStore={delegateStore} />
          <AddDelegationButton delegateStore={delegateStore} classes={classes} />
        </div>
      </div>
    );
  })
);

const AddDelegationButton = observer(({ delegateStore }: any) => (
  <Button
    fullWidth
    variant="contained"
    color="primary"
    size="large"
    disabled={delegateStore.buttonDisabled}
    onClick={delegateStore.routeToAddDelegationConfirm}
    endIcon={<SendIcon />}
  >
    Add Delegation
  </Button>
));

export default AddDelegation;
