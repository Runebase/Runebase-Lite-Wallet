export default class Permission {
  public name: string;
  public allowed: boolean = false;

  constructor(name: string, allowed: boolean) {
    this.name = name;
    this.allowed = allowed;
  }
}
