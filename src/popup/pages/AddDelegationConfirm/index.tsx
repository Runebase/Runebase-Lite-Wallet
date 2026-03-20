import React from 'react';
import { Button, Typography, Paper, Divider } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import BigNumber from 'bignumber.js';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  sendDelegationConfirm,
  selectDelegateButtonDisabled,
} from '../../store/slices/delegateSlice';

const AddDelegationConfirm: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const selectedSuperstaker = useAppSelector((state) => state.delegate.selectedSuperstaker);
  const delegationFee = useAppSelector((state) => state.delegate.delegationFee);
  const signedPoD = useAppSelector((state) => state.delegate.signedPoD);
  const errorMessage = useAppSelector((state) => state.delegate.errorMessage);
  const gasLimit = useAppSelector((state) => state.delegate.gasLimit);
  const gasPrice = useAppSelector((state) => state.delegate.gasPrice);
  const buttonDisabled = useAppSelector(selectDelegateButtonDisabled);

  if (!loggedInAccountName || !walletInfo || !selectedSuperstaker) return null;

  function renderItem(title: string, message: string | number) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body1" style={{ wordBreak: 'break-all' }}>
          <strong style={{ textDecoration: 'underline' }}>{title}</strong>
        </Typography>
        <Typography variant="caption" style={{ wordBreak: 'break-all' }}>
          {message}
        </Typography>
        <Divider style={{ margin: '8px 0' }} />
      </div>
    );
  }

  if (!signedPoD) {
    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Add Delegation Confirm" />
        <Paper className={classes.contentContainer} elevation={3}>
          <Typography variant="body1" style={{ padding: '16px' }}>
            Loading...
          </Typography>
        </Paper>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title="Add Delegation Confirm" />
      <Paper className={classes.contentContainer} elevation={3} style={{ padding: '8px' }}>
        {renderItem('SuperStaker', signedPoD.superStakerAddress)}
        {renderItem('Delegator', signedPoD.delegatorAddress)}
        {renderItem('SuperStaker Fee', `${delegationFee}%`)}
        {renderItem('Gas Limit', gasLimit)}
        {renderItem('Gas Cost', `${new BigNumber(gasPrice ?? 0).dividedBy(1e8).toFixed(8)} RUNES`)}
        {renderItem('Gas Amount', `${new BigNumber(gasPrice ?? 0).times(gasLimit ?? 0).dividedBy(1e8).dp(8).toNumber()} RUNES`)}
        {renderItem('PoD', signedPoD.podMessage)}
        {errorMessage && <Typography style={{ color: 'red' }}>{errorMessage}</Typography>}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={buttonDisabled}
          onClick={() => dispatch(sendDelegationConfirm())}
          endIcon={<SendIcon />}
          style={{ marginTop: '16px' }}
        >
          Confirm Delegation
        </Button>
      </Paper>
    </div>
  );
};

export default AddDelegationConfirm;
