import { Network as RjswNetwork } from 'runebasejs-wallet';

export default class QryNetwork {
  public name: string;
  public network: RjswNetwork;
  public explorerUrl: string;

  constructor(name: string, network: RjswNetwork, explorerUrl: string) {
    this.name = name;
    this.network = network;
    this.explorerUrl = explorerUrl;
  }
}
