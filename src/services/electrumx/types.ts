// ElectrumX JSON-RPC Types

export interface ElectrumXServerConfig {
  host: string;
  port: number;
  protocol: 'wss' | 'ws' | 'ssl' | 'tcp';
  label?: string;
}

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: unknown[];
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: { code: number; message: string };
}

export interface JsonRpcNotification {
  jsonrpc: '2.0';
  method: string;
  params: unknown[];
}

// ElectrumX response types

export interface ElectrumXBalance {
  confirmed: number;
  unconfirmed: number;
}

export interface ElectrumXUtxo {
  tx_hash: string;
  tx_pos: number;
  height: number;
  value: number;
}

export interface ElectrumXHistoryItem {
  tx_hash: string;
  height: number;
  fee?: number;
}

export interface ElectrumXTransaction {
  hex: string;
  txid: string;
  hash: string;
  size: number;
  vsize: number;
  version: number;
  locktime: number;
  vin: ElectrumXVin[];
  vout: ElectrumXVout[];
  blockhash?: string;
  confirmations?: number;
  time?: number;
  blocktime?: number;
}

export interface ElectrumXVin {
  txid: string;
  vout: number;
  scriptSig: { asm: string; hex: string };
  sequence: number;
  value?: number;
  address?: string;
}

export interface ElectrumXVout {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    type: string;
    address?: string;    // Runebase daemon uses singular
    addresses?: string[]; // Some daemons use plural array
  };
}

export interface ElectrumXHeaderNotification {
  height: number;
  hex: string;
}

export interface ElectrumXContractCallResult {
  address: string;
  executionResult: {
    gasUsed: number;
    excepted: string;
    newAddress: string;
    output: string;
    codeDeposit: number;
    gasRefunded: number;
    depositSize: number;
    gasForDeposit: number;
  };
  transactionReceipt: {
    stateRoot: string;
    gasUsed: number;
    bloom: string;
    log: unknown[];
  };
}

export interface ElectrumXTokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string;
}

export interface ElectrumXEventHistoryItem {
  tx_hash: string;
  height: number;
  log_index: number;
}

/** Paginated response from get_history / event.get_history when limit/offset are provided */
export interface ElectrumXPaginatedHistory<T> {
  items: T[];
  total: number;
}

export interface ElectrumXServerFeatures {
  genesis_hash: string;
  hosts: Record<string, Record<string, number>>;
  protocol_max: string;
  protocol_min: string;
  pruning?: number;
  server_version: string;
  hash_function: string;
}

export type SubscriptionCallback = (params: unknown[]) => void;

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed';

export interface ElectrumXClientEvents {
  connected: () => void;
  disconnected: (reason?: string) => void;
  error: (error: Error) => void;
  notification: (method: string, params: unknown[]) => void;
}
