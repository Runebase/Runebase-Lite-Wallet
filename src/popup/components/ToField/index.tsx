import React, { useEffect } from 'react';
import { ArrowDropDown } from '@mui/icons-material';
import { FormControl, TextField, Typography, Button } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setReceiverAddress, selectReceiverFieldError } from '../../store/slices/sendSlice';
import { isCordova } from '../../abstraction';

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onEnterPress();
    }
  };

  useEffect(() => {
    if (scanning) {
      window.QRScanner.show();
      return () => {
        stopScan();
      };
    }
  }, [scanning, stopScan]);

  return (
    <>
      {
        !scanning && (
          <FormControl fullWidth sx={{ marginBottom: '8px', position: 'relative' }}>
            <TextField
              fullWidth
              label="To"
              type="text"
              multiline={false}
              placeholder={walletAddress || ''}
              value={receiverAddress || ''}
              InputProps={{
                endAdornment: <ArrowDropDown />,
                readOnly: scanning,
              }}
              onChange={(event) => dispatch(setReceiverAddress(event.target.value.replace(/^runebase:/i, '')))}
              onKeyDown={handleKeyDown}
            />
            {!!receiverAddress && receiverFieldError && (
              <Typography color="error" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
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
            sx={{
              marginBottom: '10px'
            }}
          >
            {scanning ? 'Scanning...' : 'Scan QR'}
          </Button>

          {scanning && (
            <Button
              variant="contained"
              color="secondary"
              style={{ position: 'fixed', bottom: 0, left: 0, width: '100%' }}
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
