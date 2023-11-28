import React, { useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { Button, Typography, Paper, Divider } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import BigNumber from 'bignumber.js';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const AddDelegationConfirm: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const { sessionStore, delegateStore } = store;
    const { loggedInAccountName, walletInfo } = sessionStore;
    const { selectedSuperstaker, delegationFee, signedPoD, errorMessage, gasLimit, gasPrice  } = delegateStore;
    if (!loggedInAccountName || !walletInfo || !selectedSuperstaker) return null;

    useEffect(() => {}, [signedPoD, errorMessage]);

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
    } else {
      return (
        <div className={classes.root}>
          <NavBar hasBackButton title="Add Delegation Confirm" />
          <Paper className={classes.contentContainer} elevation={3} style={{ padding: '8px' }}>
            {renderItem('SuperStaker', signedPoD.superStakerAddress)}
            {renderItem('Delegator', signedPoD.delegatorAddress)}
            {renderItem('SuperStaker Fee', `${delegationFee}%`)}
            {renderItem('Gas Limit', gasLimit)}
            {renderItem('Gas Cost', `${new BigNumber(gasPrice).dividedBy(1e8).toFixed(8)} RUNES`)}
            {renderItem('Gas Amount', `${new BigNumber(gasPrice).times(gasLimit).dividedBy(1e8).dp(8).toNumber()} RUNES`)}
            {renderItem('PoD', signedPoD.podMessage)}
            {errorMessage && <Typography style={{ color: 'red' }}>{errorMessage}</Typography>}
            <ConfirmDelegationButton delegateStore={delegateStore} />
          </Paper>
        </div>
      );
    }

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
  })
);

const ConfirmDelegationButton = observer(({ delegateStore }: any) => (
  <Button
    fullWidth
    variant="contained"
    color="primary"
    size="large"
    disabled={delegateStore.buttonDisabled}
    onClick={delegateStore.sendDelegationConfirm}
    endIcon={<SendIcon />}
    style={{ marginTop: '16px' }}
  >
    Confirm Delegation
  </Button>
));

export default AddDelegationConfirm;
