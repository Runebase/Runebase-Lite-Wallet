// background/controllers/accountController.ts
import { isEmpty, find, cloneDeep } from 'lodash';
import { Wallet as RunebaseWallet, RunebaseInfo } from 'runebasejs-wallet';
import assert from 'assert';
import { Buffer } from 'buffer';
import runebase from 'runebasejs-lib';
import RunebaseChromeController from '.';
import IController from './iController';
import { MESSAGE_TYPE, STORAGE, NETWORK_NAMES, RUNEBASECHROME_ACCOUNT_CHANGE } from '../../constants';
import Account from '../../models/Account';
import Wallet from '../../models/Wallet';
import { TRANSACTION_SPEED, DELEGATION_CONTRACT_ADDRESS } from '../../constants';
import Transaction from '../../models/Transaction';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { PodReturnResult } from '../../types';
import { generateRequestId, parseJsonOrFallback } from '../../utils';
import abi from 'ethjs-abi';
import { addMessageListener, getMultipleStorageValues, isExtensionEnvironment, sendMessage, setStorageValue } from '../../popup/abstraction';
globalThis.Buffer = Buffer;

const INIT_VALUES = {
  mainnetAccounts: [],
  testnetAccounts: [],
  regtestAccounts: [],
  loggedInAccount: undefined,
  getWalletInfoInterval: undefined,
  getBlockchainInfoInterval: undefined,
  blockchainInfo: undefined,
};

export default class AccountController extends IController {
  private static SCRYPT_PARAMS_PRIV_KEY: any = { N: 8192, r: 8, p: 1 };
  private static GET_WALLET_INFO_INTERVAL_MS: number = 30000;
  private static GET_BLOCKCHAIN_INFO_INTERVAL_MS: number = 120000;

  public get accounts(): Account[] {
    if (this.main.network.networkName === NETWORK_NAMES.MAINNET) {
      return this.mainnetAccounts;
    } else if (this.main.network.networkName === NETWORK_NAMES.TESTNET) {
      return this.testnetAccounts;
    }
    return this.regtestAccounts;
  }

  public get hasAccounts(): boolean {
    return !isEmpty(this.mainnetAccounts) || !isEmpty(this.testnetAccounts) || !isEmpty(this.regtestAccounts);
  }
  public loggedInAccount?: Account = INIT_VALUES.loggedInAccount;
  public blockchainInfo?: RunebaseInfo.IGetBlockchainInfo = INIT_VALUES.blockchainInfo;

  private mainnetAccounts: Account[] = INIT_VALUES.mainnetAccounts;
  private testnetAccounts: Account[] = INIT_VALUES.testnetAccounts;
  private regtestAccounts: Account[] = INIT_VALUES.regtestAccounts;
  private getWalletInfoInterval?: any = INIT_VALUES.getWalletInfoInterval;
  private getBlockchainInfoInterval?: any = INIT_VALUES.getBlockchainInfoInterval;

  constructor(main: RunebaseChromeController) {
    super('account', main);
    // addMessageListener(this.handleMessage.bind(this)); // Add this line
    addMessageListener(this.handleMessage);

    const { MAINNET_ACCOUNTS, TESTNET_ACCOUNTS, REGTEST_ACCOUNTS } = STORAGE;
    const keys = [MAINNET_ACCOUNTS, TESTNET_ACCOUNTS, REGTEST_ACCOUNTS];

    getMultipleStorageValues(keys).then(({ mainnetAccounts, testnetAccounts, regtestAccounts }) => {
      if (!isEmpty(mainnetAccounts)) {
        this.mainnetAccounts = mainnetAccounts;
      }

      if (!isEmpty(testnetAccounts)) {
        this.testnetAccounts = testnetAccounts;
      }

      if (!isEmpty(regtestAccounts)) {
        this.regtestAccounts = regtestAccounts;
      }

      this.initFinished();
    });
  }

  /*
  * Checks if the wallet name has been taken by another account.
  * @param name The wallet name to check.
  * @return If the wallet name has been already taken.
  */
  public isWalletNameTaken = (name: string): boolean => {
    return !!find(this.accounts, { name });
  };

