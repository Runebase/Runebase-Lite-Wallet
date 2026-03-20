import SubAccount from './SubAccount';

export default class Account {
  public name: string;
  public privateKeyHash: string;
  public subAccounts: SubAccount[] = [];

  constructor(name: string, privateKeyHash: string, subAccounts: SubAccount[] = []) {
    this.name = name;
    this.privateKeyHash = privateKeyHash;
    this.subAccounts = subAccounts;
  }

  public addSubAccount(account: SubAccount) {
    this.subAccounts.push(account);
  }
}
