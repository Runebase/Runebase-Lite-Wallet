// ElectrumX WebSocket JSON-RPC Client - single server connection
import {
  ConnectionState,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcNotification,
  SubscriptionCallback,
  ElectrumXServerConfig,
} from './types';

interface PendingRequest {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export default class ElectrumXClient {
  private ws: WebSocket | null = null;
  private config: ElectrumXServerConfig;
  private requestId = 0;
  private pending = new Map<number, PendingRequest>();
  private subscriptions = new Map<string, SubscriptionCallback[]>();
  private _state: ConnectionState = 'disconnected';
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private requestTimeoutMs = 30000;
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;

  // Event callbacks
  public onConnected?: () => void;
  public onDisconnected?: (reason?: string) => void;
  public onError?: (error: Error) => void;

  constructor(config: ElectrumXServerConfig) {
    this.config = config;
  }

  get state(): ConnectionState {
    return this._state;
  }

  get serverLabel(): string {
    return this.config.label || `${this.config.host}:${this.config.port}`;
  }

  async connect(): Promise<void> {
    if (this._state === 'connected' || this._state === 'connecting') return;

    this._state = 'connecting';

    return new Promise((resolve, reject) => {
      try {
        const url = `${this.config.protocol}://${this.config.host}:${this.config.port}`;
        this.ws = new WebSocket(url);

        const connectTimeout = setTimeout(() => {
          if (this._state === 'connecting') {
            this.ws?.close();
            this._state = 'failed';
            reject(new Error(`Connection timeout to ${this.serverLabel}`));
          }
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(connectTimeout);
          this._state = 'connected';
          this.startKeepAlive();
          this.onConnected?.();
          resolve();
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectTimeout);
          this.cleanup();
          const reason = event.reason || 'Connection closed';
          this._state = 'disconnected';
          this.onDisconnected?.(reason);
        };

        this.ws.onerror = () => {
          clearTimeout(connectTimeout);
          const error = new Error(`WebSocket error connecting to ${this.serverLabel}`);
          this._state = 'failed';
          this.onError?.(error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data as string);
        };
      } catch (err) {
        this._state = 'failed';
        reject(err);
      }
    });
  }

  async disconnect(): Promise<void> {
    this.stopReconnect();
    this.stopKeepAlive();
    this.cleanup();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
    this._state = 'disconnected';
  }

  async request(method: string, params: unknown[] = []): Promise<unknown> {
    if (this._state !== 'connected' || !this.ws) {
      throw new Error(`Not connected to ${this.serverLabel}`);
    }

    const id = ++this.requestId;
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Request timeout: ${method}`));
      }, this.requestTimeoutMs);

      this.pending.set(id, { resolve, reject, timer });
      this.ws!.send(JSON.stringify(request));
    });
  }

  subscribe(method: string, callback: SubscriptionCallback): void {
    const existing = this.subscriptions.get(method) || [];
    existing.push(callback);
    this.subscriptions.set(method, existing);
  }

  unsubscribe(method: string, callback: SubscriptionCallback): void {
    const existing = this.subscriptions.get(method);
    if (existing) {
      const filtered = existing.filter((cb) => cb !== callback);
      if (filtered.length > 0) {
        this.subscriptions.set(method, filtered);
      } else {
        this.subscriptions.delete(method);
      }
    }
  }

  private handleMessage(data: string): void {
    try {
      const messages = data.includes('\n')
        ? data.split('\n').filter(Boolean)
        : [data];

      for (const msgStr of messages) {
        const msg = JSON.parse(msgStr);

        // Check if it's a notification (no id field)
        if (msg.method && msg.id === undefined) {
          this.handleNotification(msg as JsonRpcNotification);
        } else if (msg.id !== undefined) {
          this.handleResponse(msg as JsonRpcResponse);
        }
      }
    } catch (err) {
      console.error('ElectrumX: Failed to parse message:', err);
    }
  }

  private handleResponse(response: JsonRpcResponse): void {
    const pending = this.pending.get(response.id);
    if (!pending) return;

    clearTimeout(pending.timer);
    this.pending.delete(response.id);

    if (response.error) {
      pending.reject(new Error(response.error.message));
    } else {
      pending.resolve(response.result);
    }
  }

  private handleNotification(notification: JsonRpcNotification): void {
    const callbacks = this.subscriptions.get(notification.method);
    if (callbacks) {
      for (const cb of callbacks) {
        try {
          cb(notification.params);
        } catch (err) {
          console.error('ElectrumX: Subscription callback error:', err);
        }
      }
    }
  }

  private startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(async () => {
      try {
        await this.request('server.ping');
      } catch {
        // Ping failed, connection likely dead
        console.warn('ElectrumX: Keep-alive ping failed');
      }
    }, 60000);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private cleanup(): void {
    this.stopKeepAlive();
    // Reject all pending requests
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Connection closed'));
      this.pending.delete(id);
    }
  }
}
