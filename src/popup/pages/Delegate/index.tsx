import React, { useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import { Grid } from '@mui/material';
import SuperStakerCard from '../../components/SuperstakerCard';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const Delegate: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const { sessionStore, delegateStore, routerStore } = store;
    const { loggedInAccountName, walletInfo, delegationInfo } = sessionStore;
    if (!loggedInAccountName || !walletInfo) return null;

    useEffect(() => {
      delegateStore.setSelectedSuperStaker(undefined);
      delegateStore.setSuperStakerDelegations(undefined);
      delegateStore.getSuperstakers();
    }, []);


    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Delegate" />
        {
          delegateStore
          && delegateStore.superstakers
          && delegateStore.superstakers.length > 0
          && (
            <Grid
              container
            >
              {delegateStore.superstakers.map((superstaker) => (
                <Grid
                  item
                  xs={12}
                  style={{
                    padding: '10px',
                  }}
                >
                  <SuperStakerCard
                    superstaker={superstaker}
                    delegationInfo={delegationInfo}
                    routerStore={routerStore}
                    delegateStore={delegateStore}
                  />
                </Grid>
              ))}
            </Grid>
          )
        }
      </div>
    );
  })
);

export default Delegate;
