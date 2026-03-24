/**
 * WalletCore - Key management, transaction building, and signing.
 * Uses bitcoinjs-lib v7 with ecpair and bip32 for crypto primitives.
 */
import { Buffer } from 'buffer';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory, ECPairInterface } from 'ecpair';
import { BIP32Factory } from 'bip32';
import * as ecc from '@bitcoinerlab/secp256k1';
import * as bip39 from 'bip39';
import * as bip38 from 'bip38';
import * as wif from 'wif';
import coinSelect from 'coinselect';

import { RunebaseNetwork, BIP32_PATH } from './networks';

// Initialize factories with the secp256k1 ECC implementation
const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

// Runebase-specific opcodes (different from Bitcoin — these are VM extensions)
const OP_CALL = 0xc2;   // 194
const OP_CREATE = 0xc1;  // 193

export interface WalletKeyPair {
  keyPair: ECPairInterface;
  network: RunebaseNetwork;
  address: string;
  compressed: boolean;
}

export interface UtxoInput {
  hash: string;       // txid
  pos: number;        // output index
  value: number;      // satoshis
  isStake?: boolean;
  confirmations: number;
}

export interface BuildTxResult {
  rawTx: string;
  fee: number;
  inputs: UtxoInput[];
}

export interface ContractCallOpts {
  gasLimit?: number;
  gasPrice?: number;
  amount?: number;     // value in satoshi to send with call
}

const DEFAULT_GAS_LIMIT = 250000;
const DEFAULT_GAS_PRICE = 40;
const STAKE_MATURITY = 2000; // Coinbase/coinstake maturity on Runebase (4x speed adjustment)

/**
 * Derive a P2PKH address from a public key and network.
 * Replaces the removed keyPair.getAddress() from bitcoinjs-lib v3.
 */
function getAddress(publicKey: Uint8Array, network: RunebaseNetwork): string {
  const hash = bitcoin.crypto.hash160(Buffer.from(publicKey));
  return bitcoin.address.toBase58Check(Buffer.from(hash), network.pubKeyHash);
}

/**
 * Build a P2PKH scriptPubKey for an address
 */
function addressToOutputScript(addr: string, network: RunebaseNetwork): Buffer {
  const { hash, version } = bitcoin.address.fromBase58Check(addr);
  if (version !== network.pubKeyHash) {
    throw new Error(`Address version ${version} does not match network pubKeyHash ${network.pubKeyHash}`);
  }
  // P2PKH: OP_DUP OP_HASH160 <20 bytes> OP_EQUALVERIFY OP_CHECKSIG
  return Buffer.from(bitcoin.script.compile([
    bitcoin.opcodes.OP_DUP,
    bitcoin.opcodes.OP_HASH160,
    Buffer.from(hash),
    bitcoin.opcodes.OP_EQUALVERIFY,
    bitcoin.opcodes.OP_CHECKSIG,
  ]));
}

/**
 * Sign all inputs of a transaction (P2PKH).
 * Replaces TransactionBuilder.sign() from bitcoinjs-lib v3.
 */
function signP2PKH(
  tx: InstanceType<typeof bitcoin.Transaction>,
  inputs: Array<{ txId: string; vout: number }>,
  keyPair: ECPairInterface,
  network: RunebaseNetwork,
): void {
  const hashType = bitcoin.Transaction.SIGHASH_ALL;
  const prevOutScript = addressToOutputScript(getAddress(keyPair.publicKey, network), network);

  for (let i = 0; i < inputs.length; i++) {
    const sigHash = tx.hashForSignature(i, prevOutScript, hashType);
    const rawSig = keyPair.sign(Buffer.from(sigHash));
    // Encode the 64-byte compact signature as DER + hashType byte
    const derSig = bitcoin.script.signature.encode(Buffer.from(rawSig), hashType);
    const scriptSig = bitcoin.script.compile([
      derSig,
      Buffer.from(keyPair.publicKey),
    ]);
    tx.setInputScript(i, Buffer.from(scriptSig));
  }
}

