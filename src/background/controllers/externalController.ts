import RunebaseChromeController from '.';
import IController from './iController';
import { MESSAGE_TYPE } from '../../constants';
import BigNumber from 'bignumber.js';
import { SuperStaker, SuperStakerArray } from '../../types';

const INIT_VALUES = {
  getPriceInterval: undefined,
  runebasePriceUSD: 0,
};

export default class ExternalController extends IController {
  private static GET_PRICE_INTERVAL_MS: number = 60000;

  private getPriceInterval?: any = INIT_VALUES.getPriceInterval;
  private runebasePriceUSD: number = INIT_VALUES.runebasePriceUSD;

  constructor(main: RunebaseChromeController) {
    super('external', main);
    chrome.runtime.onMessage.addListener(this.handleMessage);
    this.initFinished();
  }

  public calculateRunebaseToUSD = (balance: number): number => {
    return this.runebasePriceUSD
      ? new BigNumber(balance).dividedBy(1e8).times(this.runebasePriceUSD).dp(4).toNumber()
      : 0;
  };

  /*
  * Starts polling for periodic info updates.
  */
  public startPolling = async () => {
    await this.getRunebasePrice();
    if (!this.getPriceInterval) {
      this.getPriceInterval = setInterval(() => {
        this.getRunebasePrice();
      }, ExternalController.GET_PRICE_INTERVAL_MS);
    }
  };

  /*
  * Stops polling for the periodic info updates.
  */
  public stopPolling = () => {
    if (this.getPriceInterval) {
      clearInterval(this.getPriceInterval);
      this.getPriceInterval = undefined;
    }
  };

  /*
  * Gets the current Runebase market price.
  */
  private getRunebasePrice = async () => {
    try {
      // Replace Axios with Fetch API
      const response = await fetch('https://api.coinpaprika.com/v1/ticker/runes-runebase');
      const jsonObj = await response.json();

      this.runebasePriceUSD = jsonObj.price_usd;

      if (
        this.main.account.loggedInAccount &&
        this.main.account.loggedInAccount.wallet &&
        this.main.account.loggedInAccount.wallet.info
      ) {
        const runebaseUSD = this.calculateRunebaseToUSD(
          Number(this.main.account.loggedInAccount.wallet.info.balance)
        );
        this.main.account.loggedInAccount.wallet.runebaseUSD = runebaseUSD;

        chrome.runtime.sendMessage({
          type: MESSAGE_TYPE.GET_RUNEBASE_USD_RETURN,
          runebaseUSD,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  private getSuperstakers = async () => {
    try {
      const response = await fetch('https://discord.runebase.io/api/super-stakers');
      const jsonObj = await response.json();
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPE.GET_SUPERSTAKERS_RETURN,
        superstakers: jsonObj.result as SuperStakerArray,
      });
    } catch (err) {
      console.log(err);
    }
  };

  private getSuperstaker = async (
    address: string,
  ) => {
    try {
      const response = await fetch(`https://discord.runebase.io/api/super-staker/${address}`);
      const jsonObj = await response.json();
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPE.GET_SUPERSTAKER_RETURN,
        superstaker: jsonObj.result as SuperStaker,
      });
    } catch (err) {
      console.log(err);
    }
  };

  private handleMessage = async (
    request: any
  ) => {
    try {
      switch (request.type) {
      case MESSAGE_TYPE.GET_SUPERSTAKERS:
        this.getSuperstakers();
        break;
      case MESSAGE_TYPE.GET_SUPERSTAKER:
        this.getSuperstaker(request.address);
        break;
      default:
        break;
      }
    } catch (err) {
      console.error(err);
      this.main.displayErrorOnPopup(err as any);
    }
  };
}
