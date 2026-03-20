## Get RunebaseLite
Chome Web Store: https://chrome.google.com/webstore/detail/runebasechrome/hdmjdgjbehedbnjmljikggbmmbnbmlnd

## Web Dapp Usage

Your dapp can use RunebaseChrome to get information about a user's account status (whether they are logged into RunebaseChrome, their account address, and balance). RunebaseChrome also enables your dapp to listen to a window event for any changes to the user's account status.
Your dapp can also use runebasechrome to make callcontract and sendtocontract calls to the blockchain.

### Connecting RunebaseChrome
To use any of the above functionality, your dapp will first need to initiate a long-lived connection between RunebaseChrome's content script and background script.
The code to do this is already in RunebaseChrome, your dapp just needs to trigger the function by posting a window message.
`window.postMessage({ message: { type: 'CONNECT_RUNEBASECHROME' }}, '*')`

This will populate the `window.runebasechrome` object in your webpage. The `window.runebasechrome.account` values are automatically updated when a user logs in/out or the account balance changes.

```
// window.runebasechrome
{
  rpcProvider: RunebaseChromeRPCProvider,
  account: {
    loggedIn: true,
    name: "2",
    network: "TestNet",
    address: "qJHp6dUSmDShpEEMmwxqHPo7sFSdydSkPM",
    balance: 49.10998413
  }
}
```

### Refreshing your page when RunebaseChrome is installed or updated
You will probably want to refresh your dapp webpage when RunebaseChrome is installed or updated. This allows your dapp to rerun
`window.postMessage({ message: { type: 'CONNECT_RUNEBASECHROME' }}, '*')`
which would have previously failed to do anything while RunebaseChrome was not yet installed.
When RunebaseChrome is installed or updated it will send all existing tabs an event message. To have that event message refresh your dapp, add the following event listener.

```
function handleRunebaseChromeInstalledOrUpdated(event) {
  if (event.data.message && event.data.message.type === 'RUNEBASECHROME_INSTALLED_OR_UPDATED') {
      // Refresh the page
      window.location.reload()
  }
}
window.addEventListener('message', handleRunebaseChromeInstalledOrUpdated, false);
```

### RunebaseChrome User Account Status - Login/Logout
After connecting RunebaseChrome to your dapp, you can use an event listener to get notified of any changes to the user's account status(logging in/out, change in account balance).

```
function handleRunebaseChromeAcctChanged(event) {
  if (event.data.message && event.data.message.type === "RUNEBASECHROME_ACCOUNT_CHANGED") {
  	if (event.data.message.payload.error){
  		// handle error
  	}
    console.log("account:", event.data.message.payload.account)
  }
}
window.addEventListener('message', handleRunebaseChromeAcctChanged, false);
```

Note that `window.runebasechrome.account` will still get updated even if you don't set up this event listener; your Dapp just won't be notified of the changes.

### Using RunebaseChromeProvider

RPC calls can be directly made via `RunebaseChromeProvider` which is available to any webpage that connects to RunebaseChrome.

**Make sure that `window.runebasechrome.rpcProvider` is defined before using it.**

```
// callcontract
const contractAddress = 'a6dd0b0399dc6162cedde85ed50c6fa4a0dd44f1';
const data = '06fdde03';
window.runebasechrome.rpcProvider.rawCall(
  'callcontract',
  [contractAddress, data]
).then((res) => console.log(res));

// sendtocontract
const contractAddress = '49a941c5259e4e6ef9ac4a2a6716c1717ce0ffb6';
const data = 'd0821b0e0000000000000000000000000000000000000000000000000000000000000001';
const runebaseAmt = 1; // optional. defaults to 0.
const gasLimit = 200000; // optional. defaults to 200000.
const gasPrice = 4000; // optional. defaults to 4000 (satoshi).
window.runebasechromeProvider.rawCall(
  'sendtocontract',
  [contractAddress, data, runebaseAmt, gasLimit, gasPrice],
);

// Handle incoming messages
function handleMessage(message) {
  if (message.data.target == 'runebasechrome-inpage') {
    // result: object
    // error: string
    const { result, error } = message.data.message.payload;

    if (error) {
      if (error === 'Not logged in. Please log in to RunebaseChrome first.') {
        // Show an alert dialog that the user needs to login first
        alert(error);
      } else {
        // Handle different error than not logged in...
      }
      return;
    }

    // Do something with the message result...
  }
}
window.addEventListener('message', handleMessage, false);
```

