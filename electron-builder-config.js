module.exports = {
  productName: 'Runebase-Light-Wallet',
  appId: 'com.yourcompany.runebase-light-wallet',
  files: [
    'dist/**/*',
    'electron/**/*',
    'package.json',
    'main.js'
  ],
  extraResources: [
    {
      from: 'assets',
      to: 'assets'
    }
  ],
  win: {
    icon: 'dist/icons/icon.ico'
  },
  linux: {
    category: 'Utility',
    icon: 'dist/icons/icon.png'
  },
  mac: {
    icon: 'dist/icons/icon.icns',
    category: 'your.app.category'
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
