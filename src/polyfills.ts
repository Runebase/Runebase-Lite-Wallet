// Global polyfills — must be imported before any module that uses
// Buffer, process, or crypto (e.g. bitcoinjs-lib, scryptsy, bip38).
// In Vite 8 dev mode, the node-polyfills plugin's esbuild banner is
// not supported by rolldown, so we set globals explicitly here.
import { Buffer } from 'buffer';
import process from 'process';

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
if (typeof globalThis.process === 'undefined') {
  globalThis.process = process;
}
if (typeof globalThis.global === 'undefined') {
  (globalThis as any).global = globalThis;
}
