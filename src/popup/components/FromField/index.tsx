import React from 'react';
import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useAppSelector } from '../../store/hooks';

const FromField: React.FC = () => {
  const senderAddress = useAppSelector((state) => state.send.senderAddress);
  const walletAddress = useAppSelector((state) => state.session.walletInfo?.address);
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);

  return (
    <FormControl
      fullWidth
      sx={{marginBottom: '8px'}}
    >
      <InputLabel id="from-label">From</InputLabel>
      <Select
        labelId="from-label"
        label="From"
        inputProps={{ name: 'from', id: 'from' }}
        value={walletAddress || ''}
        readOnly
      >
        <MenuItem value={walletAddress || ''}>
          <Typography>{loggedInAccountName}</Typography>
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default FromField;
