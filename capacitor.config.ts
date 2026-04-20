import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.runebase.runebaselitewallet',
  appName: 'Runebase Lite Wallet',
  webDir: 'dist',

  android: {
    // Allow cleartext for Electrum connections during development.
    // Production builds enforce TLS via network_security_config.xml.
    allowMixedContent: false,
  },

  plugins: {
    SplashScreen: {
      // Use the native Android 12 splash screen API (Theme.SplashScreen).
      // Disable the JS-controlled splash so it doesn't show a second time.
      launchShowDuration: 0,
    },
    SystemBars: {
      // Handle edge-to-edge display: add CSS safe-area insets so the
      // app content doesn't render behind the status bar or nav bar.
      insetsHandling: 'css',
      style: 'DEFAULT',
    },
  },

  server: {
    // Use https scheme (Capacitor default) for the WebView origin.
    // The native CordovaDataMigration plugin copies IndexedDB/localStorage
    // from the old Cordova file:// origin to https://localhost on first launch.
    androidScheme: 'https',
  },
};

export default config;
