// background/controllers/accountController.ts
import { isEmpty, find, cloneDeep } from 'lodash';
import assert from 'assert';
import { Buffer } from 'buffer';
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
import {
  fromMnemonic,
  fromWIF,
  fromEncryptedPrivateKey,
  toEncryptedPrivateKey,
  addressToHash160,
  hash160ToAddress,
  WalletKeyPair,
} from '../../services/wallet';
import { IBlockchainInfo, ISendRawTxResult } from '../../services/wallet/types';
globalThis.Buffer = Buffer;

/**
 * Convert raw blockchain error messages into user-friendly descriptions.
 */
function formatTxError(raw: string): string {
  if (raw.includes('premature-spend-of-coinbase') || raw.includes('bad-txns-premature-spend')) {
    return 'Your available balance consists of immature staking rewards that cannot be spent yet. Please wait for them to mature (~2000 confirmations) before delegating.';
  }
  if (raw.includes('insufficient') || raw.includes('Insufficient')) {
    return 'Insufficient funds to cover the gas cost of this transaction.';
  }
  if (raw.includes('Missing inputs') || raw.includes('missing-inputs')) {
    return 'Transaction inputs are no longer available. Please try again.';
  }
  if (raw.includes('txn-mempool-conflict')) {
    return 'A conflicting transaction is already pending. Please wait for it to confirm.';
  }
  return raw;
}

const INIT_VALUES = {
  mainnetAccounts: [],
  testnetAccounts: [],
  regtestAccounts: [],
  loggedInAccount: undefined,
  getWalletInfoInterval: undefined,
  getBlockchainInfoInterval: undefined,
  getDelegationInfoInterval: undefined,
  delegationConfirmPollInterval: undefined,
  blockchainInfo: undefined,
};

export default class AccountController extends IController {
  private static SCRYPT_PARAMS_PRIV_KEY: any = { N: 8192, r: 8, p: 1 };
  private static GET_WALLET_INFO_INTERVAL_MS: number = 30000;
  private static GET_BLOCKCHAIN_INFO_INTERVAL_MS: number = 120000;
  private static GET_DELEGATION_INFO_INTERVAL_MS: number = 120000;
  private static DELEGATION_CONFIRM_POLL_MS: number = 15000;
  private static DELEGATION_CONFIRM_POLL_MAX: number = 8;

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
  public blockchainInfo?: IBlockchainInfo = INIT_VALUES.blockchainInfo;

  private mainnetAccounts: Account[] = INIT_VALUES.mainnetAccounts;
  private testnetAccounts: Account[] = INIT_VALUES.testnetAccounts;
  private regtestAccounts: Account[] = INIT_VALUES.regtestAccounts;
  private getWalletInfoInterval?: any = INIT_VALUES.getWalletInfoInterval;
  private getBlockchainInfoInterval?: any = INIT_VALUES.getBlockchainInfoInterval;
  private getDelegationInfoInterval?: any = INIT_VALUES.getDelegationInfoInterval;
  private delegationConfirmPollInterval?: any = INIT_VALUES.delegationConfirmPollInterval;
  private delegationConfirmPollCount: number = 0;

  constructor(main: RunebaseChromeController) {
    super('account', main);
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

  public isWalletNameTaken = (name: string): boolean => {
    return !!find(this.accounts, { name });
  };

  public resetAccount = () => {
    this.loggedInAccount = INIT_VALUES.loggedInAccount;
  };

  public login = async (
    password: string,
    algorithm: string,
  ) => {
    await this.main.crypto.generateAppSaltIfNecessary();
    await this.main.crypto.derivePasswordHash(password, algorithm, true);
  };

  public finishLogin = async () => {
    if (!this.hasAccounts) {
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
    });
  };

