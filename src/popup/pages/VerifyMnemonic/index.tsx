import React, { useState } from 'react';
import { Typography, Button, TextField, Grid, useMediaQuery, useTheme, InputAdornment } from '@mui/material';
import { inject, observer } from 'mobx-react';
import cx from 'classnames';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import useStyles from './styles';
import WarningIcon from '@mui/icons-material/Warning';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
// const strings = require('../../localization/locales/en_US.json');

interface IProps {
  store: AppStore;
}

const VerifyMnemonic: React.FC<IProps> = ({ store }) => {
  const classes = useStyles();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const [verificationPhrase, setVerificationPhrase] = useState(Array(12).fill(''));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePhraseChange = (index: number, value: string) => {
    const updatedPhrase = [...verificationPhrase];
    updatedPhrase[index] = value;
    setVerificationPhrase(updatedPhrase);
    setErrorMessage(null);
  };

  const isVerificationCorrect = () => {
    const { mnemonic } = store.saveMnemonicStore;
    return verificationPhrase.join(' ') === mnemonic.join(' ');
  };

  const renderMnemonicTiles = () => {
    let wordsPerRow = 3;

    if (isSmallScreen) {
      wordsPerRow = 2;
    } else if (isLargeScreen) {
      wordsPerRow = 4;
    }

    return (
      <Grid container className={classes.mnemonicTilesContainer}>
        {verificationPhrase.map((word, index) => (
          <Grid item xs={12 / wordsPerRow} key={index} className={classes.mnemonicTile}>
            <div className={classes.tileContainer}>
              <TextField
                value={word}
                onChange={(e) => handlePhraseChange(index, e.target.value)}
                variant="outlined"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" className={classes.tileNumber}>
                      {index + 1}.
                    </InputAdornment>
                  ),
                  sx: {
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: theme.palette.text.primary,
                    },
                  },
                }}
              />
            </div>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title={''} />
      <div className={classes.contentContainer}>
        <div className={classes.topContainer}>
          <Typography className={classes.walletCreatedHeader}>
            Verify Seed Phrase
          </Typography>
          {renderMnemonicTiles()}
          {errorMessage && (
            <Typography className={classes.warningText}>
              <WarningIcon className={classes.warningIcon} />
              {errorMessage}
            </Typography>
          )}
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
              store.saveMnemonicStore.createWallet(false);
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
