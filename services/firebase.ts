import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const env = (key: string) => (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[key] ?? '';

const firebaseConfig = {
  apiKey: env('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: env('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: env('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: env('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('EXPO_PUBLIC_FIREBASE_APP_ID'),
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

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
