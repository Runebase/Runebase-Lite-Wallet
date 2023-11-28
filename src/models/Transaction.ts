import { observable, computed, makeObservable } from 'mobx';

export default class Transaction {
  @observable public id?: string;
  @observable public timestamp?: string;
  @observable public confirmations: number = 0;
  @observable public amount: number = 0;
  @observable public qrc20TokenTransfers: Qrc20TokenTransfer[] = [];

  @computed public get pending() {
    return !this.confirmations;
  }

  constructor(attributes: TransactionAttributes = {}) {
    makeObservable(this);
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
  qrc20TokenTransfers?: Qrc20TokenTransfer[];
}

export class Qrc20TokenTransfer {
  @observable public address?: string;
  @observable public addressHex?: string;
  @observable public name?: string;
  @observable public symbol?: string;
  @observable public decimals?: number;
  @observable public from?: string;
  @observable public to?: string;
  @observable public value?: string;

  constructor(attributes: Qrc20TokenTransferAttributes = {}) {
    makeObservable(this);
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