### Using Rweb3
You may also use our Rweb3 convenience library to make `sendtocontract` or `callcontract` calls. See the instructions in the Github repo here: https://github.com/runebase/rweb3.js

### Using RegTest
You can connect RunebaseChrome to regtest. You will need to set the following in your runebasecore-node.json

```
"runebase-explorer": {
  "apiPrefix": "insight-api",
  "routePrefix": "explorer",
  ...
 },
"runebase-insight-api": {
  "routePrefix": "insight-api",
  ...
}
```

## Running Dev Version (NodeJs v18)
### Development Chrome
1. Install web-ext `npm install -g web-ext`
2. Run development `npm run dev`
3. Open secondary terminal
4. navigate to dist folder
5. Run web-ext for hot-reload `web-ext run --target=chromium`

### Build Chrome
1. `npm run start` in the project folder to build the dev version and wait for it to be built
2. Open Chrome and load URL: `chrome://extensions`
3. Turn `Developer mode` on in the top right
4. At the top, click `Load Unpacked Extension`
5. Navigate to your `runebasechrome/dist` folder
6. Click `Select`. The extension should now be loaded
7. Click on the RunebaseChrome logo in your Chrome extensions bar to open

## Security Flow
**First Time Flow**
1. `appSalt` is generated on a per-install basis
2. User enters `password` in Login page
3. `password` + `appSalt` runs through `scrpyt` encryption for ~3 seconds to generate `passwordHash`
4. User creates or imports wallet
5. `passwordHash` + wallet's `privateKey` runs through `scrypt` encryption for ~1 second to generate `encryptedPrivateKey`
6. Account is saved in storage with `encryptedPrivateKey`

**Return User Flow**
1. User enters password in Login page
2. `password` + `appSalt` runs through `scrpyt` encryption for ~3 seconds to generate `passwordHash`
3. Existing account is fetched from storage
4. `passwordHash` is used to decrypted the `encryptedPrivateKey`. On successful decryption of the wallet, the password is validated.

**Running a WebApp Abstraction**
1. Navigate to dist folder
2. start http server `http-server -c-1`

## Cordova Mobile Builds (Android & iOS)

### Shared Prerequisites
Build the webpack bundle first (from project root):
```bash
npm run clean && mkdir dist
./scripts/create-empty-thunk.sh
npx webpack --progress --config webpack.prod.config.js
cp -R dist/* cordova/www
```

### Setup
```bash
cd cordova
npm install
npx cordova platform add android
npx cordova platform add ios    # macOS only
```
Plugins (`cordova-plugin-file`, `cordova-plugin-qrscanner`, `cordova-plugin-android-permissions`) are automatically installed from `config.xml`.

### Updating Icons & Splash Screens
```bash
# Install cordova-res globally if you haven't already
npm install -g cordova-res

# Run in the cordova directory to generate icons and splash screens
cd cordova
cordova-res
```

#### Regenerate after updating sources
```bash
cd cordova
cordova-res ios --copy
cordova-res android --copy
```
The `--copy` flag puts generated files directly into the platform directories.

---

### Android

#### Prerequisites
- Android SDK Platform 36 and Build Tools 36.0.0 (required by cordova-android 15)
- Install via Android Studio: **Settings > Languages & Frameworks > Android SDK > SDK Tools**
- Or via command line:
```bash
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "build-tools;36.0.0" "platforms;android-36"
```

#### Build Debug APK
```bash
cd cordova
npx cordova build android
```
Output: `cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk`

#### Build Release AAB
Requires a `build.json` in the cordova directory (see `build.json.example` for template):
```bash
cd cordova
npx cordova build android --release --buildConfig=build.json
```
Output: `cordova/platforms/android/app/build/outputs/bundle/release/app-release.aab`

