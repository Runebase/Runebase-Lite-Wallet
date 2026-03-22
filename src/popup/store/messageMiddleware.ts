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
  setPendingDelegationAction,
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
  setDelegationReadiness,
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
    const dispatch = storeApi.dispatch as AppDispatch;

    switch (requestData.type) {
    // === Session messages ===
    case MESSAGE_TYPE.GET_NETWORKS_RETURN:
      dispatch(setNetworks(requestData.networks));
      break;
    case MESSAGE_TYPE.GET_NETWORK_INDEX_RETURN:
      dispatch(setNetworkIndex(requestData.networkIndex));
      break;
    case MESSAGE_TYPE.CHANGE_NETWORK_SUCCESS:
      dispatch(setNetworkIndex(requestData.networkIndex));
      break;
    case MESSAGE_TYPE.GET_ELECTRUMX_STATUS_RETURN:
    case MESSAGE_TYPE.ELECTRUMX_STATUS_CHANGED:
      dispatch(setElectrumXStatus(requestData.electrumxStatus));
      break;
    case MESSAGE_TYPE.ACCOUNT_LOGIN_SUCCESS:
      refreshSession();
      navigateFn?.('/account-detail');
      break;
    case MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME_RETURN:
      dispatch(setLoggedInAccountName(requestData.accountName));
      break;
    case MESSAGE_TYPE.GET_WALLET_INFO_RETURN:
      dispatch(setWalletInfo(requestData.info));
      break;
    case MESSAGE_TYPE.GET_DELEGATION_INFO_RETURN:
      dispatch(setDelegationInfo(requestData.delegationInfo));
      break;
    case MESSAGE_TYPE.GET_BLOCKCHAIN_INFO_RETURN:
      dispatch(setBlockchainInfo(requestData.blockchainInfo));
      break;
    case MESSAGE_TYPE.GET_RUNEBASE_USD_RETURN:
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
      dispatch(setInvalidPassword(true));
      navigateFn?.('/login');
      break;
    case MESSAGE_TYPE.LOGIN_SUCCESS_WITH_ACCOUNTS:
      navigateFn?.('/account-login');
      break;
    case MESSAGE_TYPE.LOGIN_SUCCESS_NO_ACCOUNTS:
      navigateFn?.('/create-wallet');
      break;

      // === Account login messages ===
    case MESSAGE_TYPE.GET_ACCOUNTS_RETURN:
      dispatch(setAccounts(requestData.accounts));
      break;

      // === Account detail messages ===
    case MESSAGE_TYPE.GET_TXS_RETURN:
      dispatch(setTransactions(parseJsonOrFallback(requestData.transactions)));
      dispatch(setHasMore(requestData.hasMore));
      break;
    case MESSAGE_TYPE.GET_TOKEN_TXS_RETURN:
      dispatch(setTokenTransfers(parseJsonOrFallback(requestData.tokenTransfers)));
      break;
    case MESSAGE_TYPE.RRC_TOKENS_RETURN:
      dispatch(setAccountDetailVerifiedTokens(parseJsonOrFallback(requestData.tokens)));
      break;

      // === Send messages ===
    case MESSAGE_TYPE.SEND_TOKENS_SUCCESS:
      navigateFn?.('/account-detail');
      dispatch(setSendState(SEND_STATE.INITIAL));
      break;
    case MESSAGE_TYPE.SEND_TOKENS_FAILURE:
      dispatch(setSendState(SEND_STATE.INITIAL));
      dispatch(setSendErrorMessage(requestData.error.message));
      break;
    case MESSAGE_TYPE.GET_MAX_RUNEBASE_SEND_RETURN:
      dispatch(setMaxRunebaseSend(requestData.maxRunebaseAmount));
      break;

      // === Delegate messages ===
    case MESSAGE_TYPE.GET_SUPERSTAKERS_RETURN:
      dispatch(setSuperStakers(requestData.superstakers));
      break;
    case MESSAGE_TYPE.GET_SUPERSTAKER_RETURN:
      dispatch(setSelectedSuperStaker(requestData.superstaker));
      navigateFn?.('/superstaker-detail');
      break;
    case MESSAGE_TYPE.GET_SUPERSTAKER_DELEGATIONS_RETURN:
      dispatch(setSuperStakerDelegations(requestData.superstakerDelegations));
      break;
    case MESSAGE_TYPE.SIGN_POD_RETURN:
      dispatch(setSignedPoD(parseJsonOrFallback(requestData.result)));
      break;
    case MESSAGE_TYPE.SEND_DELEGATION_CONFIRM_SUCCESS: {
      const delegateState = storeApi.getState().delegate;
      const stakerAddr = delegateState.selectedSuperstaker?.address || delegateState.customSuperstakerAddress || '';
      const currentDelegation = storeApi.getState().session.delegationInfo;
      const actionType = currentDelegation?.staker && currentDelegation.staker !== '' ? 'change' : 'add';
      dispatch(setPendingDelegationAction({ type: actionType, stakerAddress: stakerAddr }));
      navigateFn?.('/account-detail');
      break;
    }
    case MESSAGE_TYPE.SEND_DELEGATION_CONFIRM_FAILURE:
      dispatch(setDelegateErrorMessage(requestData.error.message));
      break;
    case MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM_SUCCESS:
      dispatch(setPendingDelegationAction({ type: 'remove', stakerAddress: '' }));
      navigateFn?.('/account-detail');
      break;
    case MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM_FAILURE:
      dispatch(setDelegateErrorMessage(requestData.error.message));
      break;
    case MESSAGE_TYPE.GET_DELEGATION_READINESS_RETURN:
      dispatch(setDelegationReadiness(requestData.readiness));
      break;

      // === Add token messages ===
    case MESSAGE_TYPE.RRC_TOKEN_DETAILS_RETURN:
      if (requestData.isValid) {
        const { name, symbol, decimals } = requestData.token;
        dispatch(setRRCTokenDetails({ name, symbol, decimals }));
      } else {
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
      navigateFn?.('/login');
      break;
    case MESSAGE_TYPE.ROUTE_LOGIN:
      navigateFn?.('/login');
      break;
    case MESSAGE_TYPE.IMPORT_MNEMONIC_PRKEY_FAILURE:
      dispatch(setImportMnemonicPrKeyFailed(true));
      navigateFn?.(-1);
      break;
    case MESSAGE_TYPE.UNEXPECTED_ERROR: {
      // Only navigate back if on /loading — otherwise just show the error dialog.
      // currentLocationRef is updated synchronously on every render via setLocationRef,
      // so it's always accurate (unlike useEffect-based tracking).
      if (currentLocationRef.pathname === '/loading') {
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
