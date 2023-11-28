import React from 'react';
import { observer } from 'mobx-react';
import { Button, FormControl, TextField, Typography } from '@mui/material';

const DelegationFeeField = observer(({ delegateStore, onEnterPress }: any) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
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
        onClick={() => delegateStore?.setDelegationFee(delegateStore?.delegationFeeRecommendedAmount)}
      >
        Set Recommended Fee
      </Button>
      <TextField
        fullWidth
        type="number"
        multiline={false}
        label="Fee"
        placeholder={delegateStore?.delegationFeeRecommendedAmount.toString()}
        value={delegateStore?.delegationFee}
        InputProps={{
          endAdornment: (
            <Typography style={{ fontSize: '0.8rem' }}>%</Typography>
          ),
        }}
        onChange={(event) => delegateStore?.setDelegationFee(Number(event.target.value))}
        onKeyDown={handleKeyDown}
      />
      {delegateStore?.delegationFeeFieldError && (
        <Typography color="error" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
          {delegateStore?.delegationFeeFieldError}
        </Typography>
      )}
      <Typography variant="body2" style={{ color: 'orange', fontSize: '0.9rem' }}>
        Caution: Ensure to establish the minimum fee as agreed with the super-staker.
        {' '}
        Setting a fee that is too low will result in the rejection of your delegated UTXOs.
      </Typography>
    </FormControl>
  );
});


export default DelegationFeeField;