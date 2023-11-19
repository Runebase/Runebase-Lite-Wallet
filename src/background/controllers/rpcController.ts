import { WalletRPCProvider, Insight } from 'runebasejs-wallet';

import RunebaseChromeController from '.';
import IController from './iController';
import { MESSAGE_TYPE, RPC_METHOD } from '../../constants';
import { IRPCCallResponse } from '../../types';
import Config from '../../config';

export default class RPCController extends IController {
  constructor(main: RunebaseChromeController) {
    super('rpc', main);

    chrome.runtime.onMessage.addListener(this.handleMessage);
    this.initFinished();
  }

  public sendToContract = async (id: string, args: any[]): Promise<IRPCCallResponse> => {
    let result: any;
    let error: string | undefined;
    try {
      const rpcProvider = this.rpcProvider();
      if (!rpcProvider) {
        throw Error('Cannot sendtocontract without RPC provider.');
      }
      if (args.length < 2) {
        throw Error('Requires first two arguments: contractAddress and data.');
      }
      // Set default values for amount, gasLimit, and gasPrice if needed
      const { DEFAULT_AMOUNT, DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE } = Config.TRANSACTION;
      const [address, data, amount, gasLimit, gasPrice] = args;

      console.log('Sending to contract. Args:', args);

      const newArgs = [
        address,
        data,
        amount || DEFAULT_AMOUNT,
        gasLimit || DEFAULT_GAS_LIMIT,
        gasPrice || DEFAULT_GAS_PRICE,
      ];

      console.log('Sending transaction. New Args:', newArgs);

      result = await this.main.account.loggedInAccount!.wallet!.sendTransaction(newArgs) as Insight.ISendRawTxResult;

      console.log('Transaction result:', result);
    } catch (err) {
      console.error(err);
      error = (err as Error).message;
    }

    return { id, result, error };
  };

  public callContract = async (id: string, args: any[]): Promise<IRPCCallResponse> => {
    let result: any;
    let error: string | undefined;
    try {
      const rpcProvider = this.rpcProvider();
      if (!rpcProvider) {
        throw Error('Cannot callcontract without RPC provider.');
      }
      if (args.length < 2) {
        throw Error('Requires first two arguments: contractAddress and data.');
      }

      console.log('Calling contract. Args:', args);

      result = await rpcProvider.rawCall(RPC_METHOD.CALL_CONTRACT, args) as Insight.IContractCall;

      console.log('Contract call result:', result);
    } catch (err) {
      error = (err as Error).message;
      console.error(error);
    }

    return { id, result, error };
  };

  /*
  * Gets the current logged in RPC provider.
  * @return Logged in account's RPC provider.
  */
  private rpcProvider = (): WalletRPCProvider | undefined => {
    const acct = this.main.account.loggedInAccount;
    return acct && acct.wallet && acct.wallet.rpcProvider;
  };

  /**
   * Sends the RPC response or error to the active tab that requested.
   * @param id Request ID.
   * @param result RPC call result.
   * @param error RPC call error.message, passed in and as a string because
   * chrome.tabs.sendMessage does not support passing the error object type
   */
  private sendRpcResponseToActiveTab = (id: string, result: any, error?: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([{ id: tabID }]) => {
      chrome.tabs.sendMessage(tabID!, { type: MESSAGE_TYPE.EXTERNAL_RPC_CALL_RETURN, id, result, error });
    });
  };

  private externalRawCall = async (id: string, method: string, args: any[]) => {
    let result: any;
    let error: string | undefined;

    try {
      const rpcProvider = this.rpcProvider();
      if (!rpcProvider) {
        throw Error('Cannot call RPC without provider.');
      }

      console.log('External raw call. Method:', method, 'Args:', args);

      result = await rpcProvider.rawCall(method, args);

      console.log('External raw call result:', result);
    } catch (e) {
      console.log(e);
      error = (e as Error).message;
      console.error(error);
    }

    this.sendRpcResponseToActiveTab(id, result, error);
  };

  /*
  * Handles a sendToContract requested externally and sends the response back to the active tab.
  * @param id Request ID.
  * @param args Request arguments. [contractAddress, data, amount?, gasLimit?, gasPrice?]
  */
  private externalSendToContract = async (id: string, args: any[]) => {
    if (!this.rpcProvider()) {
      throw Error('Cannot call RPC without provider.');
    }

    const { result, error } = await this.sendToContract(id, args);
    this.sendRpcResponseToActiveTab(id, result, error);
  };

  /*
  * Handles a callContract requested externally and sends the response back to the active tab.
  * @param id Request ID.
  * @param args Request arguments. [contractAddress, data, amount?, gasLimit?, gasPrice?]
  */
  private externalCallContract = async (id: string, args: any[]) => {
    if (!this.rpcProvider()) {
      throw Error('Cannot call RPC without provider.');
    }

    const { result, error } = await this.callContract(id, args);
    this.sendRpcResponseToActiveTab(id, result, error);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
  private handleMessage = (request: any, _: chrome.runtime.MessageSender) => {
    try {
      switch (request.type) {
      case MESSAGE_TYPE.EXTERNAL_RAW_CALL:
        this.externalRawCall(request.id, request.method, request.args);
        break;
      case MESSAGE_TYPE.EXTERNAL_SEND_TO_CONTRACT:
        this.externalSendToContract(request.id, request.args);
        break;
      case MESSAGE_TYPE.EXTERNAL_CALL_CONTRACT:
        this.externalCallContract(request.id, request.args);
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