  /*
  * Resets the account vars back to initial state.
  */
  public resetAccount = () => {
    this.loggedInAccount = INIT_VALUES.loggedInAccount;
  };

  /*
  * Initial login with the master password and routing to the correct account login page.
  */
  public login = async (
    password: string,
    algorithm: string,
  ) => {
    this.main.crypto.generateAppSaltIfNecessary();
    this.main.crypto.derivePasswordHash(password, algorithm);
  };

  public finishLogin = async () => {
    if (!this.hasAccounts) {
      console.log('finished login');
      // New user. No created wallets yet. No need to validate.
      this.routeToAccountPage();
      return;
    }

    const isPwValid = await this.validatePassword();
    if (isPwValid) {
      this.routeToAccountPage();
      return;
    }

    sendMessage({
      type: MESSAGE_TYPE.LOGIN_FAILURE,
    }, () => {});
  };

  /*
  * Creates an account, stores it, and logs in.
  * @param accountName The account name for the new wallet account.
  * @param mnemonic The mnemonic to derive the wallet from.
  */
  public addAccountAndLogin = async (
    accountName: string,
    privateKeyHash: string,
    wallet: RunebaseWallet
  ) => {
    this.loggedInAccount = new Account(accountName, privateKeyHash);
    this.loggedInAccount.wallet = new Wallet(wallet);

    // Prune the wallet object before storing it
    const prunedAcct = cloneDeep(this.loggedInAccount);
    prunedAcct.wallet = undefined;

    let storageKey;
    if (this.main.network.networkName === NETWORK_NAMES.MAINNET) {
      storageKey = STORAGE.MAINNET_ACCOUNTS;
    } else if (this.main.network.networkName === NETWORK_NAMES.TESTNET) {
      storageKey = STORAGE.TESTNET_ACCOUNTS;
    } else {
      storageKey = STORAGE.REGTEST_ACCOUNTS;
    }

    // Add account to storage
    this.accounts.push(prunedAcct);
    await setStorageValue(storageKey, this.accounts);

    await this.onAccountLoggedIn();
  };

  /*
  * Imports a new wallet from mnemonic.
  * @param accountName The account name for the new wallet account.
  * @param mnemonic The mnemonic to derive the wallet from.
  */
  public importMnemonic = async (accountName: string, mnemonic: string) => {
    // Non-empty mnemonic is already validated in the popup ui
    assert(mnemonic, 'invalid mnemonic');

    const network = this.main.network.network;
    const wallet = await network.fromMnemonic(mnemonic);
    const privateKeyHash = this.getPrivateKeyHash(wallet);

    // Validate that we don't already have the wallet in our accountList
    const exists = await this.walletAlreadyExists(privateKeyHash);
    if (exists) {
      sendMessage({
        type: MESSAGE_TYPE.IMPORT_MNEMONIC_PRKEY_FAILURE
      }, () => {});
      return;
    }

    await this.addAccountAndLogin(accountName, privateKeyHash, wallet);
  };

  /*
  * Imports a new wallet from private key.
  * @param accountName The account name for the new wallet account.
  * @param privateKey The private key to derive the wallet from.
  */
  public importPrivateKey = async (
    accountName: string,
    privateKey: string
  ) => {
    // Non-empty privateKey is already validated in the popup ui
    assert(privateKey, 'invalid privateKey');

    // recover wallet and privateKeyHash
    const network = this.main.network.network;
    const wallet = await network.fromWIF(privateKey);
    const privateKeyHash = this.getPrivateKeyHash(wallet);

    // validate that we don't already have the wallet in our accountList accountList
    const exists = await this.walletAlreadyExists(privateKeyHash);
    if (exists) {
      sendMessage({
        type: MESSAGE_TYPE.IMPORT_MNEMONIC_PRKEY_FAILURE,
      }, () => {});
      return;
    }

    console.log('importPrivateKey');

    await this.addAccountAndLogin(accountName, privateKeyHash, wallet);
  };

  public saveToFile = (accountName: string, mnemonic: string) => {
    const timestamp = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const filename = `runebasechrome_${accountName}_${timestamp}.bak`;

    sendMessage({
      type: MESSAGE_TYPE.SAVE_SEED_TO_FILE_RETURN,
      filename,
      content: mnemonic,
    });
  };

