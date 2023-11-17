import React from 'react';
import { observer, inject } from 'mobx-react';
import { Typography, Button } from '@mui/material';
import cx from 'classnames';

import useStyles from './styles';
import { SEND_STATE } from '../../../constants';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const SendConfirm: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const { SENDING, SENT } = SEND_STATE;
    const { sendStore } = store;
    const {
      senderAddress,
      receiverAddress,
      amount,
      token,
      transactionSpeed,
      gasLimit,
      gasPrice,
      maxTxFee,
      sendState,
      errorMessage
    } = sendStore;

    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Confirm" />
        <div className={classes.contentContainer}>
          <div className={classes.inputContainer}>
            <div className={classes.addressFieldsContainer}>
              <AddressField fieldName={'From'} address={senderAddress} classes={classes} />
              <AddressField fieldName={'To'} address={receiverAddress} classes={classes} />
            </div>
            <CostField fieldName={'Amount'} amount={amount} unit={token!.symbol} classes={classes} />
            {store.sendStore.token && store.sendStore.token.symbol === 'RUNES' ? (
              <CostField fieldName={'Transaction Speed'} amount={transactionSpeed} unit={''} classes={classes} />
            ) : (
              <div>
                <CostField fieldName={'Gas Limit'} amount={gasLimit} unit={'GAS'} classes={classes} />
                <CostField fieldName={'Gas Price'} amount={gasPrice} unit={'SATOSHI/GAS'} classes={classes} />
                <CostField fieldName={'Max Transaction Fee'} amount={maxTxFee} unit={'RUNES'} classes={classes} />
              </div>
            )}
          </div>
          {errorMessage && <Typography className={classes.errorMessage}>{errorMessage}</Typography>}
          <Button
            className={classes.sendButton}
            fullWidth
            disabled={[SENDING, SENT].includes(sendState)}
            variant="contained"
            color="primary"
            onClick={sendStore.send}
          >
            {sendState}
          </Button>
        </div>
      </div>
    );
  })
);

interface AddressFieldProps {
  classes: Record<string, string>;
  fieldName: string;
  address?: string;
}

const AddressField: React.FC<AddressFieldProps> = ({ classes, fieldName, address }) => (
  <div className={cx(classes.fieldContainer, 'marginSmall')}>
    <Typography className={cx(classes.fieldLabel, 'address')}>{fieldName}</Typography>
    <Typography className={classes.addressValue}>{address}</Typography>
  </div>
);

interface CostFieldProps {
  classes: Record<string, string>;
  fieldName: string;
  amount: string | number | undefined;
  unit: string;
}

const CostField: React.FC<CostFieldProps> = ({ classes, fieldName, amount, unit }) => (
  <div className={cx(classes.fieldContainer, 'row', 'marginBig')}>
    <div className={classes.labelContainer}>
      <Typography className={cx(classes.fieldLabel, 'cost')}>{fieldName}</Typography>
    </div>
    <div className={classes.amountContainer}>
      <Typography className={classes.fieldValue}>{amount}</Typography>
    </div>
    <div className={classes.unitContainer}>
      <Typography className={classes.fieldUnit}>{unit}</Typography>
    </div>
  </div>
);

export default SendConfirm;
