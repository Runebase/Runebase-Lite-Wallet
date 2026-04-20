import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export type MessageCallback = (request: any, _?: any, sendResponse?: (response: any) => void) => void;
export interface TabOpener {
  openUrlInNewTab(url: string): void;
}

const messageListeners: { callback: MessageCallback }[] = [];
export const messageCallbacks = {};

let targetOrigin = '*'; // Default to allow cross-origin communication
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
  targetOrigin = chrome.runtime.getURL('/');
} else if (typeof process !== 'undefined' && (process as any).type) {
  targetOrigin = 'file://';
} else if (isNativeMobile()) {
  // Capacitor serves content from https://localhost on Android
  targetOrigin = window.location.origin;
} else {
  targetOrigin = window.location.origin;
}

export function sendMessage(message: any, callback?: any) {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      // In MV3 extensions, sendMessage throws "Receiving end does not
      // exist" when the popup/side-panel is closed. Passing a callback
      // (even a no-op) lets us read chrome.runtime.lastError and
      // suppress the noisy unchecked-error warning in the console.
      chrome.runtime.sendMessage(message, (response: any) => {
        if (chrome.runtime.lastError) {
          // Expected when popup is closed — silently ignore
        }
        if (callback) callback(response);
      });
    } else {
      if (
        callback
        && typeof callback === 'function'
        && message.type !== 'USE_CALLBACK'
      ) {
        const messageId = Math.random().toString(36).substr(2, 9);
        const handler = (event: MessageEvent) => {
          if (
            event.data.id === messageId
            && event.data.type !== message.type
          ) {
            callback(event.data.result);
            window.removeEventListener('message', handler);
          }
        };
        window.addEventListener('message', handler);
        message.id = messageId;
      }
      window.postMessage(message, targetOrigin);
    }
  } catch (error) {
    console.error('Error in sendMessage:', error);
  }
}



export function addMessageListener(handleMessage: MessageCallback) {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    // Running as a Chrome extension
    chrome.runtime.onMessage.addListener(handleMessage);
    return true;
  } else if (typeof window !== 'undefined') {
    window.addEventListener('message', handleMessage);
    return true;
  }
  return false;
}

export function removeMessageListener(callback: MessageCallback): void {
  const index = messageListeners.findIndex((entry) => entry.callback === callback);
  if (index !== -1) {
    const listenerEntry = messageListeners.splice(index, 1)[0];

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.removeListener(listenerEntry.callback);
    } else if (typeof window !== 'undefined') {
      // Web-compatible implementation
      window.removeEventListener('message', listenerEntry.callback);
    }
  }
}


export function openUrlInNewTab(url: string, tabOpener: TabOpener): void {
  tabOpener.openUrlInNewTab(url);
}

export function isExtensionEnvironment(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
}

/**
 * Returns true when running inside Capacitor's native Android/iOS shell.
 * Replaces the old isCordova() check.
 */
export function isNativeMobile(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * @deprecated Use isNativeMobile() instead. Kept temporarily so callers
 * that haven't been updated yet continue to work.
 *
 * ============================================================
 * CORDOVA COMPATIBILITY SHIM (temporary)
 *
 * Remove after: 2027-07-01
 * ============================================================
 */
export function isCordova(): boolean {
  return isNativeMobile();
}

export function getStorageValue(key: string): Promise<any> {
  return new Promise((resolve) => {
    if (isExtensionEnvironment()) {
      chrome.storage.local.get([key], (result: any) => {
        resolve(result[key]);
      });
    } else {
      // Web-compatible implementation (works in Capacitor too)
      const value = localStorage.getItem(key);
      resolve(value ? JSON.parse(value) : null);
    }
  });
}

export function setStorageValue(key: string, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isExtensionEnvironment()) {
      // Extension environment
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Unknown error'));
        } else {
          resolve();
        }
      });
    } else {
      // Web / Capacitor environment
      try {
        localStorage.setItem(key, JSON.stringify(value));
        resolve();
      } catch (error) {
        reject(error);
      }
    }
  });
}

export function getMultipleStorageValues(keys: string[]): Promise<any> {
  return new Promise((resolve) => {
    if (isExtensionEnvironment()) {
      chrome.storage.local.get(keys, (result: any) => {
        resolve(result);
      });
    } else {
      // Web-compatible implementation
      const values: Record<string, any> = {};
      keys.forEach((key) => {
        const value = localStorage.getItem(key);
        values[key] = value ? JSON.parse(value) : null;
      });
      resolve(values);
    }
  });
}

// Abstraction for accessing Chrome extension resources and manifest information
export interface ExtensionInfoProvider {
  getURL(path: string): string;
  getVersion(): string;
}

// Chrome extension implementation
export class ChromeExtensionInfoProvider implements ExtensionInfoProvider {
  getURL(path: string): string {
    return chrome.runtime.getURL(path);
  }

  getVersion(): string {
    return chrome.runtime.getManifest().version;
  }
}

// Web-compatible implementation
export class WebExtensionInfoProvider implements ExtensionInfoProvider {
  // Provide a web-compatible implementation if needed
  // For example, you can use relative paths for resources
  getURL(path: string): string {
    return path;
  }

  getVersion(): string {
    return String(process.env.APP_VERSION); // Provide a default version for the web
  }
}

// Determine the environment and use the appropriate implementation
export const extensionInfoProvider: ExtensionInfoProvider =
  typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id
    ? new ChromeExtensionInfoProvider()
    : new WebExtensionInfoProvider();

export function getImageUrl(path: string): string {
  // Determine the environment and use the appropriate implementation
  const extensionInfoProvider: ExtensionInfoProvider =
    typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id
      ? new ChromeExtensionInfoProvider()
      : new WebExtensionInfoProvider();

  return extensionInfoProvider.getURL(path);
}

export function saveFile(
  content: string,
  filename: string
) {
  if (isNativeMobile()) {
    saveFileCapacitor(content, filename);
  } else {
    downloadFileWeb(content, filename);
  }
}

async function saveFileCapacitor(content: string, originalFilename: string) {
  const sanitizedFilename = originalFilename.replace(/[:/\\?%*|"<>]/g, '_');
  const filename = sanitizedFilename + '.txt';

  try {
    await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
  } catch (error) {
    console.error('Error saving file:', error);
  }
}

function downloadFileWeb(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
