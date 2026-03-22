import RunebaseChromeController from '.';
import IController from './iController';
import { API_TYPE, MESSAGE_TYPE } from '../../constants';
import { PodSignResponse } from '../../types';
import { addMessageListener, isExtensionEnvironment, sendMessage } from '../../popup/abstraction';

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

  public handleSignPod = async (id: string, superStakerAddress: string): Promise<PodSignResponse> => {
    let result: any;
    let error: string | undefined;
    try {
      if (!superStakerAddress) {
        throw Error('Requires superStakerAddress argument.');
      }

      const acct = this.main.account.loggedInAccount;
      if (!acct || !acct.wallet) {
        throw Error('Invalid account or wallet.');
      }

      // Use the Wallet model's signPoD method which handles all the crypto
      result = acct.wallet.signPoD(superStakerAddress);

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

  private sendPodResponseToActiveTab = (id: string, result: any, error?: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([{ id: tabID }]) => {
      chrome.tabs.sendMessage(tabID!, { type: MESSAGE_TYPE.SIGN_POD_EXTERNAL_RETURN, id, result, error });
    });
  };

  private signPodMessageExternal = async (id: string, superStakerAddress: string) => {
    const { result, error } = await this.handleSignPod(id, superStakerAddress);
    this.sendPodResponseToActiveTab(id, result, error);
  };

  private signPodMessage = async (superStakerAddress: string) => {
    const { result, error } = await this.handleSignPod('', superStakerAddress);
    sendMessage({
      type: MESSAGE_TYPE.SIGN_POD_RETURN,
      result: JSON.stringify(result),
      error: error,
    }, () => {});
  };

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
