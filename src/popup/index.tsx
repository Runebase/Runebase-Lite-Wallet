import React from 'react';
import { createRoot } from 'react-dom/client';
import './global.css';
import App from './App';
import { PORT_NAME } from '../constants';

// Abstraction for connecting to a runtime port
interface PortConnector {
  connectToPort(portName: string): any; // Adjust the return type based on the actual return value
}

// Chrome extension implementation
class ChromePortConnector implements PortConnector {
  connectToPort(portName: string): chrome.runtime.Port {
    return chrome.runtime.connect({ name: portName });
  }
}

// Web-compatible implementation
class WebPortConnector implements PortConnector {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  connectToPort(_portName: string): any {
    // Provide a web-compatible implementation if needed
    // For example, you can use postMessage for communication
    // Adjust the return type accordingly
  }
}

// Determine the environment and use the appropriate implementation
let portConnector: PortConnector;

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
  // Check if chrome.runtime.connect is an actual function (Chrome extension environment)
  portConnector = new ChromePortConnector();
} else {
  // Web-compatible environment
  portConnector = new WebPortConnector();
}

// Usage example
const port = portConnector.connectToPort(PORT_NAME.POPUP);

const root: Element | null = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found'); // or handle it in some way
}

const rootContainer = createRoot(root);

rootContainer.render(<App port={port} />);
