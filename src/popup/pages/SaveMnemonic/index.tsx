import React, { Component } from 'react';
import {
  Typography,
  Button,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import cx from 'classnames';

import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import styles from './styles';
const strings = require('../../localization/locales/en_US.json');
interface IProps extends WithStyles<typeof styles> {
  store: AppStore;
}

@inject('store')
@observer
class SaveMnemonic extends Component<IProps, NonNullable<unknown>> {
  public componentDidMount() {
     console.log('SaveMnemonic');
     // console.log(this.props.store);
     this.props.store.saveMnemonicStore.generateMnemonic();
  }

  public render() {
    const { classes, store } = this.props;

    return (
      <div className={classes.root}>
        <NavBar hasBackButton title={''} />
        <div className={classes.contentContainer}>
          <div className={classes.topContainer}>
            <Typography className={classes.walletCreatedHeader}>
              {strings['saveMnemonic.walletCreated']}
            </Typography>
            <Typography className={classes.mnemonicText}>
              {store.saveMnemonicStore.mnemonic}
            </Typography>
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
          <Button
            className={classes.actionButton}
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => store.saveMnemonicStore.createWallet(true)}
          >
            Save To File
          </Button>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(SaveMnemonic);
