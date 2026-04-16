import React from 'react';
import { Button, FormControl, TextField, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setGasPrice as setSendGasPrice,
  selectGasPriceFieldError as selectSendGasPriceFieldError,
  GAS_PRICE_RECOMMENDED,
} from '../../store/slices/sendSlice';
import {
  setGasPrice as setDelegateGasPrice,
  selectGasPriceFieldError as selectDelegateGasPriceFieldError,
  DELEGATION_GAS_PRICE_RECOMMENDED,
} from '../../store/slices/delegateSlice';

interface GasPriceFieldProps {
  source?: 'send' | 'delegate';
  onEnterPress?: (event: React.KeyboardEvent) => void;
}

const GasPriceField: React.FC<GasPriceFieldProps> = ({
  source = 'send',
  onEnterPress,
}) => {
  const dispatch = useAppDispatch();

  const gasPrice = useAppSelector((state) =>
    source === 'delegate' ? state.delegate.gasPrice : state.send.gasPrice
  );
  const gasPriceFieldError = useAppSelector((state) =>
    source === 'delegate' ? selectDelegateGasPriceFieldError(state) : selectSendGasPriceFieldError(state)
  );
  const recommendedAmount = source === 'delegate' ? DELEGATION_GAS_PRICE_RECOMMENDED : GAS_PRICE_RECOMMENDED;

  const handleChange = (value: number) => {
    if (source === 'delegate') {
      dispatch(setDelegateGasPrice(value));
    } else {
      dispatch(setSendGasPrice(value));
    }
  };

  return (
    <FormControl fullWidth>
      <Button
        sx={{ alignSelf: 'flex-end', mb: 1 }}
        variant="contained"
        color="primary"
        size="small"
        onClick={() => handleChange(recommendedAmount)}
      >
        Set Recommended GasPrice
      </Button>
      <TextField
        label="Gas Price"
        fullWidth
        type="number"
        multiline={false}
        placeholder={recommendedAmount.toString()}
        value={gasPrice.toString()}
        slotProps={{
          input: {
            endAdornment: (
              <Typography variant="caption">
                SATOSHI/GAS
              </Typography>
            ),
          },
        }}
        onChange={(event) => handleChange(Number(event.target.value))}
        onKeyDown={(event) => onEnterPress?.(event)}
      />
      {gasPriceFieldError && (
        <Typography color="error" variant="caption" sx={{ textAlign: 'left', mt: 0.5 }}>
          {gasPriceFieldError}
        </Typography>
      )}
    </FormControl>
  );
};

export default GasPriceField;
