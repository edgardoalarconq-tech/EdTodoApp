import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import Constants from 'expo-constants';
import { getDatabase } from 'firebase/database';

type FirebaseFields = {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
};

function getFirebaseFieldsFromExpo(): FirebaseFields {
  const extra = Constants.expoConfig?.extra as { firebase?: FirebaseFields } | undefined;
  return extra?.firebase ?? {};
}

const fromExpo = getFirebaseFieldsFromExpo();

const firebaseConfig = {
  apiKey: fromExpo.apiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: fromExpo.authDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: fromExpo.databaseURL || process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: fromExpo.projectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: fromExpo.storageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: fromExpo.messagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: fromExpo.appId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: fromExpo.measurementId || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** Realtime Database requiere `databaseURL` además de apiKey y projectId. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.databaseURL,
);

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Falta configuración Firebase (apiKey, projectId y databaseURL). Revisa .env y reinicia con npx expo start -c',
    );
  }
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export function getRealtimeDb() {
  return getDatabase(getFirebaseApp());
}

/** Base URL de Realtime Database para la API REST (`…/path.json`). */
export function getDatabaseRestBaseUrl(): string {
  const url = getFirebaseApp().options.databaseURL;
  if (!url) {
    throw new Error('databaseURL no está definida en la configuración de Firebase');
  }
  return url.replace(/\/$/, '');
}
