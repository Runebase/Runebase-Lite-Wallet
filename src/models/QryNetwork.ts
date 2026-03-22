import { RunebaseNetwork } from '../services/wallet/networks';
import { ElectrumXServerConfig } from '../services/electrumx/types';

export default class QryNetwork {
  public name: string;
  public network: RunebaseNetwork;
  public explorerUrl: string;
  public explorerApiUrl: string;
  public electrumxServers: ElectrumXServerConfig[];

  constructor(
    name: string,
    network: RunebaseNetwork,
    explorerUrl: string,
    explorerApiUrl: string,
    electrumxServers: ElectrumXServerConfig[],
  ) {
    this.name = name;
    this.network = network;
    this.explorerUrl = explorerUrl;
    this.explorerApiUrl = explorerApiUrl;
    this.electrumxServers = electrumxServers;
  }
}
