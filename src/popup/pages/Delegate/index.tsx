import React, { useEffect } from 'react';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import { Grid } from '@mui/material';
import SuperStakerCard from '../../components/SuperstakerCard';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  getSuperstakers,
  setSelectedSuperStaker,
  setSuperStakerDelegations,
} from '../../store/slices/delegateSlice';
import { getNavigateFunction } from '../../store/messageMiddleware';

const Delegate: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const delegationInfo = useAppSelector((state) => state.session.delegationInfo);
  const superstakers = useAppSelector((state) => state.delegate.superstakers);

  useEffect(() => {
    dispatch(setSelectedSuperStaker(undefined));
    dispatch(setSuperStakerDelegations(undefined));
    getSuperstakers();
  }, []);

  if (!loggedInAccountName || !walletInfo) return null;

  const navigate = getNavigateFunction();

  const delegateStoreAdapter = {
    setSelectedSuperStaker: (superstaker: any) => dispatch(setSelectedSuperStaker(superstaker)),
  } as any;

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title="Delegate" />
      {superstakers && superstakers.length > 0 && (
        <Grid container>
          {superstakers.map((superstaker) => (
            <Grid
              key={superstaker.address}
              item
              xs={12}
              style={{ padding: '10px' }}
            >
              <SuperStakerCard
                superstaker={superstaker}
                delegationInfo={delegationInfo}
                navigate={navigate}
                delegateStore={delegateStoreAdapter}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default Delegate;
