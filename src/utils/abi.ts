/**
 * ABI encoding/decoding helpers using ethjs-abi directly.
 * Replaces the rweb3 dependency for contract interaction.
 */
import abi from 'ethjs-abi';
import { addressToHash160 } from '../services/wallet';

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
  if (address.startsWith('0x')) return address;
  if (/^[0-9a-fA-F]{40}$/.test(address)) return `0x${address}`;
  // Convert base58 Runebase address to hex
  return `0x${addressToHash160(address)}`;
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

  // Convert address args from base58 to hex
  const convertedArgs = args.map((arg, i) => {
    const input = func.inputs?.[i];
    if (input?.type === 'address' && typeof arg === 'string') {
      return toHexAddress(arg);
    }
    // Convert BigNumber-like objects to string for safety
    if (typeof arg === 'object' && arg.toString) {
      return arg.toString(10);
    }
    return arg;
  });

  const encoded = abi.encodeMethod(func, convertedArgs);
  // Strip 0x prefix for ElectrumX
  return encoded.startsWith('0x') ? encoded.slice(2) : encoded;
}

/**
 * Decode the output of a contract call.
 * Takes the raw hex output from executionResult.output and
 * returns the decoded values.
 */
export function decodeContractOutput(
  abiDef: any[],
  methodName: string,
  outputHex: string,
): any {
  const func = findAbiFunction(abiDef, methodName);
  if (!func) throw new Error(`Method ${methodName} not found in ABI`);

  // Ensure 0x prefix for ethjs-abi
  const hex = outputHex.startsWith('0x') ? outputHex : `0x${outputHex}`;
  return abi.decodeMethod(func, hex);
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
