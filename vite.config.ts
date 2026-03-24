import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const nm = (p: string) => path.resolve(__dirname, 'node_modules', p);

// Map Node builtins to browser polyfill packages.
// Replaces vite-plugin-node-polyfills (which doesn't support Vite 8).
const nodeAliases: Record<string, string> = {
  crypto: nm('crypto-browserify'),
  stream: nm('stream-browserify'),
  http: nm('stream-http'),
  https: nm('https-browserify'),
  zlib: nm('browserify-zlib'),
  url: nm('url'),
  assert: nm('assert'),
  util: nm('util'),
  buffer: nm('buffer'),
  events: nm('events'),
  vm: nm('vm-browserify'),
  process: nm('process/browser.js'),
};

// Plugin that injects process/Buffer/global shims into pre-bundled dep chunks.
// CJS deps like readable-stream reference bare `process` at module init time
// and need it available in the chunk scope during Vite's dep optimization.
function injectNodeGlobals(): Plugin {
  return {
    name: 'inject-node-globals',
    config() {
      return {
        optimizeDeps: {
          rolldownOptions: {
            plugins: [
              {
                name: 'prepend-process-shim',
                transform(code, id) {
                  if (!id.includes('node_modules')) return null;
                  if (id.endsWith('.json') || id.endsWith('.css')) return null;
                  if (!code.includes('process') && !code.includes('Buffer') && !code.includes('global')) return null;
                  const shim = [
                    'if(typeof globalThis.process==="undefined"||!globalThis.process.version){',
                    '  globalThis.process=Object.assign({browser:true,version:"v20.0.0",env:{},',
                    '    cwd:function(){return"/"},nextTick:function(c){setTimeout(c,0)}},',
                    '    typeof globalThis.process==="object"?globalThis.process:{});',
                    '}',
                    'if(typeof globalThis.global==="undefined"){globalThis.global=globalThis;}',
                    'var process=globalThis.process;',
                  ].join('');
                  return shim + '\n' + code;
                },
              },
            ],
          },
        },
      };
    },
  };
}

// Browser dev mode config — runs the wallet UI in a regular browser tab
// with HMR and CORS proxying. Chrome extension APIs are shimmed via abstraction.ts.
export default defineConfig({
  root: '.',
  publicDir: 'static',

  plugins: [
    injectNodeGlobals(),
    react(),
  ],

  define: {
    'process.env.PLATFORM': JSON.stringify('browser'),
    'process.env.APP_VERSION': JSON.stringify(pkg.version),
    'global': 'globalThis',
  },

  resolve: {
    alias: {
      'scryptsy/browser': 'scryptsy',
      'bignumber.js': path.resolve(__dirname, 'node_modules/bignumber.js/dist/bignumber.mjs'),
      ...nodeAliases,
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },

  server: {
    port: 3030,
    open: true,
    proxy: {
      '/proxy/discord': {
        target: 'https://discord.runebase.io',
        rewrite: (p) => p.replace(/^\/proxy\/discord/, ''),
        changeOrigin: true,
        secure: true,
      },
      '/proxy/explorer': {
        target: 'https://explorer.runebase.io',
        rewrite: (p) => p.replace(/^\/proxy\/explorer/, ''),
        changeOrigin: true,
        secure: true,
      },
      '/proxy/runesx': {
        target: 'https://www.runesx.xyz',
        rewrite: (p) => p.replace(/^\/proxy\/runesx/, ''),
        changeOrigin: true,
        secure: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'index.html'),
      },
    },
  },
});
