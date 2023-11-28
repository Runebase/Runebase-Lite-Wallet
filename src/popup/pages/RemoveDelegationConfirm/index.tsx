import React, { useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import BigNumber from 'bignumber.js';
import { Button, Divider, Paper, Typography } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const RemoveDelegationConfirm: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const { sessionStore, delegateStore } = store;
    const { loggedInAccountName, walletInfo } = sessionStore;
    if (!loggedInAccountName || !walletInfo) return null;
    const {gasLimit, gasPrice, errorMessage} = delegateStore;

    useEffect(() => { }, []);


    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Remove Delegation Confirm" />
        <Paper className={classes.contentContainer} elevation={3} style={{ padding: '8px' }}>
          {renderItem('Gas Limit', gasLimit)}
          {renderItem('Gas Cost', `${new BigNumber(gasPrice).dividedBy(1e8).toFixed(8)} RUNES`)}
          {renderItem('Gas Amount', `${new BigNumber(gasPrice).times(gasLimit).dividedBy(1e8).dp(8).toNumber()} RUNES`)}
          {errorMessage && <Typography style={{ color: 'red' }}>{errorMessage}</Typography>}
          <ConfirmRemoveDelegationButton delegateStore={delegateStore} />
        </Paper>
      </div>
    );
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

const ConfirmRemoveDelegationButton = observer(({ delegateStore }: any) => (
  <Button
    fullWidth
    variant="contained"
    color="primary"
    size="large"
    disabled={delegateStore.buttonDisabled}
    onClick={delegateStore.sendRemoveDelegationConfirm}
    endIcon={<SendIcon />}
    style={{ marginTop: '16px' }}
  >
    Confirm Remove Delegation
  </Button>
));


export default RemoveDelegationConfirm;
