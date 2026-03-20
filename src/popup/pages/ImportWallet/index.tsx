import React, { useEffect, useState } from 'react';
import {
  Typography,
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
} from '@mui/material';
import NavBar from '../../components/NavBar';
import BorderTextField from '../../components/BorderTextField';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  validateImportWalletName,
  importPrivateKey,
  importSeedPhrase,
  cancelImport,
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

  const accountName = useAppSelector((state) => state.import.accountName);
  const importType = useAppSelector((state) => state.import.importType);
  const mnemonic = useAppSelector((state) => state.import.mnemonic);
  const privateKey = useAppSelector((state) => state.import.privateKey);
  const walletNameTaken = useAppSelector((state) => state.import.walletNameTaken);
  const importMnemonicPrKeyFailed = useAppSelector((state) => state.import.importMnemonicPrKeyFailed);
  const walletNameError = useAppSelector(selectWalletNameError);
  const privateKeyError = useAppSelector(selectPrivateKeyError);
  const privateKeyPageError = useAppSelector(selectPrivateKeyPageError);
  const mnemonicPageError = useAppSelector(selectMnemonicPageError);

  useEffect(() => { dispatch(resetImport()); }, [dispatch]);

  return (
    <div className={classes.root}>
      <NavBar
        // hasNetworkSelector
        hasBackButton
        title="Import Wallet"
      />
      <div className={classes.contentContainer}>
        <div className={classes.inputContainer}>
          <div className={classes.fieldContainer}>
            <TypeField classes={classes} />
            {importType === IMPORT_TYPE.PRIVATE_KEY && (
              <TextField
                label="Private Key"
                autoFocus
                required
                multiline
                rows={2}
                type="text"
                placeholder={`Enter your ${importType} here to import your wallet.`}
                onChange={(e) => dispatch(setPrivateKey(e.target.value))}
                InputProps={{
                  classes: { input: classes.mnemonicPrKeyFieldInput },
                }}
              />
            )
            }
            {importType === IMPORT_TYPE.MNEMONIC && (
              <SeedPhraseInput
                phrase={mnemonic}
                setPhrase={(phrase: string[]) => dispatch(setMnemonic(phrase))}
                error={errorMessage}
                setError={setErrorMessage}
                disabled={false}
              />
            )
            }
            {!!privateKey && privateKeyError && (
              <Typography className={classes.errorText}>
                {privateKeyError}
              </Typography>
            )}
            <BorderTextField
              label="Wallet Name"
              placeholder="Wallet name"
              error={walletNameTaken}
              errorText={walletNameError}
              onChange={(e: any) => dispatch(validateImportWalletName(e.target.value))}
              onEnterPress={() => {
                if (importType === IMPORT_TYPE.PRIVATE_KEY) {
                  dispatch(importPrivateKey());
                }
                if (importType === IMPORT_TYPE.MNEMONIC) {
                  dispatch(importSeedPhrase());
                }
              }}
            />
          </div>
        </div>
        <div>
          <Button
            className={classes.importButton}
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => {
              if (importType === IMPORT_TYPE.PRIVATE_KEY) {
                dispatch(importPrivateKey());
              }
              if (importType === IMPORT_TYPE.MNEMONIC) {
                dispatch(importSeedPhrase());
              }
            }}
            disabled={
              importType === IMPORT_TYPE.PRIVATE_KEY
                ? privateKeyPageError
                : importType === IMPORT_TYPE.MNEMONIC
                  ? mnemonicPageError
                  : false
            }
          >
            Import
          </Button>
        </div>
      </div>
      <ErrorDialog />
    </div>
  );
};

const TypeField: React.FC<{ classes: any }> = ({ classes }) => {
  const dispatch = useAppDispatch();
  const importType = useAppSelector((state) => state.import.importType);

  return (
    <div className={classes.fieldContainer}>
      <FormControl fullWidth>
        <InputLabel id="select-type-label">Select Type</InputLabel>
        <Select
          labelId="select-type-label"
          label="Select Type"
          className={classes.typeSelect}
          value={importType}
          onChange={(event) => dispatch(setImportType(event.target.value))}
        >
          <MenuItem value={IMPORT_TYPE.MNEMONIC}>
            <Typography className={classes.menuItemTypography}>Seed Phrase</Typography>
          </MenuItem>
          <MenuItem value={IMPORT_TYPE.PRIVATE_KEY}>
            <Typography className={classes.menuItemTypography}>Private Key</Typography>
          </MenuItem>
        </Select>
      </FormControl>
    </div>
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
