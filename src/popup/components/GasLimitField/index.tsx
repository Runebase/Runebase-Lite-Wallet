import React from 'react';
import { Button, FormControl, TextField, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setGasLimit as setSendGasLimit,
  selectGasLimitFieldError as selectSendGasLimitFieldError,
  GAS_LIMIT_RECOMMENDED,
} from '../../store/slices/sendSlice';
import {
  setGasLimit as setDelegateGasLimit,
  selectGasLimitFieldError as selectDelegateGasLimitFieldError,
  DELEGATION_GAS_LIMIT_RECOMMENDED,
} from '../../store/slices/delegateSlice';

interface GasLimitFieldProps {
  source?: 'send' | 'delegate';
  onEnterPress?: (event: React.KeyboardEvent) => void;
}

const GasLimitField: React.FC<GasLimitFieldProps> = ({
  source = 'send',
  onEnterPress,
}) => {
  const dispatch = useAppDispatch();

  const gasLimit = useAppSelector((state) =>
    source === 'delegate' ? state.delegate.gasLimit : state.send.gasLimit
  );
  const gasLimitFieldError = useAppSelector((state) =>
    source === 'delegate' ? selectDelegateGasLimitFieldError(state) : selectSendGasLimitFieldError(state)
  );
  const recommendedAmount = source === 'delegate' ? DELEGATION_GAS_LIMIT_RECOMMENDED : GAS_LIMIT_RECOMMENDED;

  const handleChange = (value: number) => {
    if (source === 'delegate') {
      dispatch(setDelegateGasLimit(value));
    } else {
      dispatch(setSendGasLimit(value));
    }
  };

  return (
    <FormControl fullWidth>
      <Button
        sx={{ alignSelf: 'flex-end', mb: 1 }}
        color="primary"
        variant="contained"
        size="small"
        onClick={() => handleChange(recommendedAmount)}
      >
        Set Recommended GasLimit
      </Button>
      <TextField
        fullWidth
        type="number"
        multiline={false}
        label="Gas Limit"
        placeholder={recommendedAmount.toString()}
        value={gasLimit}
        InputProps={{
          endAdornment: (
            <Typography variant="caption">GAS</Typography>
          ),
        }}
        onChange={(event) => handleChange(Number(event.target.value))}
        onKeyDown={(event) => onEnterPress?.(event)}
      />
      {gasLimitFieldError && (
        <Typography color="error" variant="caption" sx={{ textAlign: 'left', mt: 0.5 }}>
          {gasLimitFieldError}
        </Typography>
      )}
    </FormControl>
  );
};

export default GasLimitField;
