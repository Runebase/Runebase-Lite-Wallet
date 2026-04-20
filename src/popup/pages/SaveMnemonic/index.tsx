import React, { useEffect } from 'react';
import { Typography, Button, Alert, Stack } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { generateNewMnemonic, setWalletName, saveToFile } from '../../store/slices/saveMnemonicSlice';
import { getNavigateFunction } from '../../store/messageMiddleware';
import useStyles from './styles';
import SaveIcon from '@mui/icons-material/Save';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import SeedPhraseInput from '../../components/SeedphraseInput';
import strings from '../../localization/locales/en_US.json';

const SaveMnemonic: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const mnemonic = useAppSelector((state) => state.saveMnemonic.mnemonic);
  const createWalletName = useAppSelector((state) => state.createWallet.walletName);

  useEffect(() => {
    dispatch(generateNewMnemonic());
    dispatch(setWalletName(createWalletName));
  }, [dispatch, createWalletName]);

  return (
    <PageLayout hasBackButton title="">
      <div className={classes.contentContainer}>
        <div className={classes.topContainer}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Creating Wallet
          </Typography>
          <SeedPhraseInput
            phrase={mnemonic}
            setPhrase={null}
            error={null}
            setError={null}
            disabled={true}
          />
          <Alert severity="warning" sx={{ my: 2, width: '100%' }}>
            {strings['saveMnemonic.warningText']}
          </Alert>
        </div>
        <Stack spacing={1.5} sx={{ px: 2, pb: 2, width: '100%' }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={() => {
              const navigate = getNavigateFunction();
              navigate?.('/verify-mnemonic');
            }}
            startIcon={<FactCheckIcon />}
          >
            Verify Seed Phrase
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => dispatch(saveToFile())}
            startIcon={<SaveIcon />}
          >
            Save Seed Phrase to File
          </Button>
        </Stack>
      </div>
    </PageLayout>
  );
};

export default SaveMnemonic;
