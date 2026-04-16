import React from 'react';
import { Button, FormControl, TextField, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setAmount, selectAmountFieldError, selectMaxAmount } from '../../store/slices/sendSlice';

interface AmountFieldProps {
  onEnterPress: () => void;
}

const AmountField: React.FC<AmountFieldProps> = ({ onEnterPress }) => {
  const dispatch = useAppDispatch();
  const amount = useAppSelector((state) => state.send.amount);
  const token = useAppSelector((state) => state.send.token);
  const amountFieldError = useAppSelector(selectAmountFieldError);
  const maxAmount = useAppSelector(selectMaxAmount);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onEnterPress();
    }
  };

  return (
    <FormControl fullWidth>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <Typography variant="caption">available: {maxAmount}</Typography>
        <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={() => {
            if (maxAmount !== undefined) {
              dispatch(setAmount(String(maxAmount)));
            }
          }}
        >
          Max
        </Button>
      </div>
      <TextField
        label="Amount"
        fullWidth
        type="number"
        multiline={false}
        placeholder={'0.00'}
        value={amount}
        slotProps={{
          input: {
            endAdornment: (
              <Typography>
                {token && token.symbol}
              </Typography>
            ),
          },
        }}
        onChange={(event) => {
          const newValue = event.target.value;
          newValue === '' ? dispatch(setAmount('')) : dispatch(setAmount(newValue));
        }}
        onKeyDown={handleKeyDown}
      />
      {amount !== '' && amountFieldError && (
        <Typography color="error" variant="caption" sx={{ textAlign: 'left', mt: 0.5 }}>
          {amountFieldError}
        </Typography>
      )}
    </FormControl>
  );
};

export default AmountField;
