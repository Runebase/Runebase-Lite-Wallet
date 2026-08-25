/**
 * ABI encoding/decoding helpers built on ethers v6.
 *
 * Replaces ethjs-abi (unmaintained, and the source of the bn.js /
 * number-to-bn advisories). Encoded call data is byte-identical to what
 * ethjs-abi produced for every method this app uses.
 *
 * One deliberate difference: ethers decodes integers to `bigint` where
 * ethjs-abi produced BN instances. Callers that need a JS number must convert
 * explicitly — `10 ** aBigInt` throws, whereas BN silently coerced.
 */
import { Interface } from 'ethers';
import { addressToHash160 } from '../services/wallet';

// An Interface is built from the single resolved fragment rather than the whole
// ABI. This matters: RRC223 overloads `transfer` three ways, and ethers throws
// on an ambiguous name lookup, whereas ethjs-abi encoded whatever fragment it
// was handed. Scoping to one fragment reproduces the old behaviour exactly.
const interfaceCache = new WeakMap<object, Interface>();

function getFragmentInterface(func: any): Interface {
  const cached = interfaceCache.get(func);
  if (cached) return cached;
  const iface = new Interface([{ type: 'function', outputs: [], inputs: [], ...func }]);
  interfaceCache.set(func, iface);
  return iface;
}

/**
 * Find a function definition in an ABI by name.
 */
function findAbiFunction(
  abiDef: any[],
  methodName: string,
): any {
  return abiDef.find(
    (item: any) => item.type === 'function' && item.name === methodName,
  );
}

/**
 * Convert a Runebase base58 address to a 0x-prefixed hex address
 * suitable for ABI encoding.
 */
function toHexAddress(address: string): string {
  // If already hex (0x prefixed or 40-char hex), return as-is
  if (address.startsWith('0x')) return address.toLowerCase();
  if (/^[0-9a-fA-F]{40}$/.test(address)) return `0x${address.toLowerCase()}`;
  // Convert base58 Runebase address to hex
  return `0x${addressToHash160(address)}`.toLowerCase();
}

/** Normalise args the way the previous ethjs-abi path did. */
function convertArgs(inputs: any[] | undefined, args: any[]): any[] {
  return args.map((arg, i) => {
    const input = inputs?.[i];
    if (input?.type === 'address' && typeof arg === 'string') {
      return toHexAddress(arg);
    }
    // Convert BigNumber-like objects to string for safety
    if (arg && typeof arg === 'object' && typeof arg.toString === 'function') {
      return arg.toString(10);
    }
    return arg;
  });
}

/**
 * ABI-encode a contract function call.
 * Returns the encoded data as a hex string WITHOUT 0x prefix
 * (ready for ElectrumX contract calls).
 *
 * Automatically converts Runebase base58 addresses to hex for
 * address-type parameters.
 */
export function encodeContractCall(
  abiDef: any[],
  methodName: string,
  args: any[],
): string {
  const func = findAbiFunction(abiDef, methodName);
  if (!func) throw new Error(`Method ${methodName} not found in ABI`);

  const encoded = getFragmentInterface(func)
    .encodeFunctionData(methodName, convertArgs(func.inputs, args));
  // Strip 0x prefix for ElectrumX
  return encoded.startsWith('0x') ? encoded.slice(2) : encoded;
}

/**
 * ABI-encode a call from a standalone function fragment (one not present in a
 * full ABI array), returning hex WITHOUT the 0x prefix.
 */
export function encodeMethodFragment(
  fragment: { name: string; inputs?: any[]; outputs?: any[] },
  args: any[],
): string {
  const full = { type: 'function', outputs: [], inputs: [], ...fragment };
  const encoded = new Interface([full])
    .encodeFunctionData(full.name, convertArgs(full.inputs, args));
  return encoded.startsWith('0x') ? encoded.slice(2) : encoded;
}

/**
 * Decode the output of a contract call.
 * Takes the raw hex output from executionResult.output and
 * returns the decoded values as a plain array.
 */
export function decodeContractOutput(
  abiDef: any[],
  methodName: string,
  outputHex: string,
): any[] {
  const func = findAbiFunction(abiDef, methodName);
  if (!func) throw new Error(`Method ${methodName} not found in ABI`);

  const hex = outputHex.startsWith('0x') ? outputHex : `0x${outputHex}`;
  return Array.from(
    getFragmentInterface(func).decodeFunctionResult(methodName, hex),
  );
}

/**
 * Decode a contract call result from ElectrumX format.
 * Wraps the result to match the format the rest of the code expects
 * (executionResult.formattedOutput).
 */
export function decodeContractCallResult(
  result: any,
  abiDef: any[],
  methodName: string,
): any {
  const output = result?.executionResult?.output;
  if (!output || result?.executionResult?.excepted !== 'None') {
    return result;
  }

  const decoded = decodeContractOutput(abiDef, methodName, output);

  // Return in the same shape the rest of the code expects
  return {
    ...result,
    executionResult: {
      ...result.executionResult,
      formattedOutput: decoded,
    },
  };
}
