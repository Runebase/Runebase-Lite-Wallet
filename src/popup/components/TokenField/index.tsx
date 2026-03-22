import React from 'react';
import { Select, MenuItem, FormControl, InputLabel, Typography, Box } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { changeToken } from '../../store/slices/sendSlice';
import RRCToken from '../../../models/RRCToken';
import { TOKEN_IMAGES } from '../../../constants';

const TokenField: React.FC = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.send.token);
  const tokens = useAppSelector((state) => state.send.tokens);

  return (
    <FormControl fullWidth>
      <InputLabel id="token-label">Token</InputLabel>
      <Select
        labelId="token-label"
        label="Token"
        value={token ? token.symbol : ''}
        onChange={(event) => dispatch(changeToken(event.target.value as string))}
      >
        {tokens.map((t: RRCToken) => (
          <MenuItem key={t.symbol} value={t.symbol}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: 24 }}>
              {TOKEN_IMAGES[t.address] && (
                <Box
                  component="img"
                  src={TOKEN_IMAGES[t.address]}
                  alt={t.symbol}
                  sx={{ mr: 1, height: 24, width: 24, objectFit: 'contain' }}
                />
              )}
              <Typography>{t.symbol}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TokenField;
