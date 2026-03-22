import createHash from 'create-hash';
import secp256k1 from 'secp256k1';
import { Buffer } from 'buffer';

import { ISigner } from '../types';
import { NETWORK_NAMES, DELEGATION_CONTRACT_ADDRESS } from '../constants';
import {
  WalletKeyPair,
  buildPaymentTx,
  buildContractSendTx,
  estimateMaxSend,
  addressToHash160,
  UtxoInput,
} from '../services/wallet';
import {
  IAddressInfo,
  IGetAddressDelegation,
  ISendRawTxResult,
  IBlockchainInfo,
} from '../services/wallet/types';
import { ElectrumXManager, ElectrumXTransaction, ElectrumXVout, ElectrumXUtxo } from '../services/electrumx';

function sha256(buffer: Buffer): Buffer {
  return createHash('sha256').update(buffer).digest();
}

function sha256d(buffer: Buffer): Buffer {
  return sha256(sha256(buffer));
}

/**
 * Compute the ElectrumX scripthash for a P2PKH address.
 * scripthash = SHA256(scriptPubKey) reversed
 */
function addressToScripthash(address: string): string {
  // P2PKH scriptPubKey: OP_DUP OP_HASH160 <hash160> OP_EQUALVERIFY OP_CHECKSIG
  const hash160 = Buffer.from(addressToHash160(address), 'hex');
  const scriptPubKey = Buffer.concat([
    Buffer.from([0x76, 0xa9, 0x14]), // OP_DUP OP_HASH160 PUSH20
    hash160,
    Buffer.from([0x88, 0xac]),       // OP_EQUALVERIFY OP_CHECKSIG
  ]);
  const hash = sha256(scriptPubKey);
  // Reverse for ElectrumX
  return Buffer.from(hash).reverse().toString('hex');
}

export default class Wallet implements ISigner {
  public wallet: WalletKeyPair;
  public info?: IAddressInfo;
  public delegationInfo?: IGetAddressDelegation;
  public runebaseUSD?: number;
  public maxRunebaseSend?: number;
  private scripthash: string;
  private cachedUtxos: UtxoInput[] = [];

  constructor(wallet: WalletKeyPair) {
    this.wallet = wallet;
    this.scripthash = addressToScripthash(wallet.address);
  }

  get address(): string {
    return this.wallet.address;
  }

  get keyPair(): any {
    return this.wallet.keyPair;
  }

  /**
   * Fetch balance from ElectrumX and ranking/txCount from explorer API.
   */
  public updateInfo = async (electrumx: ElectrumXManager, explorerApiUrl?: string): Promise<boolean> => {
    const balance = await electrumx.getBalance(this.scripthash);
    const newInfo: IAddressInfo = {
      address: this.wallet.address,
      balance: balance.confirmed,
      unconfirmedBalance: balance.unconfirmed,
    };

    // Carry over previous ranking/txCount while we fetch fresh values
    if (this.info?.ranking !== undefined) newInfo.ranking = this.info.ranking;
    if (this.info?.transactionCount !== undefined) newInfo.transactionCount = this.info.transactionCount;

    const balanceChanged = !this.info
      || this.info.balance !== newInfo.balance
      || this.info.unconfirmedBalance !== newInfo.unconfirmedBalance;

    if (balanceChanged) {
      this.info = newInfo;
      // Fetch ranking and transaction count from explorer (non-blocking)
      if (explorerApiUrl) {
        this.fetchExplorerInfo(explorerApiUrl).catch((err) => {
          console.warn('Explorer info fetch failed (non-critical):', err);
        });
      }
      return true;
    }
    return false;
  };

  /**
   * Fetch supplemental info (ranking, transactionCount) from the explorer API.
   * This data isn't available via ElectrumX.
   */
  private fetchExplorerInfo = async (explorerApiUrl: string): Promise<void> => {
    try {
      const { proxyFetch } = await import('../utils/fetchProxy');
      const response = await proxyFetch(`${explorerApiUrl}/address/${this.wallet.address}`);
      if (!response.ok) return;
      const data = await response.json();

      if (this.info) {
        if (data.ranking !== undefined) this.info.ranking = data.ranking;
        if (data.transactionCount !== undefined) this.info.transactionCount = data.transactionCount;
      }
    } catch (err) {
      console.warn('Explorer API fetch failed:', err);
    }
  };

