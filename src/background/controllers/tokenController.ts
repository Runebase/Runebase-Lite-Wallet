import { each, findIndex, isEmpty } from 'lodash';
import BigNumber from 'bignumber.js';

import RunebaseChromeController from '.';
import IController from './iController';
import { MESSAGE_TYPE, STORAGE, NETWORK_NAMES } from '../../constants';
import RRCToken from '../../models/RRCToken';
import rrc223TokenABI from '../../contracts/rrc223TokenABI';
import mainnetTokenList from '../../contracts/mainnetTokenList';
import testnetTokenList from '../../contracts/testnetTokenList';
import regtestTokenList from '../../contracts/regtestTokenList';
import { generateRequestId } from '../../utils';
import {
  encodeContractCall,
  decodeContractCallResult,
} from '../../utils/abi';
import { IRPCCallResponse } from '../../types';
import { ISendRawTxResult } from '../../services/wallet/types';
import moment from 'moment';
import Transaction from '../../models/Transaction';
import { getStorageValue, setStorageValue, addMessageListener, sendMessage, isExtensionEnvironment } from '../../popup/abstraction';

const INIT_VALUES = {
  tokens: undefined,
  getBalancesInterval: undefined,
};

export default class TokenController extends IController {
  private static GET_BALANCES_INTERVAL_MS: number = 60000;

  public tokens?: RRCToken[] = INIT_VALUES.tokens;

  private getBalancesInterval?: any = INIT_VALUES.getBalancesInterval;

  constructor(main: RunebaseChromeController) {
    super('token', main);

    addMessageListener(this.handleMessage);
    this.initFinished();
  }

  public resetTokenList = () => {
    this.tokens = INIT_VALUES.tokens;
  };

  public initTokenList = () => {
    if (this.tokens) {
      return;
    }

    const tokenListKey = this.chromeStorageAccountTokenListKey();

    getStorageValue(tokenListKey).then((res) => {
      if (!isEmpty(res)) {
        this.tokens = res;
      } else if (this.main.network.networkName === NETWORK_NAMES.MAINNET) {
        this.tokens = mainnetTokenList;
      } else if (this.main.network.networkName === NETWORK_NAMES.TESTNET) {
        this.tokens = testnetTokenList;
      } else {
        this.tokens = regtestTokenList;
      }
    });
  };

  public startPolling = async () => {
    await this.getBalances();
    if (!this.getBalancesInterval) {
      this.getBalancesInterval = setInterval(() => {
        this.getBalances();
      }, TokenController.GET_BALANCES_INTERVAL_MS);
    }
  };

  public stopPolling = () => {
    if (this.getBalancesInterval) {
      clearInterval(this.getBalancesInterval);
      this.getBalancesInterval = undefined;
    }
  };

  public setupTokenSubscriptions = async () => {
    const wallet = this.main.account.loggedInAccount?.wallet;
    const electrumx = this.main.network.electrumx;
    if (!wallet || !electrumx || !this.tokens) return;

    for (const token of this.tokens) {
      try {
        await wallet.subscribeTokenEvents(electrumx, token.address, () => {
          this.getRRCTokenBalance(token);
        });
      } catch (err) {
        console.warn(`Failed to subscribe to token events for ${token.symbol}:`, err);
      }
    }
    console.log(`Subscribed to transfer events for ${this.tokens.length} tokens`);
  };

  private getBalances = () => {
    each(this.tokens, async (token: RRCToken) => {
      await this.getRRCTokenBalance(token);
    });
  };

  private getRRCTokenBalance = async (token: RRCToken) => {
    if (!this.main.account.loggedInAccount
      || !this.main.account.loggedInAccount.wallet
    ) {
      console.error('Cannot getRRCTokenBalance without wallet instance.');
      return;
    }

    const walletAddr = this.main.account.loggedInAccount.wallet.address;
    const data = encodeContractCall(
      rrc223TokenABI,
      'balanceOf',
      [walletAddr],
    );
    const args = [token.address, data];
    const { result, error } = await this.main.rpc.callContract(
      generateRequestId(), args,
    );

    if (error) {
      console.error(error);
      return;
    }

    // Decode result
    const decoded = decodeContractCallResult(
      result, rrc223TokenABI, 'balanceOf',
    );
    const bnBal = decoded.executionResult.formattedOutput[0];
    const bigNumberBal = new BigNumber(bnBal.toString(10));
    const balance = bigNumberBal
      .dividedBy(new BigNumber(10 ** token.decimals))
      .toNumber();

    // Update token balance in place
    const index = findIndex(this.tokens, {
      name: token.name, symbol: token.symbol,
    });
    if (index !== -1) {
      this.tokens![index].balance = balance;
    }

    sendMessage({
      type: MESSAGE_TYPE.RRC_TOKENS_RETURN,
      tokens: this.tokens,
    }, () => {});
  };

