import React, { useState, useEffect } from 'react';
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
import { isNativeMobile } from '../../abstraction';

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

  const startScan = async () => {
    setScanError(null);
    if (!isNativeMobile()) return;

    try {
      const { BarcodeScanner, BarcodeFormat } = await import('@capacitor-mlkit/barcode-scanning');

      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted' && camera !== 'limited') {
        setScanError('Camera access denied. Please enable camera access in your device settings.');
        return;
      }

      setScanning(true);
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      if (barcodes.length > 0 && barcodes[0].rawValue) {
        const address = barcodes[0].rawValue.replace(/^runebase:/i, '');
        dispatch(setReceiverAddress(address));
      }
    } catch (err: any) {
      if (err?.message !== 'scan canceled') {
        setScanError('Failed to scan QR code. Please try again.');
      }
    } finally {
      setScanning(false);
    }
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
