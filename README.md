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

## Development (Node.js v20+)

The project uses **Vite** for both development and production builds. All platform builds (Chrome extension, Electron, Cordova) consume the same `dist/` output.

### Browser Dev Mode (recommended for daily development)
Runs the wallet UI in a regular browser tab with hot module replacement (HMR) and CORS proxying:
```bash
npm install --legacy-peer-deps
npm run dev
```
Opens `http://localhost:3030`. Chrome extension APIs are shimmed via `abstraction.ts` so the wallet UI works in a normal browser.

### Chrome Extension Dev Mode
Builds the full extension and launches Chromium with hot-reload via `web-ext`:
```bash
npm install -g web-ext
npm run dev:ext
```

### Loading the Extension Manually
1. `npm run build` to create the production bundle
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the `dist/` folder
5. The extension should now appear in your Chrome toolbar

## Building for All Platforms

All platforms start with the same Vite production build:
```bash
npm install --legacy-peer-deps
npm run build
```
This produces the `dist/` directory containing the Chrome extension and the base files used by Electron and Cordova.

### Chrome Extension
After `npm run build`, the `dist/` folder is a ready-to-load Chrome extension. To create a distributable zip:
```bash
cd dist && zip -r ../Runebase-Chrome-Wallet.zip * && cd ..
```

### Electron (Desktop)

All Electron builds read from `dist/` and output to `dist-electron/`.

**Linux:**
```bash
npx electron-builder --linux -c electron-builder-config.js
```
Outputs `.deb` and `.AppImage` to `dist-electron/`.

**Windows:**
```bash
npx electron-builder --win -c electron-builder-config.js
```
Outputs NSIS installer (`.exe`) and portable (`.exe`) to `dist-electron/`.

**macOS** (must be run on a Mac):
```bash
npx electron-builder --mac -c electron-builder-config.js
```
Outputs `.dmg` to `dist-electron/`.

**Windows + Linux combined:**
```bash
npx electron-builder --win --linux -c electron-builder-config.js
```

### Cordova (Mobile)

#### Shared Prerequisites
Copy the Vite build output to the Cordova www directory:
```bash
npm run build
mkdir -p cordova/www
cp -R dist/* cordova/www/
```

#### Cordova Setup
```bash
cd cordova
npm install
```

> **Important**: When adding platforms, use the full npm package name (e.g. `cordova-android`), not just `android`. The `cordova/android/` directory contains resource overrides and Cordova will try to use it as a local platform source if you run `cordova platform add android`.

```bash
cd cordova
npx cordova platform add cordova-android@^15.0.0 --save
npx cordova platform add cordova-ios@^7.1.1 --save    # macOS only
```

Plugins (`cordova-plugin-file`, `cordova-plugin-qrscanner`, `cordova-plugin-android-permissions`) are automatically installed from `config.xml`.

#### Fix QR Scanner Plugin (Android)
The `cordova-plugin-qrscanner` has outdated Gradle and import references. After adding the Android platform, apply these fixes:
```bash
# Fix deprecated compile() -> implementation() in plugin gradle files
sed -i "s/\bcompile\b/implementation/g" platforms/android/cordova-plugin-qrscanner/*.gradle

# Fix android.support.v4 -> AndroidX imports
find platforms/android/app/src -name "*.java" -exec sed -i 's/android\.support\.v4\.app\.ActivityCompat/androidx.core.app.ActivityCompat/g' {} +
```

> **Note**: These fixes must be reapplied every time you remove and re-add the Android platform.

#### Updating Icons & Splash Screens
```bash
npm install -g cordova-res
cd cordova
cordova-res
# Or regenerate for a specific platform:
cordova-res ios --copy
cordova-res android --copy
```

---

#### Android

**Prerequisites:**
- Android SDK Platform 36 and Build Tools 36.0.0 (required by cordova-android 15)
- Install via Android Studio: **Settings > Languages & Frameworks > Android SDK > SDK Tools**
- Or via command line:
```bash
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "build-tools;36.0.0" "platforms;android-36"
```

**Build Debug APK:**
```bash
cd cordova
npx cordova build android
```
Output: `cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk`

**Build Release AAB:**
Requires a `build.json` in the cordova directory (see `build.json.example` for template):
```bash
cd cordova
npx cordova build android --release --buildConfig=build.json
```
Output: `cordova/platforms/android/app/build/outputs/bundle/release/app-release.aab`

**Run on Emulator or Device:**
```bash
cd cordova
npx cordova run android
```

**Quick rebuild & deploy** (from project root):
```bash
./dev-android.sh
```

---

#### iOS (macOS only)

**Prerequisites:**

1. **Xcode** from the Mac App Store. After installing, accept the license and run:
```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
xcode-select --install
```

2. **CocoaPods:**
```bash
sudo gem install cocoapods
```

3. **ios-deploy** (for physical devices):
```bash
brew install ios-deploy
```

4. **Apple Developer account** is required for deploying to physical devices (simulator is free)

**Setup:**
```bash
cd cordova
npm install
npx cordova platform add cordova-ios@^7.1.1 --save
```

**Build for iOS:**
```bash
cd cordova
npx cordova build ios
```

