import React, { ChangeEvent, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Divider } from '@mui/material';
import { inject, observer } from 'mobx-react';
import NavBar from '../../components/NavBar';
import Logo from '../../components/Logo';
import BorderTextField from '../../components/BorderTextField';
import AppStore from '../../stores/AppStore';
import useStyles from './styles';

interface IProps {
  store: AppStore;
}

const CreateWallet: React.FC<IProps> = ({ store }) => {
  const classes = useStyles();
  const { createWalletStore, saveMnemonicStore } = store;

  useEffect(() => {}, [createWalletStore]);

  const onWalletNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    createWalletStore.updateWalletName(event.target.value);
    saveMnemonicStore.updateWalletName(event.target.value);
  };

  const handleEnterPress = () => {
    const { createWalletStore } = store;
    createWalletStore.handleEnterPress();
  };

  return (
    <div className={classes.root}>
      <NavBar
        hasBackButton={createWalletStore.showBackButton}
        // hasNetworkSelector
        title=""
      />
      <div className={classes.contentContainer}>
        <Logo />
        <div className={classes.fieldContainer}>
          <BorderTextField
            className={classes.walletNameField}
            placeholder="Wallet name"
            error={createWalletStore.walletNameTaken}
            errorText={createWalletStore.walletNameError}
            onChange={onWalletNameChange}
            onEnterPress={handleEnterPress}
          />
        </div>
        <Button
          className={classes.loginButton}
          fullWidth
          variant="contained"
          color="primary"
          disabled={createWalletStore.error}
          onClick={createWalletStore.routeToSaveMnemonic}
        >
          Create Wallet
        </Button>
        <Divider sx={{margin: '20px'}}>Or</Divider>
        <Button
          className={classes.loginButton}
          fullWidth
          variant="contained"
          color="primary"
          onClick={createWalletStore.routeToImportWallet}
        >
          Import Wallet
        </Button>
      </div>
    </div>
  );
};

CreateWallet.propTypes = {
  classes: PropTypes.shape({
    root: PropTypes.string.isRequired,
    contentContainer: PropTypes.string.isRequired,
    fieldContainer: PropTypes.string.isRequired,
    walletNameField: PropTypes.string.isRequired,
    loginButton: PropTypes.string.isRequired,
    selectionDividerContainer: PropTypes.string.isRequired,
    selectionDivider: PropTypes.string.isRequired,
    selectionDividerText: PropTypes.string.isRequired,
    importButton: PropTypes.string.isRequired,
  }),
};

export default inject('store')(observer(CreateWallet));
