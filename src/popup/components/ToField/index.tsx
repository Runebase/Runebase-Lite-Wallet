import React, { useEffect, useState, useCallback } from 'react';
import { ArrowDropDown } from '@mui/icons-material';
import { FormControl, TextField, Typography, Button, Autocomplete } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setReceiverAddress, selectReceiverFieldError } from '../../store/slices/sendSlice';
import { isNativeMobile } from '../../abstraction';
import txCacheDB, { type RecentAddress } from '../../../services/db/TransactionCache';

interface ToFieldProps {
  onEnterPress: () => void;
  scanning: boolean;
  startScan: () => void;
}

const ToField: React.FC<ToFieldProps> = ({
  onEnterPress,
  scanning,
  startScan,
}) => {
  const dispatch = useAppDispatch();
  const receiverAddress = useAppSelector((state) => state.send.receiverAddress);
  const receiverFieldError = useAppSelector(selectReceiverFieldError);
  const walletAddress = useAppSelector((state) => state.session.walletInfo?.address);
  const [recentAddresses, setRecentAddresses] = useState<string[]>([]);

  useEffect(() => {
    if (!walletAddress) return;
    txCacheDB.getRecentAddresses(walletAddress).then((entries: RecentAddress[]) => {
      setRecentAddresses(entries.map((e) => e.address));
    }).catch(() => {});
  }, [walletAddress]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onEnterPress();
    }
  }, [onEnterPress]);

  return (
    <>
      <FormControl fullWidth>
        <Autocomplete
          freeSolo
          options={recentAddresses}
          value={receiverAddress || ''}
          onInputChange={(_event, newValue) => {
            dispatch(setReceiverAddress((newValue || '').replace(/^runebase:/i, '')));
          }}
          popupIcon={<ArrowDropDown />}
          forcePopupIcon
          renderInput={(params) => (
            <TextField
              {...params}
              label="To"
              placeholder={walletAddress || ''}
              onKeyDown={handleKeyDown}
            />
          )}
          slotProps={{
            listbox: {
              sx: {
                '& .MuiAutocomplete-option': {
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  overflowWrap: 'anywhere',
                },
              },
            },
          }}
        />
        {!!receiverAddress && receiverFieldError && (
          <Typography color="error" variant="caption" sx={{ textAlign: 'left', mt: 0.5 }}>
            {receiverFieldError}
          </Typography>
        )}
      </FormControl>
      {isNativeMobile() && !scanning && (
        <Button
          variant="contained"
          color="primary"
          onClick={startScan}
          fullWidth
          sx={{ mb: 1 }}
        >
          Scan QR
        </Button>
      )}
    </>
  );
};

export default ToField;
