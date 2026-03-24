import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const nm = (p: string) => path.resolve(__dirname, 'node_modules', p);

const sharedDefine = {
  'process.env.APP_VERSION': JSON.stringify(pkg.version),
  'global': 'globalThis',
};

// Node builtin → browser polyfill aliases.
// Applied to all builds so rolldown resolves them instead of externalizing.
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

const sharedResolve = {
  alias: {
    'scryptsy/browser': 'scryptsy',
    'bignumber.js': path.resolve(__dirname, 'node_modules/bignumber.js/dist/bignumber.mjs'),
    ...nodeBuiltinAliases,
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
//   - Node builtins resolved via aliases, globals via src/polyfills.ts
//
// Sub-builds (IIFE, self-contained):
//   - contentscript.js  — injected into web pages, no module support
//   - inpage.js         — injected into web pages, no module support
export default defineConfig({
  root: '.',
  base: './',
  publicDir: 'static',

  plugins: [
    react(),
    // After main build, create self-contained IIFE scripts for content/inpage
    {
      name: 'build-iife-scripts',
      async closeBundle() {
        const { build } = await import('vite');

        // Inject global/process/Buffer shims since these IIFE bundles run
        // in web page context without Node globals.
        const nodeShimPlugin = {
          name: 'prepend-node-shims',
          renderChunk(code: string) {
            const shim = 'var global=typeof globalThis!=="undefined"?globalThis:self;' +
              'var process=typeof process!=="undefined"?process:' +
              '{browser:true,version:"v20.0.0",env:{},' +
              'nextTick:function(c){setTimeout(c,0)},' +
              'stdout:{},stderr:{}};' +
              'var Buffer=typeof Buffer!=="undefined"?Buffer:{isBuffer:function(){return false}};';
            return shim + code;
          },
        };

        for (const name of ['contentscript', 'inpage']) {
          await build({
            configFile: false,
            root: '.',
            publicDir: false,
            plugins: [nodeShimPlugin],
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
    // MUI + crypto libs are legitimately large
    chunkSizeWarningLimit: 2000,
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