  public loginAccount = async (accountName: string) => {
    console.warn('Logging in!');
    const account = find(this.accounts, { name: accountName });
    this.loggedInAccount = cloneDeep(account);

    if (!this.loggedInAccount) {
      console.error('Logged in account is undefined');
      throw Error('Account should not be undefined');
    }

    try {
      console.log('Attempting to recover wallet from private key hash');
      const wallet = this.recoverFromPrivateKeyHash(this.loggedInAccount.privateKeyHash);
      this.loggedInAccount.wallet = new Wallet(wallet);

      console.log('Login successful. Performing actions after login...');
      await this.onAccountLoggedIn();
    } catch (err) {
      console.error('Error during login:', err);
      this.resetAccount();
      throw err;
    }
  };

  public logoutAccount = () => {
    this.main.session.clearAllIntervals();
    this.main.session.clearSession();
    this.routeToAccountPage();
  };

  /*
  * Routes to the CreateWallet or AccountLogin page after unlocking with the password.
  */
  public routeToAccountPage = () => {
    if (isEmpty(this.accounts)) {
      // Accounts not found, route to Create Wallet page
      sendMessage({
        type: MESSAGE_TYPE.LOGIN_SUCCESS_NO_ACCOUNTS,
      }, () => {});
    } else {
      console.log('LOGIN_SUCCESS_WITH_ACCOUNTS');
      // Accounts found, route to Account Login page
      sendMessage({
        type: MESSAGE_TYPE.LOGIN_SUCCESS_WITH_ACCOUNTS,
      }, () => {});
    }
  };

  /*
  * Actions after adding a new account or logging into an existing account.
  */
  public onAccountLoggedIn = async (isSessionRestore = false) => {
    this.main.token.initTokenList();

    /**
     * We set sendInpageUpdate to false because we are already calling
     * inpageAccount.sendInpageAccountAllPorts() with a LOGIN message below, and we don't
     * want to call it a second time for the accountBalance update in getWalletInfo.
     */
    const sendInpageUpdate = false;
    await this.getWalletInfo(sendInpageUpdate);
    await this.getBlockchainInfo();
    await this.startPolling();
    await this.main.token.startPolling();
    await this.main.external.startPolling();

    /**
     * If we are restoring the session, i.e. the user is already logged in and is only
     * reopening the popup, we don't need to send the SEND_INPAGE_RUNEBASECHROME_ACCOUNT_VALUES event to
     * the inpage because window.runebasechrome.account has not changed.
     */
    if (!isSessionRestore) {
      this.main.inpageAccount.sendInpageAccountAllPorts(RUNEBASECHROME_ACCOUNT_CHANGE.LOGIN);
    }
    sendMessage({
      type: MESSAGE_TYPE.ACCOUNT_LOGIN_SUCCESS,
    }, () => {});
  };

  /*
  * Stops polling for the periodic info updates.
  */
  public stopPolling = () => {
    if (this.getWalletInfoInterval) {
      clearInterval(this.getWalletInfoInterval);
      this.getWalletInfoInterval = undefined;
    }
    if (this.getBlockchainInfoInterval) {
      clearInterval(this.getBlockchainInfoInterval);
      this.getBlockchainInfoInterval = undefined;
    }
  };

  /*
  * Recovers the wallet instance from an encrypted private key.
  * @param privateKeyHash The private key hash to recover the wallet from.
  */
  private recoverFromPrivateKeyHash(privateKeyHash: string): RunebaseWallet {
    assert(privateKeyHash, 'invalid privateKeyHash');

    const network = this.main.network.network;
    return network.fromEncryptedPrivateKey(
      privateKeyHash,
      this.main.crypto.validPasswordHash,
      AccountController.SCRYPT_PARAMS_PRIV_KEY,
    );
  }

  private getPrivateKeyHash(wallet: RunebaseWallet) {
    return wallet.toEncryptedPrivateKey(
      this.main.crypto.validPasswordHash,
      AccountController.SCRYPT_PARAMS_PRIV_KEY,
    );
  }

