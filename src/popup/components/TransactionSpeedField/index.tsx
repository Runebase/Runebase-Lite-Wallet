import React from 'react';
import { Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setTransactionSpeed, TRANSACTION_SPEEDS } from '../../store/slices/sendSlice';

const rates: Record<string, string> = {
  Fast: '0.8 RUNES/KB',
  Normal: '0.5 RUNES/KB',
  Slow: '0.4 RUNES/KB',
};

const TransactionSpeedField: React.FC = () => {
  const dispatch = useAppDispatch();
  const transactionSpeed = useAppSelector((state) => state.send.transactionSpeed);

  return (
    <FormControl fullWidth>
      <InputLabel id="transaction-speed-label">Transaction Speed</InputLabel>
      <Select
        labelId="transaction-speed-label"
        label="Transaction Speed"
        value={transactionSpeed}
        onChange={(event) => dispatch(setTransactionSpeed(event.target.value as string))}
      >
        {TRANSACTION_SPEEDS.map((speed: string) => (
          <MenuItem key={speed} value={speed}>
            <Typography>{rates[speed]} ({speed})</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TransactionSpeedField;
