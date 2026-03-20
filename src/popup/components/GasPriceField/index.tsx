import React from 'react';
import { Button, TextField, Typography } from '@mui/material';
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
    <div style={{ margin: '0 0 8px 0', display: 'flex', flexDirection: 'column' }}>
      <Button
        style={{ alignSelf: 'flex-end', margin: '0 0 8px 0' }}
        variant="contained"
        color="primary"
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
        InputProps={{
          endAdornment: (
            <Typography style={{ fontSize: '0.8rem' }}>
              SATOSHI/GAS
            </Typography>
          ),
        }}
        onChange={(event) => handleChange(Number(event.target.value))}
        onKeyDown={(event) => onEnterPress?.(event)}
      />
      {gasPriceFieldError && (
        <Typography color="error" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
          {gasPriceFieldError}
        </Typography>
      )}
    </div>
  );
};

export default GasPriceField;
