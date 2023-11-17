import { every } from 'lodash';

import CryptoController from './cryptoController';
import TokenController from './tokenController';
import AccountController from './accountController';
import NetworkController from './networkController';
import ExternalController from './externalController';
import RPCController from './rpcController';
import InpageAccountController from './inpageAccountController';
import TransactionController from './transactionController';
import SessionController from './sessionController';
import OnInstallController from './onInstallController';
import { API_TYPE, MESSAGE_TYPE } from '../../constants';
import UtilsController from './utilsController';

export default class RunebaseChromeController {
  public crypto: CryptoController;
  public token: TokenController;
  public account: AccountController;
  public network: NetworkController;
  public external: ExternalController;
  public rpc: RPCController;
  public inpageAccount: InpageAccountController;
  public transaction: TransactionController;
  public session: SessionController;
  public onInstall: OnInstallController;
  public utils: UtilsController;

  private initialized: Record<string, boolean> = {};

  constructor() {
    this.crypto = new CryptoController(this);
    this.token = new TokenController(this);
    this.account = new AccountController(this);
    this.network = new NetworkController(this);
    this.external = new ExternalController(this);
    this.rpc = new RPCController(this);
    this.inpageAccount = new InpageAccountController(this);
    this.transaction = new TransactionController(this);
    this.session = new SessionController(this);
    this.onInstall = new OnInstallController(this);
    this.utils = new UtilsController(this);

    chrome.runtime.onMessage.addListener((msg) => {
      switch (msg.type) {
      case API_TYPE.OPEN_WALLET_EXTENSION:
        chrome.windows.create({
          url: 'chrome-extension://' + chrome.runtime.id + '/popup.html', // Replace with the correct path
          type: 'popup',    // Type of the window ('normal', 'popup', 'panel', or 'detached_panel')
          focused: true,    // Whether the new window should be focused
          incognito: false, // Whether the new window should be in incognito mode
          width: 350,       // Width of the window in pixels
          height: 650,      // Height of the window in pixels
          left: undefined,  // Left position of the window in pixels
          top: undefined,   // Top position of the window in pixels
          state: 'normal',  // Initial state of the window ('normal', 'minimized', 'maximized', or 'fullscreen')
          setSelfAsOpener: false, // Whether the new window should be opened with the current extension as the opener
          tabId: undefined, // The ID of the tab for which you want to adopt to the new window
          // Additional options as needed
        });
        break;
      }
    });
  }

  /*
  * Registers a controller.
  * @param name The name of the controller to be registered.
  */
  public registerController = (name: string) => {
    this.initialized[name] = false;
  };

  /*
  * Routes to the login page after all controllers are initialized.
  * @param name The name of the controller that was initialized.
  */
  public controllerInitialized = (name: string) => {
    this.initialized[name] = true;

    if (every(this.initialized)) {
      chrome.runtime.sendMessage({ type: MESSAGE_TYPE.ROUTE_LOGIN });
    }
  };

  public displayErrorOnPopup = (err: Error)  => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.UNEXPECTED_ERROR, error: err.message });
  };
}
