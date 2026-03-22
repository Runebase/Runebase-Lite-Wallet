import React from 'react';
import { Typography, Button, Stack, Box, Paper, useTheme, useMediaQuery } from '@mui/material';
import { ContentCopy, Share } from '@mui/icons-material';
import { QRCodeCanvas as QRCode } from 'qrcode.react';

import PageLayout from '../../components/PageLayout';
import { useAppSelector } from '../../store/hooks';
import { useSnackbar } from '../../components/SnackbarProvider';

const Receive: React.FC = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const walletInfo = useAppSelector((state) => state.session.walletInfo);

  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumUp = useMediaQuery(theme.breakpoints.up('md'));
  const qrSize = isSmall ? 160 : isMediumUp ? 240 : 200;

  if (!loggedInAccountName || !walletInfo) {
    return null;
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(String(walletInfo?.address));
    showSnackbar('Address copied to clipboard');
  };

  const shareAddress = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Runebase Address',
          text: walletInfo.address,
        });
      } catch {
        // User cancelled or share failed silently
      }
    } else {
      copyToClipboard();
    }
  };

  const canShare = typeof navigator.share === 'function';

  return (
    <PageLayout title="Receive">
      <Stack
        alignItems="center"
        spacing={2}
        sx={{ flex: 1 }}
      >
        <Typography variant="h6" fontWeight="bold">
          {loggedInAccountName}
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            width: '100%',
            maxWidth: 360,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              p: 2.5,
              bgcolor: '#FAFAFA',
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'divider',
            }}
          >
            <QRCode
              value={walletInfo!.address}
              size={qrSize}
              style={{ width: '100%', maxWidth: qrSize, height: 'auto' }}
            />
          </Box>
          <Box
            component="code"
            onClick={copyToClipboard}
            sx={{
              wordBreak: 'break-all',
              textAlign: 'center',
              fontFamily: 'Roboto Mono, monospace',
              fontSize: 'body2.fontSize',
              px: 1,
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
            }}
          >
            {walletInfo.address}
          </Box>
        </Paper>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={copyToClipboard}
            startIcon={<ContentCopy />}
            aria-label="Copy wallet address to clipboard"
          >
            Copy
          </Button>
          {canShare && (
            <Button
              variant="outlined"
              color="primary"
              onClick={shareAddress}
              startIcon={<Share />}
              aria-label="Share wallet address"
            >
              Share
            </Button>
          )}
        </Stack>
      </Stack>
    </PageLayout>
  );
};

export default Receive;
