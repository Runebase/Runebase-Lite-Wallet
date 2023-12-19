import React from 'react';
import { Select, MenuItem, FormControl, InputLabel, Typography, Box } from '@mui/material';
import { observer } from 'mobx-react';
import RRCToken from '../../../models/RRCToken';
import { TOKEN_IMAGES } from '../../../constants'; // Assuming you have a constant file for token images

const TokenField = observer(({ sendStore }: any) => (
  <FormControl fullWidth sx={{ marginBottom: '8px' }}>
    <InputLabel id="token-label">Token</InputLabel>
    <Select
      labelId="token-label"
      label="Token"
      value={sendStore.token ? sendStore.token.symbol : ''}
      onChange={(event) => sendStore.changeToken(event.target.value)}
    >
      {sendStore.tokens.map((token: RRCToken) => (
        <MenuItem key={token.symbol} value={token.symbol} sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: '24px' }}>
            {TOKEN_IMAGES[token.address] && (
              <img
                src={TOKEN_IMAGES[token.address]}
                alt={token.symbol}
                style={{ marginRight: '8px', height: '24px', width: '24px', objectFit: 'contain' }}
              />
            )}
            <Typography>{token.symbol}</Typography>
          </Box>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
));

export default TokenField;
