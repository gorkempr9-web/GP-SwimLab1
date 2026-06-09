import Constants from 'expo-constants';
import { getApps, initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

type FirebaseExtraConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

const env = (key: string) => (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[key] ?? '';
const extraFirebase = (Constants.expoConfig?.extra?.firebase ?? {}) as FirebaseExtraConfig;

const pilotFirebaseConfig: Required<FirebaseExtraConfig> = {
  apiKey: 'AIzaSyDlgFK3WjH1a_UFfIF1tTLbdW37Y6KVIAY',
  authDomain: 'swimlab-b9a77.firebaseapp.com',
  projectId: 'swimlab-b9a77',
  storageBucket: 'swimlab-b9a77.firebasestorage.app',
  messagingSenderId: '110971542950',
  appId: '1:110971542950:web:5f29f5f2322ca52bb58367',
};

const configValue = (value: string | undefined, envKey: string, fallback: string) => {
  const fromExtra = value?.trim() ?? '';
  if (fromExtra && !fromExtra.startsWith('${')) return fromExtra;
  return env(envKey) || fallback;
};

export const firebaseConfig = {
  apiKey: configValue(extraFirebase.apiKey, 'EXPO_PUBLIC_FIREBASE_API_KEY', pilotFirebaseConfig.apiKey),
  authDomain: configValue(extraFirebase.authDomain, 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', pilotFirebaseConfig.authDomain),
  projectId: configValue(extraFirebase.projectId, 'EXPO_PUBLIC_FIREBASE_PROJECT_ID', pilotFirebaseConfig.projectId),
  storageBucket: configValue(extraFirebase.storageBucket, 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', pilotFirebaseConfig.storageBucket),
  messagingSenderId: configValue(extraFirebase.messagingSenderId, 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', pilotFirebaseConfig.messagingSenderId),
  appId: configValue(extraFirebase.appId, 'EXPO_PUBLIC_FIREBASE_APP_ID', pilotFirebaseConfig.appId),
};

let firebaseAppInstance: FirebaseApp | null = null;
let firebaseAuthInstance: Auth | null = null;
let firestoreInstance: ReturnType<typeof getFirestore> | null = null;

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

export function getFirebaseAppSafe() {
  if (!isFirebaseConfigured()) return null;
  if (firebaseAppInstance) return firebaseAppInstance;
  firebaseAppInstance = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return firebaseAppInstance;
}

export function getFirebaseAuthSafe() {
  const app = getFirebaseAppSafe();
  if (!app) return null;
  firebaseAuthInstance = firebaseAuthInstance ?? getAuth(app);
  return firebaseAuthInstance;
}

export function getFirestoreSafe() {
  const app = getFirebaseAppSafe();
  if (!app) return null;
  firestoreInstance = firestoreInstance ?? getFirestore(app);
  return firestoreInstance;
}

export const firebaseApp = getFirebaseAppSafe();
export const firebaseAuth = getFirebaseAuthSafe();
export const firestore = getFirestoreSafe();

export type UserRole = 'athlete' | 'guardian' | 'coach' | 'clubAdmin' | 'dietitian' | 'admin';
export type DataSensitivity = 'public' | 'private' | 'sensitive';

export type AccessPolicy = {
  ownerId: string;
  clubId?: string;
  allowedRoles: UserRole[];
  sensitivity: DataSensitivity;
};

export const roleAccessPolicies = {
  athleteProfile: {
    allowedRoles: ['athlete', 'guardian', 'coach', 'clubAdmin', 'admin'],
    sensitivity: 'private',
  },
  performanceReport: {
    allowedRoles: ['athlete', 'guardian', 'coach', 'clubAdmin', 'admin'],
    sensitivity: 'private',
  },
  nutritionAndHealthNotes: {
    allowedRoles: ['athlete', 'guardian', 'dietitian', 'admin'],
    sensitivity: 'sensitive',
  },
} as const;

// Firestore security rules hazırlığı:
// - clubs/{clubId}/athletes: aynı clubId içindeki coach, clubAdmin ve admin okuyabilir; yazma coach/clubAdmin/admin.
// - clubs/{clubId}/coaches: clubAdmin ve admin yönetir; coach kendi profilini okuyabilir.
// - clubs/{clubId}/trainingPlans ve trainingLog: aynı kulüp kullanıcıları okuyabilir; coach/clubAdmin/admin yazar.
// - clubs/{clubId}/raceResults: athlete/parent kendi kaydını, coach/clubAdmin kulüp kaydını, admin tümünü okuyabilir.
// - clubs/{clubId}/notifications: kulüp kullanıcıları okuyabilir; clubAdmin/admin yazar.
// - Admin/super_admin özel claim ile tüm clubId koleksiyonlarını okuyabilir.
// - Minimal veri toplama, PDF erişim kontrolü, club data isolation ve parent/athlete izin kontrolleri zorunlu olacak.
