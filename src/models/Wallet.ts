import { action, makeObservable } from 'mobx';
import {
  Wallet as RunebaseWallet,
  RunebaseInfo,
  WalletRPCProvider,
} from 'runebasejs-wallet';
import deepEqual from 'deep-equal';

import { ISigner } from '../types';
import { ISendTxOptions } from 'runebasejs-wallet/lib/tx';
import { RPC_METHOD, NETWORK_NAMES } from '../constants';

export default class Wallet implements ISigner {
  public rjsWallet?: RunebaseWallet;
  public rpcProvider?: WalletRPCProvider;
  public info?: RunebaseInfo.IGetAddressInfo;
  public runebaseUSD?: number;
  public maxRunebaseSend?: number;

  constructor(rjsWallet: RunebaseWallet) {
    makeObservable(this);
    this.rjsWallet = rjsWallet;
    this.rpcProvider = new WalletRPCProvider(this.rjsWallet);
  }

  @action
  public updateInfo = async () => {
      if (!this.rjsWallet) {
        console.error('Cannot updateInfo without rjsWallet instance.');
      }

      /**
     * We add a timeout promise to handle if rjsWallet hangs when executing getWalletInfo.
     * (This happens if the runebase api is down)
     */
      let timedOut = false;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const timeoutPromise = new Promise((_, reject) => {
        const wait = setTimeout(() => {
          clearTimeout(wait);
          timedOut = true;
          reject(Error('wallet.getWalletInfo failed, runebase api may be down'));
        }, 30000);
      });

      const getWalletInfoPromise = this.rjsWallet!.getWalletInfo();
      const promises = [timeoutPromise, getWalletInfoPromise];
      let newInfo: any;
      try {
        newInfo = await Promise.race(promises);

        // if they are not equal, then the balance has changed
        if (!timedOut && !deepEqual(this.info, newInfo)) {
          this.info = newInfo;
          console.log('Wallet info updated:', this.info); // Added logging
          return true;
        }
      } catch (e) {
        console.error('Error updating wallet info:', e); // Added logging
        throw Error(e as any);
      }

      return false;
    };

  // @param amount: (unit - whole RUNEBASE)
  public send = async (to: string, amount: number, options: ISendTxOptions): Promise<RunebaseInfo.ISendRawTxResult> => {
    if (!this.rjsWallet) {
      throw Error('Cannot send without wallet.');
    }

    // convert amount units from whole RUNEBASE => SATOSHI RUNEBASE
    console.log('Sending tokens:', to, amount, options); // Added logging
    return await this.rjsWallet!.send(to, amount * 1e8, { feeRate: options.feeRate });
  };

  public sendTransaction = async (args: any[]): Promise<any> => {
    if (!this.rpcProvider) {
      throw Error('Cannot sign transaction without RPC provider.');
    }
    if (args.length < 2) {
      throw Error('Requires first two arguments: contractAddress and data.');
    }

    console.log('Sending transaction:', args); // Added logging
    return await this.rpcProvider!.rawCall(RPC_METHOD.SEND_TO_CONTRACT, args);
  };

  public calcMaxRunebaseSend = async (networkName: string) => {
    if (!this.rjsWallet || !this.info) {
      throw Error('Cannot calculate max send amount without wallet or this.info.');
    }
    try {
      console.log('Calculating max Runebase send amount...'); // Added logging
      this.maxRunebaseSend = await this.rjsWallet.sendEstimateMaxValue(this.maxRunebaseSendToAddress(networkName));
      console.log('Max Runebase send amount calculated:', this.maxRunebaseSend); // Added logging
      return this.maxRunebaseSend;
    } catch (error) {
      console.error('Error calculating max Runebase send amount:', error); // Added logging
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

  // Inside the Wallet class
  public getBlockchainInfo = async (): Promise<RunebaseInfo.IGetBlockchainInfo> => {
    if (!this.rjsWallet) {
      throw Error('Cannot get blockchain info without wallet.');
    }

    try {
      return await this.rjsWallet.getBlockchainInfo();
    } catch (error) {
      console.error('Error getting blockchain info:', error);
      throw error;
    }
  };
}
