import React, { useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { Typography, Button, Divider } from '@mui/material';

import useStyles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import RRCToken from '../../../models/RRCToken';
import { isUndefined } from 'lodash';

interface IProps {
  store: AppStore;
}

const ManageTokens: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const { sessionStore, loginStore, accountDetailStore } = store;

    useEffect(() => {
      accountDetailStore.init();
      return () => {
        accountDetailStore.deinit();
      };
    }, [accountDetailStore, store]);

    useEffect(() => {
      console.log('useEffect ManageTokens');
      console.log(accountDetailStore.tokens);
    }, [
      sessionStore,
      store,
      loginStore,
      accountDetailStore,
      accountDetailStore.tokens,
      accountDetailStore.verifiedTokens,
    ]);

    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Manage Tokens" />
        <div className={classes.contentContainer}>
          <TokenList classes={classes} store={store} />
        </div>
      </div>
    );
  })
);

const TokenList: React.FC<{ classes: Record<string, string>; store: AppStore }> = observer(({ classes, store }) => (
  <div>
    {store.accountDetailStore.verifiedTokens
    && store.accountDetailStore.verifiedTokens.map(({ name, symbol, balance, address }: RRCToken) => (
      <div
        key={symbol}
        onClick={() => store.accountDetailStore.editTokenMode && store.accountDetailStore.removeToken(address)}
      >
        {store.accountDetailStore.editTokenMode && (
          <Button className={classes.tokenDeleteButton} id="removeTokenButton">
            <img src="images/ic_delete.svg" alt="Delete Token" />
          </Button>
        )}
        <div className={classes.tokenInfoContainer}>
          <Typography className={classes.tokenName}>{name}</Typography>
          <AmountInfo
            classes={classes}
            amount={balance}
            token={symbol}
            convertedValue={0}
          />
        </div>
        <div style={{ float: 'left', width: '100%' }}>
          <Typography variant="caption">{address}</Typography>
        </div>
        <Divider variant="fullWidth" style={{ border: '1px solid #e0e0e0' }} />
      </div>
    ))}

    <div className={`${classes.bottomButtonWrap} ${classes.listItem}`}>
      <Button
        className={classes.bottomButton}
        id="editTokenButton"
        color="primary"
        size="small"
        onClick={() => store.accountDetailStore.editTokenMode = !store.accountDetailStore.editTokenMode}
      >
        {store.accountDetailStore.editTokenMode ? 'Done' : 'Edit'}
      </Button>
      <Button
        className={classes.bottomButton}
        id="addTokenButton"
        color="primary"
        size="small"
        onClick={() => store.accountDetailStore.routeToAddToken()}
      >
        Add Token
      </Button>
    </div>
  </div>
));

const AmountInfo: React.FC<{
  classes: Record<string, string>;
  amount: number | undefined;
  token: string;
  convertedValue?: number; // Make convertedValue optional
}> = ({
  classes,
  amount,
  token,
  convertedValue
}) => (
  <div>
    <div className={classes.tokenContainer}>
      <Typography className={classes.tokenAmount}>
        {isUndefined(amount) ? '...' : amount}
      </Typography>
      <div className={classes.tokenTypeContainer}>
        <Typography className={classes.tokenType}>{token}</Typography>
      </div>
    </div>
    {convertedValue !== undefined && (
      <>
      </>
      /*
      <div className={classes.conversionContainer}>
        <Typography className={classes.tokenType}>{`= ${convertedValue} RUNES`}</Typography>
      </div>
      */
    ) }
  </div>
);

export default ManageTokens;
