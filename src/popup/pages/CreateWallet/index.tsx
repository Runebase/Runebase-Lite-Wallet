import React, { useEffect, ChangeEvent } from 'react';
import { Button, Divider, Stack } from '@mui/material';
import PageLayout from '../../components/PageLayout';
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
    <PageLayout hasBackButton={showBackButton} title="">
      <div className={classes.contentContainer}>
        <Logo />
        <Stack spacing={2} sx={{ mt: 2, width: '100%' }}>
          <BorderTextField
            placeholder="Wallet name"
            error={walletNameTaken}
            errorText={walletNameError}
            onChange={onWalletNameChange}
            onEnterPress={handleEnterPress}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={error}
            onClick={() => routeToSaveMnemonic()}
          >
            Create Wallet
          </Button>
          <Divider>Or</Divider>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => routeToImportWallet()}
          >
            Import Wallet
          </Button>
        </Stack>
      </div>
    </PageLayout>
  );
};

export default CreateWallet;
