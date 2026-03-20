import React from 'react';
import { Button, FormControl, TextField, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setDelegationFee,
  selectDelegationFeeFieldError,
  DELEGATION_FEE_RECOMMENDED,
} from '../../store/slices/delegateSlice';

interface DelegationFeeFieldProps {
  onEnterPress?: () => void;
}

const DelegationFeeField: React.FC<DelegationFeeFieldProps> = ({ onEnterPress }) => {
  const dispatch = useAppDispatch();
  const delegationFee = useAppSelector((state) => state.delegate.delegationFee);
  const delegationFeeFieldError = useAppSelector(selectDelegationFeeFieldError);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onEnterPress) {
      onEnterPress();
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
        onClick={() => dispatch(setDelegationFee(DELEGATION_FEE_RECOMMENDED))}
      >
        Set Recommended Fee
      </Button>
      <TextField
        fullWidth
        type="number"
        multiline={false}
        label="Fee"
        placeholder={DELEGATION_FEE_RECOMMENDED.toString()}
        value={delegationFee}
        InputProps={{
          endAdornment: (
            <Typography style={{ fontSize: '0.8rem' }}>%</Typography>
          ),
        }}
        onChange={(event) => dispatch(setDelegationFee(Number(event.target.value)))}
        onKeyDown={handleKeyDown}
      />
      {delegationFeeFieldError && (
        <Typography color="error" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
          {delegationFeeFieldError}
        </Typography>
      )}
      <Typography variant="body2" style={{ color: 'orange', fontSize: '0.9rem' }}>
        Caution: Ensure to establish the minimum fee as agreed with the super-staker.
        {' '}
        Setting a fee that is too low will result in the rejection of your delegated UTXOs.
      </Typography>
    </FormControl>
  );
};

export default DelegationFeeField;
