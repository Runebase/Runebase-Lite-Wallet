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
    <FormControl
      fullWidth
      sx={{marginBottom: '8px'}}
    >
      <Button
        style={{ alignSelf: 'flex-end', margin: '0 0 8px 0' }}
        color="primary"
        variant="contained"
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
            <Typography style={{ fontSize: '0.8rem' }}>GAS</Typography>
          ),
        }}
        onChange={(event) => handleChange(Number(event.target.value))}
        onKeyDown={(event) => onEnterPress?.(event)}
      />
      {gasLimitFieldError && (
        <Typography color="error" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
          {gasLimitFieldError}
        </Typography>
      )}
    </FormControl>
  );
};

export default GasLimitField;