/**
 * Create a wallet from a BIP39 mnemonic
 */
export function fromMnemonic(mnemonic: string, network: RunebaseNetwork): WalletKeyPair {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdNode = bip32.fromSeed(Buffer.from(seed), network as any);
  // Derive using Runebase BIP32 path: m/88'/0'/0'
  const child = hdNode.derivePath(BIP32_PATH);
  const keyPair = ECPair.fromPrivateKey(Buffer.from(child.privateKey!), {
    network: network as any,
    compressed: true,
  });
  const address = getAddress(keyPair.publicKey, network);

  return { keyPair, network, address, compressed: true };
}

/**
 * Create a wallet from a WIF-encoded private key
 */
export function fromWIF(wifKey: string, network: RunebaseNetwork): WalletKeyPair {
  const keyPair = ECPair.fromWIF(wifKey, network as any);
  const address = getAddress(keyPair.publicKey, network);
  return { keyPair, network, address, compressed: keyPair.compressed };
}

/**
 * Decrypt a BIP38-encrypted private key
 */
export function fromEncryptedPrivateKey(
  encrypted: string,
  passphrase: string,
  scryptParams: { N: number; r: number; p: number },
  network: RunebaseNetwork,
): WalletKeyPair {
  const decrypted = bip38.decrypt(encrypted, passphrase, undefined, scryptParams);
  const encoded = (wif.encode as any)({
    version: network.wif,
    privateKey: Buffer.from(decrypted.privateKey),
    compressed: decrypted.compressed,
  });
  const keyPair = ECPair.fromWIF(encoded, network as any);
  const address = getAddress(keyPair.publicKey, network);
  return { keyPair, network, address, compressed: keyPair.compressed };
}

/**
 * Encrypt a private key with BIP38
 */
export function toEncryptedPrivateKey(
  wallet: WalletKeyPair,
  passphrase: string,
  scryptParams: { N: number; r: number; p: number },
): string {
  const decoded = wif.decode(wallet.keyPair.toWIF());
  // bip38 v3.1.1 expects Buffer, decoded.privateKey is Uint8Array in wif v5
  return bip38.encrypt(Buffer.from(decoded.privateKey), decoded.compressed, passphrase, undefined, scryptParams);
}

/**
 * Export the WIF-encoded private key
 */
export function toWIF(wallet: WalletKeyPair): string {
  return wallet.keyPair.toWIF();
}

/**
 * Validate a WIF private key
 */
