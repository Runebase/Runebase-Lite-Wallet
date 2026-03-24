// eslint-disable-next-line no-undef
module.exports = {
  productName: 'Runebase-lite-Wallet',
  appId: 'io.runebase.runebase-lite-wallet',
  files: [
    'dist/**/*',
    'electron/**/*',
    'package.json',
    'main.js',
    // Only include node_modules needed by electron/main.js at runtime.
    // The frontend deps are already bundled by Vite into dist/.
    'node_modules/electron-progressbar/**',
    'node_modules/electron-updater/**',
    'node_modules/extend/**',
    'node_modules/builder-util-runtime/**',
    'node_modules/fs-extra/**',
    'node_modules/graceful-fs/**',
    'node_modules/js-yaml/**',
    'node_modules/argparse/**',
    'node_modules/jsonfile/**',
    'node_modules/lazy-val/**',
    'node_modules/lodash.escaperegexp/**',
    'node_modules/lodash.isequal/**',
    'node_modules/semver/**',
    'node_modules/tiny-typed-emitter/**',
    'node_modules/universalify/**',
    'node_modules/debug/**',
    'node_modules/ms/**',
    'node_modules/sax/**',
  ],
  win: {
    icon: 'dist/icons/icon.ico',
    target: ['nsis', 'portable']
  },
  linux: {
    category: 'Finance',
    icon: 'dist/icons/icon.png',
    target: ['deb', 'AppImage']
  },
  mac: {
    icon: 'dist/icons/icon.icns',
    category: 'Finance'
  },
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 150,
        type: 'file'
      }
    ]
  },
  directories: {
    output: 'dist-electron'
  }
};
