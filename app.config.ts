import 'dotenv/config';

const appJson = require('./app.json') as { expo: Record<string, unknown> };

/**
 * Carga `.env` en Node al arrancar Expo y expone Firebase en `extra`
 * (más fiable que depender solo de `process.env` en el bundle Metro).
 */
/** Identificador único en Play Store; cámbialo si publicas con otra cuenta. */
const ANDROID_PACKAGE = 'com.ripred77.edapp';
const IOS_BUNDLE_ID = 'com.ripred77.edapp';

export default {
  expo: {
    ...appJson.expo,
    android: {
      ...(typeof appJson.expo.android === 'object' && appJson.expo.android !== null
        ? appJson.expo.android
        : {}),
      package: ANDROID_PACKAGE,
    },
    ios: {
      ...(typeof appJson.expo.ios === 'object' && appJson.expo.ios !== null ? appJson.expo.ios : {}),
      bundleIdentifier: IOS_BUNDLE_ID,
    },
    extra: {
      ...(typeof appJson.expo.extra === 'object' && appJson.expo.extra !== null
        ? appJson.expo.extra
        : {}),
      eas: {
        projectId: '5f667e22-4f0b-4571-b325-5cbec73a33ab',
      },
      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
        databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL ?? '',
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
        measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
      },
    },
  },
};