  /*
  * Validates a password by decrypting a private key hash into a wallet instance.
  * @return Is the password valid.
  */
  private validatePassword = async (): Promise<boolean> => {
    let account: Account;
    if (!isEmpty(this.mainnetAccounts)) {
      account = this.mainnetAccounts[0];
    } else if (!isEmpty(this.testnetAccounts)) {
      account = this.testnetAccounts[0];
    } else if (!isEmpty(this.regtestAccounts)) {
      account = this.regtestAccounts[0];
    } else {
      console.error('No accounts found when trying to validate password');
      throw Error('Trying to validate password without existing account');
    }

    try {
      console.log('Attempting to recover wallet from private key hash');
      this.recoverFromPrivateKeyHash(account.privateKeyHash);
      console.log('Password validation successful');
      return true;
    } catch (err) {
      console.error('Error validating password:', err);
      /*
      * If the user provides an invalid password, privateKeyHash will be invalid,
      * and recoverFromPrivateKeyHash will throw an error. In this case, it is not
      * an unexpected error for us, so we don't do anything with the error.
      */
    }
    console.log('Password validation failed');
    return false;
  };

  /*
  * Checks if a wallet is already in the mainnet or testnet accounts list.
  * @param privateKeyHash Unique and deterministic for each wallet.
  * @return does the wallet already exist.
  */
  private walletAlreadyExists = async (privateKeyHash: string): Promise<boolean> => {
    return !!find(this.accounts, { privateKeyHash });
  };

