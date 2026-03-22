import React from 'react';
import { FormControl, TextField, Typography } from '@mui/material';
import { useAppSelector } from '../../store/hooks';

const DisabledSuperstakerAddressField: React.FC = () => {
  const selectedSuperstaker = useAppSelector((state) => state.delegate.selectedSuperstaker);

  return (
    <FormControl fullWidth>
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
        <Typography color="error" variant="caption" sx={{ textAlign: 'left', mt: 0.5 }}>
          No Superstaker selected
        </Typography>
      )}
    </FormControl>
  );
};

export default DisabledSuperstakerAddressField;
