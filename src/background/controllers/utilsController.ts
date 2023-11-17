import { WalletRPCProvider } from 'runebasejs-wallet';
import RunebaseChromeController from '.';
import IController from './iController';
import { API_TYPE, MESSAGE_TYPE } from '../../constants';
import { PodSignResponse } from '../../types';
import runebase from 'runebasejs-lib';
import secp256k1 from 'secp256k1';
import createHash from 'create-hash';

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

    chrome.runtime.onMessage.addListener(this.handleMessage);
    this.initFinished();
  }

  /*
  * Gets the current logged in RPC provider.
  * @return Logged in account's RPC provider.
  */
  private rpcProvider = (): WalletRPCProvider | undefined => {
    const acct = this.main.account.loggedInAccount;
    return acct && acct.wallet && acct.wallet.rpcProvider;
  };

  private handleSignPodRequest = (request: any) => {
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
      const rpcProvider = this.rpcProvider();
      if (!rpcProvider) {
        throw Error('Cannot call contract without RPC provider.');
      }

      if (!superStakerAddress) {
        throw Error('Requires first two arguments: contractAddress and data.');
      }

      const acct = this.main.account.loggedInAccount;
      if (!acct || !acct.wallet || !acct.wallet.qjsWallet || !acct.wallet.qjsWallet.keyPair) {
        throw Error('Invalid account or key pair.');
      }
      const keyPair = acct.wallet.qjsWallet.keyPair;
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
        keyPair.d.toBuffer()
      );
      const signed = Buffer.concat([
        Buffer.from([recid + (keyPair.compressed ? 31 : 27)]),
        signature
      ]);
      const podMessage = `0x${signed.toString('hex')}`;

      const pubKey = secp256k1.publicKeyCreate(keyPair.d.toBuffer());
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
        delegatorAddress: acct.wallet.qjsWallet.address,
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
      chrome.tabs.sendMessage(tabID!, { type: MESSAGE_TYPE.SIGN_POD_RETURN, id, result, error });
    });
  };

  /*
  * Handles a callContract requested externally and sends the response back to the active tab.
  * @param id Request ID.
  * @param args Request arguments. [contractAddress, data, amount?, gasLimit?, gasPrice?]
  */
  private signPodMessage = async (id: string, superStakerAddress: string) => {
    if (!this.rpcProvider()) {
      throw Error('Cannot call RPC without provider.');
    }

    const { result, error } = await this.handleSignPod(id, superStakerAddress);
    this.sendPodResponseToActiveTab(id, result, error);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
  private handleMessage = (request: any, _: chrome.runtime.MessageSender) => {
    try {
      switch (request.type) {
      case MESSAGE_TYPE.SIGN_POD:
        this.signPodMessage(request.id, request.superStakerAddress);
        break;
      case API_TYPE.SIGN_POD_REQUEST:
        this.handleSignPodRequest(request);
        break;  // Add this break statement
      default:
        break;
      }
    } catch (err) {
      console.error(err);
      this.main.displayErrorOnPopup(err as any);
    }
  };
}
