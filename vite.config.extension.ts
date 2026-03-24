import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const sharedDefine = {
  'process.env.APP_VERSION': JSON.stringify(pkg.version),
};

const sharedResolve = {
  alias: {
    'scryptsy/browser': 'scryptsy',
    'bignumber.js': path.resolve(__dirname, 'node_modules/bignumber.js/dist/bignumber.mjs'),
  } as Record<string, string>,
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
};

const terserOpts = {
  mangle: {
    safari10: true,
    keep_fnames: true,
  },
  compress: {
    drop_console: true,
  },
};

// Chrome extension / production build.
//
// Main build: popup.html + background.js (ES modules with code splitting).
//   - popup.html gets proper CSS injection and module script tags
//   - background.js is a service worker with "type": "module" in manifest.json
//   - shared code goes into chunks/ directory
//
// Sub-builds (IIFE, self-contained):
//   - contentscript.js  — injected into web pages, no module support
//   - inpage.js         — injected into web pages, no module support
//   - scryptworker.js   — Web Worker, needs crypto polyfills
export default defineConfig({
  root: '.',
  base: './',
  publicDir: 'static',

  plugins: [
    react(),
    nodePolyfills({
      include: [
        'buffer', 'crypto', 'stream', 'util', 'assert', 'events',
        'http', 'https', 'zlib', 'url', 'vm', 'process',
      ],
      globals: { Buffer: true, process: true },
    }),
    // After main build, create self-contained IIFE scripts for content/inpage/worker
    {
      name: 'build-iife-scripts',
      async closeBundle() {
        const { build } = await import('vite');

        // Content script & inpage: lightweight, only use chrome.* and window APIs
        for (const name of ['contentscript', 'inpage']) {
          await build({
            configFile: false,
            root: '.',
            publicDir: false,
            define: sharedDefine,
            resolve: sharedResolve,
            build: {
              outDir: 'dist',
              emptyOutDir: false,
              sourcemap: false,
              minify: 'terser',
              terserOptions: terserOpts,
              lib: {
                entry: path.resolve(__dirname, `src/${name}/index.ts`),
                name,
                formats: ['iife'],
                fileName: () => `${name}.js`,
              },
            },
            logLevel: 'warn',
          });
        }

        // Note: scryptworker.js is NOT built here — it is unused (no Worker()
        // calls in the codebase). Scrypt runs synchronously in cryptoController.ts.
        // If a worker build is needed in the future, it requires special handling
        // for Node builtin polyfills in IIFE mode.
      },
    },
  ],

  define: sharedDefine,
  resolve: sharedResolve,

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: terserOpts,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'popup.html'),
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
