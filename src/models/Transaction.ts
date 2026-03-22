export default class Transaction {
  public id?: string;
  public timestamp?: string;
  public confirmations: number = 0;
  public amount: number = 0;
  public fee?: number; // network fee in satoshi
  public qrc20TokenTransfers: Qrc20TokenTransfer[] = [];

  public get pending() {
    return !this.confirmations;
  }

  constructor(attributes: TransactionAttributes = {}) {
    Object.assign(this, attributes);

    if (attributes.qrc20TokenTransfers) {
      this.qrc20TokenTransfers = attributes.qrc20TokenTransfers.map(
        (transfer) => new Qrc20TokenTransfer(transfer)
      );
    }
  }
}

interface TransactionAttributes {
  id?: string;
  timestamp?: string;
  confirmations?: number;
  amount?: number;
  fee?: number;
  qrc20TokenTransfers?: Qrc20TokenTransfer[];
}

export class Qrc20TokenTransfer {
  public address?: string;
  public addressHex?: string;
  public name?: string;
  public symbol?: string;
  public decimals?: number;
  public from?: string;
  public to?: string;
  public value?: string;

  constructor(attributes: Qrc20TokenTransferAttributes = {}) {
    Object.assign(this, attributes);
  }
}

interface Qrc20TokenTransferAttributes {
  address?: string;
  addressHex?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  from?: string;
  to?: string;
  value?: string;
}
