import React, { useEffect } from 'react';
import { Typography, Select, MenuItem, TextField, Button } from '@mui/material';
import { ArrowDropDown, Send as SendIcon } from '@mui/icons-material';
import { observer, inject } from 'mobx-react';
import { map } from 'lodash';
import { handleEnterPress } from '../../../utils';
import RRCToken from '../../../models/RRCToken';

import useStyles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

const Send: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const { sendStore, sessionStore } = store;
    if (!sendStore) return;
    const classes = useStyles();

    useEffect(() => {
      if (sendStore) {
        sendStore.init();
      }
    }, [sendStore]);

    useEffect(() => {}, [
      sendStore.senderAddress,
      sendStore.buttonDisabled
    ]);

    const onEnterPress = (event: React.KeyboardEvent) => {
      handleEnterPress(event, () => {
        if (!sendStore.buttonDisabled) {
          sendStore.routeToSendConfirm();
        }
      });
    };

    if (!sessionStore || !sessionStore.loggedInAccountName) {
      return null;
    }

    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Send" />
        <div className={classes.contentContainer}>
          <div
            // className={classes.fieldsContainer}
          >
            <FromField sendStore={sendStore} sessionStore={sessionStore} classes={classes} />
            <ToField onEnterPress={onEnterPress} sendStore={sendStore} classes={classes} />
            <TokenField sendStore={sendStore} classes={classes} />
            <AmountField onEnterPress={onEnterPress} sendStore={sendStore} classes={classes} />
            {sendStore.token && sendStore.token.symbol === 'RUNES' ? (
              <TransactionSpeedField sendStore={sendStore} classes={classes} />
            ) : (
              <div>
                <GasLimitField onEnterPress={onEnterPress} sendStore={sendStore} classes={classes} />
                <GasPriceField onEnterPress={onEnterPress} sendStore={sendStore} classes={classes} />
              </div>
            )}
          </div>
          <SendButton sendStore={sendStore} classes={classes} />
        </div>
      </div>
    );
  })
);

const Heading: React.FC<{ classes: Record<string, string>; name: string }> = ({ classes, name }) => (
  <Typography className={classes.fieldHeading}>{name}</Typography>
);

const FromField = observer(({ classes, sendStore, sessionStore }: any) => (
  <div className={classes.fieldContainer}>
    <Heading name="From" classes={classes} />
    <div className={classes.fieldContentContainer}>
      <Select
        className={classes.selectOrTextField}
        inputProps={{ name: 'from', id: 'from'}}
        value={sessionStore.walletInfo.address}
        onChange={(event) => {
          sendStore.senderAddress = event.target.value;
        }}
      >
        <MenuItem value={sessionStore.walletInfo.address}>
          <Typography className={classes.fieldTextOrInput}>{sessionStore.loggedInAccountName}</Typography>
        </MenuItem>
      </Select>
    </div>
  </div>
));

const ToField = observer(({ classes, sendStore, sessionStore, onEnterPress }: any) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onEnterPress();
    }
  };
  return (
    <div className={classes.fieldContainer}>
      <Heading name="To" classes={classes} />
      <div className={classes.fieldContentContainer}>
        <TextField
          className={classes.selectOrTextField}
          fullWidth
          type="text"
          multiline={false}
          placeholder={sessionStore?.walletInfo?.address || ''}
          value={sendStore.receiverAddress || ''}
          InputProps={{ className: classes.fieldTextOrInput, endAdornment: <ArrowDropDown /> }}
          onChange={(event) => sendStore.receiverAddress = event.target.value}
          onKeyDown={handleKeyDown}
        />
      </div>
      {!!sendStore.receiverAddress && sendStore.receiverFieldError && (
        <Typography className={classes.errorText}>{sendStore.receiverFieldError}</Typography>
      )}
    </div>
  );
});

const TokenField = observer(({ classes, sendStore }: any) => (
  <div className={classes.fieldContainer}>
    <Heading name="Token" classes={classes} />
    <div className={classes.fieldContentContainer}>
      <Select
        className={classes.selectOrTextField}
        value={sendStore.token ? sendStore.token.symbol : ''}
        onChange={(event) => sendStore.changeToken(event.target.value)}
      >
        {map(sendStore.tokens, (token: RRCToken) => (
          <MenuItem key={token.symbol} value={token.symbol}>
            <Typography className={classes.fieldTextOrInput}>{token.symbol}</Typography>
          </MenuItem>
        ))}
      </Select>
    </div>
  </div>
));

