import RunebaseChromeController from '.';
import IController from './iController';
import { API_TYPE, MESSAGE_TYPE } from '../../constants';
import { PodSignResponse } from '../../types';
import runebase from 'runebasejs-lib';
import secp256k1 from 'secp256k1';
import createHash from 'create-hash';
import { addMessageListener, isExtensionEnvironment, sendMessage } from '../../popup/abstraction';

export function sha256(buffer: Buffer) {
  return createHash('sha256')
    .update(buffer)
    .digest();
}

export function sha256d(buffer: Buffer) {
  return sha256(sha256(buffer));
}



export default class UtilsController extends IController {
  constructor(main: RunebaseChromeController) {
    super('utils', main);

    addMessageListener(this.handleMessage);
    this.initFinished();
  }

  private handleSignPodRequestExternal = (request: any) => {
    const { id, superStakerAddress } = request.payload;
    this.handleSignPod(id, superStakerAddress);
  };

  /*
  * Executes a callcontract request.
  * @param id Request ID.
  * @param args Request arguments. [contractAddress, data, amount?, gasLimit?, gasPrice?]
  */
  public handleSignPod = async (id: string, superStakerAddress: string): Promise<PodSignResponse> => {
    let result: any;
    let error: string | undefined;
    try {
      if (!superStakerAddress) {
        throw Error('Requires first two arguments: contractAddress and data.');
      }

      const acct = this.main.account.loggedInAccount;
      if (!acct || !acct.wallet || !acct.wallet.rjsWallet || !acct.wallet.rjsWallet.keyPair) {
        throw Error('Invalid account or key pair.');
      }
      const keyPair = acct.wallet.rjsWallet.keyPair;
      const hexAddress = runebase.address.fromBase58Check(superStakerAddress).hash.toString('hex');

      // Verify that keyPair.network.messagePrefix is set correctly for Runebase
      const hash = sha256d(
        Buffer.concat([
          Buffer.from(keyPair.network.messagePrefix, 'utf8'),
          Buffer.from([hexAddress.length]),
          Buffer.from(hexAddress, 'utf8')
        ])
      );

      const { signature, recid } = secp256k1.ecdsaSign(
        hash,
        keyPair.d.toBuffer(32)
      );
      const signed = Buffer.concat([
        Buffer.from([recid + (keyPair.compressed ? 31 : 27)]),
        signature
      ]);
      const podMessage = `0x${signed.toString('hex')}`;

      const pubKey = secp256k1.publicKeyCreate(keyPair.d.toBuffer(32));
      const verified = secp256k1.ecdsaVerify(signature, hash, pubKey);
      if (!verified) {
        throw Error('Unable to verify signature');
      }
      if (podMessage.length !== 132) {
        throw Error('Incorrect POD length');
      }

      result = {
        podMessage,
        superStakerAddress,
        delegatorAddress: acct.wallet.rjsWallet.address,
      };

    } catch (err) {
      error = (err as Error).message;
      console.error(error);
    }

    return {
      id,
      result,
      error,
    };
  };


  /**
   * Sends the RPC response or error to the active tab that requested.
   * @param id Request ID.
   * @param result RPC call result.
   * @param error RPC call error.message, passed in and as a string because
   * chrome.tabs.sendMessage does not support passing the error object type
   */
  private sendPodResponseToActiveTab = (id: string, result: any, error?: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([{ id: tabID }]) => {
      chrome.tabs.sendMessage(tabID!, { type: MESSAGE_TYPE.SIGN_POD_EXTERNAL_RETURN, id, result, error });
    });
  };

  /*
  * Handles a callContract requested externally and sends the response back to the active tab.
  * @param id Request ID.
  * @param args Request arguments. [contractAddress, data, amount?, gasLimit?, gasPrice?]
  */
  private signPodMessageExternal = async (id: string, superStakerAddress: string) => {
    const { result, error } = await this.handleSignPod(id, superStakerAddress);
    this.sendPodResponseToActiveTab(id, result, error);
  };

  private signPodMessage = async (superStakerAddress: string) => {
    const { result } = await this.handleSignPod('', superStakerAddress);
    if (result) {
      sendMessage({
        type: MESSAGE_TYPE.SIGN_POD_RETURN,
        result: result
      }, () => {});
    }
  };


  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
  private handleMessage = (request: any, _: chrome.runtime.MessageSender) => {
    const requestData = isExtensionEnvironment() ? request : request.data;
    try {
      switch (requestData.type) {
      case MESSAGE_TYPE.SIGN_POD:
        this.signPodMessage(requestData.superStakerAddress);
        break;
      case MESSAGE_TYPE.SIGN_POD_EXTERNAL:
        this.signPodMessageExternal(requestData.id, requestData.superStakerAddress);
        break;
      case API_TYPE.SIGN_POD_EXTERNAL_REQUEST:
        this.handleSignPodRequestExternal(requestData);
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
