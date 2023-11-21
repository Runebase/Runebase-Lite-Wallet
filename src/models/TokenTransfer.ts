import { round } from 'lodash';
import { observable, computed, makeObservable } from 'mobx';
import moment from 'moment';

interface Token {
  address: string;
  addressHex: string;
  name: string;
  symbol: string;
  decimals: number;
  amount: string;
  balance: string;
}

interface TokenTransferData {
  id: string;
  blockHash: string;
  blockHeight: number;
  timestamp: number;
  tokens: Token[];
}

export default class TokenTransfer {
  @observable public id: string;
  @observable public blockHash: string;
  @observable public blockHeight: number;
  @observable public timestamp: string;
  @observable public tokens: Token[];
  @observable public confirmations: number = 0;
  @observable public amount: number = 0;

  constructor(data: TokenTransferData) {
    makeObservable(this);
    this.id = data.id;
    this.blockHash = data.blockHash;
    this.blockHeight = data.blockHeight;
    this.timestamp = moment(data.timestamp).format('MM-DD-YYYY, HH:mm');
    this.tokens = data.tokens;
    this.confirmations = 0;
    this.amount = round(Number(data.tokens[0]?.amount), 8);
  }

  @computed
  public get pending(): boolean {
    return this.confirmations === 0;
  }
}
