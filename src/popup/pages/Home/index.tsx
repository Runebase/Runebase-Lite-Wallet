import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles, WithStyles } from '@material-ui/core';
import NavBar from '../../components/NavBar';
import MainAccount from './MainAccount';
import AppStore from '../../stores/AppStore';
import styles from './styles';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

@inject('store')
@observer
class Home extends Component<WithStyles<typeof styles> & IProps, {}> {
  public render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <NavBar hasSettingsButton hasNetworkSelector title="Home" />
        <div className={classes.content}>
          <MainAccount />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Home);
