import RunebaseChromeController from '.';
import IController from './iController';
import { MESSAGE_TYPE, RESPONSE_TYPE, RUNEBASECHROME_ACCOUNT_CHANGE } from '../../constants';
import { addMessageListener, addConnectListener, isExtensionEnvironment, sendMessage, setStorageValue, getStorageValue } from '../../popup/abstraction';

export default class SessionController extends IController {
  public sessionTimeout?: any = undefined;

  private sessionLogoutInterval: number = 600000; // in ms

  constructor(main: RunebaseChromeController) {
    super('session', main);
    getStorageValue('sessionLogoutInterval').then((sessionLogoutInterval) => {
      if (sessionLogoutInterval) {
        this.sessionLogoutInterval = sessionLogoutInterval;
      }
    });

    addMessageListener(this.handleMessage);
    addConnectListener({
      onMessage: this.onPopupOpened,
      onDisconnect: this.onPopupClosed,
    });

    this.initFinished();
  }

  /*
  * Clears all the intervals throughout the app.
  */
  public clearAllIntervals = () => {
    this.main.account.stopPolling();
    this.clearAllIntervalsExceptAccount();
  };

  /*
  * Closes the current session and resets all the necessary session values.
  */
  public clearSession = () => {
    this.main.account.resetAccount();
    this.main.token.resetTokenList();
    this.main.inpageAccount.sendInpageAccountAllPorts(RUNEBASECHROME_ACCOUNT_CHANGE.LOGOUT);
    sendMessage({
      type: MESSAGE_TYPE.CLEARED_SESSION_RETURN,
    });
  };

  private clearAllIntervalsExceptAccount = () => {
    this.main.token.stopPolling();
    this.main.external.stopPolling();
    this.main.transaction.stopPolling();
  };

  /*
  * Actions taken when the popup is opened.
  */
  private onPopupOpened = () => {
    // If port is reconnected (user reopened the popup), clear sessionTimeout
    const inExtensionEnvironment = isExtensionEnvironment();
    if (inExtensionEnvironment) clearTimeout(this.sessionTimeout);
  };

  /*
  * Actions taken when the popup is closed..
  */
  private onPopupClosed = () => {
    this.clearAllIntervalsExceptAccount();

    // Logout from bgp after interval
    this.setSessionTimeOut();
  };

  private setSessionTimeOut = () => {
    try {
      this.sessionTimeout = setTimeout(() => {
        this.clearSession();
        this.main.crypto.resetPasswordHash();
        console.log('Session cleared!');
      },  this.sessionLogoutInterval);
    } catch (error) {
      console.error('Error in setSessionTimeOut:', error);
    }
  };

  private handleMessage = async (
    request: any,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _?: chrome.runtime.MessageSender,
    sendResponse?: (response: any) => void,
  ) => {
    const inExtensionEnvironment = isExtensionEnvironment();
    const requestData = inExtensionEnvironment ? request : request.data;

    try {
      switch (requestData.type) {
      case MESSAGE_TYPE.REFRESH_SESSION_TIMER:
        clearTimeout(this.sessionTimeout);
        this.setSessionTimeOut();
        break;
      case MESSAGE_TYPE.RESTORE_SESSION:
        if (this.main.account.loggedInAccount) {
          sendMessage({
            type: MESSAGE_TYPE.RESTORING_SESSION_RETURN,
            restoreSession: RESPONSE_TYPE.RESTORING_SESSION,
          });
          const isSessionRestore = true;
          this.main.account.onAccountLoggedIn(isSessionRestore);
        } else if (this.main.crypto.hasValidPasswordHash()) {
          sendMessage({
            type: MESSAGE_TYPE.RESTORING_SESSION_RETURN,
            restoreSession: RESPONSE_TYPE.RESTORING_SESSION,
          });
          this.main.account.routeToAccountPage();
        }
        break;
      case MESSAGE_TYPE.GET_SESSION_LOGOUT_INTERVAL:
        if (inExtensionEnvironment) {
          sendResponse?.(this.sessionLogoutInterval);
        } else {
          sendMessage({
            type: MESSAGE_TYPE.USE_CALLBACK,
            id: requestData.id,// include the messageId in the response for the identifying correct window to close
            result: this.sessionLogoutInterval,
          });
        }
        break;
      case MESSAGE_TYPE.SAVE_SESSION_LOGOUT_INTERVAL:
        setStorageValue('sessionLogoutInterval', requestData.value);
        this.sessionLogoutInterval = requestData.value;
        break;
      default:
        break;
      }
    } catch (err) {
      console.error(err);
      this.main.displayErrorOnPopup(err as any);
    }
  };
}
