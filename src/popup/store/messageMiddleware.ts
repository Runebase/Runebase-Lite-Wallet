// messageMiddleware.ts
// Central middleware that routes background script messages to Redux actions
import { Middleware } from '@reduxjs/toolkit';
import { MESSAGE_TYPE } from '../../constants';
import { addMessageListener, isExtensionEnvironment, saveFile } from '../abstraction';
import {
  setNetworks,
  setNetworkIndex,
  setLoggedInAccountName,
  setWalletInfo,
  setBlockchainInfo,
  setDelegationInfo,
  setRunebaseUSD,
  setWalletBackupInfo,
  setElectrumXStatus,
  refreshSession,
} from './slices/sessionSlice';
import {
  setHasAccounts,
  setInvalidPassword,
} from './slices/loginSlice';
import {
  setAccounts,
} from './slices/accountLoginSlice';
import {
  setTransactions,
  setTokenTransfers,
  setHasMore,
  setVerifiedTokens as setAccountDetailVerifiedTokens,
} from './slices/accountDetailSlice';
import {
  setSendState,
  setErrorMessage as setSendErrorMessage,
  setMaxRunebaseSend,
} from './slices/sendSlice';
import {
  setSuperStakers,
  setSelectedSuperStaker,
  setSuperStakerDelegations,
  setSignedPoD,
  setDelegateErrorMessage,
} from './slices/delegateSlice';
import {
  setRRCTokenDetails,
  setGetRRCTokenDetailsFailed,
} from './slices/addTokenSlice';
import {
  setUnexpectedError,
} from './slices/mainContainerSlice';
import {
  setImportMnemonicPrKeyFailed,
} from './slices/importSlice';
import { SEND_STATE } from '../../constants';
import { parseJsonOrFallback } from '../../utils';
import type { AppDispatch } from './index';

// We need to store the navigate function reference and current location
let navigateFn: any = null;
let currentLocationRef: { pathname: string } = { pathname: '/login' };

export const setNavigateFunction = (fn: any) => {
  navigateFn = fn;
};

export const getNavigateFunction = () => navigateFn;

// Called synchronously from useLocation() in MainContainer on every render
export const setLocationRef = (location: { pathname: string }) => {
  currentLocationRef = location;
};

