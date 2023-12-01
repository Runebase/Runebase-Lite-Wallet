import { networks, Network } from 'runebasejs-wallet';
import RunebaseChromeController from '.';
import IController from './iController';
import { MESSAGE_TYPE, STORAGE, NETWORK_NAMES } from '../../constants';
import QryNetwork from '../../models/QryNetwork';
import { addMessageListener, getStorageValue, isExtensionEnvironment, sendMessage, setStorageValue } from '../../popup/abstraction';

export default class NetworkController extends IController {
  public static NETWORKS: QryNetwork[] = [
    new QryNetwork(NETWORK_NAMES.MAINNET, networks.mainnet, 'https://explorer.runebase.io/tx'),
    new QryNetwork(NETWORK_NAMES.TESTNET, networks.testnet, 'https://testnet.runebase.io/tx'),
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
    console.log('getting network name');
    console.log(this.networkIndex);
    return NetworkController.NETWORKS[this.networkIndex].name;
  }

  private networkIndex: number = 0;

  constructor(main: RunebaseChromeController) {
    super('network', main);

    addMessageListener(this.handleMessage);

    const key = STORAGE.NETWORK_INDEX;
    getStorageValue(key).then((networkIndex) => {
      console.log('getting network index from store:', networkIndex);
      if (networkIndex) {
        console.log('FOUND NETWORKINDEX IN LOCAL STORE: ', networkIndex);
        this.networkIndex = networkIndex;
        sendMessage({
          type: MESSAGE_TYPE.CHANGE_NETWORK_SUCCESS,
          networkIndex: this.networkIndex,
        }, () => {});
      }
      this.initFinished();
    });

  }

  /*
  * Changes the networkIndex and logs out of the loggedInAccount.
  * @param networkIndex The index of the network to change to.
  */
  public changeNetwork = async (networkIndex: number) => {
    console.log('CHANGING NETWORK TO ID:' , networkIndex);
    if (this.networkIndex !== networkIndex) {
      this.networkIndex = networkIndex;

      await setStorageValue(STORAGE.NETWORK_INDEX, networkIndex);
      console.log('networkIndex changed', networkIndex);

      sendMessage({
        type: MESSAGE_TYPE.CHANGE_NETWORK_SUCCESS,
        networkIndex,
      }, () => {});

      this.main.account.logoutAccount();
    }
  };

  private handleMessage = (request: any, _?: chrome.runtime.MessageSender, sendResponse?: (response: any) => void) => {
    const requestData = isExtensionEnvironment() ? request : request.data;
    try {
      console.log('network received request handleMessage: ', requestData);
      switch (requestData.type) {
      case MESSAGE_TYPE.CHANGE_NETWORK:
        this.changeNetwork(requestData.networkIndex);
        break;
      case MESSAGE_TYPE.GET_NETWORKS:
        sendMessage({
          type: MESSAGE_TYPE.GET_NETWORKS_RETURN,
          networks: NetworkController.NETWORKS,
        }, () => {});
        break;
      case MESSAGE_TYPE.GET_NETWORK_INDEX:
        sendMessage({
          type: MESSAGE_TYPE.GET_NETWORK_INDEX_RETURN,
          networkIndex: this.networkIndex,
        }, () => {});
        break;
      case MESSAGE_TYPE.GET_NETWORK_EXPLORER_URL:
        sendResponse && sendResponse(this.explorerUrl);
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
