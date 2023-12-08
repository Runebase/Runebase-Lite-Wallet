import React, { useEffect } from 'react';
import { ArrowDropDown } from '@mui/icons-material';
import { FormControl, TextField, Typography, Button } from '@mui/material';
import { observer } from 'mobx-react';
import { isCordova } from '../../abstraction';

interface ToFieldProps {
  sendStore: any;
  sessionStore: any;
  onEnterPress: () => void;
  scanning: boolean;
  startScan: () => void;
  stopScan: () => void;
}

const ToField: React.FC<ToFieldProps> = observer(({
  sendStore,
  sessionStore,
  onEnterPress,
  scanning,
  startScan,
  stopScan
}) => {
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
              placeholder={sessionStore?.walletInfo?.address || ''}
              value={sendStore.receiverAddress || ''}
              InputProps={{
                endAdornment: <ArrowDropDown />,
                readOnly: scanning,
              }}
              onChange={(event) => sendStore.setReceiverAddress(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            {!!sendStore.receiverAddress && sendStore.receiverFieldError && (
              <Typography color="error" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
                {sendStore.receiverFieldError}
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
});

export default ToField;
