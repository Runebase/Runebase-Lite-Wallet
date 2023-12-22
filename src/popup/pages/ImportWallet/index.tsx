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
import { inject, observer } from 'mobx-react';
import NavBar from '../../components/NavBar';
import BorderTextField from '../../components/BorderTextField';
import AppStore from '../../stores/AppStore';
import { IMPORT_TYPE } from '../../../constants';
import useStyles from './styles';
import SeedPhraseInput from '../../components/SeedphraseInput';

interface IProps {
  store: AppStore;
}

const ImportWallet: React.FC<IProps> = ({ store }) => {
  const { importStore } = store;
  const classes = useStyles();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => { importStore.reset(); }, []);

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
            <TypeField classes={classes} store={store} />
            {importStore.importType === IMPORT_TYPE.PRIVATE_KEY && (
              <TextField
                label="Private Key"
                autoFocus
                required
                multiline
                rows={2}
                type="text"
                placeholder={`Enter your ${importStore.importType} here to import your wallet.`}
                onChange={(e) => importStore.setPrivateKey(e.target.value)}
                InputProps={{
                  classes: { input: classes.mnemonicPrKeyFieldInput },
                }}
              />
            )
            }
            {importStore.importType === IMPORT_TYPE.MNEMONIC && (
              <SeedPhraseInput
                phrase={importStore.mnemonic}
                setPhrase={importStore.setMnemonic}
                error={errorMessage}
                setError={setErrorMessage}
                disabled={false}
              />
            )
            }
            {!!importStore.privateKey && importStore.privateKeyError && (
              <Typography className={classes.errorText}>
                {importStore.privateKeyError}
              </Typography>
            )}
            <BorderTextField
              label="Wallet Name"
              placeholder="Wallet name"
              error={importStore.walletNameTaken}
              errorText={importStore.walletNameError}
              onChange={(e: any) => importStore.setAccountName(e.target.value)}
              onEnterPress={() => {
                if (importStore.importType === IMPORT_TYPE.PRIVATE_KEY) {
                  importStore.importPrivateKey();
                }
                if (importStore.importType === IMPORT_TYPE.MNEMONIC) {
                  importStore.importSeedPhrase();
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
              if (importStore.importType === IMPORT_TYPE.PRIVATE_KEY) {
                importStore.importPrivateKey();
              }
              if (importStore.importType === IMPORT_TYPE.MNEMONIC) {
                importStore.importSeedPhrase();
              }
            }}
            disabled={
              importStore.importType === IMPORT_TYPE.PRIVATE_KEY
                ? importStore.privateKeyPageError
                : importStore.importType === IMPORT_TYPE.MNEMONIC
                  ? importStore.mnemonicPageError
                  : false // Return default value or false if needed
            }
          >
            Import
          </Button>
        </div>
      </div>
      <ErrorDialog store={store} />
    </div>
  );
};

const TypeField: React.FC<any> = observer(({ classes, store }) => (
  <div className={classes.fieldContainer}>
    <FormControl fullWidth>
      <InputLabel id="select-type-label">Select Type</InputLabel>
      <Select
        labelId="select-type-label"
        label="Select Type"
        className={classes.typeSelect}
        value={store.importStore.importType}
        onChange={(event) => store.importStore.changeImportType(event.target.value)}
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
));

const ErrorDialog: React.FC<any> = observer(({ store }) => (
  <Dialog
    open={store.importStore.importMnemonicPrKeyFailed}
    onClose={() => (store.importStore.importMnemonicPrKeyFailed = false)}
  >
    <DialogTitle>{`Invalid ${store.importStore.importType}`}</DialogTitle>
    <DialogContent>
      <DialogContentText>This wallet has already been imported.</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => (store.importStore.importMnemonicPrKeyFailed = false)} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
));

export default inject('store')(observer(ImportWallet));