  /**
   * Fetch UTXOs from ElectrumX with proper confirmation depth and coinbase detection.
   *
   * ElectrumX's listunspent only returns block height, not confirmation count or
   * coinbase status. We calculate real confirmations from the current block height
   * and fetch transaction details for young UTXOs to detect coinstake outputs
   * which require 2000 confirmations to mature on Runebase.
   *
   * Coinstake detection: On QTUM/Runebase, coinstake transactions always have
   * vout[0].value === 0 (an empty marker output). This distinguishes them from
   * regular transactions.
   */
  public getUtxos = async (electrumx: ElectrumXManager, currentHeight?: number): Promise<UtxoInput[]> => {
    const rawUtxos: ElectrumXUtxo[] = await electrumx.listUnspent(this.scripthash);

    // Get current block height if not provided
    let height = currentHeight;
    if (!height) {
      try {
        const headerInfo = await electrumx.subscribeHeaders(() => {});
        height = headerInfo.height;
      } catch {
        height = 0;
      }
    }

    const COINBASE_MATURITY = 2000;

    // Map raw UTXOs with real confirmation depth
    const mapped = rawUtxos.map((u) => ({
      hash: u.tx_hash,
      pos: u.tx_pos,
      value: u.value,
      height: u.height,
      confirmations: (u.height > 0 && height) ? (height - u.height + 1) : 0,
      isStake: false,
    }));

    // For UTXOs below coinstake maturity, check if they're from coinstake transactions
    const youngUtxos = mapped.filter((u) => u.confirmations > 0 && u.confirmations < COINBASE_MATURITY);
    if (youngUtxos.length > 0) {
      // Batch-fetch unique transactions (a tx may have multiple UTXOs)
      const uniqueTxids = [...new Set(youngUtxos.map((u) => u.hash))];
      const txResults = await Promise.allSettled(
        uniqueTxids.map((txid) => electrumx.getTransaction(txid, true)),
      );

      const coinstakeTxids = new Set<string>();
      txResults.forEach((result, idx) => {
        if (result.status === 'fulfilled' && typeof result.value !== 'string') {
          const tx = result.value as ElectrumXTransaction;
          // Coinstake detection for QTUM/Runebase:
          // Coinstake transactions always have vout[0] with value 0 (empty marker output).
          // Regular transactions never have a zero-value first output.
          const firstVout = tx.vout?.[0];
          if (firstVout && firstVout.value === 0) {
            coinstakeTxids.add(uniqueTxids[idx]);
          }
        }
      });

      // Mark coinstake UTXOs
      for (const utxo of mapped) {
        if (coinstakeTxids.has(utxo.hash)) {
          utxo.isStake = true;
        }
      }
    }

    this.cachedUtxos = mapped.map(({ height: _h, ...rest }) => rest);
    return this.cachedUtxos;
  };

  /**
   * Send RUNEBASE to an address
   */
  public send = async (
    to: string,
    amount: number,
    options: { feeRate: number },
    electrumx: ElectrumXManager,
  ): Promise<ISendRawTxResult> => {
    const utxos = await this.getUtxos(electrumx);
    const { rawTx } = buildPaymentTx(this.wallet, utxos, to, amount, options.feeRate);
    const txid = await electrumx.broadcastTransaction(rawTx);
    return { txid };
  };

  /**
   * Send to contract (OP_CALL) - used for RPC provider replacement
   */
  public sendTransaction = async (
    args: any[],
    electrumx: ElectrumXManager,
    feeRate = 40000,
  ): Promise<ISendRawTxResult> => {
    const [contractAddress, encodedData, amount, gasLimit, gasPrice] = args;
    const utxos = await this.getUtxos(electrumx);
    const { rawTx } = buildContractSendTx(
      this.wallet,
      utxos,
      contractAddress,
      encodedData,
      feeRate,
      { gasLimit, gasPrice, amount: amount || 0 },
    );
    const txid = await electrumx.broadcastTransaction(rawTx);
    return { txid };
  };

  /**
   * Call a contract (read-only) via ElectrumX
   */
  public callContract = async (
    contractAddress: string,
    data: string,
    electrumx: ElectrumXManager,
    sender = '',
  ): Promise<any> => {
    return await electrumx.contractCall(contractAddress, data, sender);
  };

  /**
   * Calculate max sendable amount
   */
  public calcMaxRunebaseSend = async (
    networkName: string,
    electrumx: ElectrumXManager,
    feeRate = 40000,
  ): Promise<number> => {
    const utxos = await this.getUtxos(electrumx);
    const toAddress = networkName === NETWORK_NAMES.MAINNET
      ? 'RasfBnAjGidRrwmbve42Uacrp3sXFFkzaj'
      : '5ZiLJ5LuCyhLTmwF2MYjVrc82gCFuJuocB';
    this.maxRunebaseSend = estimateMaxSend(this.wallet, utxos, toAddress, feeRate);
    return this.maxRunebaseSend;
  };

