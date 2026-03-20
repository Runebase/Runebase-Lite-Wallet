import React from 'react';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import BigNumber from 'bignumber.js';
import { Button, Divider, Paper, Typography } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  sendRemoveDelegationConfirm,
  selectDelegateButtonDisabled,
} from '../../store/slices/delegateSlice';

const RemoveDelegationConfirm: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);
  const gasLimit = useAppSelector((state) => state.delegate.gasLimit);
  const gasPrice = useAppSelector((state) => state.delegate.gasPrice);
  const errorMessage = useAppSelector((state) => state.delegate.errorMessage);
  const buttonDisabled = useAppSelector(selectDelegateButtonDisabled);

  if (!loggedInAccountName || !walletInfo) return null;

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

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title="Remove Delegation Confirm" />
      <Paper className={classes.contentContainer} elevation={3} style={{ padding: '8px' }}>
        {renderItem('Gas Limit', gasLimit)}
        {renderItem('Gas Cost', `${new BigNumber(gasPrice ?? 0).dividedBy(1e8).toFixed(8)} RUNES`)}
        {renderItem('Gas Amount', `${new BigNumber(gasPrice ?? 0).times(gasLimit ?? 0).dividedBy(1e8).dp(8).toNumber()} RUNES`)}
        {errorMessage && <Typography style={{ color: 'red' }}>{errorMessage}</Typography>}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={buttonDisabled}
          onClick={() => dispatch(sendRemoveDelegationConfirm())}
          endIcon={<SendIcon />}
          style={{ marginTop: '16px' }}
        >
          Confirm Remove Delegation
        </Button>
      </Paper>
    </div>
  );
};

export default RemoveDelegationConfirm;
