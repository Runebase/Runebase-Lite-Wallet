import { API_TYPE, TARGET_NAME } from '../constants';
import { postWindowMessage } from '../utils/messenger';

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const scriptElement = document.createElement('script');
    const headOrDocumentElement = document.head || document.documentElement;

    scriptElement.onload = () => resolve();
    scriptElement.onerror = (error) => reject(error);
    scriptElement.src = src;
    headOrDocumentElement.insertAdjacentElement('afterbegin', scriptElement);
  });
}

function injectStylesheet(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const styleElement = document.createElement('link');
    const headOrDocumentElement = document.head || document.documentElement;

    styleElement.onload = () => resolve();
    styleElement.onerror = (error) => reject(error);
    styleElement.rel = 'stylesheet';
    styleElement.href = src;
    headOrDocumentElement.insertAdjacentElement('afterbegin', styleElement);
  });
}

export async function injectAllScripts() {
  try {
    // await injectScript(chrome.runtime.getURL('commons.all.js'));
    // await injectScript(chrome.runtime.getURL('commons.exclude-background.js'));
    // await injectScript(chrome.runtime.getURL('commons.exclude-contentscript.js'));
    // await injectScript(chrome.runtime.getURL('commons.exclude-popup.js'));
    // await injectScript(chrome.runtime.getURL('commons.background-inpage.js'));
    // await injectScript(chrome.runtime.getURL('commons.contentscript-inpage.js'));
    // await injectScript(chrome.runtime.getURL('commons.popup-inpage.js'));
    await injectScript(chrome.runtime.getURL('inpage.js'));

    // Pass the Chrome extension absolute URL of the Sign Transaction dialog to the Inpage
    const signTxUrl = chrome.runtime.getURL('sign-tx.html');
    postWindowMessage(TARGET_NAME.INPAGE, {
      type: API_TYPE.SIGN_TX_URL_RESOLVED,
      payload: { url: signTxUrl },
    });
  } catch (error) {
    console.error('Error injecting scripts:', error);
  }

  try {
    await injectStylesheet(chrome.runtime.getURL('css/modal.css'));
  } catch (error) {
    console.error('Error injecting stylesheet:', error);
  }
}