  /**
   * Get blockchain info from ElectrumX
   */
  public getBlockchainInfo = async (electrumx: ElectrumXManager): Promise<IBlockchainInfo> => {
    const [feeRate, relayFee, headerInfo] = await Promise.all([
      electrumx.estimateFee(6),
      electrumx.relayFee(),
      electrumx.subscribeHeaders(() => {}),
    ]);
    return {
      height: headerInfo.height,
      feeRate: feeRate > 0 ? feeRate : 0.004, // default if estimation fails
      relayFee,
    };
  };

  /**
   * Get transaction history with resolved amounts.
   *
   * The Runebase daemon does NOT include value/address in vin entries.
   * To calculate the net effect of a tx on this wallet, we must look
   * up each input's referenced previous tx output. Results are cached
   * to avoid duplicate lookups.
   *
   * For outgoing txs: shows the amount sent to the recipient (negative),
   * excluding change returned to our own address.
   */
  public getTransactionHistory = async (
    electrumx: ElectrumXManager,
    limit: number,
    offset: number,
  ): Promise<{
    totalCount: number;
    transactions: Array<{
      txid: string;
      time?: number;
      confirmations: number;
      amount: number; // satoshi, net effect on this wallet
      fee: number;    // satoshi, network fee
    }>;
  }> => {
    const history = await electrumx.getHistory(this.scripthash);
    const totalCount = history.length;
    const slice = history.reverse().slice(offset, offset + limit);
    const myAddress = this.wallet.address;

    // Cache verbose tx lookups to avoid re-fetching
    const txCache = new Map<string, ElectrumXTransaction>();
    const fetchVerboseTx = async (
      txid: string,
    ): Promise<ElectrumXTransaction> => {
      const cached = txCache.get(txid);
      if (cached) return cached;
      const tx = await electrumx.getTransaction(
        txid, true,
      ) as ElectrumXTransaction;
      txCache.set(txid, tx);
      return tx;
    };

    const results: Array<{
      txid: string;
      time?: number;
      confirmations: number;
      amount: number;
      fee: number;
    }> = [];

    for (const item of slice) {
      try {
        const tx = await fetchVerboseTx(item.tx_hash);

        // Helper: get address from a vout
        // Runebase daemon uses "address" (singular), some use "addresses"
        const getVoutAddress = (
          vout: ElectrumXVout,
        ): string | undefined => {
          const sp = vout.scriptPubKey;
          if (!sp) return undefined;
          if (sp.address) return sp.address;
          if (sp.addresses && sp.addresses.length > 0) {
            return sp.addresses[0];
          }
          return undefined;
        };

        // Resolve input values by looking up previous tx outputs
        let myInputTotal = 0;
        let allInputTotal = 0;
        let hasMyInputs = false;
        let isCoinbase = false;
        for (const vin of (tx.vin || [])) {
          if (!vin.txid) { isCoinbase = true; continue; }
          try {
            const prevTx = await fetchVerboseTx(vin.txid);
            const prevVout = prevTx.vout?.[vin.vout];
            if (!prevVout) continue;
            const val = Number(prevVout.value || 0);
            allInputTotal += val;
            const prevAddr = getVoutAddress(prevVout);
            if (prevAddr === myAddress) {
              myInputTotal += val;
              hasMyInputs = true;
            }
          } catch {
            // Skip unresolvable inputs
          }
        }

        // Classify outputs
        let myOutputTotal = 0;
        let otherOutputTotal = 0;
        let allOutputTotal = 0;
        for (const vout of (tx.vout || [])) {
          const addr = getVoutAddress(vout);
          const val = Number(vout.value || 0);
          allOutputTotal += val;
          if (addr === myAddress) {
            myOutputTotal += val;
          } else if (val > 0) {
            otherOutputTotal += val;
          }
        }

        // Fee = total inputs - total outputs (0 for coinbase)
        const feeCoins = isCoinbase ? 0 : allInputTotal - allOutputTotal;
        const feeSatoshi = Math.round(Math.max(0, feeCoins) * 1e8);

        let amountCoins: number;
        if (hasMyInputs && otherOutputTotal > 0) {
          // Outgoing tx: show amount sent to others (negative)
          amountCoins = -otherOutputTotal;
        } else if (hasMyInputs) {
          // Self-transfer or staking: show net delta
          amountCoins = myOutputTotal - myInputTotal;
        } else {
          // Incoming tx: show what we received
          amountCoins = myOutputTotal;
        }

        const amountSatoshi = Math.round(amountCoins * 1e8);

        results.push({
          txid: item.tx_hash,
          time: tx.time,
          confirmations: tx.confirmations || 0,
          amount: amountSatoshi,
          fee: feeSatoshi,
        });
      } catch (err) {
        console.error(`Failed to process tx ${item.tx_hash}:`, err);
      }
    }

    return { totalCount, transactions: results };
  };