export function validatePrivateKey(wifKey: string): boolean {
  try {
    wif.decode(wifKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a new BIP39 mnemonic
 */
export function generateMnemonic(): string {
  return bip39.generateMnemonic();
}

/**
 * Filter UTXOs - exclude immature stake outputs
 */
function filterUtxos(utxos: UtxoInput[]): UtxoInput[] {
  return utxos.filter((utxo) => {
    if (utxo.isStake) {
      return utxo.confirmations >= STAKE_MATURITY;
    }
    return true;
  });
}

/**
 * Create a raw Transaction, add inputs and outputs, and sign.
 * Replaces TransactionBuilder from bitcoinjs-lib v3.
 */
function buildAndSignTx(
  wallet: WalletKeyPair,
  inputs: Array<{ txId: string; vout: number; [key: string]: any }>,
  outputs: Array<{ address?: string; script?: Buffer; value: number }>,
): string {
  const tx = new bitcoin.Transaction();
  tx.version = 2;

  const inputRefs: Array<{ txId: string; vout: number }> = [];
  for (const input of inputs) {
    const txIdBuf = Buffer.from(input.txId, 'hex').reverse();
    tx.addInput(txIdBuf, input.vout);
    inputRefs.push({ txId: input.txId, vout: input.vout });
  }

  for (const output of outputs) {
    const value = BigInt(output.value);
    if (output.script) {
      tx.addOutput(output.script, value);
    } else if (output.address) {
      tx.addOutput(addressToOutputScript(output.address, wallet.network), value);
    } else {
      // Change output - send back to self
      tx.addOutput(addressToOutputScript(wallet.address, wallet.network), value);
    }
  }

  signP2PKH(tx, inputRefs, wallet.keyPair, wallet.network);
  return tx.toHex();
}

/**
 * Build and sign a standard P2PKH payment transaction
 */
export function buildPaymentTx(
  wallet: WalletKeyPair,
  utxos: UtxoInput[],
  to: string,
  amount: number,
  feeRate: number,
): BuildTxResult {
  const filtered = filterUtxos(utxos);
  const targets = [{ address: to, value: amount }];
  const { inputs, outputs, fee } = coinSelect(
    filtered.map((u) => ({ ...u, txId: u.hash, vout: u.pos })),
    targets,
    feeRate,
  );

  if (!inputs || !outputs) {
    throw new Error('Insufficient funds');
  }

  const txOutputs = outputs.map((output: any) => ({
    address: output.address || wallet.address,
    value: output.value,
  }));

  return {
    rawTx: buildAndSignTx(wallet, inputs as any, txOutputs),
    fee,
    inputs: inputs as UtxoInput[],
  };
}

/**
 * Estimate the maximum sendable amount (accounting for fees)
 */
export function estimateMaxSend(
  _wallet: WalletKeyPair,
  utxos: UtxoInput[],
  to: string,
  feeRate: number,
): number {
  const filtered = filterUtxos(utxos);
  const totalValue = filtered.reduce((sum, u) => sum + u.value, 0);
  if (totalValue === 0) return 0;

  const targets = [{ address: to, value: totalValue }];
  const { fee } = coinSelect(
    filtered.map((u) => ({ ...u, txId: u.hash, vout: u.pos })),
    targets,
    feeRate,
  );

  const maxSend = totalValue - (fee || 0);
  return maxSend > 0 ? maxSend : 0;
}

/**
 * Encode a number using Runebase's contract number format.
 */
function contractEncodeNumber(n: number): Buffer {
  if (n === 0) return Buffer.alloc(0);

  const neg = n < 0;
  let absvalue = neg ? -n : n;
  const r: number[] = [];

  while (absvalue > 0) {
    r.push(absvalue & 0xff);
    absvalue >>= 8;
  }

  if (r[r.length - 1] & 0x80) {
    r.push(neg ? 0x80 : 0x00);
  } else if (neg) {
    r[r.length - 1] |= 0x80;
  }

  return Buffer.from([r.length, ...r]);
}

/**
 * Push data onto the script using Bitcoin's push opcodes.
 */
function pushData(hex: string): Buffer {
  const data = Buffer.from(hex, 'hex');
  const len = data.length;

  if (len === 0) {
    return Buffer.from([0x00]); // OP_0
  } else if (len < 0x4c) {
    return Buffer.concat([Buffer.from([len]), data]);
  } else if (len <= 0xff) {
    return Buffer.concat([Buffer.from([0x4c, len]), data]);
  } else if (len <= 0xffff) {
    const lenBuf = Buffer.alloc(2);
    lenBuf.writeUInt16LE(len, 0);
    return Buffer.concat([Buffer.from([0x4d]), lenBuf, data]);
  } else {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32LE(len, 0);
    return Buffer.concat([Buffer.from([0x4e]), lenBuf, data]);
  }
}

/**
 * Build an OP_CALL script for calling a smart contract.
 */
function buildOPCallScript(
  contractAddress: string,
  encodedData: string,
  gasLimit: number,
  gasPrice: number,
): Buffer {
  return Buffer.concat([
    Buffer.from([0x01, 0x04]),
    contractEncodeNumber(gasLimit),
    contractEncodeNumber(gasPrice),
    pushData(encodedData),
    pushData(contractAddress),
    Buffer.from([OP_CALL]),
  ]);
}

/**
 * Build an OP_CREATE script for deploying a smart contract.
 */
function buildOPCreateScript(
  code: string,
  gasLimit: number,
  gasPrice: number,
): Buffer {
  return Buffer.concat([
    Buffer.from([0x01, 0x04]),
    contractEncodeNumber(gasLimit),
    contractEncodeNumber(gasPrice),
    pushData(code),
    Buffer.from([OP_CREATE]),
  ]);
}

/**
 * Build and sign a send-to-contract (OP_CALL) transaction
 */
export function buildContractSendTx(
  wallet: WalletKeyPair,
  utxos: UtxoInput[],
  contractAddress: string,
  encodedData: string,
  feeRate: number,
  opts: ContractCallOpts = {},
): BuildTxResult {
  const gasLimit = opts.gasLimit || DEFAULT_GAS_LIMIT;
  const gasPrice = opts.gasPrice || DEFAULT_GAS_PRICE;
  const amount = opts.amount || 0;
  const gasFee = gasLimit * gasPrice;

  const opcallScript = buildOPCallScript(contractAddress, encodedData, gasLimit, gasPrice);
  const filtered = filterUtxos(utxos);

  const targets = [
    { script: opcallScript, value: amount + gasFee },
  ];

  const { inputs, outputs, fee } = coinSelect(
    filtered.map((u) => ({ ...u, txId: u.hash, vout: u.pos })),
    targets,
    feeRate,
  );

  if (!inputs || !outputs) {
    throw new Error('Insufficient funds for contract call');
  }

  // Build outputs: contract call + change
  const txOutputs: Array<{ script?: Buffer; address?: string; value: number }> = [
    { script: opcallScript, value: amount },
  ];

  const totalIn = inputs.reduce((sum: number, i: any) => sum + i.value, 0);
  const change = totalIn - fee - gasFee - amount;
  if (change > 0) {
    txOutputs.push({ address: wallet.address, value: change });
  }

  return {
    rawTx: buildAndSignTx(wallet, inputs as any, txOutputs),
    fee: fee + gasFee,
    inputs: inputs as UtxoInput[],
  };
}

/**
 * Build and sign a create-contract (OP_CREATE) transaction
 */
export function buildContractCreateTx(
  wallet: WalletKeyPair,
  utxos: UtxoInput[],
  code: string,
  feeRate: number,
  opts: ContractCallOpts = {},
): BuildTxResult {
  const gasLimit = opts.gasLimit || DEFAULT_GAS_LIMIT;
  const gasPrice = opts.gasPrice || DEFAULT_GAS_PRICE;
  const gasFee = gasLimit * gasPrice;

  const createScript = buildOPCreateScript(code, gasLimit, gasPrice);
  const filtered = filterUtxos(utxos);

  const targets = [
    { script: createScript, value: gasFee },
  ];

  const { inputs, outputs, fee } = coinSelect(
    filtered.map((u) => ({ ...u, txId: u.hash, vout: u.pos })),
    targets,
    feeRate,
  );

  if (!inputs || !outputs) {
    throw new Error('Insufficient funds for contract creation');
  }

  const txOutputs: Array<{ script?: Buffer; address?: string; value: number }> = [
    { script: createScript, value: 0 },
  ];

  const totalIn = inputs.reduce((sum: number, i: any) => sum + i.value, 0);
  const change = totalIn - fee - gasFee;
  if (change > 0) {
    txOutputs.push({ address: wallet.address, value: change });
  }

  return {
    rawTx: buildAndSignTx(wallet, inputs as any, txOutputs),
    fee: fee + gasFee,
    inputs: inputs as UtxoInput[],
  };
}

/**
 * Convert a base58 address to its hash160 hex representation
 */
export function addressToHash160(address: string): string {
  const { hash } = bitcoin.address.fromBase58Check(address);
  return Buffer.from(hash).toString('hex');
}

/**
 * Convert a hash160 hex string to a base58check address
 */
export function hash160ToAddress(hash160: string, network: RunebaseNetwork): string {
  const hash = Buffer.from(hash160.replace(/^0x/, ''), 'hex');
  return bitcoin.address.toBase58Check(hash, network.pubKeyHash);
}
