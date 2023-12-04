module.exports = {
  productName: 'Runebase-Light-Wallet',
  appId: 'com.yourcompany.runebase-light-wallet',
  files: [
    'src/**/*',
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
  mac: {
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
