import React, { Component, ChangeEvent } from 'react';
import PropTypes from 'prop-types';
import { Typography, Button, withStyles, WithStyles, Divider } from '@material-ui/core';
import { inject, observer } from 'mobx-react';

import styles from './styles';
import NavBar from '../../components/NavBar';
import Logo from '../../components/Logo';
import BorderTextField from '../../components/BorderTextField';
import AppStore from '../../stores/AppStore';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

interface IState {}

@inject('store')
@observer
class CreateWallet extends Component<WithStyles & IProps, IState> {
  public static propTypes = {
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
      // Add other classes as needed
    }).isRequired,
  };

  public componentWillUnmount() {
    this.props.store.createWalletStore.reset();
  }

  public render() {
    const { classes, store: { createWalletStore } } = this.props;

    return (
      <div className={classes.root}>
        <NavBar hasBackButton={createWalletStore.showBackButton} hasNetworkSelector title="" />
        <div className={classes.contentContainer}>
          <Logo />
          <div className={classes.fieldContainer}>
            <BorderTextField
              className={classes.walletNameField}
              placeholder="Wallet name"
              error={createWalletStore.walletNameTaken}
              errorText={createWalletStore.walletNameError}
              onChange={this.onWalletNameChange}
              onEnterPress={this.handleEnterPress}
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
          <div className={classes.selectionDividerContainer}>
            <Divider className={classes.selectionDivider} />
            <Typography className={classes.selectionDividerText}>or</Typography>
            <Divider className={classes.selectionDivider} />
          </div>
          <Button
            className={classes.importButton}
            fullWidth
            disableRipple
            color="primary"
            onClick={createWalletStore.routeToImportWallet}
          >
            Import Wallet
          </Button>
        </div>
      </div>
    );
  }

  private onWalletNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { createWalletStore, saveMnemonicStore } = this.props.store;
    createWalletStore.walletName = event.target.value;
    saveMnemonicStore.walletName = event.target.value;
  };

  private handleEnterPress = () => {
    const { createWalletStore } = this.props.store;
    if (createWalletStore.walletName) {
      createWalletStore.routeToSaveMnemonic();
    }
  };
}

export default withStyles(styles)(CreateWallet);
