import '../polyfills';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './global.css';
import App from './App';
import { PORT_NAME } from '../constants';

const isExtension = typeof chrome !== 'undefined'
  && !!chrome.runtime && !!chrome.runtime.id;

// Connect port
let port: any;
if (isExtension) {
  port = chrome.runtime.connect({ name: PORT_NAME.POPUP });
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

// Detect layout: extension popup = fixed 400×600, everything else = fill viewport.
// For extension, check chrome.storage for viewMode set by the side panel toggle.
// Render React AFTER the class is applied so the first paint uses correct layout.
function applyLayoutAndRender() {
  if (!isExtension) {
    // Non-extension (dev:browser, Electron, Cordova): always fill viewport
    document.documentElement.classList.add('fill-viewport');
    render();
  } else {
    chrome.storage.local.get('viewMode', (data) => {
      if (data.viewMode === 'sidePanel') {
        document.documentElement.classList.add('fill-viewport');
      }
      // Extension popup: no class → fixed 400×600 via CSS default
      render();
    });
  }
}

function render() {
  createRoot(root!).render(<App port={port} />);
}

applyLayoutAndRender();
