const { app, BrowserWindow, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');

let mainWindow;
let feedURL = 'https://github.com/runebase/runebase-lite-wallet/releases/latest';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      enableRemoteModule: false,
      contentSecurityPolicy: {
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://github.com/'],
      },
    },
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '../dist/popup.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  mainWindow.setMinimumSize(350, 600);
  mainWindow.webContents.openDevTools();
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function checkForUpdates() {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    console.log('Update available');
    mainWindow.webContents.send('update-available');
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded');
    mainWindow.webContents.send('update-downloaded');
  });

  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater error:', err);
  });

  // Additional logging for update events
  autoUpdater.on('checking-for-update', () => console.log('Checking for update'));
  autoUpdater.on('update-not-available', () => console.log('No update available'));
}

app.on('ready', () => {
  // Remove the default menu bar
  Menu.setApplicationMenu(null);

  // Generate Custom Menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'Check for Updates',
      click: () => {
        checkForUpdates();
      },
    },
  ]);
  Menu.setApplicationMenu(menu);

  createWindow();
  // Check for updates
  checkForUpdates();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
