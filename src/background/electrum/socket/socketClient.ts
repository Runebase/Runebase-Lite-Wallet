import { EventEmitter } from 'events';
import * as util from './util';
import WebSocketClient from './socket_client_ws';

interface Message {
  id?: number;
  error?: { message: string };
  result?: any;
  method?: string;
  params?: any;
}

interface Options {
  [key: string]: any;
}

class SocketClient {
  private id: number = 0;
  private host: string;
  private port: number;
  private protocol: string;
  private options: Options;
  public status: number = 0;
  private callback_message_queue: Record<number, (error: string | null, result?: any) => void> = {};
  public events: EventEmitter;
  private mp: util.MessageParser;
  public client: WebSocketClient;

  constructor(host: string, port: number, protocol: string, options: Options) {
    this.host = host;
    this.port = port;
    this.protocol = protocol;
    this.options = options;
    this.events = new EventEmitter();
    this.mp = new util.MessageParser((body: string, n: number) => {
      this.onMessage(body, n);
    });

    switch (protocol) {
    case 'ws':
    case 'wss':
      this.client = new WebSocketClient(this, host, port, protocol, options);
      break;
    default:
      throw new Error(`Invalid protocol: [${protocol}]`);
    }
  }

  async connect(): Promise<void> {
    if (this.status === 1) {
      return;
    }
    this.status = 1;
    return this.client.connect();
  }

  close(): void {
    if (this.status === 0) {
      return;
    }
    this.client.close();
    this.status = 0;
  }

  private response(msg: Message): void {
    const callback = this.callback_message_queue[msg.id!];
    if (callback) {
      delete this.callback_message_queue[msg.id!];
      if (msg.error) {
        callback(msg.error.message);
      } else {
        callback(null, msg.result);
      }
    } else {
      console.log("Can't get callback");
    }
  }

  private onMessage(
    body: string, 
    // _n: number
  ): void {
    const msg: Message | Message[] = JSON.parse(body);
    if (Array.isArray(msg)) {
      // Don't support batch request
      return;
    }
    if (msg.id !== undefined) {
      this.response(msg);
    } else {
      this.events.emit(msg.method!, msg.params);
    }
  }

  onConnect(): void {}

  onClose(
  // _event: any
  ): void {
    this.status = 0;
    Object.keys(this.callback_message_queue).forEach((key) => {
      this.callback_message_queue[Number(key)](new Error('Connection closed').message);
      delete this.callback_message_queue[Number(key)];
    });
  }

  onRecv(chunk: Buffer): void {
    this.mp.run(chunk);
  }

  onEnd(error: any): void {
    console.log(`onEnd: [${error}]`);
  }

  onError(error: any): void {
    console.log(`onError: [${error}]`);
  }
}

export default SocketClient;
