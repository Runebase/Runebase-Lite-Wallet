/**
 * In browser dev mode (webpack-dev-server), external API requests
 * are blocked by CORS. This helper rewrites known external URLs to
 * go through the webpack proxy so they work without CORS headers.
 *
 * In the Chrome extension, fetch bypasses CORS via host_permissions,
 * so the URLs are used as-is.
 */

declare const process: { env: { PLATFORM?: string } };

const isBrowserDev = typeof process !== 'undefined'
  && process.env?.PLATFORM === 'browser';

const PROXY_MAP: Array<[string, string]> = [
  ['https://discord.runebase.io', '/proxy/discord'],
  ['https://api.coinpaprika.com', '/proxy/coinpaprika'],
  ['https://explorer.runebase.io/api', '/proxy/explorer/api'],
  ['https://testnet.runebase.io/api', '/proxy/explorer/api'],
];

export function proxyUrl(url: string): string {
  if (!isBrowserDev) return url;

  for (const [prefix, proxy] of PROXY_MAP) {
    if (url.startsWith(prefix)) {
      return url.replace(prefix, proxy);
    }
  }
  return url;
}

/**
 * Drop-in replacement for fetch that proxies URLs in browser dev mode.
 */
export function proxyFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(proxyUrl(url), init);
}
