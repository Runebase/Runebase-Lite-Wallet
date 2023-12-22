// eslint-disable-next-line no-undef
module.exports = {
  productName: 'Runebase-lite-Wallet',
  appId: 'io.runebase.runebase-lite-wallet',
  files: [
    'dist/**/*',
    'electron/**/*',
    'package.json',
    'main.js'
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
