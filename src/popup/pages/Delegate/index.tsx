import React from 'react';
import { observer, inject } from 'mobx-react';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const Delegate: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const { loggedInAccountName, walletInfo } = store.sessionStore;
    if (!loggedInAccountName || !walletInfo) return null;

    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Delegate" />
      </div>
    );
  })
);

export default Delegate;