#### Run on Emulator or Device
```bash
cd cordova
npx cordova run android
```
Or install a debug APK manually:
```bash
adb install cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

---

### iOS (macOS only)

#### Prerequisites

1. **Install Homebrew** (Mac package manager):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. **Install Node.js**:
```bash
brew install node
```

3. **Install Xcode** from the Mac App Store (search "Xcode"). After installing, open it once to accept the license, then run:
```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
xcode-select --install
```

4. **Install CocoaPods**:
```bash
sudo gem install cocoapods
```

5. **Install ios-deploy** (for deploying to physical devices):
```bash
brew install ios-deploy
```

6. **Apple Developer account** is required for deploying to physical devices (simulator is free)

#### Setup
```bash
cd cordova
npm install
npx cordova platform add ios
```

#### Build for iOS
```bash
cd cordova
npx cordova build ios
```

#### Open in Xcode
```bash
open cordova/platforms/ios/Runebase\ Lite\ Wallet.xcworkspace
```
Choose a simulator or connected device, then click **Run**.

#### Run on Simulator
```bash
cd cordova
npx cordova run ios --target="iPhone-16-Pro"
```

#### Run on Physical Device
```bash
cd cordova
npx cordova run ios --device
```
Requires a valid signing identity configured in Xcode (**Signing & Capabilities** tab).

#### Build Release IPA
```bash
cd cordova
npx cordova build ios --release --device --buildConfig=build.json
```
The `build.json` should include your iOS signing configuration:
```json
{
  "ios": {
    "release": {
      "codeSignIdentity": "Apple Distribution",
      "developmentTeam": "YOUR_TEAM_ID",
      "packageType": "app-store",
      "provisioningProfile": "YOUR_PROVISIONING_PROFILE_UUID"
    }
  }
}
```

#### Troubleshooting
- **White screen on launch**: Ensure `cordova-plugin-qrscanner` is installed. The app requires this plugin to be present — removing it causes the JS to fail silently.
- **Simulator not found**: Open Xcode > **Settings > Platforms** and install the iOS simulator runtime.
- **Signing errors**: Ensure your Apple Developer Team ID is set in Xcode under **Signing & Capabilities**.

## Electron Desktop Builds

All Electron builds require the webpack production bundle to be built first:
```bash
# Clean and prepare
npm run clean && mkdir dist

# Create empty thunk files
./scripts/create-empty-thunk.sh

# Build the production bundle
npx webpack --progress --config webpack.prod.config.js
```

### Building for Windows
```bash
npx electron-builder --win -c electron-builder-config.js
```
Outputs NSIS installer (`.exe`) and portable (`.exe`) to `dist-electron/`.

### Building for Linux
```bash
npx electron-builder --linux -c electron-builder-config.js
```
Outputs `.deb` and `.AppImage` to `dist-electron/`.

### Building for Windows + Linux (combined)
```bash
npx electron-builder --win --linux -c electron-builder-config.js
```

### Building for macOS
Must be run on a macOS machine.
```bash
npx electron-builder --mac -c electron-builder-config.js
```
Outputs `.dmg` to `dist-electron/`.

### Full Release Build (all platforms except macOS)
The `build.sh` script automates version bumping, webpack build, Cordova Android build, Electron Windows/Linux builds, and Chrome extension packaging:
```bash
# patch, minor, or major
./build.sh patch
```
All compiled artifacts are copied to the `compiled_files/` directory.

After pushing to GitHub, the CI/CD pipeline will automatically build macOS and iOS artifacts (see below).

## CI/CD (GitHub Actions)

A GitHub Actions workflow (`.github/workflows/build.yml`) automatically builds **all platforms** on every push to `main`:

| Job | Runner | Artifacts |
|-----|--------|-----------|
| Chrome Extension | Ubuntu | `.zip` |
| Electron (Linux + Windows) | Ubuntu | `.AppImage`, `.deb`, `.exe` |
| Electron (macOS) | macOS | `.dmg` |
| Cordova Android | Ubuntu | `.apk`, `.aab` |
| Cordova iOS | macOS | Xcode build output |

### Downloading Build Artifacts
1. Go to your repo's **Actions** tab on GitHub
2. Click the latest workflow run
3. Download artifacts from the **Artifacts** section at the bottom

### Triggering a Build
- **Automatic**: Builds on every push to `main`
- **Manual**: Go to **Actions > Build All Platforms > Run workflow**

> **Note**: iOS builds require code signing for device deployment. The CI builds an unsigned version suitable for simulator testing. For App Store submission, configure signing secrets in your GitHub repository settings.

