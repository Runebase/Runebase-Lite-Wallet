import { w3cwebsocket as W3CWebSocket } from 'websocket';

interface WebSocketClientOptions {
  [key: string]: any;
}

interface WebSocketClientSelf {
  onError: (error: Error) => void;
  onClose: (event: CloseEvent) => void;
  onMessage: (data: string) => void;
  onConnect: () => void;
}

class WebSocketClient {
  private self: WebSocketClientSelf;
  private host: string;
  private port: number;
  private protocol: string;
  private options?: WebSocketClientOptions;
  private client: W3CWebSocket | null = null;

  constructor(
    self: WebSocketClientSelf, 
    host: string, 
    port: number, 
    protocol: string, 
    options?: WebSocketClientOptions
  ) {
    this.self = self;
    this.host = host;
    this.port = port;
    this.protocol = protocol;
    this.options = options;
  }

  async connect(): Promise<void> {
    const url = `${this.protocol}://${this.host}:${this.port}`;
    const client = new W3CWebSocket(url, undefined, undefined, undefined, this.options);
    this.client = client;

    return new Promise((resolve, reject) => {
      client.onerror = (error: Event) => {
        this.self.onError(error as Error);
      };

      client.onclose = (event: CloseEvent) => {
        this.self.onClose(event);
        reject(new Error(`WebSocket connection closed: code: [${event.code}], reason: [${event.reason}]`));
      };

      client.onmessage = (message: MessageEvent) => {
        this.self.onMessage(message.data);
      };

      client.onopen = () => {
        if (client.readyState === W3CWebSocket.OPEN) {
          this.self.onConnect();
          resolve();
        }
      };
    });
  }

  async close(): Promise<void> {
    this.client?.close(1000, 'close connection');
  }

  send(data: string): void {
    this.client?.send(data);
  }
}

export default WebSocketClient;