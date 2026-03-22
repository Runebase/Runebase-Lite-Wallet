/**
 * WalletCore - Key management, transaction building, and signing.
 * Replaces runebasejs-wallet and runebasejs-lib entirely.
 * Uses bitcoinjs-lib v3 directly for crypto primitives.
 */
import { Buffer } from 'buffer';
import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import * as bip38 from 'bip38';
import * as wif from 'wif';
import coinSelect from 'coinselect';

import { RunebaseNetwork, BIP32_PATH } from './networks';

// Runebase-specific opcodes (different from Bitcoin — these are VM extensions)
const OP_CALL = 0xc2;   // 194
const OP_CREATE = 0xc1;  // 193

export interface WalletKeyPair {
  keyPair: any; // bitcoinjs-lib ECPair
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
 * Create a wallet from a BIP39 mnemonic
 */
export function fromMnemonic(mnemonic: string, network: RunebaseNetwork): WalletKeyPair {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdNode = bitcoin.HDNode.fromSeedBuffer(seed, network as any);
  // Derive using Runebase BIP32 path: m/88'/0'/0'
  const child = hdNode.derivePath(BIP32_PATH);
  const keyPair = child.keyPair;
  const address = keyPair.getAddress();

  return { keyPair, network, address, compressed: keyPair.compressed };
}

/**
 * Create a wallet from a WIF-encoded private key
 */
export function fromWIF(wifKey: string, network: RunebaseNetwork): WalletKeyPair {
  const keyPair = bitcoin.ECPair.fromWIF(wifKey, network as any);
  const address = keyPair.getAddress();
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
  const keyPair = bitcoin.ECPair.fromWIF(
    wif.encode(network.wif, decrypted.privateKey, decrypted.compressed),
    network as any,
  );
  const address = keyPair.getAddress();
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
  return bip38.encrypt(decoded.privateKey, decoded.compressed, passphrase, undefined, scryptParams);
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

  const txb = new bitcoin.TransactionBuilder(wallet.network as any);

  for (const input of inputs) {
    txb.addInput(input.txId || input.hash, input.vout ?? input.pos);
  }

  for (const output of outputs) {
    if (output.address) {
      txb.addOutput(output.address, output.value);
    } else {
      // Change output - send back to self
      txb.addOutput(wallet.address, output.value);
    }
  }

  for (let i = 0; i < inputs.length; i++) {
    txb.sign(i, wallet.keyPair);
  }

  return {
    rawTx: txb.build().toHex(),
    fee,
    inputs: inputs as UtxoInput[],
  };
}

/**
 * Estimate the maximum sendable amount (accounting for fees)
 */
export function estimateMaxSend(
  wallet: WalletKeyPair,
  utxos: UtxoInput[],
  to: string,
  feeRate: number,
): number {
  const filtered = filterUtxos(utxos);
  const totalValue = filtered.reduce((sum, u) => sum + u.value, 0);
  if (totalValue === 0) return 0;

  // Try sending total, let coinselect figure out the fee
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
 * This is NOT Bitcoin's script number encoding — it uses a
 * length-prefixed little-endian format:
 *   [length_byte][data_bytes_le...]
 * With sign-bit handling identical to the Electrum client's
 * contract_encode_number() function.
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

  // Handle sign bit
  if (r[r.length - 1] & 0x80) {
    r.push(neg ? 0x80 : 0x00);
  } else if (neg) {
    r[r.length - 1] |= 0x80;
  }

  return Buffer.from([r.length, ...r]);
}

/**
 * Push data onto the script using Bitcoin's push opcodes.
 * Matches the Electrum client's push_data() function.
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
 * Format matches the Electrum client's contract_script() exactly:
 *   [0x01][0x04][gas_limit_encoded][gas_price_encoded][data_pushed][contract_addr_pushed][OP_CALL]
 */
function buildOPCallScript(
  contractAddress: string,
  encodedData: string,
  gasLimit: number,
  gasPrice: number,
): Buffer {
  return Buffer.concat([
    Buffer.from([0x01, 0x04]),              // version prefix
    contractEncodeNumber(gasLimit),          // gas limit
    contractEncodeNumber(gasPrice),          // gas price
    pushData(encodedData),                  // ABI-encoded call data
    pushData(contractAddress),              // 20-byte contract address
    Buffer.from([OP_CALL]),                 // OP_CALL opcode (0xc2)
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
    Buffer.from([0x01, 0x04]),              // version prefix
    contractEncodeNumber(gasLimit),          // gas limit
    contractEncodeNumber(gasPrice),          // gas price
    pushData(code),                         // contract bytecode
    Buffer.from([OP_CREATE]),               // OP_CREATE opcode (0xc1)
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

  // We need: amount (to contract) + gasFee + txFee
  // Use coinselect with the contract output as a script target
  const targets = [
    { script: opcallScript, value: amount },
  ];

  // Add a dummy output for gas fee reservation
  const { inputs, outputs, fee } = coinSelect(
    filtered.map((u) => ({ ...u, txId: u.hash, vout: u.pos })),
    targets,
    feeRate,
  );

  if (!inputs || !outputs) {
    throw new Error('Insufficient funds for contract call');
  }

  const txb = new bitcoin.TransactionBuilder(wallet.network as any);

  for (const input of inputs) {
    txb.addInput(input.txId || input.hash, input.vout ?? input.pos);
  }

  // Add the contract output
  txb.addOutput(opcallScript, amount);

  // Calculate total input value
  const totalIn = inputs.reduce((sum: number, i: any) => sum + i.value, 0);
  const change = totalIn - fee - gasFee - amount;
  if (change > 0) {
    txb.addOutput(wallet.address, change);
  }

  for (let i = 0; i < inputs.length; i++) {
    txb.sign(i, wallet.keyPair);
  }

  return {
    rawTx: txb.build().toHex(),
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
    { script: createScript, value: 0 },
  ];

  const { inputs, outputs, fee } = coinSelect(
    filtered.map((u) => ({ ...u, txId: u.hash, vout: u.pos })),
    targets,
    feeRate,
  );

  if (!inputs || !outputs) {
    throw new Error('Insufficient funds for contract creation');
  }

  const txb = new bitcoin.TransactionBuilder(wallet.network as any);

  for (const input of inputs) {
    txb.addInput(input.txId || input.hash, input.vout ?? input.pos);
  }

  txb.addOutput(createScript, 0);

  const totalIn = inputs.reduce((sum: number, i: any) => sum + i.value, 0);
  const change = totalIn - fee - gasFee;
  if (change > 0) {
    txb.addOutput(wallet.address, change);
  }

  for (let i = 0; i < inputs.length; i++) {
    txb.sign(i, wallet.keyPair);
  }

  return {
    rawTx: txb.build().toHex(),
    fee: fee + gasFee,
    inputs: inputs as UtxoInput[],
  };
}

/**
 * Convert a base58 address to its hash160 hex representation
 */
export function addressToHash160(address: string): string {
  const { hash } = bitcoin.address.fromBase58Check(address);
  return hash.toString('hex');
}

/**
 * Convert a hash160 hex string to a base58check address
 */
export function hash160ToAddress(hash160: string, network: RunebaseNetwork): string {
  const hash = Buffer.from(hash160.replace(/^0x/, ''), 'hex');
  return bitcoin.address.toBase58Check(hash, network.pubKeyHash);
}