  // ─── Subscriptions ──────────────────────────────────────────────

  /**
   * Subscribe to scripthash changes (balance/UTXO updates).
   * The callback fires whenever the address receives or spends funds.
   */
  public subscribeAddress = async (
    electrumx: ElectrumXManager,
    onChanged: () => void,
  ): Promise<void> => {
    await electrumx.subscribeScripthash(this.scripthash, () => {
      onChanged();
    });
  };

  /**
   * Subscribe to new block headers.
   * The callback fires whenever a new block is found.
   */
  public subscribeHeaders = async (
    electrumx: ElectrumXManager,
    onNewBlock: (height: number) => void,
  ): Promise<number> => {
    const header = await electrumx.subscribeHeaders((params: unknown[]) => {
      const notification = params[0] as { height: number };
      onNewBlock(notification.height);
    });
    return header.height;
  };

  /**
   * Subscribe to QRC20 token transfer events for this address.
   * Topic is the keccak256 of Transfer(address,address,uint256).
   */
  public subscribeTokenEvents = async (
    electrumx: ElectrumXManager,
    contractAddress: string,
    onTransfer: () => void,
  ): Promise<void> => {
    const hash160 = addressToHash160(this.wallet.address);
    // Transfer(address,address,uint256) event topic
    const transferTopic = 'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    await electrumx.subscribeContractEvent(hash160, contractAddress, transferTopic, () => {
      onTransfer();
    });
  };

  /**
   * Subscribe to delegation contract events (AddDelegation / RemoveDelegation).
   * Uses the delegate's hash160 as the address filter on the delegation precompile.
   */
  public subscribeDelegationEvents = async (
    electrumx: ElectrumXManager,
    onDelegationChanged: () => void,
  ): Promise<void> => {
    const hash160 = addressToHash160(this.wallet.address);
    // AddDelegation(address indexed _staker, address indexed _delegate, uint8 fee, uint256 blockHeight, bytes PoD)
    const addDelegationTopic = 'a23803f3b2b56e71f2921c22b23c32ef596a439dbe03f7250e6b58a30eb910b5';
    await electrumx.subscribeContractEvent(hash160, DELEGATION_CONTRACT_ADDRESS, addDelegationTopic, () => {
      onDelegationChanged();
    });
    // RemoveDelegation(address indexed _staker, address indexed _delegate)
    const removeDelegationTopic = '4a2e37ae4307e59e127e9222e978e2bb42a13bc8b6df3e2c40abb7b835980e55';
    await electrumx.subscribeContractEvent(hash160, DELEGATION_CONTRACT_ADDRESS, removeDelegationTopic, () => {
      onDelegationChanged();
    });
  };

  /**
   * Sign a Proof of Delegation message
   */
  public signPoD = (superStakerAddress: string): {
    podMessage: string;
    superStakerAddress: string;
    delegatorAddress: string;
  } => {
    const hexAddress = addressToHash160(superStakerAddress);
    const hash = sha256d(
      Buffer.concat([
        Buffer.from(this.wallet.network.messagePrefix, 'utf8'),
        Buffer.from([hexAddress.length]),
        Buffer.from(hexAddress, 'utf8'),
      ]),
    );

    const { signature, recid } = secp256k1.ecdsaSign(
      hash,
      this.wallet.keyPair.d.toBuffer(32),
    );
    const signed = Buffer.concat([
      Buffer.from([recid + (this.wallet.compressed ? 31 : 27)]),
      signature,
    ]);
    const podMessage = `0x${signed.toString('hex')}`;

    // Verify
    const pubKey = secp256k1.publicKeyCreate(this.wallet.keyPair.d.toBuffer(32));
    const verified = secp256k1.ecdsaVerify(signature, hash, pubKey);
    if (!verified) throw new Error('Unable to verify signature');
    if (podMessage.length !== 132) throw new Error('Incorrect POD length');

    return {
      podMessage,
      superStakerAddress,
      delegatorAddress: this.wallet.address,
    };
  };
}
