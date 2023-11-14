/* eslint-disable no-undef */
import scrypt from 'scryptsy';
import { Buffer } from 'buffer';

globalThis.Buffer = Buffer;

onmessage = (e) => {
  try {
    console.log('Worker received message:', e);

    if (!e.data || !e.data.password || !e.data.salt || !e.data.scryptParams) {
      throw new Error('Invalid message format. Expected properties: password, salt, scryptParams');
    }

    const password = e.data.password;
    const salt = e.data.salt;
    const saltBuffer = Buffer.from(salt);
    const { N, r, p } = e.data.scryptParams;

    console.log('Calculating scrypt...');
    const derivedKey = scrypt(password, saltBuffer, N, r, p, 64);
    console.log('Scrypt calculation completed.');

    const passwordHash = derivedKey.toString('hex');
    postMessage({ passwordHash });
  } catch (err) {
    console.error('Error in scryptworker:', err);
    postMessage({ error: err.message || 'Unknown error occurred in scryptworker' });
  }
};
