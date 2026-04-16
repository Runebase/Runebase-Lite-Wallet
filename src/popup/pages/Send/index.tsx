import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Box, CircularProgress, Alert, Paper, Stack, Skeleton, Typography } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { handleEnterPress } from '../../../utils';
import PageLayout from '../../components/PageLayout';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  initSend,
  setReceiverAddress,
  routeToSendConfirm,
  selectButtonDisabled,
} from '../../store/slices/sendSlice';
import GasLimitField from '../../components/GasLimitField';
import GasPriceField from '../../components/GasPriceField';
import AmountField from '../../components/AmountField';
import FromField from '../../components/FromField';
import ToField from '../../components/ToField';
import TokenField from '../../components/TokenField';
import TransactionSpeedField from '../../components/TransactionSpeedField';

// ─── Loading Skeleton ────────────────────────────────────────

const SendSkeleton: React.FC = () => (
  <Stack spacing={2}>
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="rounded" height={44} />
      <Skeleton variant="text" width="20%" height={20} sx={{ mt: 2, mb: 1 }} />
      <Skeleton variant="rounded" height={44} />
    </Paper>
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Skeleton variant="text" width="25%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="rounded" height={44} />
      <Skeleton variant="text" width="30%" height={20} sx={{ mt: 2, mb: 1 }} />
      <Skeleton variant="rounded" height={44} />
    </Paper>
    <Skeleton variant="rounded" height={48} />
  </Stack>
);

const Send: React.FC = () => {
  const dispatch = useAppDispatch();
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const token = useAppSelector((state) => state.send.token);
  const isInitializing = useAppSelector((state) => state.send.isInitializing);
  const buttonDisabled = useAppSelector(selectButtonDisabled);

  useEffect(() => {
    dispatch(initSend());
  }, [dispatch]);

  const startScan = () => {
    setScanError(null);
    window.QRScanner?.prepare((err: any, status: any) => {
      if (err) {
        setScanError('Failed to access camera. Please try again.');
      } else if (status.authorized) {
        window.QRScanner?.scan(displayContents);
        window.QRScanner?.show();
        document.documentElement.classList.add('qr-scanning');
        setScanning(true);
      } else if (status.denied) {
        setScanError('Camera access denied. Please enable camera access in your device settings.');
      } else {
        setScanError('Camera access was not granted.');
      }
    });
  };

  const displayContents = (err: any, text: string) => {
    if (err) {
      setScanError('Failed to scan QR code. Please try again.');
    } else {
      const address = text.replace(/^runebase:/i, '');
      dispatch(setReceiverAddress(address));
    }
    stopScan();
  };

  const stopScan = () => {
    document.documentElement.classList.remove('qr-scanning');
    window.QRScanner?.destroy(() => {
      setScanning(false);
    });
  };

  const onEnterPress = (event?: React.KeyboardEvent) => {
    if (!event) return;
    handleEnterPress(event, () => {
      if (!buttonDisabled) {
        routeToSendConfirm();
      }
    });
  };

  if (!loggedInAccountName) {
    return (
      <PageLayout title="Send">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 4 }}>
          <CircularProgress aria-label="Loading send form" />
        </Box>
      </PageLayout>
    );
  }

  if (scanning) {
    return createPortal(
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Crosshair / scan area indicator */}
        <div
          style={{
            width: 220,
            height: 220,
            border: '2px solid rgba(255,255,255,0.7)',
            borderRadius: 8,
            marginBottom: 32,
          }}
        />

        <p style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)', marginBottom: 24, fontFamily: 'sans-serif' }}>
          Point camera at QR code
        </p>

        <button
          onClick={stopScan}
          style={{
            minWidth: 160,
            padding: '12px 24px',
            fontSize: 16,
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: 24,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>,
      document.body,
    );
  }

  return (
    <PageLayout title="Send">
      {isInitializing ? (
        <SendSkeleton />
      ) : (
        <Stack spacing={2} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {scanError && (
            <Alert severity="error" onClose={() => setScanError(null)}>
              {scanError}
            </Alert>
          )}

          {/* Addresses section */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Addresses
            </Typography>
            <Stack spacing={1}>
              <FromField />
              <ToField
                onEnterPress={onEnterPress}
                scanning={scanning}
                startScan={startScan}
              />
            </Stack>
          </Paper>

          {/* Amount & fees section */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Amount & Fees
            </Typography>
            <Stack spacing={1}>
              <TokenField />
              <AmountField onEnterPress={onEnterPress} />
              {token && token.symbol === 'RUNES' ? (
                <TransactionSpeedField />
              ) : (
                <>
                  <GasLimitField onEnterPress={onEnterPress} />
                  <GasPriceField onEnterPress={onEnterPress} />
                </>
              )}
            </Stack>
          </Paper>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={buttonDisabled}
            onClick={routeToSendConfirm}
            endIcon={<SendIcon />}
            sx={{ mt: 'auto' }}
          >
            Send
          </Button>
        </Stack>
      )}
    </PageLayout>
  );
};

export default Send;
