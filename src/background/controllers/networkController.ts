import RunebaseChromeController from '.';
import IController from './iController';
import { MESSAGE_TYPE, STORAGE, NETWORK_NAMES } from '../../constants';
import QryNetwork from '../../models/QryNetwork';
import { mainnet, testnet, regtest } from '../../services/wallet/networks';
import { ElectrumXManager } from '../../services/electrumx';
import { addMessageListener, isExtensionEnvironment, sendMessage, setStorageValue } from '../../popup/abstraction';

export default class NetworkController extends IController {
  public static NETWORKS: QryNetwork[] = [
    new QryNetwork(NETWORK_NAMES.MAINNET, mainnet, 'https://explorer.runebase.io/tx', 'https://explorer.runebase.io/api', [
      { host: 'electrum1.runebase.io', port: 50004, protocol: 'wss', label: 'Runebase Electrum 1' },
      { host: 'electrum2.runebase.io', port: 50004, protocol: 'wss', label: 'Runebase Electrum 2' },
      { host: 'electrum3.runebase.io', port: 50004, protocol: 'wss', label: 'Runebase Electrum 3' },
      { host: 'electrum4.runebase.io', port: 50004, protocol: 'wss', label: 'Runebase Electrum 4' },
    ]),
    new QryNetwork(NETWORK_NAMES.TESTNET, testnet, 'https://testnet.runebase.io/tx', 'https://testnet.runebase.io/api', [
      { host: 'testelectrum1.runebase.io', port: 50004, protocol: 'wss', label: 'Runebase Testnet Electrum 1' },
      { host: 'testelectrum2.runebase.io', port: 50004, protocol: 'wss', label: 'Runebase Testnet Electrum 2' },
    ]),
    new QryNetwork(NETWORK_NAMES.REGTEST, regtest, 'http://localhost:3001/tx', 'http://localhost:3001/api', [
      { host: '127.0.0.1', port: 50004, protocol: 'ws', label: 'Local Regtest' },
    ]),
  ];

  public electrumx?: ElectrumXManager;
  private connectPromise: Promise<ElectrumXManager> | null = null;

  public get isMainNet(): boolean {
    return this.networkIndex === 0;
  }
  public get network(): QryNetwork {
    return NetworkController.NETWORKS[this.networkIndex];
  }
  /** The RunebaseNetwork params (pubKeyHash, scriptHash, wif, etc.) */
  public get runebaseNetwork(): import('../../services/wallet/networks').RunebaseNetwork {
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

    addMessageListener(this.handleMessage);

    // Always default to mainnet (network selector is currently disabled)
    this.networkIndex = 0;
    setStorageValue(STORAGE.NETWORK_INDEX, 0);
    this.initFinished();

  }

