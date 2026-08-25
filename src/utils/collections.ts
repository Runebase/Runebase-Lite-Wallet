/**
 * Small collection helpers replacing the handful of lodash functions this app
 * used. Semantics intentionally match lodash for the shapes we pass in, so
 * behaviour is unchanged (verified against lodash by differential test).
 *
 * The rest of the former lodash usage (find/findIndex/every/each/split/
 * isUndefined/isFinite) maps directly onto native equivalents at the call site.
 */

/**
 * lodash-compatible `isEmpty`.
 *
 * Notable semantics preserved: null/undefined are empty, primitives such as
 * numbers and booleans are ALWAYS empty, strings/arrays use length, and plain
 * objects use their own enumerable key count.
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value !== 'object') return true;
  return Object.keys(value as object).length === 0;
}

/**
 * lodash-compatible `cloneDeep` for the plain-data / class-instance shapes we
 * clone (accounts and their nested wallet objects).
 *
 * Prototypes are preserved and functions are carried by reference, which is
 * what lodash does — `structuredClone` does neither and would throw on the
 * wallet's function-valued properties.
 */
export function cloneDeep<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if (value === null || typeof value !== 'object') return value;

  const obj = value as unknown as object;
  if (seen.has(obj)) return seen.get(obj) as T;

  if (value instanceof Date) return new Date(value.getTime()) as unknown as T;
  if (ArrayBuffer.isView(value)) {
    // Typed arrays / Buffers: copy the bytes, keep the concrete constructor.
    const Ctor = (value as unknown as { constructor: new (v: unknown) => unknown }).constructor;
    return new Ctor((value as unknown as { slice: () => unknown }).slice()) as T;
  }

  if (Array.isArray(value)) {
    const out: unknown[] = [];
    seen.set(obj, out);
    for (const item of value) out.push(cloneDeep(item, seen));
    return out as unknown as T;
  }

  // Preserve the prototype so class instances stay instances.
  const out = Object.create(Object.getPrototypeOf(value)) as Record<string, unknown>;
  seen.set(obj, out);
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = typeof val === 'function' ? val : cloneDeep(val, seen);
  }
  return out as unknown as T;
}
