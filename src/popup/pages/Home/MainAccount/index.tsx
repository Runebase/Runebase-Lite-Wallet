import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, CardContent } from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';

import AccountInfo from '../../../components/AccountInfo';
import AppStore from '../../../stores/AppStore';

import styles from '../styles';

interface IProps {
  classes: Record<string, string>;
  store?: AppStore;
}

@inject('store')
@observer
class MainAccount extends Component<WithStyles<typeof styles> & IProps, {}> {
  public handleClick = (id: string, event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    switch (id) {
      case 'mainCard': {
        this.props.store!.routerStore.push('/account-detail');
        break;
      }
      default: {
        break;
      }
    }
  };

  public render() {
    const { classes } = this.props;
    const { loggedInAccountName, info } = this.props.store!.sessionStore;

    if (!loggedInAccountName || !info) {
      return null;
    }

    return (
      <div>
        <Card
          raised
          id="mainCard"
          onClick={(e) => this.handleClick('mainCard', e)}
          className={classes.card}
        >
          <CardContent className={classes.cardContent}>
            <AccountInfo hasRightArrow />
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(MainAccount);
