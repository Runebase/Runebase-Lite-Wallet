// Runebase network definitions - replaces runebasejs-lib and runebasejs-wallet network configs

export interface RunebaseNetwork {
  messagePrefix: string;
  bech32: string;
  bip32: { public: number; private: number };
  pubKeyHash: number;
  scriptHash: number;
  wif: number;
}

export const mainnet: RunebaseNetwork = {
  messagePrefix: '\x19Runebase Signed Message:\n',
  bech32: 'rune',
  bip32: { public: 0x0586c22e, private: 0x0586dcf1 },
  pubKeyHash: 0x3d,
  scriptHash: 0x7b,
  wif: 0xd8,
};

export const testnet: RunebaseNetwork = {
  messagePrefix: '\x19Runebase Signed Message:\n',
  bech32: 'trun',
  bip32: { public: 0x053782bf, private: 0x053784a4 },
  pubKeyHash: 0x0b,
  scriptHash: 0x6a,
  wif: 0xe5,
};

export const regtest: RunebaseNetwork = {
  messagePrefix: '\x19Runebase Signed Message:\n',
  bech32: 'rurt',
  bip32: { public: 0x043587cf, private: 0x04358394 },
  pubKeyHash: 0x78,
  scriptHash: 0x6e,
  wif: 0xef,
};

// BIP32 derivation path for Runebase
export const BIP32_PATH = "m/88'/0'/0'";
