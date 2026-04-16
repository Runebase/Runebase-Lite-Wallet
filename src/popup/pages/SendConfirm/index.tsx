import React from 'react';
import { Typography, Button, CircularProgress, Stack, Paper, Box, Alert, IconButton } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

import useStyles from './styles';
import { SEND_STATE } from '../../../constants';
import PageLayout from '../../components/PageLayout';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { executeSend, selectMaxTxFee } from '../../store/slices/sendSlice';
import { useSnackbar } from '../../components/SnackbarProvider';

const SendConfirm: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const { SENDING, SENT } = SEND_STATE;

  const senderAddress = useAppSelector((state) => state.send.senderAddress);
  const receiverAddress = useAppSelector((state) => state.send.receiverAddress);
  const amount = useAppSelector((state) => state.send.amount);
  const token = useAppSelector((state) => state.send.token);
  const transactionSpeed = useAppSelector((state) => state.send.transactionSpeed);
  const gasLimit = useAppSelector((state) => state.send.gasLimit);
  const gasPrice = useAppSelector((state) => state.send.gasPrice);
  const maxTxFee = useAppSelector(selectMaxTxFee);
  const sendState = useAppSelector((state) => state.send.sendState);
  const errorMessage = useAppSelector((state) => state.send.errorMessage);

  const isSending = sendState === SENDING;
  const isSent = sendState === SENT;

  return (
    <PageLayout hasBackButton title="Confirm">
      {/* Hero amount */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          textAlign: 'center',
          bgcolor: 'action.hover',
          borderRadius: 2,
        }}
      >
        <Typography variant="overline" color="text.secondary">
            You are sending
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold', my: 0.5 }}>
          {amount}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {token!.symbol}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack spacing={1.5}>
          <AddressField fieldName="From" address={senderAddress} classes={classes} />
          <AddressField fieldName="To" address={receiverAddress} classes={classes} />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack spacing={1}>
          {token && token.symbol === 'RUNES' ? (
            <CostField fieldName="Transaction Speed" amount={transactionSpeed} unit="" classes={classes} />
          ) : (
            <>
              <CostField fieldName="Gas Limit" amount={gasLimit} unit="GAS" classes={classes} />
              <CostField fieldName="Gas Price" amount={gasPrice} unit="SATOSHI/GAS" classes={classes} />
              <CostField fieldName="Max Transaction Fee" amount={maxTxFee} unit="RUNES" classes={classes} />
            </>
          )}
        </Stack>
      </Paper>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>
      )}
      <Button
        className={classes.sendButton}
        fullWidth
        disabled={isSending || isSent}
        variant="contained"
        color="primary"
        size="large"
        onClick={() => dispatch(executeSend())}
        startIcon={isSending ? <CircularProgress size={20} color="inherit" aria-label="Sending transaction" /> : undefined}
      >
        {sendState}
      </Button>
    </PageLayout>
  );
};

interface AddressFieldProps {
  classes: Record<string, string>;
  fieldName: string;
  address?: string;
}

const AddressField: React.FC<AddressFieldProps> = ({ classes, fieldName, address }) => {
  const { showSnackbar } = useSnackbar();

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      showSnackbar(`${fieldName} address copied`);
    }
  };

  return (
    <div className={classes.fieldContainer}>
      <Typography variant="caption" color="text.secondary">
        {fieldName}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
        <Box
          component="code"
          onClick={handleCopy}
          sx={{
            fontSize: 'body2.fontSize',
            fontWeight: 'fontWeightMedium',
            fontFamily: 'Roboto Mono, monospace',
            wordBreak: 'break-all',
            display: 'block',
            cursor: 'pointer',
            flex: 1,
            '&:hover': { color: 'primary.main' },
          }}
        >
          {address}
        </Box>
        <IconButton size="small" onClick={handleCopy} aria-label={`Copy ${fieldName} address`} sx={{ mt: -0.5 }}>
          <ContentCopy sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </div>
  );
};

interface CostFieldProps {
  classes: Record<string, string>;
  fieldName: string;
  amount: string | number | undefined;
  unit: string;
}

const CostField: React.FC<CostFieldProps> = ({ classes, fieldName, amount, unit }) => (
  <div className={classes.costFieldContainer}>
    <Typography variant="caption" color="text.secondary">{fieldName}</Typography>
    <div className={classes.amountContainer}>
      <Typography className={classes.fieldValue}>{amount}</Typography>
      {unit && <Typography className={classes.fieldUnit}>{unit}</Typography>}
    </div>
  </div>
);

export default SendConfirm;
