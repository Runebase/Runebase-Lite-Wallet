import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const nm = (p: string) => path.resolve(__dirname, 'node_modules', p);

const nodeBuiltinAliases: Record<string, string> = {
  'crypto': nm('crypto-browserify'),
  'stream': nm('stream-browserify'),
  'http': nm('stream-http'),
  'https': nm('https-browserify'),
  'zlib': nm('browserify-zlib'),
  'url': nm('url'),
  'assert': nm('assert'),
  'util': nm('util'),
  'buffer': nm('buffer'),
  'events': nm('events'),
  'vm': nm('vm-browserify'),
  'process': nm('process/browser.js'),
};

// Capacitor / mobile build.
//
// Produces a single-page app from popup.html + background.js.
// No Chrome extension scripts (contentscript/inpage) — those are
// only needed for the browser extension target.
export default defineConfig({
  root: '.',
  base: './',
  publicDir: 'static',

  plugins: [react()],

  define: {
    'process.env.PLATFORM': JSON.stringify('capacitor'),
    'process.env.APP_VERSION': JSON.stringify(pkg.version),
    'global': 'globalThis',
  },

  resolve: {
    alias: {
      'scryptsy/browser': 'scryptsy',
      'bignumber.js': path.resolve(__dirname, 'node_modules/bignumber.js/dist/bignumber.mjs'),
      ...nodeBuiltinAliases,
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      mangle: { safari10: true, keep_fnames: true },
      compress: { drop_console: true },
    },
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
