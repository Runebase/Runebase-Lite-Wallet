import React, { useEffect, useState, useCallback } from 'react';
import { ArrowDropDown } from '@mui/icons-material';
import { FormControl, TextField, Typography, Button, Autocomplete } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setReceiverAddress, selectReceiverFieldError } from '../../store/slices/sendSlice';
import { isCordova } from '../../abstraction';
import txCacheDB, { type RecentAddress } from '../../../services/db/TransactionCache';

interface ToFieldProps {
  onEnterPress: () => void;
  scanning: boolean;
  startScan: () => void;
  stopScan: () => void;
}

const ToField: React.FC<ToFieldProps> = ({
  onEnterPress,
  scanning,
  startScan,
  stopScan,
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

  useEffect(() => {
    if (scanning) {
      window.QRScanner?.show();
      return () => {
        stopScan();
      };
    }
    return undefined;
  }, [scanning, stopScan]);

  return (
    <>
      {
        !scanning && (
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
        )
      }
      {isCordova() && (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={startScan}
            disabled={scanning}
            fullWidth
            sx={{ mb: 1 }}
          >
            {scanning ? 'Scanning...' : 'Scan QR'}
          </Button>

          {scanning && (
            <Button
              variant="contained"
              color="secondary"
              sx={{ position: 'fixed', bottom: 0, left: 0, width: '100%' }}
              onClick={stopScan}
            >
              Stop Scan
            </Button>
          )}
        </>
      )}
    </>
  );
};

export default ToField;
