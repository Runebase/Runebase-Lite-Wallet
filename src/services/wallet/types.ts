/**
 * Wallet types - replaces RunebaseInfo.* types from runebasejs-wallet
 */

export interface IAddressInfo {
  address: string;
  balance: number;       // confirmed balance in satoshi
  unconfirmedBalance: number;
  totalReceived?: number;
  totalSent?: number;
  transactionCount?: number;
  ranking?: number;
}

export interface IBlockchainInfo {
  height: number;
  feeRate: number;       // estimated fee rate per KB
  relayFee: number;
}

export interface IGetAddressDelegation {
  staker: string;
  fee: number;
  blockHeight: number;
  PoD: string;
}

export interface ISendRawTxResult {
  txid: string;
}

export interface IContractCall {
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
    formattedOutput?: any[];
  };
  transactionReceipt: {
    stateRoot: string;
    gasUsed: number;
    bloom: string;
    log: unknown[];
  };
}
