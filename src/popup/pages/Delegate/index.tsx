import React, { useEffect } from 'react';
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
    const { sessionStore, delegateStore } = store;
    const { loggedInAccountName, walletInfo } = sessionStore;
    if (!loggedInAccountName || !walletInfo) return null;

    useEffect(() => {
      delegateStore.getSuperstakers();
    }, []);


    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Delegate" />
      </div>
    );
  })
);

export default Delegate;
