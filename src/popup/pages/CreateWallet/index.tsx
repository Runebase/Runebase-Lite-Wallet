import React, { useEffect, ChangeEvent } from 'react';
import { Button, Divider } from '@mui/material';
import NavBar from '../../components/NavBar';
import Logo from '../../components/Logo';
import BorderTextField from '../../components/BorderTextField';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  validateWalletName,
  routeToSaveMnemonic,
  routeToImportWallet,
  resetCreateWallet,
  selectWalletNameError,
  selectCreateWalletError,
  selectShowBackButton,
} from '../../store/slices/createWalletSlice';
import { setWalletName as setSaveMnemonicWalletName } from '../../store/slices/saveMnemonicSlice';
import useStyles from './styles';

const CreateWallet: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();

  const walletNameTaken = useAppSelector((state) => state.createWallet.walletNameTaken);
  const walletNameError = useAppSelector(selectWalletNameError);
  const error = useAppSelector(selectCreateWalletError);
  const showBackButton = useAppSelector(selectShowBackButton);

  useEffect(() => {
    dispatch(resetCreateWallet());
  }, [dispatch]);

  const onWalletNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(validateWalletName(event.target.value));
    dispatch(setSaveMnemonicWalletName(event.target.value));
  };

  const handleEnterPress = () => {
    if (!error) {
      routeToSaveMnemonic();
    }
  };

  return (
    <div className={classes.root}>
      <NavBar
        hasBackButton={showBackButton}
        // hasNetworkSelector
        title=""
      />
      <div className={classes.contentContainer}>
        <Logo />
        <div className={classes.fieldContainer}>
          <BorderTextField
            className={classes.walletNameField}
            placeholder="Wallet name"
            error={walletNameTaken}
            errorText={walletNameError}
            onChange={onWalletNameChange}
            onEnterPress={handleEnterPress}
          />
        </div>
        <Button
          className={classes.loginButton}
          fullWidth
          variant="contained"
          color="primary"
          disabled={error}
          onClick={() => routeToSaveMnemonic()}
        >
          Create Wallet
        </Button>
        <Divider sx={{margin: '20px'}}>Or</Divider>
        <Button
          className={classes.loginButton}
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => routeToImportWallet()}
        >
          Import Wallet
        </Button>
      </div>
    </div>
  );
};

export default CreateWallet;
