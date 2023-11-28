import React from 'react';
import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { observer } from 'mobx-react';

const FromField = observer(({ sendStore, sessionStore }: any) => (
  <FormControl
    fullWidth
    sx={{marginBottom: '8px'}}
  >
    <InputLabel id="from-label">From</InputLabel>
    <Select
      labelId="from-label"
      label="From"
      inputProps={{ name: 'from', id: 'from' }}
      value={sessionStore.walletInfo.address}
      onChange={(event) => sendStore.setSenderAddress(String(event.target.value))}
    >
      <MenuItem value={sessionStore.walletInfo.address}>
        <Typography>{sessionStore.loggedInAccountName}</Typography>
      </MenuItem>
    </Select>
  </FormControl>
));

export default FromField;