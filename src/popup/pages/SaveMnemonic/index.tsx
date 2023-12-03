import React, { useEffect } from 'react';
import { Typography, Button } from '@mui/material';
import { inject, observer } from 'mobx-react';
import cx from 'classnames';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import useStyles from './styles';
const strings = require('../../localization/locales/en_US.json');

interface IProps {
  store: AppStore;
}

const SaveMnemonic: React.FC<IProps> = ({ store }) => {
  const classes = useStyles();
  useEffect(() => {
    console.log('SaveMnemonic');
    // console.log(store);
    store.saveMnemonicStore.generateMnemonic();

    return () => {
      // Cleanup code (if needed) when the component unmounts
    };
  }, [store.saveMnemonicStore]);

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title={''} />
      <div className={classes.contentContainer}>
        <div className={classes.topContainer}>
          <Typography className={classes.walletCreatedHeader}>
            {strings['saveMnemonic.walletCreated']}
          </Typography>
          <Typography className={classes.mnemonicText}>{store.saveMnemonicStore.mnemonic}</Typography>
          <Typography className={classes.warningText}>
            {strings['saveMnemonic.warningText']}
          </Typography>
        </div>
        <Button
          className={cx(classes.actionButton, 'marginBottom')}
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => store.saveMnemonicStore.createWallet(false)}
        >
          I Copied It Somewhere Safe
        </Button>
        {/*
          Developer Note: Download functionality is disabled for Cordova
          since i encountered issues in making it work.
        */}
        {typeof window.cordova === 'undefined' || window.cordova === null ? null : (
          <Button
            className={classes.actionButton}
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => store.saveMnemonicStore.createWallet(true)}
          >
            Save To File
          </Button>
        )}
      </div>
    </div>
  );
};

export default inject('store')(observer(SaveMnemonic));
