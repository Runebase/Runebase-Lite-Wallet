import React from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { observer } from 'mobx-react';

const AmountField = observer(({ sendStore, onEnterPress }: any) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onEnterPress();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', margin: '0 0 8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
        <Typography style={{ fontSize: '0.8rem' }}>available: {sendStore.maxAmount}</Typography>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            sendStore.setAmount(sendStore.maxAmount);
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
        value={sendStore.amount}
        InputProps={{
          endAdornment: (
            <Typography>
              {sendStore.token && sendStore.token.symbol}
            </Typography>
          ),
        }}
        onChange={(event) => {
          const newValue = event.target.value;
          newValue === '' ? (sendStore.setAmount('')) : (sendStore.setAmount(Number(newValue)));
        }}
        onKeyDown={handleKeyDown}
      />
      {sendStore.amount !== '' && sendStore.amountFieldError && (
        <Typography color="error" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
          {sendStore.amountFieldError}
        </Typography>
      )}
    </div>
  );
});

export default AmountField;