  private getRRCTokenDetails = async (contractAddress: string) => {
    let msg;

    try {
      // Get name
      let data = encodeContractCall(rrc223TokenABI, 'name', []);
      let { result, error }: IRPCCallResponse =
        await this.main.rpc.callContract(
          generateRequestId(), [contractAddress, data],
        );
      if (error) throw Error(error);
      result = decodeContractCallResult(
        result, rrc223TokenABI, 'name',
      );
      const name = result.executionResult.formattedOutput[0];

      // Get symbol
      data = encodeContractCall(rrc223TokenABI, 'symbol', []);
      ({ result, error } = await this.main.rpc.callContract(
        generateRequestId(), [contractAddress, data],
      ));
      if (error) throw Error(error);
      result = decodeContractCallResult(
        result, rrc223TokenABI, 'symbol',
      );
      const symbol = result.executionResult.formattedOutput[0];

      // Get decimals
      data = encodeContractCall(rrc223TokenABI, 'decimals', []);
      ({ result, error } = await this.main.rpc.callContract(
        generateRequestId(), [contractAddress, data],
      ));
      if (error) throw Error(error);
      result = decodeContractCallResult(
        result, rrc223TokenABI, 'decimals',
      );
      const decimals = result.executionResult.formattedOutput[0];

      if (name && symbol && decimals) {
        const token = new RRCToken(name, symbol, decimals, contractAddress);
        msg = {
          type: MESSAGE_TYPE.RRC_TOKEN_DETAILS_RETURN,
          isValid: true,
          token,
        };
      } else {
        msg = {
          type: MESSAGE_TYPE.RRC_TOKEN_DETAILS_RETURN,
          isValid: false,
        };
      }
    } catch (err) {
      console.error(err);
      msg = {
        type: MESSAGE_TYPE.RRC_TOKEN_DETAILS_RETURN,
        isValid: false,
      };
    }

    sendMessage(msg, () => {});
  };

  private sendRRCToken = async (
    receiverAddress: string,
    amount: number,
    token: RRCToken,
    gasLimit: number,
    gasPrice: number
  ) => {
    try {
      console.log('sendRRCToken:', { amount, token: token.symbol });
      const bnAmount = new BigNumber(amount ?? 0)
        .times(new BigNumber(10 ** token.decimals))
        .dp(0);
      const data = encodeContractCall(
        rrc223TokenABI,
        'transfer',
        [receiverAddress, bnAmount.toString(10)],
      );
      const args = [token.address, data, null, gasLimit, gasPrice];

      console.log('Sending RRCToken with args:', args);

      const requestId = generateRequestId();
      const response = await this.main.rpc.sendToContract(requestId, args);
      const { error, result } = response as {
        error: any; result: ISendRawTxResult;
      };

      const newTransaction = new Transaction({
        id: result && result.txid ? result.txid : undefined,
        timestamp: moment().format('MM-DD-YYYY, HH:mm'),
        confirmations: 0,
        amount: -new BigNumber(gasLimit ?? 0)
          .times(gasPrice ?? 0).dp(0).toNumber(),
        qrc20TokenTransfers: [
          {
            address: token.address,
            addressHex: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            value: bnAmount.toString(),
            from: this.main.account.loggedInAccount?.wallet?.info?.address,
            to: receiverAddress,
          }
        ]
      });
      this.main.transaction.addTransaction(newTransaction);

      if (error) {
        console.error('Error sending RRCToken:', error);
        sendMessage({
          type: MESSAGE_TYPE.SEND_TOKENS_FAILURE, error,
        }, () => {});
        return;
      }

      console.log('RRCToken sent successfully!');
      sendMessage({
        type: MESSAGE_TYPE.SEND_TOKENS_SUCCESS,
      }, () => {});
    } catch (e: any) {
      console.error('An unexpected error occurred:', e);
      sendMessage({
        type: MESSAGE_TYPE.SEND_TOKENS_FAILURE, error: e.message,
      }, () => {});
    }
  };

  private addToken = async (
    contractAddress: string, name: string,
    symbol: string, decimals: number,
  ) => {
    const newToken = new RRCToken(name, symbol, decimals, contractAddress);
    this.tokens!.push(newToken);
    this.setTokenListInStorage();
    await this.getRRCTokenBalance(newToken);
  };

  private removeToken = (contractAddress: string) => {
    const index = findIndex(this.tokens, { address: contractAddress });
    this.tokens!.splice(index, 1);
    this.setTokenListInStorage();
  };

  private setTokenListInStorage = async () => {
    const storageKey = this.chromeStorageAccountTokenListKey();
    await setStorageValue(storageKey, this.tokens);
    sendMessage({
      type: MESSAGE_TYPE.RRC_TOKENS_RETURN,
      tokens: this.tokens,
    }, () => {});
  };

  private chromeStorageAccountTokenListKey = () => {
    return `${STORAGE.ACCOUNT_TOKEN_LIST}-` +
      `${this.main.account.loggedInAccount!.name}-` +
      `${this.main.network.networkName}`;
  };

  private handleMessage = (
    request: any,
    _?: chrome.runtime.MessageSender,
    sendResponse?: (response: any) => void,
  ) => {
    const inExtensionEnvironment = isExtensionEnvironment();
    const requestData = inExtensionEnvironment ? request : request.data;
    try {
      switch (requestData.type) {
      case MESSAGE_TYPE.GET_RRC_TOKEN_LIST:
        if (inExtensionEnvironment) {
          sendResponse?.(this.tokens);
        } else {
          sendMessage({
            type: MESSAGE_TYPE.USE_CALLBACK,
            id: requestData.id,
            result: this.tokens,
          });
        }
        break;
      case MESSAGE_TYPE.SEND_RRC_TOKENS:
        this.sendRRCToken(
          requestData.receiverAddress,
          requestData.amount,
          requestData.token,
          requestData.gasLimit,
          requestData.gasPrice
        );
        break;
      case MESSAGE_TYPE.ADD_TOKEN:
        this.addToken(
          requestData.contractAddress, requestData.name,
          requestData.symbol, requestData.decimals,
        );
        break;
      case MESSAGE_TYPE.GET_RRC_TOKEN_DETAILS:
        this.getRRCTokenDetails(requestData.contractAddress);
        break;
      case MESSAGE_TYPE.REMOVE_TOKEN:
        this.removeToken(requestData.contractAddress);
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
