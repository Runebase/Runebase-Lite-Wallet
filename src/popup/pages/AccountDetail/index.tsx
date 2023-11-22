import React, { useEffect, useRef, ChangeEvent } from 'react';
import {
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { KeyboardArrowRight } from '@mui/icons-material';
import { observer, inject } from 'mobx-react';
import cx from 'classnames';
import { isUndefined } from 'lodash';
import NavBar from '../../components/NavBar';
import Transaction from '../../../models/Transaction';
import AccountInfo from '../../components/AccountInfo';
import AppStore from '../../stores/AppStore';
import { shortenTxid } from '../../../utils';
import useStyles from './styles';
import TokenTransfer from '../../../models/TokenTransfer';
import { TOKEN_IMAGES } from '../../../constants';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const AccountDetail: React.FC<IProps> = ({ store }) => {
  const classes = useStyles();
  const { accountDetailStore, sessionStore, loginStore } = store;
  const { loggedInAccountName, walletInfo, blockchainInfo } = sessionStore;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { }, [
    loggedInAccountName,
    walletInfo,
    sessionStore,
    store,
    loginStore,
    blockchainInfo,
    blockchainInfo?.height,
    accountDetailStore.tokenBalanceHistory,
    accountDetailStore.transactions
  ]);

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
          <NavBar
            hasSettingsButton
            title="Account Detail"
            // hasNetworkSelector
          />
          {/* <NavBar hasBackButton isDarkTheme title="Account Detail" /> */}
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
            <Tab label="Token Transfers" className={classes.tab} />
          </Tabs>
        </Paper>
        <List className={classes.list}>
          {accountDetailStore.activeTabIdx === 0 ? (
            <TransactionList classes={classes} store={store} />
          ) : (
            <TokenTransferList classes={classes} store={store} />
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
          <AmountInfo classes={classes} amount={amount / 1e8} token={{symbol: 'RUNES', address: ''}} />
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

const TokenTransferList: React.FC<{
  classes: Record<string, string>;
  store: AppStore;
}> = observer(({ classes, store: {
  accountDetailStore,
  sessionStore,
} }) => {
  return (
    <div>
      {accountDetailStore.tokenBalanceHistory.map(
        ({
          id,
          // blockHash,
          blockHeight,
          timestamp,
          tokens,
        }: TokenTransfer) => {
          const confirmations: number = (sessionStore.blockchainInfo?.height || 0) - blockHeight;
          return (
            <ListItem
              divider
              key={id}
              className={classes.listItem}
              onClick={() => accountDetailStore.onTransactionClick(id ?? '')}
            >
              <div className={classes.txInfoContainer}>
                {confirmations <= 0 ? (
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
              {tokens.map((
                token,
                index: number,
              ) => {
                return(
                  <Box
                    // fullWidth
                    key={index}
                  >
                    <AmountInfo
                      key={index} // Assuming you have a unique identifier for each token
                      classes={classes}
                      amount={Number(token.amount) / 1e8}
                      token={token} // Assuming 'symbol' is the property you want to use for the token name
                    />
                  </Box>
                );})}
              <div>
                <KeyboardArrowRight className={classes.arrowRight} />
              </div>
            </ListItem>
          );
        }
      )}
      <div className={cx(classes.bottomButtonWrap, 'center')}>
        {accountDetailStore.hasMore && (
          <Button
            className={classes.bottomButton}
            id="loadingButton"
            color="primary"
            size="small"
            onClick={accountDetailStore.fetchMoreTxs}
          >
          Load More
          </Button>
        )}
      </div>
    </div>
  );});


const AmountInfo: React.FC<{
  classes: Record<string, string>;
  amount: number | undefined;
  token: {
    address: string,
    symbol: string,
  };
  convertedValue?: number; // Make convertedValue optional
}> = ({
  classes,
  amount,
  token,
  convertedValue
}) => {
  const tokenLogoSrc = TOKEN_IMAGES[token.address];
  return (
    <div>
      <div className={classes.tokenContainer}>
        <Typography className={classes.tokenAmount}>
          {isUndefined(amount) ? '...' : amount}
        </Typography>
        <div className={classes.tokenTypeContainer} style={{ display: 'flex', alignItems: 'center' }}>
          {
            tokenLogoSrc && (
              <img
                style={{
                  height: '18px',
                  width: '18px'
                }}
                src={chrome.runtime.getURL(tokenLogoSrc)}
                alt={token.symbol}
              />
            )
          }
          <Typography className={classes.tokenType}>{token.symbol}</Typography>
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
  );};
export default inject('store')(observer(AccountDetail));
