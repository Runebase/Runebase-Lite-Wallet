import React from 'react';
import { ArrowDropDown } from '@mui/icons-material';
import { FormControl, TextField, Typography } from '@mui/material';
import { observer } from 'mobx-react';

const ToField = observer(({ sendStore, sessionStore, onEnterPress }: any) => {
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
      <TextField
        fullWidth
        label="To"
        type="text"
        multiline={false}
        placeholder={sessionStore?.walletInfo?.address || ''}
        value={sendStore.receiverAddress || ''}
        InputProps={{ endAdornment: <ArrowDropDown /> }}
        onChange={(event) => sendStore.setReceiverAddress(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {!!sendStore.receiverAddress && sendStore.receiverFieldError && (
        <Typography color="error" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
          {sendStore.receiverFieldError}
        </Typography>
      )}
    </FormControl>
  );
});

export default ToField;