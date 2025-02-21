import React from 'react';
import { Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import { observer } from 'mobx-react';

const rates: Record<string, string> = {
  Fast: '0.8 RUNES/KB',
  Normal: '0.5 RUNES/KB',
  Slow: '0.4 RUNES/KB',
};

const TransactionSpeedField = observer(({ sendStore }: any) => (
  <FormControl
    fullWidth
    sx={{marginBottom: '8px'}}
  >
    <InputLabel id="transaction-speed-label">Transaction Speed</InputLabel>
    <Select
      labelId="transaction-speed-label"
      label="Transaction Speed"
      value={sendStore.transactionSpeed}
      onChange={(event) => sendStore.setTransactionSpeed(event.target.value)}
    >
      {sendStore.transactionSpeeds.map((transactionSpeed: string) => (
        <MenuItem key={transactionSpeed} value={transactionSpeed}>
          <Typography>{rates[transactionSpeed]} ({transactionSpeed})</Typography>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
));

export default TransactionSpeedField;
