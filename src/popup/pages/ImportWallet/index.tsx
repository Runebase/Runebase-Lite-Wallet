import React, { useEffect } from 'react';
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
} from '@mui/material';
import { inject, observer } from 'mobx-react';
import NavBar from '../../components/NavBar';
import BorderTextField from '../../components/BorderTextField';
import AppStore from '../../stores/AppStore';
import { IMPORT_TYPE } from '../../../constants';
import useStyles from './styles';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const ImportWallet: React.FC<IProps> = ({ store }) => {
  const { importStore } = store;
  const classes = useStyles();

  useEffect(() => {
    return () => {
      importStore.reset();
    };
  }, [importStore]);

  return (
    <div className={classes.root}>
      <NavBar hasNetworkSelector title="" />
      <div className={classes.contentContainer}>
        <Typography className={classes.headerText}>Import Wallet</Typography>
        <div className={classes.inputContainer}>
          <div className={classes.fieldContainer}>
            <TypeField classes={classes} store={store} />
            <TextField
              className={classes.mnemonicPrKeyTextField}
              autoFocus
              required
              multiline
              rows={5}
              type="text"
              placeholder={`Enter your ${importStore.importType} here to import your wallet.`}
              onChange={(e) => (importStore.mnemonicPrivateKey = e.target.value)}
              InputProps={{
                classes: { input: classes.mnemonicPrKeyFieldInput },
              }}
            />
            {!!importStore.mnemonicPrivateKey && importStore.privateKeyError && (
              <Typography className={classes.errorText}>{importStore.privateKeyError}</Typography>
            )}
            <BorderTextField
              classNames={classes.borderTextFieldContainer}
              placeholder="Wallet name"
              error={importStore.walletNameTaken}
              errorText={importStore.walletNameError}
              onChange={(e: any) => (importStore.accountName = e.target.value)}
              onEnterPress={importStore.importMnemonicOrPrKey}
            />
          </div>
        </div>
        <div>
          <Button
            className={classes.importButton}
            fullWidth
            variant="contained"
            color="primary"
            onClick={importStore.importMnemonicOrPrKey}
            disabled={importStore.mnemonicPrKeyPageError}
          >
            Import
          </Button>
          <Button
            className={classes.cancelButton}
            fullWidth
            color="primary"
            onClick={importStore.cancelImport}
          >
            Cancel
          </Button>
        </div>
      </div>
      <ErrorDialog store={store} />
    </div>
  );
};

const Heading: React.FC<any> = ({ classes, name }) => (
  <Typography className={classes.fieldHeading}>{name}</Typography>
);

const TypeField: React.FC<any> = observer(({ classes, store }) => (
  <div className={classes.fieldContainer}>
    <Heading name="Select Type" classes={classes} />
    <div className={classes.fieldContentContainer}>
      <Select
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
    </div>
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
