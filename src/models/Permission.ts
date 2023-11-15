import { observable, makeObservable } from 'mobx';

export default class Permission {
  @observable public name: string;
  @observable public allowed: boolean = false;

  constructor(name: string, allowed: boolean) {
    makeObservable(this);
    this.name = name;
    this.allowed = allowed;
  }
}
