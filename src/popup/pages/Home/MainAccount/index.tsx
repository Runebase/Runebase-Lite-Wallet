import React from 'react';
import { observer, inject } from 'mobx-react';
import { Card, CardContent } from '@mui/material';
import AccountInfo from '../../../components/AccountInfo';
import AppStore from '../../../stores/AppStore';
import useStyles from './styles';

interface IProps {
  store?: AppStore;
}

const MainAccount: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const handleClick = (id: string, event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();

      switch (id) {
        case 'mainCard': {
          store!.routerStore.push('/account-detail');
          break;
        }
        default: {
          break;
        }
      }
    };

    const { loggedInAccountName, info } = store!.sessionStore;

    if (!loggedInAccountName || !info) {
      return null;
    }

    return (
      <div>
        <Card raised id="mainCard" onClick={(e) => handleClick('mainCard', e)} className={classes.card}>
          <CardContent className={classes.cardContent}>
            <AccountInfo hasRightArrow />
          </CardContent>
        </Card>
      </div>
    );
  })
);

export default MainAccount;