  /*
  * Fetches the wallet info from the current wallet instance.
  */
  private getWalletInfo = async (sendInpageUpdate = true) => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet || !this.loggedInAccount.wallet.rjsWallet) {
      console.error('Could not get wallet info.');
      return;
    }

    const infoDidUpdate = await this.loggedInAccount.wallet.updateInfo();
    if (infoDidUpdate) {
      sendMessage({
        type: MESSAGE_TYPE.GET_WALLET_INFO_RETURN,
        info: this.loggedInAccount.wallet.info,
      }, () => {});
      if (sendInpageUpdate) {
        this.main.inpageAccount.sendInpageAccountAllPorts(RUNEBASECHROME_ACCOUNT_CHANGE.BALANCE_CHANGE);
      }

      this.updateAndSendMaxRunebaseAmountToPopup();
    }
  };

  private getDelegationInfo = async () => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet || !this.loggedInAccount.wallet.rjsWallet) {
      console.error('Could not get wallet info.');
      return;
    }
    const delegationInfo = await this.loggedInAccount.wallet.getDelegationInfoForAddress();
    if (delegationInfo) {
      sendMessage({
        type: MESSAGE_TYPE.GET_DELEGATION_INFO_RETURN,
        delegationInfo,
      }, () => {});
    }
  };

  private getSuperstakerDelegations = async (address: string) => {
    try {
      if (!this.loggedInAccount || !this.loggedInAccount.wallet || !this.loggedInAccount.wallet.rjsWallet) {
        console.error('Could not get wallet info.');
        return;
      }

      const superstakerDelegations = await this.loggedInAccount.wallet.rjsWallet.getSuperStakerDelegations(address);
      if (superstakerDelegations) {
        sendMessage({
          type: MESSAGE_TYPE.GET_SUPERSTAKER_DELEGATIONS_RETURN,
          superstakerDelegations,
        }, () => {});
      }
    } catch (error) {
      console.error('Error fetching superstaker delegations:', error);
    }
  };


  /*
  * Fetches the blockchain info from the current wallet instance.
  */
  private getBlockchainInfo = async () => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet || !this.loggedInAccount.wallet.rjsWallet) {
      console.error('Could not get wallet info.');
      return;
    }
    const blockchainInfo = await this.loggedInAccount.wallet.getBlockchainInfo();
    console.log('getblockchainInfo: ', blockchainInfo);
    if (blockchainInfo) {
      this.blockchainInfo = blockchainInfo;
      sendMessage({
        type: MESSAGE_TYPE.GET_BLOCKCHAIN_INFO_RETURN,
        blockchainInfo: this.blockchainInfo,
      }, () => {});
    }
  };

  /*
  * Starts polling for periodic info updates.
  */
  private startPolling = async () => {
    if (!this.getWalletInfoInterval) {
      this.getWalletInfoInterval = setInterval(() => {
        this.getWalletInfo();
      }, AccountController.GET_WALLET_INFO_INTERVAL_MS);
    }
    if (!this.getBlockchainInfoInterval) {
      this.getBlockchainInfoInterval = setInterval(() => {
        this.getBlockchainInfo();
      }, AccountController.GET_BLOCKCHAIN_INFO_INTERVAL_MS);
    }
  };

  /*
  * Executes a sendtoaddress.
  * @param receiverAddress The address to send Runebase to.
  * @param amount The amount to send.
  */
  private sendTokens = async (receiverAddress: string, amount: number, transactionSpeed: TRANSACTION_SPEED) => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet || !this.loggedInAccount.wallet.rjsWallet) {
      throw Error('Cannot send with no wallet instance.');
    }

    /*
    * TODO - As of 9/21/18 there is no congestion in the network and we are under
    * capacity, so we are setting the same base fee rate for all transaction speeds.
    * In the future if traffic changes, we will set different fee rates.
    */
    try {
      const rates = {
        [TRANSACTION_SPEED.FAST]: 500,
        [TRANSACTION_SPEED.NORMAL]: 500,
        [TRANSACTION_SPEED.SLOW]: 500,
      };
      const feeRate = rates[transactionSpeed]; // satoshi/byte; 500 satoshi/byte == .005 RUNEBASE/KB
      if (!feeRate) {
        throw Error('feeRate not set');
      }

      const transaction = await this.loggedInAccount.wallet.send(receiverAddress, amount, {feeRate});
      const newTransaction = new Transaction({
        id: transaction.txid,
        timestamp: moment().format('MM-DD-YYYY, HH:mm'), // Use current timestamp for the new transaction
        confirmations: 0, // Transaction is not confirmed initially
        amount: new BigNumber(amount).times(1e8).dp(0).toNumber(),
      });
      this.main.transaction.addTransaction(newTransaction);
      sendMessage({
        type: MESSAGE_TYPE.SEND_TOKENS_SUCCESS,
      }, () => {});
    } catch (err) {
      sendMessage({
        type: MESSAGE_TYPE.SEND_TOKENS_FAILURE,
        error: err,
      }, () => {});
      throw (err);
    }
  };

  /**
   * We update the maxRunebase amount under 2 scenarios
   * 1 - When wallet.info has been updated because a new balance has a new maxRunebaseSend
   * 2 - Whenever the maxRunebaseSend is requested, because even if the balance does not
   * change, the available UTXOs can change(which causes a change in maxRunebaseSend).
   * For instance when a user sends Runebase, but that transaction has not confirmed yet,
   * the balance will not change, but calcMaxRunebaseSend is able to account for those
   * unconfirmed UTXOs and update maxRunebaseSend accordingly.
   */
  private updateAndSendMaxRunebaseAmountToPopup = async () => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet || !this.loggedInAccount.wallet.rjsWallet) {
      throw Error('Cannot calculate max balance with no wallet instance.');
    }

    const calcMQSPr = this.loggedInAccount.wallet.calcMaxRunebaseSend(this.main.network.networkName);
    calcMQSPr.then(() => {
      const maxRunebaseAmount = this.loggedInAccount?.wallet?.maxRunebaseSend;
      sendMessage({
        type: MESSAGE_TYPE.GET_MAX_RUNEBASE_SEND_RETURN,
        maxRunebaseAmount,
      }, () => {});
    });
  };

  private sendDelegationConfirm = async (
    signedPoD: PodReturnResult,
    fee: number,
    gasLimit: number,
    gasPrice: number
  ) => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet || !this.loggedInAccount.wallet.rjsWallet) {
      throw Error('Cannot send with no wallet instance.');
    }
    const hexAddress = runebase.address.fromBase58Check(signedPoD.superStakerAddress).hash.toString('hex');
    const params = [`0x${hexAddress}`, fee, signedPoD.podMessage];
    const encodedData = abi.encodeMethod({
      name: 'addDelegation',
      inputs: [
        { name: 'staker', type: 'address' },
        { name: 'fee', type: 'uint8' },
        { name: 'PoD', type: 'bytes' },
      ],
    }, params).substr(2);

    const args = [
      DELEGATION_CONTRACT_ADDRESS,
      encodedData,
      null,
      gasLimit,
      gasPrice
    ];

    const requestId = generateRequestId();
    const response = await this.main.rpc.sendToContract(requestId, args);
    const { error, result } = response as { error: any, result: RunebaseInfo.ISendRawTxResult };
    const newTransaction = new Transaction({
      id: result && result.txid ? result.txid : undefined,
      timestamp: moment().format('MM-DD-YYYY, HH:mm'),
      confirmations: 0,
      amount: new BigNumber(gasLimit).times(new BigNumber(gasPrice).times(1e8)).dp(0).toNumber(),
      qrc20TokenTransfers: []
    });
    this.main.transaction.addTransaction(newTransaction);

    if (error) {
      console.error('Error sendDelegationConfirm:', error);
      sendMessage({
        type: MESSAGE_TYPE.SEND_DELEGATION_CONFIRM_FAILURE,
        error,
      }, () => {});
      return;
    }

    console.log('sendDelegationConfirm sent successfully!');
    sendMessage({
      type: MESSAGE_TYPE.SEND_DELEGATION_CONFIRM_SUCCESS,
    }, () => {});
  };

  private sendRemoveDelegationConfirm = async (
    gasLimit: number,
    gasPrice: number
  ) => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet || !this.loggedInAccount.wallet.rjsWallet) {
      throw Error('Cannot send with no wallet instance.');
    }
    const encodedData = abi.encodeMethod({ name: 'removeDelegation', inputs: [] }, []).substr(2);
    const args = [
      DELEGATION_CONTRACT_ADDRESS,
      encodedData,
      null,
      gasLimit,
      gasPrice
    ];

    const requestId = generateRequestId();
    const response = await this.main.rpc.sendToContract(requestId, args);
    const { error, result } = response as { error: any, result: RunebaseInfo.ISendRawTxResult };
    const newTransaction = new Transaction({
      id: result && result.txid ? result.txid : undefined,
      timestamp: moment().format('MM-DD-YYYY, HH:mm'),
      confirmations: 0,
      amount: new BigNumber(gasLimit).times(new BigNumber(gasPrice).times(1e8)).dp(0).toNumber(),
      qrc20TokenTransfers: []
    });
    this.main.transaction.addTransaction(newTransaction);

    if (error) {
      console.error('Error sendRemoveDelegationConfirm:', error);
      sendMessage({
        type: MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM_FAILURE,
        error,
      }, () => {});
      return;
    }

    console.log('sendRemoveDelegationConfirm sent successfully!');
    sendMessage({
      type: MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM_SUCCESS,
    }, () => {});
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
      case MESSAGE_TYPE.LOGIN:
        console.log(`Logging in with password: ${requestData.password}`);
        this.login(requestData.password, requestData.algorithm);
        break;
      case MESSAGE_TYPE.IMPORT_MNEMONIC:
        console.log(`Importing mnemonic: ${requestData.accountName}, ${requestData.mnemonicPrivateKey}`);
        await this.importMnemonic(requestData.accountName, requestData.mnemonicPrivateKey);
        break;
      case MESSAGE_TYPE.IMPORT_PRIVATE_KEY:
        console.log(`Importing private key: ${requestData.accountName}, ${requestData.mnemonicPrivateKey}`);
        await this.importPrivateKey(requestData.accountName, requestData.mnemonicPrivateKey);
        break;
      case MESSAGE_TYPE.SAVE_TO_FILE:
        console.log(`Saving to file: ${requestData.accountName}, ${requestData.mnemonicPrivateKey}`);
        this.saveToFile(requestData.accountName, requestData.mnemonicPrivateKey);
        break;
      case MESSAGE_TYPE.ACCOUNT_LOGIN:
        console.log(`Logging into account: ${requestData.selectedWalletName}`);
        await this.loginAccount(requestData.selectedWalletName);
        break;
      case MESSAGE_TYPE.SEND_TOKENS:
        console.log(`Sending tokens: ${requestData.receiverAddress}, Amount: ${requestData.amount}, Speed: ${requestData.transactionSpeed}`);
        this.sendTokens(requestData.receiverAddress, requestData.amount, requestData.transactionSpeed);
        break;
      case MESSAGE_TYPE.SEND_DELEGATION_CONFIRM:
        console.log(`sendDelegationConfirm: ${JSON.stringify(request)}`);
        this.sendDelegationConfirm(
          parseJsonOrFallback(requestData.signedPoD),
          requestData.fee,
          requestData.gasLimit,
          requestData.gasPrice
        );
        break;
      case MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM:
        console.log(`sendRemoveDelegationConfirm: ${JSON.stringify(request)}`);
        this.sendRemoveDelegationConfirm(requestData.gasLimit, requestData.gasPrice);
        break;
      case MESSAGE_TYPE.LOGOUT:
        console.log('Logging out');
        this.logoutAccount();
        break;
      case MESSAGE_TYPE.HAS_ACCOUNTS:
        console.log('Checking if accounts exist');
        console.log(this.accounts);
        sendMessage({
          type: MESSAGE_TYPE.HAS_ACCOUNTS_RETURN,
          hasAccounts: this.hasAccounts,
        });
        break;
      case MESSAGE_TYPE.GET_ACCOUNTS:
        console.log('Getting accounts');
        console.log(this.accounts);
        sendMessage({
          type: MESSAGE_TYPE.GET_ACCOUNTS_RETURN,
          accounts: this.accounts,
        });
        break;
      case MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT:
        console.log('Getting logged-in account');
        if (isExtensionEnvironment()) {
          sendResponse?.(this.loggedInAccount && this.loggedInAccount.wallet && this.loggedInAccount.wallet.info
            ? { name: this.loggedInAccount.name, address: this.loggedInAccount!.wallet!.info!.address }
            : undefined);
        }
        break;
      case MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME:
        console.log('Getting logged-in account name');
        sendMessage({
          type: MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME_RETURN,
          accountName: this.loggedInAccount ? this.loggedInAccount.name : undefined,
        });
        break;
      case MESSAGE_TYPE.GET_BLOCKCHAIN_INFO:
        console.log('Getting blockchain info');
        sendMessage({
          type: MESSAGE_TYPE.GET_BLOCKCHAIN_INFO_RETURN,
          blockchainInfo: this.blockchainInfo ? this.blockchainInfo : undefined,
        });
        break;
      case MESSAGE_TYPE.GET_WALLET_INFO:
        console.log('Getting wallet info');
        sendMessage({
          type: MESSAGE_TYPE.GET_WALLET_INFO_RETURN,
          info: this.loggedInAccount && this.loggedInAccount.wallet
            ? this.loggedInAccount.wallet.info : undefined,
        });
        break;
      case MESSAGE_TYPE.GET_DELEGATION_INFO:
        console.log('Getting wallet delegation info');
        this.getDelegationInfo();
        break;
      case MESSAGE_TYPE.GET_SUPERSTAKER_DELEGATIONS:
        this.getSuperstakerDelegations(requestData.address);
        break;
      case MESSAGE_TYPE.GET_RUNEBASE_USD:
        console.log('Getting RUNEBASE to USD conversion');
        sendMessage({
          type: MESSAGE_TYPE.GET_RUNEBASE_USD_RETURN,
          runebaseUSD: this.loggedInAccount && this.loggedInAccount.wallet
            ? this.loggedInAccount.wallet.runebaseUSD : undefined,
        });
        break;
      case MESSAGE_TYPE.VALIDATE_WALLET_NAME:
        console.log(`Validating wallet name: ${requestData.name}`);
        if (inExtensionEnvironment) {
          sendResponse?.(this.isWalletNameTaken(requestData.name));
        } else {
          sendMessage({
            type: MESSAGE_TYPE.USE_CALLBACK,
            id: requestData.id,// include the messageId in the response for the identifying correct window to close
            result: this.isWalletNameTaken(requestData.name),
          });
        }
        break;
      case MESSAGE_TYPE.GET_MAX_RUNEBASE_SEND:
        console.log('Getting max RUNEBASE send amount');
        this.updateAndSendMaxRunebaseAmountToPopup();
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
