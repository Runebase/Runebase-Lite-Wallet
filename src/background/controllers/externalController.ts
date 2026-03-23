import RunebaseChromeController from '.';
import IController from './iController';
import { MESSAGE_TYPE } from '../../constants';
import BigNumber from 'bignumber.js';
import { SuperStaker, SuperStakerArray } from '../../types';
import { addMessageListener, isExtensionEnvironment, sendMessage } from '../../popup/abstraction';
import { proxyFetch } from '../../utils/fetchProxy';

const INIT_VALUES = {
  getPriceInterval: undefined,
  runebasePriceUSD: 0,
};

export default class ExternalController extends IController {
  private static GET_PRICE_INTERVAL_MS: number = 600000; // 10 minutes

  private getPriceInterval?: any = INIT_VALUES.getPriceInterval;
  private runebasePriceUSD: number = INIT_VALUES.runebasePriceUSD;

  constructor(main: RunebaseChromeController) {
    super('external', main);
    addMessageListener(this.handleMessage);
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
  * Gets the current Runebase market price from the RunesX DEX RUNES/USDC pool.
  */
  private getRunebasePrice = async () => {
    try {
      const response = await proxyFetch('https://www.runesx.xyz/api/runes-price');
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

        sendMessage({
          type: MESSAGE_TYPE.GET_RUNEBASE_USD_RETURN,
          runebaseUSD,
        });
      }
    } catch (_err) {
      sendMessage({
        type: MESSAGE_TYPE.GET_RUNEBASE_USD_RETURN,
        runebaseUSD: null,
      });
    }
  };

  private getSuperstakers = async () => {
    try {
      const response = await proxyFetch('https://discord.runebase.io/api/super-stakers');
      const jsonObj = await response.json();
      sendMessage({
        type: MESSAGE_TYPE.GET_SUPERSTAKERS_RETURN,
        superstakers: jsonObj.result as SuperStakerArray,
      }, () => {});
    } catch (_err) {
      // superstakers fetch failed silently
    }
  };

  private getSuperstaker = async (
    address: string,
  ) => {
    try {
      const response = await proxyFetch(`https://discord.runebase.io/api/super-staker/${address}`);
      const jsonObj = await response.json();
      sendMessage({
        type: MESSAGE_TYPE.GET_SUPERSTAKER_RETURN,
        superstaker: jsonObj.result as SuperStaker,
      }, () => {});
    } catch (_err) {
      // superstaker fetch failed silently
    }
  };

  private handleMessage = async (
    request: any
  ) => {
    const requestData = isExtensionEnvironment() ? request : request.data;
    try {
      switch (requestData.type) {
      case MESSAGE_TYPE.GET_SUPERSTAKERS:
        this.getSuperstakers();
        break;
      case MESSAGE_TYPE.GET_SUPERSTAKER:
        this.getSuperstaker(requestData.address);
        break;
      default:
        break;
      }
    } catch (err) {
      this.main.displayErrorOnPopup(err as any);
    }
  };
}
