import React, { useState } from 'react';
import { Typography, Button } from '@mui/material';
import { inject, observer } from 'mobx-react';
import cx from 'classnames';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import useStyles from './styles';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import SeedPhraseInput from '../../components/SeedphraseInput';
// const strings = require('../../localization/locales/en_US.json');

interface IProps {
  store: AppStore;
}

const VerifyMnemonic: React.FC<IProps> = ({ store }) => {
  const classes = useStyles();
  const [verificationPhrase, setVerificationPhrase] = useState(Array(12).fill(''));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isVerificationCorrect = () => {
    const { mnemonic } = store.saveMnemonicStore;
    return verificationPhrase.join(' ') === mnemonic.join(' ');
  };

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title={''} />
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
              store.saveMnemonicStore.createWallet();
            } else {
              setErrorMessage('Invalid Seed Phrase');
            }
          }}
        >
          Verify Seed Phrase
        </Button>
      </div>
    </div>
  );
};

export default inject('store')(observer(VerifyMnemonic));
