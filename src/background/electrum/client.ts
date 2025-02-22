import SocketClient from './socket/socketClient';

const keepAliveInterval = 450 * 1000; // 7.5 minutes (recommended by ElectrumX)

interface PersistencePolicy {
  maxRetry: number;
  callback: (() => void) | null;
}

function makeRequest(method: string, params: any[], id: number): string {
  return JSON.stringify({
    jsonrpc: '2.0',
    method: method,
    params: params,
    id: id,
  });
}

function createPromiseResult<T>(resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) {
  return (err: Error | null, result: T) => {
    if (err) reject(err);
    else resolve(result);
  };
}

class ElectrumClient extends SocketClient {
  private static instance: ElectrumClient;
  private timeLastCall: number = 0;
  private keepAliveHandle?: NodeJS.Timeout;
  private persistencePolicy!: PersistencePolicy;
  private id: number = 0;
  private callback_message_queue: Record<number, any> = {};

  private constructor(host: string, port: number, protocol: string, options?: any) {
    super(host, port, protocol, options);
  }

  public static getInstance(host: string, port: number, protocol: string, options?: any): ElectrumClient {
    if (!ElectrumClient.instance) {
      ElectrumClient.instance = new ElectrumClient(host, port, protocol, options);
    }
    return ElectrumClient.instance;
  }

  async connect(
    clientName: string, 
    electrumProtocolVersion: string,
    persistencePolicy: PersistencePolicy = { maxRetry: 10, callback: null }
  ): Promise<void> {
    this.persistencePolicy = persistencePolicy;
    this.timeLastCall = 0;

    if (this.status === 0) {
      try {
        await super.connect();
        const banner = await this.server_banner();
        console.log(banner);

        if (clientName && electrumProtocolVersion) {
          const version = await this.server_version(clientName, electrumProtocolVersion);
          console.log(`Negotiated version: [${version}]`);
        }
      } catch (err) {
        throw new Error(`failed to connect to electrum server: [${err}]`);
      }

      this.keepAlive();
    }
  }

  async request(method: string, params: any[]): Promise<any> {
    if (this.status === 0) {
      throw new Error('connection not established');
    }

    this.timeLastCall = Date.now();

    return new Promise((resolve, reject) => {
      const id = ++this.id;
      const content = makeRequest(method, params, id);
      this.callback_message_queue[id] = createPromiseResult(resolve, reject);
      this.client.send(content + '\n');
    });
  }

  private async keepAlive(): Promise<void> {
    if (this.status !== 0) {
      this.keepAliveHandle = setInterval(async () => {
        if (this.timeLastCall !== 0 && Date.now() > this.timeLastCall + keepAliveInterval / 2) {
          try {
            await this.server_ping();
          } catch (err) {
            console.error(`ping to server failed: [${err}]`);
            this.close();
          }
        }
      }, keepAliveInterval);
    }
  }

  close(): void {
    super.close();
  }

  onClose(): void {
    super.onClose();

    const events = [
      'server.peers.subscribe',
      'blockchain.numblocks.subscribe',
      'blockchain.headers.subscribe',
      'blockchain.address.subscribe',
    ];

    events.forEach(event => this.events.removeAllListeners(event));

    if (this.keepAliveHandle) {
      clearInterval(this.keepAliveHandle);
    }
  }

  server_version(clientName: string, protocolVersion: string): Promise<any> {
    return this.request('server.version', [clientName, protocolVersion]);
  }

  server_banner(): Promise<any> {
    return this.request('server.banner', []);
  }

  server_ping(): Promise<any> {
    return this.request('server.ping', []);
  }
}

export default ElectrumClient;
