import SubAccount from './SubAccount';
import Wallet from './Wallet';

export default class Account {
  public name: string;
  public privateKeyHash: string;
  public subAccounts: SubAccount[] = [];
  public wallet?: Wallet;

  constructor(name: string, privateKeyHash: string, subAccounts: SubAccount[] = []) {
    this.name = name;
    this.privateKeyHash = privateKeyHash;
    this.subAccounts = subAccounts;
  }

  public addSubAccount(account: SubAccount) {
    this.subAccounts.push(account);
  }
}
