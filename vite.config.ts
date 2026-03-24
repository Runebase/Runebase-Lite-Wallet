import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const nm = (p: string) => path.resolve(__dirname, 'node_modules', p);

// Manually map Node builtins to browser polyfills
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
// This is needed because vite-plugin-node-polyfills' esbuild banner injection
// is deprecated in Vite 8 (rolldown). CJS deps like readable-stream reference
// bare `process` at module init time and need it available in the chunk scope.
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
                // Transform individual files before bundling into chunks
                transform(code, id) {
                  // Only add to JS/CJS files from node_modules that reference process or Buffer
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

// Browser dev mode config — equivalent to the old webpack.dev-browser.config.js
// Only builds popup + background for rapid iteration in a regular browser tab.
export default defineConfig({
  root: '.',
  publicDir: 'static',

  plugins: [
    injectNodeGlobals(),
    react(),
    nodePolyfills({
      include: [
        'buffer', 'crypto', 'stream', 'util', 'assert', 'events',
        'http', 'https', 'zlib', 'url', 'vm', 'process',
      ],
      globals: { Buffer: true, process: true },
    }),
  ],

  define: {
    'process.env.PLATFORM': JSON.stringify('browser'),
    'process.env.APP_VERSION': JSON.stringify(pkg.version),
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