**Open in Xcode:**
```bash
open cordova/platforms/ios/Runebase\ Lite\ Wallet.xcworkspace
```
Choose a simulator or connected device, then click **Run**.

**Run on Simulator:**
```bash
cd cordova
npx cordova run ios --target="iPhone-16-Pro"
```

**Run on Physical Device:**
```bash
cd cordova
npx cordova run ios --device
```
Requires a valid signing identity configured in Xcode (**Signing & Capabilities** tab).

**Build Release IPA:**
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

**Troubleshooting:**
- **White screen on launch**: Ensure `cordova-plugin-qrscanner` is installed. The app requires this plugin to be present.
- **Simulator not found**: Open Xcode > **Settings > Platforms** and install the iOS simulator runtime.
- **Signing errors**: Ensure your Apple Developer Team ID is set in Xcode under **Signing & Capabilities**.

### Full Local Release Build
The `build.sh` script automates version bumping, Vite build, Cordova Android build, Electron Windows/Linux builds, and Chrome extension packaging:
```bash
# patch, minor, or major
./build.sh patch
```
All compiled artifacts are copied to the `compiled_files/` directory.

### Version Bumping
```bash
npm run release:patch   # 2.1.0 -> 2.1.1
npm run release:minor   # 2.1.0 -> 2.2.0
npm run release:major   # 2.1.0 -> 3.0.0
```
This updates the version in `package.json`, `cordova/package.json`, `cordova/config.xml`, and `static/manifest.json`, then commits, tags, and pushes. The GitHub Actions workflow will automatically build all platforms and create a release.

## Security Flow
**First Time Flow**
1. `appSalt` is generated on a per-install basis
2. User enters `password` in Login page
3. `password` + `appSalt` runs through `scrypt` encryption for ~3 seconds to generate `passwordHash`
4. User creates or imports wallet
5. `passwordHash` + wallet's `privateKey` runs through `scrypt` encryption for ~1 second to generate `encryptedPrivateKey`
6. Account is saved in storage with `encryptedPrivateKey`

**Return User Flow**
1. User enters password in Login page
2. `password` + `appSalt` runs through `scrypt` encryption for ~3 seconds to generate `passwordHash`
3. Existing account is fetched from storage
4. `passwordHash` is used to decrypt the `encryptedPrivateKey`. On successful decryption of the wallet, the password is validated.

## CI/CD (GitHub Actions)

The workflow at `.github/workflows/build.yml` builds **all platforms** automatically. It triggers on pushes to `master`, version tags (`v*`), and manual dispatch.

### Pipeline Architecture

```
build-web (Vite)
    |
    +---> build-chrome          (Ubuntu)    -> .zip
    +---> build-electron-linux  (Ubuntu)    -> .AppImage, .deb
    +---> build-electron-win    (Windows)   -> .exe
    +---> build-electron-mac    (macOS)     -> .dmg
    +---> build-android         (Ubuntu)    -> .apk, .aab
    +---> build-ios             (macOS)     -> .app (simulator)
    |
    +---> release (only on v* tags, after all jobs pass)
```

The `build-web` job runs `npm run build` (Vite) and uploads the `dist/` artifact. All downstream jobs download that artifact and package it for their platform.

### Jobs

| Job | Runner | What it does | Artifacts |
|-----|--------|-------------|-----------|
| `build-web` | Ubuntu | `npm run build` (Vite production build) | `dist/` bundle |
| `build-chrome` | Ubuntu | Zips `dist/` | `Runebase-Chrome-Wallet.zip` |
| `build-electron-linux` | Ubuntu | `electron-builder --linux` | `.AppImage`, `.deb` |
| `build-electron-win` | Windows | `electron-builder --win` | `.exe` |
| `build-electron-mac` | macOS | `electron-builder --mac` | `.dmg` |
| `build-android` | Ubuntu | Cordova Android build | `app-debug.apk`, `app-release.aab` |
| `build-ios` | macOS | Cordova iOS build (emulator) | `.app` zip |
| `release` | Ubuntu | Creates GitHub Release with all artifacts | (only on `v*` tags) |

### Downloading Build Artifacts
1. Go to your repo's **Actions** tab on GitHub
2. Click the latest workflow run
3. Download artifacts from the **Artifacts** section at the bottom

### Triggering a Build
- **Automatic**: Pushes to `master` or version tags (`v*`)
- **Manual**: Go to **Actions > Build All Platforms > Run workflow**

### Creating a Release
Push a version tag to trigger a full release:
```bash
npm run release:patch   # bumps version, commits, tags, pushes
```
The workflow will build all platforms and create a GitHub Release with all artifacts attached.

### Android Signing (CI)
To produce signed release builds, add these secrets to your GitHub repository settings:
- `ANDROID_KEYSTORE_BASE64` — base64-encoded `.jks` keystore
- `ANDROID_KEYSTORE_PASSWORD` — keystore password
- `ANDROID_KEY_ALIAS` — signing key alias
- `ANDROID_KEY_PASSWORD` — signing key password

> **Note**: iOS builds in CI are unsigned simulator builds. For App Store submission, configure signing locally or add Apple signing secrets to your CI.

