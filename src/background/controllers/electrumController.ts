import ElectrumClient from '../electrum/client';
import RunebaseChromeController from '.';
import IController from './iController';

export default class ElectrumController extends IController {
  private electrumClient!: ElectrumClient;
  private isConnected: boolean = false; // New flag to track connection status

  constructor(main: RunebaseChromeController) {
    super('electrum', main);

    // Get the singleton instance and connect to the server
    this.electrumClient = ElectrumClient.getInstance('electrum2.runebase.io', 50004, 'wss');
    this.connectToElectrumServer().catch(err => {
      console.error('Final connection attempt failed:', err);
    });
    this.initFinished();
  }

  async connectToElectrumServer(
    maxRetries: number = 3, 
    // timeout: number = 10000
  ) {
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        await this.electrumClient.connect('RuneBase Lite Wallet', '1.4.2');
        this.isConnected = true; // Update status to connected
        console.log('Successfully connected to the Electrum server!');
        const serverBanner = await this.electrumClient.server_banner();
        console.log(serverBanner);
        return;
      } catch (err) {
        console.error(`Attempt ${attempts + 1} failed: ${err}`);
        attempts++;

        if (attempts >= maxRetries) {
          console.error('Max retries reached. Could not connect to the Electrum server.');
        }
      }
    }
  }

  // Check if connected
  public isElectrumConnected(): boolean {
    return this.isConnected;
  }
}
