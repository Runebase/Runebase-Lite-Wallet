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
    privateKey: Buffer | Uint8Array,
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
