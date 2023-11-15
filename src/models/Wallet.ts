import { action, makeObservable } from 'mobx';
import {
  Wallet as RunebaseWallet,
  Insight,
  WalletRPCProvider,
} from 'runebasejs-wallet';
import deepEqual from 'deep-equal';

import { ISigner } from '../types';
import { ISendTxOptions } from 'runebasejs-wallet/lib/tx';
import { RPC_METHOD, NETWORK_NAMES } from '../constants';

export default class Wallet implements ISigner {
  public qjsWallet?: RunebaseWallet;
  public rpcProvider?: WalletRPCProvider;
  public info?: Insight.IGetInfo;
  public runebaseUSD?: number;
  public maxRunebaseSend?: number;

  constructor(qjsWallet: RunebaseWallet) {
    makeObservable(this);
    this.qjsWallet = qjsWallet;
    this.rpcProvider = new WalletRPCProvider(this.qjsWallet);
  }

  @action
  public updateInfo = async () => {
    if (!this.qjsWallet) {
      console.error('Cannot updateInfo without qjsWallet instance.');
    }

    /**
     * We add a timeout promise to handle if qjsWallet hangs when executing getInfo.
     * (This happens if the insight api is down)
     */
    let timedOut = false;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const timeoutPromise = new Promise((_, reject) => {
      const wait = setTimeout(() => {
        clearTimeout(wait);
        timedOut = true;
        reject(Error('wallet.getInfo failed, insight api may be down'));
      }, 30000);
    });

    const getInfoPromise = this.qjsWallet!.getInfo();
    const promises = [timeoutPromise, getInfoPromise];
    let newInfo: any;
    try {
      newInfo = await Promise.race(promises);

      // if they are not equal, then the balance has changed
      if (!timedOut && !deepEqual(this.info, newInfo)) {
        this.info = newInfo;
        return true;
      }
    } catch (e) {
      throw(Error(e as any));
    }

    return false;
  };

  // @param amount: (unit - whole RUNEBASE)
  public send = async (to: string, amount: number, options: ISendTxOptions): Promise<Insight.ISendRawTxResult> => {
    if (!this.qjsWallet) {
      throw Error('Cannot send without wallet.');
    }

    // convert amount units from whole RUNEBASE => SATOSHI RUNEBASE
    return await this.qjsWallet!.send(to, amount * 1e8, { feeRate: options.feeRate });
  };

  public sendTransaction = async (args: any[]): Promise<any> => {
    if (!this.rpcProvider) {
      throw Error('Cannot sign transaction without RPC provider.');
    }
    if (args.length < 2) {
      throw Error('Requires first two arguments: contractAddress and data.');
    }

    return await this.rpcProvider!.rawCall(RPC_METHOD.SEND_TO_CONTRACT, args);
  };

  public calcMaxRunebaseSend = async (networkName: string) => {
    if (!this.qjsWallet || !this.info) {
      throw Error('Cannot calculate max send amount without wallet or this.info.');
    }
    try {
      this.maxRunebaseSend = await this.qjsWallet.sendEstimateMaxValue(this.maxRunebaseSendToAddress(networkName));
      return this.maxRunebaseSend;
    } catch (error) {
      console.error('Error calculating max Runebase send amount:', error);
      throw error;
    }
  };

  /**
   * We just need to pass a valid sendTo address belonging to that network for the
   * runebasejs-wallet library to calculate the maxRunebaseSend amount.  It does not matter what
   * the specific address is, as that does not affect the value of the
   * maxRunebaseSend amount
   */
  private maxRunebaseSendToAddress = (networkName: string) => {
    return networkName === NETWORK_NAMES.MAINNET ?
      'RasfBnAjGidRrwmbve42Uacrp3sXFFkzaj' : '5ZiLJ5LuCyhLTmwF2MYjVrc82gCFuJuocB';
  };
}
