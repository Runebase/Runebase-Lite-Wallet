/**
 * Key-derivation helpers backed by @noble/hashes (audited, zero-dependency).
 *
 * These replace the browserify crypto stack (pbkdf2 / scryptsy). Output is
 * byte-identical to the previous implementation for the same parameters, so
 * password hashes stored by earlier versions still validate — verified across
 * ASCII, accented, CJK, emoji, combining-mark and embedded-NUL passwords at the
 * exact production parameters.
 *
 * PBKDF2 prefers the platform's native WebCrypto, which is ~8x faster than a
 * pure-JS implementation and available in every target we ship (extension,
 * Android WebView, Electron file://, browser). @noble/hashes is the fallback
 * for any environment without SubtleCrypto.
 */
import { pbkdf2 as noblePbkdf2 } from '@noble/hashes/pbkdf2';
import { sha512 } from '@noble/hashes/sha2';
import { scrypt as nobleScrypt } from '@noble/hashes/scrypt';

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

/** PBKDF2-HMAC-SHA512, returned as a lowercase hex string. */
export async function pbkdf2Sha512(
  password: string,
  salt: Uint8Array,
  iterations: number,
  keyLength: number,
): Promise<string> {
  const passwordBytes = new TextEncoder().encode(password);

  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    try {
      // Copy into a plain ArrayBuffer-backed view; SubtleCrypto's BufferSource
      // does not accept a possibly SharedArrayBuffer-backed Uint8Array.
      const saltBytes = new Uint8Array(salt);
      const key = await subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveBits']);
      const bits = await subtle.deriveBits(
        { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-512' },
        key,
        keyLength * 8,
      );
      return toHex(new Uint8Array(bits));
    } catch {
      // Fall through to the pure-JS implementation below.
    }
  }

  return toHex(noblePbkdf2(sha512, passwordBytes, salt, { c: iterations, dkLen: keyLength }));
}

/** scrypt, returned as a lowercase hex string. */
export function scryptHex(
  password: string,
  salt: Uint8Array,
  N: number,
  r: number,
  p: number,
  keyLength: number,
): string {
  const derived = nobleScrypt(new TextEncoder().encode(password), salt, {
    N,
    r,
    p,
    dkLen: keyLength,
  });
  return toHex(derived);
}
