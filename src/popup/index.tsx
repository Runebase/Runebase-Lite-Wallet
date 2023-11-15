import React from 'react';
import { createRoot } from 'react-dom/client';
import './global.css';
import App from './App';
import { PORT_NAME } from '../constants';

const port = chrome.runtime.connect({ name: PORT_NAME.POPUP });

const root: Element | null = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found'); // or handle it in some way
}

const rootContainer = createRoot(root);

rootContainer.render(<App port={port} />);
