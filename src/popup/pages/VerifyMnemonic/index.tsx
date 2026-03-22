import React, { useState } from 'react';
import { Typography, Button } from '@mui/material';
import cx from 'classnames';
import PageLayout from '../../components/PageLayout';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { createWallet } from '../../store/slices/saveMnemonicSlice';
import useStyles from './styles';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import SeedPhraseInput from '../../components/SeedphraseInput';
// const strings = require('../../localization/locales/en_US.json');

const VerifyMnemonic: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const [verificationPhrase, setVerificationPhrase] = useState(Array(12).fill(''));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mnemonic = useAppSelector((state) => state.saveMnemonic.mnemonic);

  const isVerificationCorrect = () => {
    return verificationPhrase.join(' ') === mnemonic.join(' ');
  };

  return (
    <PageLayout hasBackButton title="">
      <div className={classes.contentContainer}>
        <div className={classes.topContainer}>
          <Typography className={classes.walletCreatedHeader}>
            Verify Seed Phrase
          </Typography>
          <SeedPhraseInput
            phrase={verificationPhrase}
            setPhrase={setVerificationPhrase}
            error={errorMessage}
            setError={setErrorMessage}
            disabled={false}
          />
        </div>
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          Please enter the words in the correct order to verify your seed phrase.
        </Typography>
        <Button
          className={cx(classes.actionButton, 'marginBottom')}
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<LibraryAddCheckIcon />}
          onClick={() => {
            if (isVerificationCorrect()) {
              dispatch(createWallet());
            } else {
              setErrorMessage('Invalid Seed Phrase');
            }
          }}
        >
          Verify Seed Phrase
        </Button>
      </div>
    </PageLayout>
  );
};

export default VerifyMnemonic;
