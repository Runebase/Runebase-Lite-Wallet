import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@mui/material';
import { inject, observer } from 'mobx-react';
import cx from 'classnames';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import useStyles from './styles';
import WarningIcon from '@mui/icons-material/Warning';
import SaveIcon from '@mui/icons-material/Save';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import SeedPhraseInput from '../../components/SeedphraseInput';
const strings = require('../../localization/locales/en_US.json');

interface IProps {
  store: AppStore;
}

const SaveMnemonic: React.FC<IProps> = ({ store }) => {
  const classes = useStyles();
  const [isCordova, setIsCordova] = useState<boolean>(false);
  useEffect(() => {
    setIsCordova(typeof window.cordova !== 'undefined');
    store.saveMnemonicStore.generateMnemonic();
  }, [store.saveMnemonicStore]);
  const { mnemonic } = store.saveMnemonicStore;

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title={''} />
      <div className={classes.contentContainer}>
        <div className={classes.topContainer}>
          <Typography className={classes.walletCreatedHeader}>
            Creating Wallet
          </Typography>
          <SeedPhraseInput
            phrase={mnemonic}
            setPhrase={null}
            error={null}
            setError={null}
            disabled={true}
          />
          <Typography className={classes.warningText}>
            <WarningIcon className={classes.warningIcon} />
            {strings['saveMnemonic.warningText']}
          </Typography>
        </div>
        <Button
          className={cx(classes.actionButton, 'marginBottom')}
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => store.navigate?.('/verify-mnemonic')}
          startIcon={<FactCheckIcon />}
        >
          Verify Seed Phrase
        </Button>
        {/*
          Developer Note: Download functionality is disabled for Cordova
          since i encountered issues in making it work.
        */}
        {
          !isCordova && (
            <Button
              className={cx(classes.actionButton, classes.saveButton)}
              fullWidth
              variant="contained"
              color="secondary"
              onClick={() => store.saveMnemonicStore.saveToFile()}
              startIcon={<SaveIcon />}
            >
              Save Seed Phrase to File
            </Button>
          )}
      </div>
    </div>
  );
};

export default inject('store')(observer(SaveMnemonic));
