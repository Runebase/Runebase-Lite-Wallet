export type MessageCallback = (request: any, _?: any, sendResponse?: (response: any) => void) => void;


export interface TabOpener {
  openUrlInNewTab(url: string): void;
}

const messageListeners: { callback: MessageCallback }[] = [];
export const messageCallbacks = {};

export function sendMessage(message: any, callback?: any) {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage(message, callback);
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
      window.postMessage(message, '*');
    }
  } catch (error) {
    console.error('Error in sendMessage:', error);
    // You might want to add additional error handling logic here
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

export function getStorageValue(key: string): Promise<any> {
  return new Promise((resolve) => {
    if (isExtensionEnvironment()) {
      chrome.storage.local.get([key], (result: any) => {
        resolve(result[key]);
      });
    } else {
      // Web-compatible implementation
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
      // Web environment
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

interface ConnectListenerOptions {
  onMessage: MessageCallback;
  onDisconnect?: () => void; // New optional callback for disconnect events
}

export function addConnectListener(options: ConnectListenerOptions): void {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onConnect) {
    // Chrome extension compatible implementation
    chrome.runtime.onConnect.addListener((port) => {
      port.onMessage.addListener((message) => {
        options.onMessage(message);
      });

      if (options.onDisconnect) {
        port.onDisconnect.addListener(options.onDisconnect);
      }
    });
  } else if (typeof window !== 'undefined') {
    // Web-compatible implementation
    window.addEventListener('message', (event: MessageEvent) => {
      options.onMessage(event.data);
    });
  }
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

export function saveFile(content, filename) {
  if (isCordova()) {
    // Cordova environment
    downloadAndSaveFileCordova(content, filename);
  } else {
    // Web or Chrome extension environment
    downloadFileWeb(content, filename);
  }
}

export function isCordova() {
  return window.cordova !== undefined;
}

// Broken, Couldn't figure out how to fix this. supposed to be for downloading seedphrase to file
function downloadAndSaveFileCordova(content: string, filename: string) {
  console.log('downloadAndSaveFileCordova calleds');

  document.addEventListener('deviceready', function () {
    console.log('deviceready event triggered');

    console.log('Content:', content);
    console.log('Content type:', typeof content);

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

    // Request WRITE_EXTERNAL_STORAGE permission
    window.plugins.permissions.requestPermission(
      window.plugins.permissions.WRITE_EXTERNAL_STORAGE,
      function (status) {
        if (status.hasPermission) {
          // Permission granted, proceed with file operations
          window.resolveLocalFileSystemURL(
            cordova.file.dataDirectory,
            function (directoryEntry) {
              // Create or open the file
              directoryEntry.getFile(
                filename,
                { create: true, exclusive: false },
                function (fileEntry: any) {
                  // Create a FileWriter object
                  fileEntry.createWriter(
                    function (fileWriter: any) {
                      fileWriter.onwriteend = function () {
                        console.log('File saved locally: ' + fileEntry.toURL());
                        // Handle further operations here, if needed
                      };

                      fileWriter.onerror = function (error: any) {
                        console.error('Error writing to file: ' + JSON.stringify(error));
                      };

                      // Write the blob to the file
                      fileWriter.write(blob);
                    },
                    function (error: any) {
                      console.error('Error creating FileWriter: ' + JSON.stringify(error));
                    }
                  );
                },
                function (error: any) {
                  console.error('Error creating or opening file: ' + JSON.stringify(error));
                }
              );
            },
            function (error) {
              console.error('Error resolving file system URL: ' + JSON.stringify(error));
            }
          );
        } else {
          console.error('WRITE_EXTERNAL_STORAGE permission denied');
        }
      },
      function () {
        console.error('Error requesting WRITE_EXTERNAL_STORAGE permission');
      }
    );
  }, false);
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