/**
 * Private-key validation.
 *
 * Deliberately kept out of `utils/index.ts`: this is the only helper there that
 * needs the wallet crypto stack (bitcoinjs-lib / ecpair / bip38). Because the
 * content script and the injected inpage script import small helpers from that
 * barrel, a top-level crypto import there pulled the whole wallet — roughly a
 * megabyte, plus an ECPairFactory() call at module scope — into scripts that
 * run on every page the user visits.
 */
import { validatePrivateKey } from '../services/wallet';

export const isValidPrivateKey = (address?: string) => {
  if (!address) {
    return false;
  }
  if (!(address.length === 51 || address.length === 52)) {
    return false;
  }

  try {
    const privateKey = validatePrivateKey(address);
    return privateKey;
  } catch (e) {
    console.error('Private Key Invalid', e);
    return false;
  }
};