export const messageMiddleware: Middleware = (storeApi) => {
  const handleMessage = (request: any) => {
    const requestData = isExtensionEnvironment() ? request : request.data;
    if (requestData?.type) {
      console.log('[middleware] received message:', requestData.type);
    }
    const dispatch = storeApi.dispatch as AppDispatch;

    switch (requestData.type) {
    // === Session messages ===
    case MESSAGE_TYPE.GET_NETWORKS_RETURN:
      console.log('setting networks: ', requestData.networks);
      dispatch(setNetworks(requestData.networks));
      break;
    case MESSAGE_TYPE.GET_NETWORK_INDEX_RETURN:
      dispatch(setNetworkIndex(requestData.networkIndex));
      break;
    case MESSAGE_TYPE.CHANGE_NETWORK_SUCCESS:
      console.log('Changing network success. New network index:', requestData.networkIndex);
      dispatch(setNetworkIndex(requestData.networkIndex));
      break;
    case MESSAGE_TYPE.GET_ELECTRUMX_STATUS_RETURN:
    case MESSAGE_TYPE.ELECTRUMX_STATUS_CHANGED:
      dispatch(setElectrumXStatus(requestData.electrumxStatus));
      break;
    case MESSAGE_TYPE.ACCOUNT_LOGIN_SUCCESS:
      console.log('Account login success. Initializing session and routing to home');
      refreshSession();
      navigateFn?.('/account-detail');
      break;
    case MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME_RETURN:
      dispatch(setLoggedInAccountName(requestData.accountName));
      break;
    case MESSAGE_TYPE.GET_WALLET_INFO_RETURN:
      console.log('Received wallet info (return):', requestData.info);
      dispatch(setWalletInfo(requestData.info));
      break;
    case MESSAGE_TYPE.GET_DELEGATION_INFO_RETURN:
      console.log('Received wallet delegation info (return):', requestData.delegationInfo);
      dispatch(setDelegationInfo(requestData.delegationInfo));
      break;
    case MESSAGE_TYPE.GET_BLOCKCHAIN_INFO_RETURN:
      console.log('Received blockchain info (return):', requestData.blockchainInfo);
      dispatch(setBlockchainInfo(requestData.blockchainInfo));
      break;
    case MESSAGE_TYPE.GET_RUNEBASE_USD_RETURN:
      console.log('Received RUNEBASE USD (return):', requestData.runebaseUSD);
      dispatch(setRunebaseUSD(requestData.runebaseUSD));
      break;
    case MESSAGE_TYPE.REQUEST_BACKUP_WALLET_INFO_RETURN:
      dispatch(setWalletBackupInfo({ address: requestData.address, privateKey: requestData.privateKey }));
      break;

      // === Login messages ===
    case MESSAGE_TYPE.HAS_ACCOUNTS_RETURN:
      dispatch(setHasAccounts(requestData.hasAccounts));
      break;
    case MESSAGE_TYPE.RESTORING_SESSION_RETURN:
      navigateFn?.('/loading');
      break;
    case MESSAGE_TYPE.LOGIN_FAILURE:
      console.log('Login failure. Setting invalid password and routing to login page');
      dispatch(setInvalidPassword(true));
      navigateFn?.('/login');
      break;
    case MESSAGE_TYPE.LOGIN_SUCCESS_WITH_ACCOUNTS:
      console.log('Login success with accounts. Routing to account login page');
      navigateFn?.('/account-login');
      break;
    case MESSAGE_TYPE.LOGIN_SUCCESS_NO_ACCOUNTS:
      console.log('Login success with no accounts. Routing to create wallet page');
      navigateFn?.('/create-wallet');
      break;

      // === Account login messages ===
    case MESSAGE_TYPE.GET_ACCOUNTS_RETURN:
      dispatch(setAccounts(requestData.accounts));
      break;

      // === Account detail messages ===
    case MESSAGE_TYPE.GET_TXS_RETURN:
      console.log('GET_TXS_RETURN', requestData);
      dispatch(setTransactions(parseJsonOrFallback(requestData.transactions)));
      dispatch(setHasMore(requestData.hasMore));
      break;
    case MESSAGE_TYPE.GET_TOKEN_TXS_RETURN:
      dispatch(setTokenTransfers(parseJsonOrFallback(requestData.tokenTransfers)));
      break;
    case MESSAGE_TYPE.RRC_TOKENS_RETURN:
      console.log('RRC_TOKENS_RETURN', requestData);
      dispatch(setAccountDetailVerifiedTokens(parseJsonOrFallback(requestData.tokens)));
      break;

      // === Send messages ===
    case MESSAGE_TYPE.SEND_TOKENS_SUCCESS:
      console.log('Send tokens success:', requestData);
      navigateFn?.('/account-detail');
      dispatch(setSendState(SEND_STATE.INITIAL));
      break;
    case MESSAGE_TYPE.SEND_TOKENS_FAILURE:
      console.log('Send tokens failure:', requestData);
      dispatch(setSendState(SEND_STATE.INITIAL));
      dispatch(setSendErrorMessage(requestData.error.message));
      break;
    case MESSAGE_TYPE.GET_MAX_RUNEBASE_SEND_RETURN:
      dispatch(setMaxRunebaseSend(requestData.maxRunebaseAmount));
      break;

      // === Delegate messages ===
    case MESSAGE_TYPE.GET_SUPERSTAKERS_RETURN:
      console.log('GET_SUPERSTAKERS_RETURN: ', requestData);
      dispatch(setSuperStakers(requestData.superstakers));
      break;
    case MESSAGE_TYPE.GET_SUPERSTAKER_RETURN:
      console.log('GET_SUPERSTAKER_RETURN: ', requestData);
      dispatch(setSelectedSuperStaker(requestData.superstaker));
      navigateFn?.('/superstaker-detail');
      break;
    case MESSAGE_TYPE.GET_SUPERSTAKER_DELEGATIONS_RETURN:
      console.log('GET_SUPERSTAKER_DELEGATIONS_RETURN: ', requestData);
      dispatch(setSuperStakerDelegations(requestData.superstakerDelegations));
      break;
    case MESSAGE_TYPE.SIGN_POD_RETURN:
      console.log('SIGN_POD_RETURN: ', parseJsonOrFallback(requestData));
      dispatch(setSignedPoD(parseJsonOrFallback(requestData.result)));
      break;
    case MESSAGE_TYPE.SEND_DELEGATION_CONFIRM_SUCCESS:
      console.log('SEND_DELEGATION_CONFIRM_SUCCESS:', requestData);
      navigateFn?.('/account-detail');
      break;
    case MESSAGE_TYPE.SEND_DELEGATION_CONFIRM_FAILURE:
      console.log('SEND_DELEGATION_CONFIRM_FAILURE:', requestData);
      dispatch(setDelegateErrorMessage(requestData.error.message));
      break;
    case MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM_SUCCESS:
      console.log('SEND_REMOVE_DELEGATION_CONFIRM_SUCCESS:', requestData);
      navigateFn?.('/account-detail');
      break;
    case MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM_FAILURE:
      console.log('SEND_DELEGATION_CONFIRM_FAILURE:', requestData);
      dispatch(setDelegateErrorMessage(requestData.error.message));
      break;

      // === Add token messages ===
    case MESSAGE_TYPE.RRC_TOKEN_DETAILS_RETURN:
      if (requestData.isValid) {
        const { name, symbol, decimals } = requestData.token;
        console.log('Received RRC token details:', { name, symbol, decimals });
        dispatch(setRRCTokenDetails({ name, symbol, decimals }));
      } else {
        console.log('RRC token details request failed');
        dispatch(setGetRRCTokenDetailsFailed(true));
      }
      break;

      // === Main container messages ===
    case MESSAGE_TYPE.SAVE_SEED_TO_FILE_RETURN: {
      const content = requestData.content;
      const filename = requestData.filename;
      saveFile(content, filename);
      break;
    }
    case MESSAGE_TYPE.CLEARED_SESSION_RETURN:
      console.log('CLEARED_SESSION_RETURN');
      navigateFn?.('/login');
      break;
    case MESSAGE_TYPE.ROUTE_LOGIN:
      console.log('Routing to login page');
      navigateFn?.('/login');
      break;
    case MESSAGE_TYPE.IMPORT_MNEMONIC_PRKEY_FAILURE:
      console.log('Import mnemonic/prkey failure');
      dispatch(setImportMnemonicPrKeyFailed(true));
      navigateFn?.(-1);
      break;
    case MESSAGE_TYPE.UNEXPECTED_ERROR: {
      console.log('Received unexpected error:', requestData.error);
      // Only navigate back if on /loading — otherwise just show the error dialog.
      // currentLocationRef is updated synchronously on every render via setLocationRef,
      // so it's always accurate (unlike useEffect-based tracking).
      if (currentLocationRef.pathname === '/loading') {
        console.log('Going back from loading page');
        navigateFn?.(-1);
      }
      dispatch(setUnexpectedError(requestData.error));
      break;
    }

    default:
      break;
    }
  };

  // Register the message listener once
  addMessageListener(handleMessage);

  return (next) => (action) => next(action);
};
