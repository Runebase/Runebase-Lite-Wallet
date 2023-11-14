import { networks, Network } from 'runebasejs-wallet';

import RunebaseChromeController from '.';
import IController from './iController';
import { MESSAGE_TYPE, STORAGE, NETWORK_NAMES } from '../../constants';
import QryNetwork from '../../models/QryNetwork';

export default class NetworkController extends IController {
  public static NETWORKS: QryNetwork[] = [
    new QryNetwork(NETWORK_NAMES.MAINNET, networks.mainnet, 'https://explorer2.runebase.io/tx'),
    new QryNetwork(NETWORK_NAMES.TESTNET, networks.testnet, 'https://testnet2.runebase.io/tx'),
    new QryNetwork(NETWORK_NAMES.REGTEST, networks.regtest, 'http://localhost:3001/tx'),
  ];

  public get isMainNet(): boolean {
    return this.networkIndex === 0;
  }
  public get network(): Network {
    return NetworkController.NETWORKS[this.networkIndex].network;
  }
  public get explorerUrl(): string {
    return NetworkController.NETWORKS[this.networkIndex].explorerUrl;
  }
  public get networkName(): string {
    return NetworkController.NETWORKS[this.networkIndex].name;
  }

  private networkIndex: number = 0;

  constructor(main: RunebaseChromeController) {
    super('network', main);

    chrome.runtime.onMessage.addListener(this.handleMessage);
    chrome.storage.local.get([STORAGE.NETWORK_INDEX], ({ networkIndex }: any) => {
      if (networkIndex !== undefined) {
        this.networkIndex = networkIndex;
        chrome.runtime.sendMessage({ type: MESSAGE_TYPE.CHANGE_NETWORK_SUCCESS, networkIndex: this.networkIndex });
      }

      this.initFinished();
    });
  }

  /*
  * Changes the networkIndex and logs out of the loggedInAccount.
  * @param networkIndex The index of the network to change to.
  */
  public changeNetwork = (networkIndex: number) => {
    if (this.networkIndex !== networkIndex) {
      this.networkIndex = networkIndex;
      chrome.storage.local.set({
        [STORAGE.NETWORK_INDEX]: networkIndex,
      }, () => console.log('networkIndex changed', networkIndex));

      chrome.runtime.sendMessage({ type: MESSAGE_TYPE.CHANGE_NETWORK_SUCCESS, networkIndex });
      this.main.account.logoutAccount();
    }
  };

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private handleMessage = (request: any, _: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
    try {
      switch (request.type) {
        case MESSAGE_TYPE.CHANGE_NETWORK:
          this.changeNetwork(request.networkIndex);
          break;
        case MESSAGE_TYPE.GET_NETWORKS:
          sendResponse(NetworkController.NETWORKS);
          break;
        case MESSAGE_TYPE.GET_NETWORK_INDEX:
          sendResponse(this.networkIndex);
          break;
        case MESSAGE_TYPE.GET_NETWORK_EXPLORER_URL:
          sendResponse(this.explorerUrl);
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
