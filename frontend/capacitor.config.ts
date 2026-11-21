import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vipearner.gh',
  appName: 'VIP Earner GH',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    App: {
      // Handle back button on Android
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1D4ED8',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
    },
  },
  android: {
    // Android-specific config
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
};

export default config;
