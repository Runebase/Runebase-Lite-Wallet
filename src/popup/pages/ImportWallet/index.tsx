import React, { useEffect, useRef, useState } from 'react';
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Collapse,
  Stack,
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import BorderTextField from '../../components/BorderTextField';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  validateImportWalletName,
  importPrivateKey,
  importSeedPhrase,
  setImportType,
  setPrivateKey,
  setMnemonic,
  resetImport,
  setImportMnemonicPrKeyFailed,
  selectPrivateKeyError,
  selectPrivateKeyPageError,
  selectMnemonicPageError,
  selectWalletNameError,
} from '../../store/slices/importSlice';
import { IMPORT_TYPE } from '../../../constants';
import useStyles from './styles';
import SeedPhraseInput from '../../components/SeedphraseInput';

const ImportWallet: React.FC = () => {
  const dispatch = useAppDispatch();
  const { classes } = useStyles();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const _accountName = useAppSelector((state) => state.import.accountName);
  const importType = useAppSelector((state) => state.import.importType);
  const mnemonic = useAppSelector((state) => state.import.mnemonic);
  const privateKey = useAppSelector((state) => state.import.privateKey);
  const walletNameTaken = useAppSelector((state) => state.import.walletNameTaken);
  const walletNameError = useAppSelector(selectWalletNameError);
  const privateKeyError = useAppSelector(selectPrivateKeyError);
  const privateKeyPageError = useAppSelector(selectPrivateKeyPageError);
  const mnemonicPageError = useAppSelector(selectMnemonicPageError);

  // Only reset form on first visit, not when navigating back from an error
  // (which would wipe the user's inputs)
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const hasExistingData = _accountName || privateKey
        || mnemonic.some((word: string) => word.length > 0);
      if (!hasExistingData) {
        dispatch(resetImport());
      }
    }
  }, [dispatch]);

  const handleImport = () => {
    if (importType === IMPORT_TYPE.PRIVATE_KEY) {
      dispatch(importPrivateKey());
    }
    if (importType === IMPORT_TYPE.MNEMONIC) {
      dispatch(importSeedPhrase());
    }
  };

  return (
    <PageLayout hasBackButton title="Import Wallet">
      <div className={classes.contentContainer}>
        <Stack spacing={2} sx={{ flex: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="select-type-label">Select Type</InputLabel>
            <Select
              labelId="select-type-label"
              label="Select Type"
              value={importType}
              onChange={(event) => dispatch(setImportType(event.target.value))}
              aria-label="Select import type"
            >
              <MenuItem value={IMPORT_TYPE.MNEMONIC}>Seed Phrase</MenuItem>
              <MenuItem value={IMPORT_TYPE.PRIVATE_KEY}>Private Key</MenuItem>
            </Select>
          </FormControl>

          <Collapse in={importType === IMPORT_TYPE.PRIVATE_KEY}>
            <TextField
              label="Private Key"
              autoFocus
              required
              multiline
              rows={3}
              fullWidth
              type="text"
              placeholder="Enter your private key here"
              onChange={(e) => dispatch(setPrivateKey(e.target.value))}
              aria-label="Enter private key"
            />
          </Collapse>

          <Collapse in={importType === IMPORT_TYPE.MNEMONIC}>
            <SeedPhraseInput
              phrase={mnemonic}
              setPhrase={(phrase: string[]) => dispatch(setMnemonic(phrase))}
              error={errorMessage}
              setError={setErrorMessage}
              disabled={false}
            />
          </Collapse>

          {!!privateKey && privateKeyError && (
            <Alert severity="error">{privateKeyError}</Alert>
          )}

          <BorderTextField
            label="Wallet Name"
            placeholder="Wallet name"
            error={walletNameTaken}
            errorText={walletNameError}
            onChange={(e: any) => dispatch(validateImportWalletName(e.target.value))}
            onEnterPress={handleImport}
          />
        </Stack>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={handleImport}
          disabled={
            importType === IMPORT_TYPE.PRIVATE_KEY
              ? privateKeyPageError
              : importType === IMPORT_TYPE.MNEMONIC
                ? mnemonicPageError
                : false
          }
          sx={{ mt: 2 }}
        >
          Import
        </Button>
      </div>
      <ErrorDialog />
    </PageLayout>
  );
};

const ErrorDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const importMnemonicPrKeyFailed = useAppSelector((state) => state.import.importMnemonicPrKeyFailed);
  const importType = useAppSelector((state) => state.import.importType);

  return (
    <Dialog
      open={importMnemonicPrKeyFailed}
      onClose={() => dispatch(setImportMnemonicPrKeyFailed(false))}
    >
      <DialogTitle>{`Invalid ${importType}`}</DialogTitle>
      <DialogContent>
        <DialogContentText>This wallet has already been imported.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(setImportMnemonicPrKeyFailed(false))} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportWallet;
