import React, { useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const RemoveDelegation: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const { sessionStore } = store;
    const { loggedInAccountName, walletInfo } = sessionStore;
    if (!loggedInAccountName || !walletInfo) return null;

    useEffect(() => { }, []);


    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Remove Delegation" />
        <div className={classes.contentContainer}>
          // Remove delegation fields
        </div>
      </div>
    );
  })
);

export default RemoveDelegation;