const AmountField = observer(({ classes, sendStore, onEnterPress }: any) => (
  <div className={classes.fieldContainer}>
    <div className={classes.buttonFieldHeadingContainer}>
      <div className={classes.buttonFieldHeadingTextContainer}>
        <Heading name="Amount" classes={classes} />
      </div>
      <Typography className={classes.fieldButtonText}>{sendStore.maxAmount}</Typography>
      <Button
        color="primary"
        variant="contained"
        onClick={() => {
          sendStore.amount = sendStore.maxAmount;
        }}
      >
        Max
      </Button>
    </div>
    <div className={classes.fieldContentContainer}>
      <TextField
        className={classes.selectOrTextField}
        fullWidth
        type="number"
        multiline={false}
        placeholder={'0.00'}
        value={sendStore.amount}
        InputProps={{
          classes: {
            input: classes.fieldInput,
          },
          className: classes.fieldTextOrInput,
          endAdornment: (
            <Typography className={classes.fieldTextAdornment}>
              {sendStore.token && sendStore.token.symbol}
            </Typography>
          ),
        }}
        onChange={(event) => {
          const newValue = event.target.value;
          newValue === '' ? sendStore.amount = '' : sendStore.amount = Number(newValue);
        }}
        onKeyPress={onEnterPress}
      />
    </div>
    {sendStore.amount !== '' && sendStore.amountFieldError && (
      <Typography className={classes.errorText}>{sendStore.amountFieldError}</Typography>
    )}
  </div>
));

const TransactionSpeedField = observer(({ classes, sendStore }: any) => (
  <div className={classes.fieldContainer}>
    <Heading name="Transaction Speed" classes={classes} />
    <div className={classes.fieldContentContainer}>
      <Select
        className={classes.selectOrTextField}
        value={sendStore.transactionSpeed}
        onChange={(event) => sendStore.transactionSpeed = event.target.value}
      >
        {map(sendStore.transactionSpeeds, (transactionSpeed: string) => (
          <MenuItem key={transactionSpeed} value={transactionSpeed}>
            <Typography className={classes.fieldTextOrInput}>{transactionSpeed}</Typography>
          </MenuItem>
        ))}
      </Select>
    </div>
  </div>
));

const GasLimitField = observer(({ classes, sendStore, onEnterPress }: any) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onEnterPress();
    }
  };

  return (
    <div className={classes.fieldContainer}>
      <div className={classes.buttonFieldHeadingContainer}>
        <div className={classes.buttonFieldHeadingTextContainer}>
          <Heading name="Gas Limit" classes={classes} />
        </div>
        <Typography className={classes.fieldButtonText}>{sendStore.gasLimitRecommendedAmount}</Typography>
        <Button
          color="primary"
          className={classes.fieldButton}
          onClick={() => (sendStore.gasLimit = sendStore.gasLimitRecommendedAmount)}
        >
          Recommended
        </Button>
      </div>
      <div className={classes.fieldContentContainer}>
        <TextField
          className={classes.selectOrTextField}
          fullWidth
          type="number"
          multiline={false}
          placeholder={sendStore.gasLimitRecommendedAmount.toString()}
          value={sendStore.gasLimit}
          InputProps={{
            classes: {
              input: classes.fieldInput,
            },
            className: classes.fieldTextOrInput,
            endAdornment: (
              <Typography className={classes.fieldTextAdornment}>GAS</Typography>
            ),
          }}
          onChange={(event) => sendStore.setGasLimit(Number(event.target.value))}
          onKeyDown={handleKeyDown}
        />
      </div>
      {sendStore.gasLimitFieldError && (
        <Typography className={classes.errorText}>{sendStore.gasLimitFieldError}</Typography>
      )}
    </div>
  );
});

const GasPriceField = observer(({ classes, sendStore, onEnterPress }: any) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onEnterPress();
    }
  };

  return (
    <div className={classes.fieldContainer}>
      <div className={classes.buttonFieldHeadingContainer}>
        <div className={classes.buttonFieldHeadingTextContainer}>
          <Heading name="Gas Price" classes={classes} />
        </div>
        <Typography className={classes.fieldButtonText}>{sendStore.gasPriceRecommendedAmount}</Typography>
        <Button
          color="primary"
          className={classes.fieldButton}
          onClick={() => sendStore.gasPrice = sendStore.gasPriceRecommendedAmount}
        >
          Recommended
        </Button>
      </div>
      <div className={classes.fieldContentContainer}>
        <TextField
          className={classes.selectOrTextField}
          fullWidth
          type="number"
          multiline={false}
          placeholder={sendStore.gasPriceRecommendedAmount.toString()}
          value={sendStore.gasPrice.toString()}
          InputProps={{
            classes: {
              input: classes.fieldInput,
            },
            className: classes.fieldTextOrInput,
            endAdornment: (
              <Typography className={classes.fieldTextAdornment}>
                SATOSHI/GAS
              </Typography>
            ),
          }}
          onChange={(event) => sendStore.setGasPrice(Number(event.target.value))}
          onKeyDown={handleKeyDown}
        />
      </div>
      {sendStore.gasPriceFieldError && (
        <Typography className={classes.errorText}>{sendStore.gasPriceFieldError}</Typography>
      )}
    </div>
  );
});


const SendButton = observer(({ classes, sendStore }: any) => (
  <Button
    sx={{
      mt: 1,
    }}
    className={classes.sendButton}
    fullWidth
    variant="contained"
    color="primary"
    size="large"
    disabled={sendStore.buttonDisabled}
    onClick={sendStore.routeToSendConfirm}
    endIcon={<SendIcon />}
  >
    Send
  </Button>
));

export default Send;
