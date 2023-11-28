import React, { useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import GasLimitField from '../../components/GasLimitField';
import GasPriceField from '../../components/GasPriceField';
import { Button } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { handleEnterPress } from '../../../utils';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const RemoveDelegation: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const { sessionStore, delegateStore, routerStore } = store;
    const { loggedInAccountName, walletInfo } = sessionStore;
    if (!loggedInAccountName || !walletInfo) return null;

    useEffect(() => { }, []);

    const onEnterPress = (event: React.KeyboardEvent) => {
      handleEnterPress(event, () => {
        if (!delegateStore.buttonDisabled) {
          routerStore.push('/remove-delegation-confirm');
        }
      });
    };


    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Remove Delegation" />
        <div className={classes.contentContainer}>
          <GasLimitField onEnterPress={onEnterPress} sendStore={delegateStore} />
          <GasPriceField onEnterPress={onEnterPress} sendStore={delegateStore} />
          <RemoveDelegationButton delegateStore={delegateStore} classes={classes} />
        </div>
      </div>
    );
  })
);

const RemoveDelegationButton = observer(({ delegateStore }: any) => (
  <Button
    fullWidth
    variant="contained"
    color="primary"
    size="large"
    disabled={delegateStore.buttonDisabled}
    onClick={delegateStore.routeToRemoveDelegationConfirm}
    endIcon={<SendIcon />}
  >
    Remove Delegation
  </Button>
));


export default RemoveDelegation;
