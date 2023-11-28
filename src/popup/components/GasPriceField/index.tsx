import React from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { observer } from 'mobx-react';

const GasPriceField = observer(({ sendStore, onEnterPress }: any) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onEnterPress();
    }
  };

  return (
    <div style={{ margin: '0 0 8px 0', display: 'flex', flexDirection: 'column' }}>
      <Button
        style={{ alignSelf: 'flex-end', margin: '0 0 8px 0' }}
        variant="contained"
        color="primary"
        onClick={() => (sendStore.gasPrice = sendStore.gasPriceRecommendedAmount)}
      >
        Set Recommended GasPrice
      </Button>
      <TextField
        label="Gas Price"
        fullWidth
        type="number"
        multiline={false}
        placeholder={sendStore.gasPriceRecommendedAmount.toString()}
        value={sendStore.gasPrice.toString()}
        InputProps={{
          endAdornment: (
            <Typography style={{ fontSize: '0.8rem' }}>
              SATOSHI/GAS
            </Typography>
          ),
        }}
        onChange={(event) => sendStore.setGasPrice(Number(event.target.value))}
        onKeyDown={handleKeyDown}
      />
      {sendStore.gasPriceFieldError && (
        <Typography color="error" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
          {sendStore.gasPriceFieldError}
        </Typography>
      )}
    </div>
  );
});

export default GasPriceField;
