import React from 'react';
import { observer } from 'mobx-react';
import { Button, FormControl, TextField, Typography } from '@mui/material';

const GasLimitField = observer(({ sendStore, onEnterPress }: any) => {
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
        onClick={() => sendStore.setGasLimit(sendStore.gasLimitRecommendedAmount)}
      >
        Set Recommended GasLimit
      </Button>
      <TextField
        fullWidth
        type="number"
        multiline={false}
        label="Gas Limit"
        placeholder={sendStore.gasLimitRecommendedAmount.toString()}
        value={sendStore.gasLimit}
        InputProps={{
          endAdornment: (
            <Typography style={{ fontSize: '0.8rem' }}>GAS</Typography>
          ),
        }}
        onChange={(event) => sendStore.setGasLimit(Number(event.target.value))}
        onKeyDown={handleKeyDown}
      />
      {sendStore.gasLimitFieldError && (
        <Typography color="error" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
          {sendStore.gasLimitFieldError}
        </Typography>
      )}
    </FormControl>
  );
});

export default GasLimitField;
