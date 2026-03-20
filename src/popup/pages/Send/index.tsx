import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { handleEnterPress } from '../../../utils';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  initSend,
  setReceiverAddress,
  routeToSendConfirm,
  selectButtonDisabled,
} from '../../store/slices/sendSlice';
import GasLimitField from '../../components/GasLimitField';
import GasPriceField from '../../components/GasPriceField';
import AmountField from '../../components/AmountField';
import FromField from '../../components/FromField';
import ToField from '../../components/ToField';
import TokenField from '../../components/TokenField';
import TransactionSpeedField from '../../components/TransactionSpeedField';

const Send: React.FC = () => {
  const dispatch = useAppDispatch();
  const { classes } = useStyles();
  const [scanning, setScanning] = useState(false);

  const loggedInAccountName = useAppSelector((state) => state.session.loggedInAccountName);
  const token = useAppSelector((state) => state.send.token);
  const buttonDisabled = useAppSelector(selectButtonDisabled);

  useEffect(() => {
    dispatch(initSend());
  }, [dispatch]);

  const startScan = () => {
    window.QRScanner.prepare((err: any, status: any) => {
      if (err) {
        console.error(err);
      } else if (status.authorized) {
        window.QRScanner.scan(displayContents);
        setScanning(true);
      } else if (status.denied) {
        console.error('Camera access denied. Please enable camera access in settings.');
      } else {
        console.error('Camera access not granted.');
      }
    });
  };

  const displayContents = (err: any, text: string) => {
    if (err) {
      console.error(err);
    } else {
      const address = text.replace(/^runebase:/i, '');
      dispatch(setReceiverAddress(address));
    }
    stopScan();
  };

  const stopScan = () => {
    window.QRScanner.destroy(() => {
      setScanning(false);
    });
  };

  const onEnterPress = (event: React.KeyboardEvent) => {
    handleEnterPress(event, () => {
      if (!buttonDisabled) {
        routeToSendConfirm();
      }
    });
  };

  if (!loggedInAccountName) {
    return null;
  }

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title="Send" />
      <div className={classes.contentContainer}>
        {
          !scanning && (
            <FromField />
          )
        }
        <ToField
          onEnterPress={onEnterPress}
          scanning={scanning}
          startScan={startScan}
          stopScan={stopScan}
        />
        {
          !scanning && (
            <>
              <TokenField />
              <AmountField onEnterPress={onEnterPress} />
              {token && token.symbol === 'RUNES' ? (
                <TransactionSpeedField />
              ) : (
                <div>
                  <GasLimitField onEnterPress={onEnterPress} />
                  <GasPriceField onEnterPress={onEnterPress} />
                </div>
              )}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={buttonDisabled}
                onClick={routeToSendConfirm}
                endIcon={<SendIcon />}
              >
                Send
              </Button>
            </>
          )
        }
      </div>
    </div>
  );
};

export default Send;
