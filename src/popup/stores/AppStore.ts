// AppStore.ts
import NavBarStore from './components/NavBarStore';
import SessionStore from './SessionStore';
import LoginStore from './LoginStore';
import CreateWalletStore from './CreateWalletStore';
import SaveMnemonicStore from './SaveMnemonicStore';
import AccountLoginStore from './AccountLoginStore';
import ImportStore from './ImportStore';
import SettingsStore from './SettingsStore';
import AccountDetailStore from './AccountDetailStore';
import SendStore from './SendStore';
import AddTokenStore from './AddTokenStore';
import MainContainerStore from './MainContainerStore';
import DelegateStore from './DelegateStore';
import { NavigateFunction } from 'react-router-dom';

export default class AppStore {
  public navigate?: NavigateFunction;
  public sessionStore: SessionStore;
  public navBarStore: NavBarStore;
  public loginStore: LoginStore;
  public createWalletStore: CreateWalletStore;
  public saveMnemonicStore: SaveMnemonicStore;
  public accountLoginStore: AccountLoginStore;
  public importStore: ImportStore;
  public settingsStore: SettingsStore;
  public accountDetailStore: AccountDetailStore;
  public sendStore: SendStore;
  public addTokenStore: AddTokenStore;
  public mainContainerStore: MainContainerStore;
  public delegateStore: DelegateStore;

  constructor() {
    this.sessionStore = new SessionStore(this);
    this.navBarStore = new NavBarStore(this);
    this.loginStore = new LoginStore(this);
    this.createWalletStore = new CreateWalletStore(this);
    this.saveMnemonicStore = new SaveMnemonicStore(this);
    this.accountLoginStore = new AccountLoginStore(this);
    this.importStore = new ImportStore(this);
    this.settingsStore = new SettingsStore();
    this.accountDetailStore = new AccountDetailStore(this);
    this.sendStore = new SendStore(this);
    this.addTokenStore = new AddTokenStore(this);
    this.delegateStore = new DelegateStore(this);
    this.mainContainerStore = new MainContainerStore(this);
  }

  // Add this method to set the custom navigation functions
  public setNavigate = (navigate: NavigateFunction) => {
    this.navigate = navigate;
  };
}

export const store = new AppStore();
Object.assign(window, { store });
