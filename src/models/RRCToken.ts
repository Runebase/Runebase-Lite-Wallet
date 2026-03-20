export default class RRCToken {
  public name: string;
  public symbol: string;
  public decimals: number;
  public address: string;
  public balance?: number;

  constructor(
    name: string,
    symbol: string,
    decimals: number,
    address: string
  ) {
    this.name = name;
    this.symbol = symbol;
    this.decimals = decimals;
    this.address = address;
  }
}
