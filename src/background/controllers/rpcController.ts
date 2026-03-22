import RunebaseChromeController from '.';
import IController from './iController';
import { MESSAGE_TYPE, RPC_METHOD } from '../../constants';
import { IRPCCallResponse } from '../../types';
import Config from '../../config';
import { ISendRawTxResult, IContractCall } from '../../services/wallet/types';
import { addMessageListener, isExtensionEnvironment } from '../../popup/abstraction';

export default class RPCController extends IController {
  constructor(main: RunebaseChromeController) {
    super('rpc', main);

    addMessageListener(this.handleMessage);
    this.initFinished();
  }

  public sendToContract = async (id: string, args: any[]): Promise<IRPCCallResponse> => {
    let result: any;
    let error: string | undefined;
    try {
      const wallet = this.getWallet();
      const electrumx = this.getElectrumX();

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

      result = await wallet.sendTransaction(newArgs, electrumx) as ISendRawTxResult;

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
      const wallet = this.getWallet();
      const electrumx = this.getElectrumX();

      if (args.length < 2) {
        throw Error('Requires first two arguments: contractAddress and data.');
      }

      console.log('Calling contract. Args:', args);

      const [contractAddress, data] = args;
      result = await wallet.callContract(contractAddress, data, electrumx) as IContractCall;

      console.log('Contract call result:', result);
    } catch (err) {
      error = (err as Error).message;
      console.error(error);
    }

    return { id, result, error };
  };

  private getWallet() {
    const acct = this.main.account.loggedInAccount;
    if (!acct || !acct.wallet) {
      throw Error('Cannot call RPC without wallet.');
    }
    return acct.wallet;
  }

  private getElectrumX() {
    const electrumx = this.main.network.electrumx;
    if (!electrumx) {
      throw Error('ElectrumX not connected.');
    }
    return electrumx;
  }

  /**
   * Sends the RPC response or error to the active tab that requested.
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
      const wallet = this.getWallet();
      const electrumx = this.getElectrumX();

      console.log('External raw call. Method:', method, 'Args:', args);

      if (method === RPC_METHOD.CALL_CONTRACT) {
        const [contractAddress, data] = args;
        result = await wallet.callContract(contractAddress, data, electrumx);
      } else if (method === RPC_METHOD.SEND_TO_CONTRACT) {
        result = await wallet.sendTransaction(args, electrumx);
      } else {
        throw Error(`Unsupported RPC method: ${method}`);
      }

      console.log('External raw call result:', result);
    } catch (e) {
      console.log(e);
      error = (e as Error).message;
      console.error(error);
    }

    this.sendRpcResponseToActiveTab(id, result, error);
  };

  private externalSendToContract = async (id: string, args: any[]) => {
    const { result, error } = await this.sendToContract(id, args);
    this.sendRpcResponseToActiveTab(id, result, error);
  };

  private externalCallContract = async (id: string, args: any[]) => {
    const { result, error } = await this.callContract(id, args);
    this.sendRpcResponseToActiveTab(id, result, error);
  };

  private handleMessage = (request: any, _: chrome.runtime.MessageSender) => {
    const requestData = isExtensionEnvironment() ? request : request.data;
    try {
      switch (requestData.type) {
      case MESSAGE_TYPE.EXTERNAL_RAW_CALL:
        this.externalRawCall(requestData.id, requestData.method, requestData.args);
        break;
      case MESSAGE_TYPE.EXTERNAL_SEND_TO_CONTRACT:
        this.externalSendToContract(requestData.id, requestData.args);
        break;
      case MESSAGE_TYPE.EXTERNAL_CALL_CONTRACT:
        this.externalCallContract(requestData.id, requestData.args);
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
