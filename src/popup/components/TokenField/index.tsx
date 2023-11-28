import React from 'react';
import { Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import RRCToken from '../../../models/RRCToken';

const TokenField = observer(({ sendStore }: any) => (
  <FormControl
    fullWidth
    sx={{marginBottom: '8px'}}
  >
    <InputLabel id="token-label">Token</InputLabel>
    <Select
      labelId="token-label"
      label="Token"
      value={sendStore.token ? sendStore.token.symbol : ''}
      onChange={(event) => sendStore.changeToken(event.target.value)}
    >
      {sendStore.tokens.map((token: RRCToken) => (
        <MenuItem key={token.symbol} value={token.symbol}>
          <Typography>{token.symbol}</Typography>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
));

export default TokenField;
