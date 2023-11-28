import React from 'react';
import { FormControl, TextField, Typography } from '@mui/material';
import { observer } from 'mobx-react';

const DisabledSuperstakerAddressField = observer(({ delegateStore }: any) => {
  return (
    <FormControl
      fullWidth
      sx={{marginBottom: '8px'}}
    >
      <TextField
        disabled
        fullWidth
        label="SuperStaker"
        type="text"
        multiline={false}
        placeholder={delegateStore.selectedSuperstaker.address || ''}
        value={delegateStore.selectedSuperstaker.address || ''}
      />
      {delegateStore.selectedSuperstaker && !delegateStore.selectedSuperstaker.address && (
        <Typography color="error" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
          No Superstaker selected
        </Typography>
      )}
    </FormControl>
  );
});

export default DisabledSuperstakerAddressField;