import React, { useEffect, useRef } from 'react';
import {
  Paper,
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
import { TOKEN_IMAGES } from '../../../constants';
import BigNumber from 'bignumber.js';
import { getImageUrl } from '../../abstraction';

interface IProps {
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
    accountDetailStore.transactions,
    walletInfo?.balance,
    walletInfo?.address,
    walletInfo?.qrc20Balances,
    walletInfo?.qrc721Balances,
    accountDetailStore.transactions,
    sessionStore.delegationInfo,
  ]);

  useEffect(() => {
    sessionStore.initWalletBackupInfo();
  }, []);

  useEffect(() => {
    if (accountDetailStore.shouldScrollToBottom === true) {
      scrollToBottom();
    }
  }, [accountDetailStore, store]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    accountDetailStore.shouldScrollToBottom = false;
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
        <List className={classes.list}>
          <TransactionList classes={classes} store={store} />
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
      ({ id, pending, confirmations, timestamp, amount, qrc20TokenTransfers }: Transaction) => {
        const filteredTransfers =
          qrc20TokenTransfers &&
          qrc20TokenTransfers.filter(
            (tokenTransfer) =>
              tokenTransfer.to === store.sessionStore.walletInfo?.address ||
              tokenTransfer.from === store.sessionStore.walletInfo?.address
          );

        return (
          <ListItem
            divider
            key={id}
            className={classes.listItem}
            onClick={() => store.accountDetailStore.onTransactionClick(id ?? '')}
          >
            <div className={classes.txInfoContainer}>
              {pending ? (
                <Typography className={cx(classes.txState, 'pending')}>pending</Typography>
              ) : (
                <Typography className={classes.txState}>{`${confirmations} confirmations`}</Typography>
              )}
              <Typography className={classes.txId}>{`txid: ${shortenTxid(
                id
              )}`}</Typography>
              <Typography className={classes.txTime}>{timestamp || '01-01-2018 00:00'}</Typography>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Box style={{ width: '100%' }}>
                <AmountInfo classes={classes} amount={amount / 1e8} token={{ symbol: 'RUNES', address: '' }} />
              </Box>
              {filteredTransfers &&
                filteredTransfers.length > 0 &&
                filteredTransfers.map((tokenTransfer, index) => (
                  <Box key={index} style={{ width: '100%' }}>
                    <AmountInfo
                      classes={classes}
                      amount={
                        tokenTransfer.to === store.sessionStore.walletInfo?.address
                          ? new BigNumber(tokenTransfer.value || '0').dividedBy(`1e${tokenTransfer.decimals}`).toNumber()
                          : new BigNumber(tokenTransfer.value || '0').dividedBy(`-1e${tokenTransfer.decimals}`).toNumber()
                      }
                      token={{ symbol: tokenTransfer.symbol || '', address: tokenTransfer.address || '' }}
                    />
                  </Box>
                ))}
            </div>
            <div>
              <KeyboardArrowRight className={classes.arrowRight} />
            </div>
          </ListItem>
        );
      }
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
                src={getImageUrl(tokenLogoSrc)}
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