  /**
   * Connect to ElectrumX servers for the current network.
   * Reuses an existing connection if already connected/connecting.
   * Pass force=true to tear down and reconnect (e.g. after network change).
   */
  public connectElectrumX = async (
    force = false,
  ): Promise<ElectrumXManager> => {
    // Reuse existing connection if alive or in progress
    if (
      !force
      && this.electrumx
      && (this.electrumx.state === 'connected'
        || this.electrumx.state === 'connecting'
        || this.electrumx.state === 'reconnecting')
    ) {
      return this.electrumx;
    }

    // If a connection attempt is already in flight, share it
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = this.doConnectElectrumX();
    try {
      return await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  };

  private doConnectElectrumX = async (): Promise<ElectrumXManager> => {
    // Disconnect existing if any
    if (this.electrumx) {
      await this.electrumx.disconnect();
    }

    const servers = this.network.electrumxServers;
    this.electrumx = new ElectrumXManager(servers);

    this.electrumx.onConnected = () => {
      this.broadcastElectrumXStatus();
    };
    this.electrumx.onDisconnected = (reason?: string) => {
      console.warn(`ElectrumX: Disconnected: ${reason}`);
      this.broadcastElectrumXStatus();
    };
    this.electrumx.onError = () => {
      // Errors are handled by connect/failover logic — suppress noise
    };
    this.electrumx.onServerChanged = () => {
      this.broadcastElectrumXStatus();
    };

    await this.electrumx.connect();
    return this.electrumx;
  };

  /**
   * Switch to a specific ElectrumX server by index.
   */
  public switchElectrumXServer = async (serverIndex: number) => {
    if (!this.electrumx) return;
    try {
      await this.electrumx.switchServer(serverIndex);
    } finally {
      // Always broadcast status so the UI reflects the current state
      // (whether we connected to the new server or fell back to the old one)
      this.broadcastElectrumXStatus();
    }
  };

  /**
   * Build and send the current ElectrumX status to the popup.
   */
  public broadcastElectrumXStatus = (messageType: string = MESSAGE_TYPE.ELECTRUMX_STATUS_CHANGED) => {
    const status = this.getElectrumXStatus();
    sendMessage({ type: messageType, electrumxStatus: status });
  };

  public getElectrumXStatus = () => {
    if (!this.electrumx) {
      return {
        state: 'disconnected' as const,
        serverLabel: '',
        serverIndex: -1,
        servers: this.network.electrumxServers,
      };
    }
    const current = this.electrumx.currentServer;
    return {
      state: this.electrumx.state,
      serverLabel: current ? (current.label || `${current.host}:${current.port}`) : '',
      serverIndex: this.electrumx.currentServerIndex,
      servers: this.electrumx.serverList,
    };
  };

  /*
  * Changes the networkIndex and logs out of the loggedInAccount.
  * @param networkIndex The index of the network to change to.
  */
  public changeNetwork = async (networkIndex: number) => {
    if (this.networkIndex !== networkIndex) {
      this.networkIndex = networkIndex;

      await setStorageValue(STORAGE.NETWORK_INDEX, networkIndex);

      sendMessage({
        type: MESSAGE_TYPE.CHANGE_NETWORK_SUCCESS,
        networkIndex,
      });

      this.main.account.logoutAccount();
    }
  };

  private handleMessage = async (
    request: any, _?: chrome.runtime.MessageSender, sendResponse?: (response: any) => void,
  ) => {
    const inExtensionEnvironment = isExtensionEnvironment();
    const requestData = inExtensionEnvironment ? request : request.data;
    try {
      switch (requestData.type) {
      case MESSAGE_TYPE.CHANGE_NETWORK:
        await this.changeNetwork(requestData.networkIndex);
        break;
      case MESSAGE_TYPE.GET_NETWORKS:
        sendMessage({
          type: MESSAGE_TYPE.GET_NETWORKS_RETURN,
          networks: NetworkController.NETWORKS,
        });
        break;
      case MESSAGE_TYPE.GET_NETWORK_INDEX:
        sendMessage({
          type: MESSAGE_TYPE.GET_NETWORK_INDEX_RETURN,
          networkIndex: this.networkIndex,
        });
        break;
      case MESSAGE_TYPE.GET_ELECTRUMX_STATUS:
        this.broadcastElectrumXStatus(MESSAGE_TYPE.GET_ELECTRUMX_STATUS_RETURN);
        break;
      case MESSAGE_TYPE.SWITCH_ELECTRUMX_SERVER:
        await this.switchElectrumXServer(requestData.serverIndex);
        break;
      case MESSAGE_TYPE.GET_NETWORK_EXPLORER_URL:
        sendResponse && sendResponse(this.explorerUrl);
        if (inExtensionEnvironment) {
          sendResponse?.(this.explorerUrl);
        } else {
          sendMessage({
            type: MESSAGE_TYPE.USE_CALLBACK,
            id: requestData.id,
            result: this.explorerUrl,
          });
        }
        break;
      default:
        break;
      }
    } catch (err) {
      this.main.displayErrorOnPopup(err as any);
    }
  };
}