  public requestWalletBackupInfo = async (
    password: string,
    algorithm: string,
  ) => {
    await this.main.crypto.generateAppSaltIfNecessary();
    await this.main.crypto.derivePasswordHash(
      password,
      algorithm,
      false,
    );
    const isPwValid = await this.validatePassword();
    if (isPwValid) {
      sendMessage({
        address: this.loggedInAccount?.wallet?.address,
        privateKey: this.loggedInAccount?.wallet?.keyPair?.toWIF(),
        type: MESSAGE_TYPE.REQUEST_BACKUP_WALLET_INFO_RETURN,
      });
    } else {
      sendMessage({
        type: MESSAGE_TYPE.LOGIN_FAILURE,
      });
    }
  };

  public addAccountAndLogin = async (
    accountName: string,
    privateKeyHash: string,
    walletKeyPair: WalletKeyPair
  ) => {
    this.loggedInAccount = new Account(accountName, privateKeyHash);
    this.loggedInAccount.wallet = new Wallet(walletKeyPair);

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

  public importMnemonic = async (accountName: string, mnemonic: string) => {
    assert(mnemonic, 'invalid mnemonic');

    const network = this.main.network.runebaseNetwork;
    const walletKeyPair = fromMnemonic(mnemonic, network);
    const privateKeyHash = this.getPrivateKeyHash(walletKeyPair);

    const exists = await this.walletAlreadyExists(privateKeyHash);
    if (exists) {
      sendMessage({
        type: MESSAGE_TYPE.IMPORT_MNEMONIC_PRKEY_FAILURE
      });
      return;
    }

    await this.addAccountAndLogin(accountName, privateKeyHash, walletKeyPair);
  };

  public importPrivateKey = async (
    accountName: string,
    privateKey: string
  ) => {
    assert(privateKey, 'invalid privateKey');

    const network = this.main.network.runebaseNetwork;
    const walletKeyPair = fromWIF(privateKey, network);
    const privateKeyHash = this.getPrivateKeyHash(walletKeyPair);

    const exists = await this.walletAlreadyExists(privateKeyHash);
    if (exists) {
      sendMessage({
        type: MESSAGE_TYPE.IMPORT_MNEMONIC_PRKEY_FAILURE,
      });
      return;
    }

    await this.addAccountAndLogin(accountName, privateKeyHash, walletKeyPair);
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
    const account = find(this.accounts, { name: accountName });
    this.loggedInAccount = cloneDeep(account);

    if (!this.loggedInAccount) {
      console.error('Logged in account is undefined');
      throw Error('Account should not be undefined');
    }

    try {
      const walletKeyPair = this.recoverFromPrivateKeyHash(this.loggedInAccount.privateKeyHash);
      this.loggedInAccount.wallet = new Wallet(walletKeyPair);

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

  public routeToAccountPage = () => {
    if (isEmpty(this.accounts)) {
      sendMessage({
        type: MESSAGE_TYPE.LOGIN_SUCCESS_NO_ACCOUNTS,
      });
    } else {
      sendMessage({
        type: MESSAGE_TYPE.LOGIN_SUCCESS_WITH_ACCOUNTS,
      });
    }
  };

  public onAccountLoggedIn = async () => {
    // Clean up any existing polling/subscriptions before reinitializing
    // (handles switching accounts or importing a 2nd wallet without logout)
    this.stopPolling();
    this.main.token.stopPolling();
    this.main.external.stopPolling();

    // connectElectrumX() is safe to call repeatedly — it reuses an
    // existing connection if one is already alive or in progress.
    await this.main.network.connectElectrumX();

    this.main.token.initTokenList();

    const sendInpageUpdate = false;
    await this.getWalletInfo(sendInpageUpdate);
    await this.getBlockchainInfo();
    await this.setupSubscriptions();
    await this.startPolling();
    await this.main.token.startPolling();
    await this.main.external.startPolling();

    this.main.inpageAccount.sendInpageAccountAllPorts(RUNEBASECHROME_ACCOUNT_CHANGE.LOGIN);
    sendMessage({
      type: MESSAGE_TYPE.ACCOUNT_LOGIN_SUCCESS,
    });
  };

  public stopPolling = () => {
    if (this.getWalletInfoInterval) {
      clearInterval(this.getWalletInfoInterval);
      this.getWalletInfoInterval = undefined;
    }
    if (this.getBlockchainInfoInterval) {
      clearInterval(this.getBlockchainInfoInterval);
      this.getBlockchainInfoInterval = undefined;
    }
    if (this.getDelegationInfoInterval) {
      clearInterval(this.getDelegationInfoInterval);
      this.getDelegationInfoInterval = undefined;
    }
    this.stopDelegationConfirmPoll();
  };

  /**
   * Set up ElectrumX push subscriptions for real-time updates.
   * Subscriptions replace the need for frequent polling — the server
   * pushes notifications when the address balance or blockchain state changes.
   * Polling is kept as a fallback at longer intervals.
   */
  private setupSubscriptions = async () => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet) return;

    const electrumx = this.getElectrumX();
    const wallet = this.loggedInAccount.wallet;

    try {
      // Subscribe to address changes (balance/UTXO updates)
      await wallet.subscribeAddress(electrumx, () => {
        this.getWalletInfo();
        this.main.transaction.fetchFirst();
      });

      // Subscribe to new block headers
      await wallet.subscribeHeaders(electrumx, () => {
        this.getBlockchainInfo();
      });

      // Subscribe to token transfer events for each tracked token
      await this.main.token.setupTokenSubscriptions();

      // Subscribe to delegation contract events (AddDelegation / RemoveDelegation)
      await wallet.subscribeDelegationEvents(electrumx, () => {
        this.getDelegationInfo();
      });

    } catch (_err) {
      // subscriptions failed, relying on polling
    }
  };

  private recoverFromPrivateKeyHash(privateKeyHash: string): WalletKeyPair {
    assert(privateKeyHash, 'invalid privateKeyHash');

    const network = this.main.network.runebaseNetwork;
    return fromEncryptedPrivateKey(
      privateKeyHash,
      this.main.crypto.validPasswordHash,
      AccountController.SCRYPT_PARAMS_PRIV_KEY,
      network,
    );
  }

  private getPrivateKeyHash(walletKeyPair: WalletKeyPair) {
    return toEncryptedPrivateKey(
      walletKeyPair,
      this.main.crypto.validPasswordHash,
      AccountController.SCRYPT_PARAMS_PRIV_KEY,
    );
  }

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
      this.recoverFromPrivateKeyHash(account.privateKeyHash);
      return true;
    } catch (_err) {
      // password validation failed
    }
    return false;
  };

  private walletAlreadyExists = async (privateKeyHash: string): Promise<boolean> => {
    return !!find(this.accounts, { privateKeyHash });
  };

  private getElectrumX() {
    const electrumx = this.main.network.electrumx;
    if (!electrumx) {
      throw new Error('ElectrumX not connected');
    }
    return electrumx;
  }

  private getWalletInfo = async (sendInpageUpdate = true) => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet) {
      console.error('Could not get wallet info.');
      return;
    }

    const electrumx = this.getElectrumX();
    const explorerApiUrl = this.main.network.network.explorerApiUrl;
    const infoDidUpdate = await this.loggedInAccount.wallet.updateInfo(electrumx, explorerApiUrl);
    if (infoDidUpdate) {
      sendMessage({
        type: MESSAGE_TYPE.GET_WALLET_INFO_RETURN,
        info: this.loggedInAccount.wallet.info,
      });
      if (sendInpageUpdate) {
        this.main.inpageAccount.sendInpageAccountAllPorts(RUNEBASECHROME_ACCOUNT_CHANGE.BALANCE_CHANGE);
      }

      this.updateAndSendMaxRunebaseAmountToPopup();
    }
  };

  /**
   * Query delegation info for the logged-in wallet via the delegation
   * precompile contract at address 0x86.
   *
   * Contract method: delegations(address) → (address staker, uint8 fee, uint256 blockHeight, bytes PoD)
   * Function selector: bffe3486
   */
  private getDelegationInfo = async () => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet) {
      console.error('Could not get delegation info.');
      return;
    }

    const electrumx = this.getElectrumX();
    try {
      const walletHash160 = addressToHash160(this.loggedInAccount.wallet.address);
      // delegations(address) selector = bffe3486, pad address to 64 hex chars
      const callData = `bffe3486${walletHash160.padStart(64, '0')}`;
      const result = await electrumx.contractCall(
        DELEGATION_CONTRACT_ADDRESS,
        callData,
        '',
      );

      const output = result?.executionResult?.output;
      if (!output || output === '0'.repeat(512) || result?.executionResult?.excepted !== 'None') {
        // No delegation found or contract call failed
        sendMessage({
          type: MESSAGE_TYPE.GET_DELEGATION_INFO_RETURN,
          delegationInfo: null,
        });
        return;
      }

      // Decode output: address (32 bytes) | uint8 fee (32 bytes) | uint256 blockHeight (32 bytes) | bytes PoD (offset + length + data)
      const stakerHash160 = output.substring(24, 64); // last 20 bytes of first 32-byte word
      const fee = parseInt(output.substring(64, 128), 16);
      const blockHeight = parseInt(output.substring(128, 192), 16);

      // PoD is dynamic bytes: offset at word 3 (192..256), then length + data
      const podOffset = parseInt(output.substring(192, 256), 16) * 2; // byte offset → hex offset
      const podLength = parseInt(output.substring(podOffset, podOffset + 64), 16);
      const pod = '0x' + output.substring(podOffset + 64, podOffset + 64 + podLength * 2);

      // A zero staker address means no delegation
      const isActive = stakerHash160 !== '0'.repeat(40);

      // Convert hash160 to base58 address for UI display
      const network = this.main.network.runebaseNetwork;
      const staker = isActive ? hash160ToAddress(stakerHash160, network) : '';

      const delegationInfo = isActive ? {
        staker,
        fee,
        blockHeight,
        PoD: pod,
      } : null;

      this.loggedInAccount.wallet.delegationInfo = delegationInfo ?? undefined;

      sendMessage({
        type: MESSAGE_TYPE.GET_DELEGATION_INFO_RETURN,
        delegationInfo,
      });
    } catch (err) {
      console.error('Error getting delegation info:', err);
      sendMessage({
        type: MESSAGE_TYPE.GET_DELEGATION_INFO_RETURN,
        delegationInfo: null,
      });
    }
  };

  /**
   * Check whether the wallet has enough mature UTXOs to pay for a delegation tx.
   * Returns maturity info so the UI can show progress toward spendability.
   */
  private getDelegationReadiness = async () => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet) {
      return;
    }

    const electrumx = this.getElectrumX();
    const STAKE_MATURITY = 2000;
    const DELEGATION_GAS_COST = 2500000 * 8000; // gasLimit * gasPrice in satoshis

    try {
      const currentHeight = this.blockchainInfo?.height || 0;
      const utxos = await this.loggedInAccount.wallet.getUtxos(electrumx, currentHeight);

      let matureBalance = 0;
      let immatureBalance = 0;
      let nearestMatureHeight: number | undefined;

      for (const utxo of utxos) {
        if (utxo.isStake && utxo.confirmations < STAKE_MATURITY) {
          immatureBalance += utxo.value;
          // Calculate when this UTXO will mature
          // utxo.confirmations = currentHeight - utxoHeight + 1
          // maturesAt = utxoHeight + STAKE_MATURITY = currentHeight - confirmations + 1 + STAKE_MATURITY
          const maturesAtHeight = currentHeight - utxo.confirmations + 1 + STAKE_MATURITY;
          if (!nearestMatureHeight || maturesAtHeight < nearestMatureHeight) {
            nearestMatureHeight = maturesAtHeight;
          }
        } else {
          matureBalance += utxo.value;
        }
      }

      const canDelegate = matureBalance >= DELEGATION_GAS_COST;
      const blocksUntilMature = nearestMatureHeight && currentHeight
        ? Math.max(0, nearestMatureHeight - currentHeight)
        : undefined;

      sendMessage({
        type: MESSAGE_TYPE.GET_DELEGATION_READINESS_RETURN,
        readiness: {
          canDelegate,
          matureBalance,
          immatureBalance,
          blocksUntilMature,
          currentHeight,
        },
      });
    } catch (err) {
      console.error('Error checking delegation readiness:', err);
      sendMessage({
        type: MESSAGE_TYPE.GET_DELEGATION_READINESS_RETURN,
        readiness: { canDelegate: true, matureBalance: 0, immatureBalance: 0 },
      });
    }
  };

  /**
   * Query superstaker delegations by fetching AddDelegation event history
   * and decoding each event's data from the transaction receipt.
   *
   * AddDelegation event:
   *   topic[0] = a23803f3b... (event signature)
   *   topic[1] = staker address (indexed, hash160 padded to 32 bytes)
   *   topic[2] = delegate address (indexed, hash160 padded to 32 bytes)
   *   data = fee (uint8) + blockHeight (uint256) + PoD (bytes)
   */
  private getSuperstakerDelegations = async (address: string) => {
    try {
      if (!this.loggedInAccount || !this.loggedInAccount.wallet) {
        console.error('Could not get wallet info.');
        return;
      }

      const electrumx = this.getElectrumX();
      const hash160 = addressToHash160(address);
      const network = this.main.network.runebaseNetwork;
      const addDelegationTopic =
        'a23803f3b2b56e71f2921c22b23c32ef596a439dbe03f7250e6b58a30eb910b5';

      const events = await electrumx.getContractEventHistory(
        hash160,
        DELEGATION_CONTRACT_ADDRESS,
        addDelegationTopic,
      );

      if (!events || events.length === 0) {
        sendMessage({
          type: MESSAGE_TYPE.GET_SUPERSTAKER_DELEGATIONS_RETURN,
          superstakerDelegations: [],
        });
        return;
      }

      // For each event, fetch the tx receipt to decode the log data
      const delegations: Array<{
        delegate: string;
        staker: string;
        fee: number;
        blockHeight: number;
        PoD: string;
      }> = [];

      for (const event of events) {
        try {
          const receipt = await electrumx.getTransactionReceipt(
            event.tx_hash,
          ) as any;

          // Find the AddDelegation log in the receipt
          const logs = receipt?.[0]?.log || receipt?.log || [];
          for (const log of logs) {
            const topics = log.topics || [];
            if (topics[0] !== addDelegationTopic) continue;

            // topics[1] = staker (indexed, last 20 bytes)
            // topics[2] = delegate (indexed, last 20 bytes)
            const stakerH160 = topics[1]?.substring(24, 64);
            const delegateH160 = topics[2]?.substring(24, 64);
            const logData = log.data || '';

            // data: fee (uint8, 32 bytes) | blockHeight (uint256, 32 bytes) | PoD offset + length + data
            const decodedFee = parseInt(logData.substring(0, 64), 16);
            const decodedBlockHeight = parseInt(
              logData.substring(64, 128), 16,
            );
            const podOffset = parseInt(
              logData.substring(128, 192), 16,
            ) * 2;
            const podLength = parseInt(
              logData.substring(podOffset, podOffset + 64), 16,
            );
            const podData = '0x' + logData.substring(
              podOffset + 64, podOffset + 64 + podLength * 2,
            );

            delegations.push({
              staker: stakerH160
                ? hash160ToAddress(stakerH160, network) : address,
              delegate: delegateH160
                ? hash160ToAddress(delegateH160, network) : '',
              fee: decodedFee,
              blockHeight: decodedBlockHeight,
              PoD: podData,
            });
          }
        } catch (_err) {
          // failed to decode delegation event
        }
      }

      sendMessage({
        type: MESSAGE_TYPE.GET_SUPERSTAKER_DELEGATIONS_RETURN,
        superstakerDelegations: delegations,
      });
    } catch (error) {
      console.error('Error fetching superstaker delegations:', error);
      sendMessage({
        type: MESSAGE_TYPE.GET_SUPERSTAKER_DELEGATIONS_RETURN,
        superstakerDelegations: [],
      });
    }
  };

  private getBlockchainInfo = async () => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet) {
      console.error('Could not get wallet info.');
      return;
    }
    const electrumx = this.getElectrumX();
    const blockchainInfo = await this.loggedInAccount.wallet.getBlockchainInfo(electrumx);
    if (blockchainInfo) {
      this.blockchainInfo = blockchainInfo;
      sendMessage({
        type: MESSAGE_TYPE.GET_BLOCKCHAIN_INFO_RETURN,
        blockchainInfo: this.blockchainInfo,
      });
    }
  };

  public startPolling = async () => {
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
    if (!this.getDelegationInfoInterval) {
      this.getDelegationInfoInterval = setInterval(() => {
        this.getDelegationInfo();
      }, AccountController.GET_DELEGATION_INFO_INTERVAL_MS);
    }
  };

  /**
   * Start a short-lived rapid poll after a delegation tx is broadcast.
   * Polls getDelegationInfo every 15s up to 8 times to catch the on-chain confirmation.
   */
  private startDelegationConfirmPoll = () => {
    this.stopDelegationConfirmPoll();
    this.delegationConfirmPollCount = 0;
    this.delegationConfirmPollInterval = setInterval(() => {
      this.delegationConfirmPollCount++;
      this.getDelegationInfo();
      if (this.delegationConfirmPollCount >= AccountController.DELEGATION_CONFIRM_POLL_MAX) {
        this.stopDelegationConfirmPoll();
      }
    }, AccountController.DELEGATION_CONFIRM_POLL_MS);
  };

  private stopDelegationConfirmPoll = () => {
    if (this.delegationConfirmPollInterval) {
      clearInterval(this.delegationConfirmPollInterval);
      this.delegationConfirmPollInterval = undefined;
      this.delegationConfirmPollCount = 0;
    }
  };

  private sendTokens = async (receiverAddress: string, amount: number, transactionSpeed: TRANSACTION_SPEED) => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet) {
      throw Error('Cannot send with no wallet instance.');
    }

    try {
      const rates = {
        [TRANSACTION_SPEED.FAST]: 80000,
        [TRANSACTION_SPEED.NORMAL]: 50000,
        [TRANSACTION_SPEED.SLOW]: 40000,
      };
      const feeRate = rates[transactionSpeed];
      if (!feeRate) {
        throw Error('feeRate not set');
      }

      const electrumx = this.getElectrumX();
      const transaction = await this.loggedInAccount.wallet.send(
        receiverAddress,
        amount * 1e8,
        { feeRate },
        electrumx,
      );
      const newTransaction = new Transaction({
        id: transaction.txid,
        timestamp: moment().format('MM-DD-YYYY, HH:mm'),
        confirmations: 0,
        amount: new BigNumber(amount ?? 0).times(1e8).dp(0).toNumber(),
      });
      this.main.transaction.addTransaction(newTransaction);
      sendMessage({
        type: MESSAGE_TYPE.SEND_TOKENS_SUCCESS,
      });
    } catch (err) {
      sendMessage({
        type: MESSAGE_TYPE.SEND_TOKENS_FAILURE,
        error: err,
      });
      throw (err);
    }
  };

  private updateAndSendMaxRunebaseAmountToPopup = async () => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet) {
      throw Error('Cannot calculate max balance with no wallet instance.');
    }

    const electrumx = this.getElectrumX();
    const calcMQSPr = this.loggedInAccount.wallet.calcMaxRunebaseSend(
      this.main.network.networkName,
      electrumx,
    );
    calcMQSPr.then(() => {
      const maxRunebaseAmount = this.loggedInAccount?.wallet?.maxRunebaseSend;
      sendMessage({
        type: MESSAGE_TYPE.GET_MAX_RUNEBASE_SEND_RETURN,
        maxRunebaseAmount,
      });
    });
  };

  private sendDelegationConfirm = async (
    signedPoD: PodReturnResult,
    fee: number,
    gasLimit: number,
    gasPrice: number
  ) => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet) {
      throw Error('Cannot send with no wallet instance.');
    }
    const hexAddress = addressToHash160(signedPoD.superStakerAddress);
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
    const { error, result } = response as { error: any, result: ISendRawTxResult };
    const newTransaction = new Transaction({
      id: result && result.txid ? result.txid : undefined,
      timestamp: moment().format('MM-DD-YYYY, HH:mm'),
      confirmations: 0,
      amount: -new BigNumber(gasLimit ?? 0).times(gasPrice ?? 0).dp(0).toNumber(),
      qrc20TokenTransfers: []
    });
    this.main.transaction.addTransaction(newTransaction);

    if (error) {
      console.error('Error sendDelegationConfirm:', error);
      sendMessage({
        type: MESSAGE_TYPE.SEND_DELEGATION_CONFIRM_FAILURE,
        error: { ...error, message: formatTxError(error.message || String(error)) },
      });
      return;
    }

    sendMessage({
      type: MESSAGE_TYPE.SEND_DELEGATION_CONFIRM_SUCCESS,
    });
    // Refresh delegation info immediately and start rapid polling to catch confirmation
    this.getDelegationInfo();
    this.startDelegationConfirmPoll();
  };

  private sendRemoveDelegationConfirm = async (
    gasLimit: number,
    gasPrice: number
  ) => {
    if (!this.loggedInAccount || !this.loggedInAccount.wallet) {
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
    const { error, result } = response as { error: any, result: ISendRawTxResult };
    const newTransaction = new Transaction({
      id: result && result.txid ? result.txid : undefined,
      timestamp: moment().format('MM-DD-YYYY, HH:mm'),
      confirmations: 0,
      amount: -new BigNumber(gasLimit ?? 0).times(gasPrice ?? 0).dp(0).toNumber(),
      qrc20TokenTransfers: []
    });
    this.main.transaction.addTransaction(newTransaction);

    if (error) {
      console.error('Error sendRemoveDelegationConfirm:', error);
      sendMessage({
        type: MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM_FAILURE,
        error: { ...error, message: formatTxError(error.message || String(error)) },
      });
      return;
    }

    sendMessage({
      type: MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM_SUCCESS,
    });
    // Refresh delegation info immediately and start rapid polling to catch confirmation
    this.getDelegationInfo();
    this.startDelegationConfirmPoll();
  };

  private handleMessage = async (
    request: any,

    _?: chrome.runtime.MessageSender,
    sendResponse?: (response: any) => void,
  ) => {
    const inExtensionEnvironment = isExtensionEnvironment();
    const requestData = inExtensionEnvironment ? request : request.data;
    try {
      switch (requestData.type) {
      case MESSAGE_TYPE.LOGIN:
        await this.login(requestData.password, requestData.algorithm);
        break;
      case MESSAGE_TYPE.REQUEST_BACKUP_WALLET_INFO: {
        await this.requestWalletBackupInfo(requestData.password, requestData.algorithm);
        break;
      }
      case MESSAGE_TYPE.IMPORT_MNEMONIC:
        await this.importMnemonic(requestData.accountName, requestData.mnemonicPrivateKey);
        break;
      case MESSAGE_TYPE.IMPORT_PRIVATE_KEY:
        await this.importPrivateKey(requestData.accountName, requestData.mnemonicPrivateKey);
        break;
      case MESSAGE_TYPE.SAVE_TO_FILE:
        this.saveToFile(requestData.accountName, requestData.mnemonicPrivateKey);
        break;
      case MESSAGE_TYPE.ACCOUNT_LOGIN:
        await this.loginAccount(requestData.selectedWalletName);
        break;
      case MESSAGE_TYPE.SEND_TOKENS:
        this.sendTokens(requestData.receiverAddress, requestData.amount, requestData.transactionSpeed);
        break;
      case MESSAGE_TYPE.SEND_DELEGATION_CONFIRM:
        this.sendDelegationConfirm(
          parseJsonOrFallback(requestData.signedPoD),
          requestData.fee,
          requestData.gasLimit,
          requestData.gasPrice
        );
        break;
      case MESSAGE_TYPE.SEND_REMOVE_DELEGATION_CONFIRM:
        this.sendRemoveDelegationConfirm(requestData.gasLimit, requestData.gasPrice);
        break;
      case MESSAGE_TYPE.LOGOUT:
        this.logoutAccount();
        break;
      case MESSAGE_TYPE.HAS_ACCOUNTS:
        sendMessage({
          type: MESSAGE_TYPE.HAS_ACCOUNTS_RETURN,
          hasAccounts: this.hasAccounts,
        });
        break;
      case MESSAGE_TYPE.GET_ACCOUNTS:
        sendMessage({
          type: MESSAGE_TYPE.GET_ACCOUNTS_RETURN,
          accounts: this.accounts,
        });
        break;
      case MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT:
        if (isExtensionEnvironment()) {
          sendResponse?.(this.loggedInAccount && this.loggedInAccount.wallet && this.loggedInAccount.wallet.info
            ? { name: this.loggedInAccount.name, address: this.loggedInAccount!.wallet!.info!.address }
            : undefined);
        }
        break;
      case MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME:
        sendMessage({
          type: MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME_RETURN,
          accountName: this.loggedInAccount ? this.loggedInAccount.name : undefined,
        });
        break;
      case MESSAGE_TYPE.GET_BLOCKCHAIN_INFO:
        sendMessage({
          type: MESSAGE_TYPE.GET_BLOCKCHAIN_INFO_RETURN,
          blockchainInfo: this.blockchainInfo ? this.blockchainInfo : undefined,
        });
        break;
      case MESSAGE_TYPE.GET_WALLET_INFO:
        sendMessage({
          type: MESSAGE_TYPE.GET_WALLET_INFO_RETURN,
          info: this.loggedInAccount && this.loggedInAccount.wallet
            ? this.loggedInAccount.wallet.info : undefined,
        });
        break;
      case MESSAGE_TYPE.GET_DELEGATION_INFO:
        // Return cached delegation info to avoid ElectrumX calls on
        // every popup open. Fresh data is fetched by polling intervals.
        sendMessage({
          type: MESSAGE_TYPE.GET_DELEGATION_INFO_RETURN,
          delegationInfo: this.loggedInAccount?.wallet?.delegationInfo ?? null,
        });
        break;
      case MESSAGE_TYPE.GET_DELEGATION_READINESS:
        this.getDelegationReadiness();
        break;
      case MESSAGE_TYPE.GET_SUPERSTAKER_DELEGATIONS:
        this.getSuperstakerDelegations(requestData.address);
        break;
      case MESSAGE_TYPE.GET_RUNEBASE_USD:
        sendMessage({
          type: MESSAGE_TYPE.GET_RUNEBASE_USD_RETURN,
          runebaseUSD: this.loggedInAccount && this.loggedInAccount.wallet
            ? this.loggedInAccount.wallet.runebaseUSD : undefined,
        });
        break;
      case MESSAGE_TYPE.VALIDATE_WALLET_NAME:
        if (inExtensionEnvironment) {
          sendResponse?.(this.isWalletNameTaken(requestData.name));
        } else {
          sendMessage({
            type: MESSAGE_TYPE.USE_CALLBACK,
            id: requestData.id,
            result: this.isWalletNameTaken(requestData.name),
          });
        }
        break;
      case MESSAGE_TYPE.GET_MAX_RUNEBASE_SEND:
        this.updateAndSendMaxRunebaseAmountToPopup();
        break;
      default:
        break;
      }
    } catch (err) {
      this.main.displayErrorOnPopup(err as any);
    }
  };
}
