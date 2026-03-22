declare module 'bitcoinjs-lib' {
  export const ECPair: any;
  export const HDNode: any;
  export const TransactionBuilder: any;
  export const Transaction: any;
  export const Block: any;
  export const address: {
    fromBase58Check(address: string): { hash: Buffer; version: number };
    toBase58Check(hash: Buffer, version: number): string;
  };
  export const crypto: {
    hash256(buffer: Buffer): Buffer;
    hash160(buffer: Buffer): Buffer;
    sha256(buffer: Buffer): Buffer;
    ripemd160(buffer: Buffer): Buffer;
  };
  export const networks: any;
  export const opcodes: Record<string, number>;
  export const script: {
    compile(chunks: any[]): Buffer;
    decompile(buffer: Buffer): any[];
    number: {
      encode(number: number): Buffer;
      decode(buffer: Buffer): number;
    };
  };
}

declare module 'bitcoinjs-lib/src/script_number' {
  export function encode(number: number): Buffer;
  export function decode(buffer: Buffer, maxLength?: number, minimal?: boolean): number;
}

declare module 'coinselect' {
  interface CoinSelectInput {
    txId?: string;
    hash?: string;
    vout?: number;
    pos?: number;
    value: number;
    script?: Buffer;
    [key: string]: any;
  }
  interface CoinSelectOutput {
    address?: string;
    script?: Buffer;
    value: number;
    [key: string]: any;
  }
  interface CoinSelectResult {
    inputs?: CoinSelectInput[];
    outputs?: CoinSelectOutput[];
    fee: number;
  }
  function coinSelect(
    utxos: CoinSelectInput[],
    outputs: CoinSelectOutput[],
    feeRate: number,
  ): CoinSelectResult;
  export = coinSelect;
}

declare module 'bip38' {
  export function encrypt(
    privateKey: Buffer,
    compressed: boolean,
    passphrase: string,
    progressCallback?: (status: { current: number; total: number }) => void,
    scryptParams?: { N: number; r: number; p: number },
  ): string;
  export function decrypt(
    encryptedKey: string,
    passphrase: string,
    progressCallback?: (status: { current: number; total: number }) => void,
    scryptParams?: { N: number; r: number; p: number },
  ): { privateKey: Buffer; compressed: boolean };
}

declare module 'scryptsy' {
  function scrypt(
    password: string | Buffer,
    salt: string | Buffer,
    N: number,
    r: number,
    p: number,
    keyLen: number,
    progressCallback?: (status: { current: number; total: number }) => void,
  ): Buffer;
  export = scrypt;
}
