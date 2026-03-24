const { app, BrowserWindow, Menu, dialog, net } = require('electron');
const path = require('path');
const url = require('url');

// electron-updater and electron-progressbar crash when running unpackaged
// (e.g. `npx electron .`), so load them lazily.
let ProgressBar, autoUpdater;
try {
  ProgressBar = require('electron-progressbar');
  autoUpdater = require('electron-updater').autoUpdater;
} catch (e) {
  // Running in dev mode — updater not available
}

let mainWindow;
let progressBar;
let owner = 'runebase'; // Replace with the actual owner of the GitHub repository
let repo = 'runebase-lite-wallet'; // Replace with the actual name of the GitHub repository


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Remove the restrictive extension CSP so ES module chunks can load
  // from file:// and external API connections are not blocked.
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [''],
      },
    });
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '../dist/popup.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  mainWindow.setMinimumSize(350, 600);
  // mainWindow.webContents.openDevTools();
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

async function checkForUpdates(
  clickedCheckForUpdates = false,
) {
  if (!autoUpdater || !ProgressBar) return;
  try {
    const response = await net.fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);
    const data = await response.json();
    const latestVersion = data.tag_name.replace('v', '');
    const currentVersion = app.getVersion();

    if (latestVersion !== currentVersion) {
      const choice = await dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: `Version ${latestVersion} is available. Do you want to download and install it?`,
        buttons: ['Yes', 'No'],
        defaultId: 0, // Default button (Yes)
      });

      if (choice.response === 0) {
        autoUpdater.once('update-downloaded', async () => {
          progressBar.close();

          const installChoice = await dialog.showMessageBox({
            type: 'question',
            buttons: ['Install and Restart', 'Later'],
            defaultId: 0,
            message: 'A new update has been downloaded. Would you like to install and restart the app now?',
          });

          if (installChoice.response === 0) {
            // User clicked 'Install and Restart'
            autoUpdater.quitAndInstall();
          }
        });

        // Show the progress bar before triggering download
        progressBar = new ProgressBar({
          indeterminate: false,
          title: 'Downloading Update',
          text: 'Downloading...',
          detail: '0%',
          browserWindow: {
            parent: mainWindow,
            modal: true,
            closable: false,
          },
        });

        autoUpdater.on('download-progress', (progressObj) => {
          if (progressBar) {
            progressBar.detail = `${progressObj.percent.toFixed(0)}%`;
            progressBar.value = progressObj.percent;
          }
        });
        autoUpdater.checkForUpdates();
      }
    } else {
      if (clickedCheckForUpdates) {
        dialog.showMessageBox({
          type: 'info',
          title: 'No Update Available',
          message: 'Your app is already up to date.',
          buttons: ['OK'],
          defaultId: 0,
        });
      }
    }
  } catch (error) {
    console.error('Error during update check:', error);
  }
}

app.on('ready', () => {
  // Remove the default menu bar
  Menu.setApplicationMenu(null);

  // Generate Custom Menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'Check for Updates',
      click: () => {
        checkForUpdates(true);
      },
    },
  ]);
  Menu.setApplicationMenu(menu);
  createWindow();
  checkForUpdates(false);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
