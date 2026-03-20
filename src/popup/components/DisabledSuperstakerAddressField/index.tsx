import React from 'react';
import { FormControl, TextField, Typography } from '@mui/material';
import { useAppSelector } from '../../store/hooks';

const DisabledSuperstakerAddressField: React.FC = () => {
  const selectedSuperstaker = useAppSelector((state) => state.delegate.selectedSuperstaker);

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
        placeholder={selectedSuperstaker?.address || ''}
        value={selectedSuperstaker?.address || ''}
      />
      {selectedSuperstaker && !selectedSuperstaker.address && (
        <Typography color="error" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
          No Superstaker selected
        </Typography>
      )}
    </FormControl>
  );
};

export default DisabledSuperstakerAddressField;
