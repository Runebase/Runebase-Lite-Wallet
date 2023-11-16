import React, { useEffect, useRef, ChangeEvent } from 'react';
import {
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  Typography,
  Button,
} from '@mui/material';
import { KeyboardArrowRight } from '@mui/icons-material';
import { observer, inject } from 'mobx-react';
import cx from 'classnames';
import { isUndefined } from 'lodash';
import NavBar from '../../components/NavBar';
import Transaction from '../../../models/Transaction';
import AccountInfo from '../../components/AccountInfo';
import AppStore from '../../stores/AppStore';
import QRCToken from '../../../models/QRCToken';
import { shortenTxid } from '../../../utils';
import useStyles from './styles';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const AccountDetail: React.FC<IProps> = ({ store }) => {
  const classes = useStyles();
  const { accountDetailStore } = store;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    accountDetailStore.init();

    if (accountDetailStore.shouldScrollToBottom === true) {
      scrollToBottom();
    }

    return () => {
      store.accountDetailStore.deinit();
    };
  }, [accountDetailStore, store]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    accountDetailStore.shouldScrollToBottom = false;
  };

  const handleTabChange = (_: ChangeEvent<{}>, value: number) => {
    accountDetailStore.activeTabIdx = value;
  };

  return (
    <div className={classes.root}>
      <div className={classes.contentContainer}>
        <Paper className={classes.accountDetailPaper} elevation={2}>
          <NavBar hasBackButton isDarkTheme title="Account Detail" />
          <AccountInfo />
        </Paper>
        <Paper className={classes.tabsPaper} elevation={1}>
          <Tabs
            indicatorColor="primary"
            textColor="primary"
            value={accountDetailStore.activeTabIdx}
            onChange={handleTabChange}
          >
            <Tab label="Transactions" className={classes.tab} />
            <Tab label="Tokens" className={classes.tab} />
          </Tabs>
        </Paper>
        <List className={classes.list}>
          {accountDetailStore.activeTabIdx === 0 ? (
            <TransactionList classes={classes} store={store} />
          ) : (
            <TokenList classes={classes} store={store} />
          )}
          <div ref={messagesEndRef}></div>
        </List>
      </div>
    </div>
  );
};

const TransactionList: React.FC<{
  classes: Record<string, string>;
  store: AppStore;
}> = observer(({ classes, store }) => (
  <div>
    {store.accountDetailStore.transactions.map(
      ({ id, pending, confirmations, timestamp, amount }: Transaction) => (
        <ListItem
          divider
          key={id}
          className={classes.listItem}
          onClick={() => store.accountDetailStore.onTransactionClick(id ?? '')}
        >
          <div className={classes.txInfoContainer}>
            {pending ? (
              <Typography className={cx(classes.txState, 'pending')}>
                pending
              </Typography>
            ) : (
              <Typography className={classes.txState}>{`${confirmations} confirmations`}</Typography>
            )}
            <Typography className={classes.txId}>{`txid: ${shortenTxid(
              id
            )}`}</Typography>
            <Typography className={classes.txTime}>
              {timestamp || '01-01-2018 00:00'}
            </Typography>
          </div>
          <AmountInfo classes={classes} amount={amount} token="RUNES" />
          <div>
            <KeyboardArrowRight className={classes.arrowRight} />
          </div>
        </ListItem>
      )
    )}
    <div className={cx(classes.bottomButtonWrap, 'center')}>
      {store.accountDetailStore.hasMore && (
        <Button
          className={classes.bottomButton}
          id="loadingButton"
          color="primary"
          size="small"
          onClick={store.accountDetailStore.fetchMoreTxs}
        >
          Load More
        </Button>
      )}
    </div>
  </div>
));

const TokenList: React.FC<{ classes: Record<string, string>; store: AppStore }> = observer(({ classes, store }) => (
  <div>
    {store.accountDetailStore.tokens &&
      store.accountDetailStore.tokens.map(({ name, symbol, balance, address }: QRCToken) => (
        <ListItem
          divider
          key={symbol}
          className={classes.listItem}
          onClick={() => store.accountDetailStore.editTokenMode && store.accountDetailStore.removeToken(address)}
        >
          {store.accountDetailStore.editTokenMode && (
            <Button className={classes.tokenDeleteButton} id="removeTokenButton">
              <img src="images/ic_delete.svg" alt="Delete Token" />
            </Button>
          )}
          <div className={classes.tokenInfoContainer}>
            <Typography className={classes.tokenName}>{name}</Typography>
          </div>
          <AmountInfo
            classes={classes}
            amount={balance}
            token={symbol}
            convertedValue={0}
          />
        </ListItem>
      ))}
    <div className={classes.bottomButtonWrap}>
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
export default inject('store')(observer(AccountDetail));
