import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { getFirestoreSafe, isFirebaseConfigured } from '@/services/firebase';
import { getActiveClubId, getClubStorageKey, getLocalData, removeLocalData, saveLocalData } from '@/services/localStore';
import { sanitizeForFirestore } from '@/services/firestoreSanitize';

export type ClubCollectionName = 'athletes' | 'coaches' | 'parents' | 'groups' | 'trainingPlans' | 'trainingLog' | 'raceResults' | 'notifications';
export type RootCollectionName = 'users' | 'inviteCodes' | 'clubs' | 'auditLogs';

export type PilotClubDocument = {
  id: string;
  name: string;
  code: string;
  city: string;
  district?: string;
  managerName?: string;
  phone?: string;
  email?: string;
  note?: string;
  type?: string;
  createdAt: string;
  isActive: boolean;
};

export const pilotClubDocuments: PilotClubDocument[] = [
  { id: 'mev-koleji', name: 'MEV Koleji', code: 'MEV26', city: 'Ankara', createdAt: '2026-06-01T00:00:00.000Z', isActive: true, type: 'pilot' },
  { id: 'baskent-cankaya', name: 'Başkent Çankaya Spor Kulübü', code: 'BASKENT26', city: 'Ankara', createdAt: '2026-06-01T00:00:00.000Z', isActive: true, type: 'pilot' },
  { id: 'pilot-club', name: 'SwimLab Pilot Kulüp', code: 'PILOT26', city: 'Pilot', createdAt: '2026-06-01T00:00:00.000Z', isActive: true, type: 'pilot' },
];

export function isFirestoreEnabled() {
  return isFirebaseConfigured() && Boolean(getFirestoreSafe());
}

export function clubCollectionPath(clubId: string, collectionName: ClubCollectionName) {
  return `clubs/${clubId}/${collectionName}`;
}

export function rootCollectionPath(collectionName: RootCollectionName) {
  return collectionName;
}

export function getDataSourceStatus() {
  return {
    firestoreEnabled: isFirestoreEnabled(),
    label: isFirestoreEnabled() ? 'Firestore aktif' : 'Local fallback aktif',
  };
}

export async function ensurePilotClubDocuments() {
  const db = getFirestoreSafe();
  if (!db) return { synced: false as const };

  try {
    await Promise.all(
      pilotClubDocuments.map((club) => setDoc(doc(db, 'clubs', club.id), sanitizeForFirestore({ ...club, updatedAt: new Date().toISOString() }), { merge: true })),
    );
    console.log('[SUCCESS] Pilot club documents ensured');
    return { synced: true as const };
  } catch (error) {
    console.log('[ERROR] Firestore write failed', error);
    return { synced: false as const };
  }
}

export async function readClubCollection<T>(
  collectionName: ClubCollectionName,
  fallback: T[],
  clubId = getActiveClubId(),
) {
  const cacheKey = getClubStorageKey(collectionName, clubId);
  const cached = await getLocalData<T[]>(cacheKey, fallback);
  const db = getFirestoreSafe();
  if (!db) return cached;

  try {
    const snap = await getDocs(collection(db, 'clubs', clubId, collectionName));
    const rows = snap.docs.map((item: { id: string; data: () => Record<string, unknown> }) => ({ id: item.id, ...item.data() }) as T);
    await saveLocalData(cacheKey, rows);
    return rows;
  } catch {
    return cached;
  }
}

export async function writeClubDocument<T extends Record<string, unknown>>(
  collectionName: ClubCollectionName,
  id: string,
  data: T,
  clubId = getActiveClubId(),
) {
  const cacheKey = getClubStorageKey(collectionName, clubId);
  const sanitizedData = sanitizeForFirestore({ ...data, id }) as T & { id?: string };
  const cached = await getLocalData<Array<T & { id?: string }>>(cacheKey, []);
  const next = [sanitizedData, ...cached.filter((item) => item.id !== id)];
  await saveLocalData(cacheKey, next);

  const db = getFirestoreSafe();
  if (!db) return { synced: false as const };

  try {
    const payload = sanitizeForFirestore({ ...sanitizedData, updatedAt: new Date().toISOString() });
    if (collectionName === 'athletes') console.log('[SANITIZED] Athlete payload', payload);
    await setDoc(doc(db, 'clubs', clubId, collectionName, id), payload, { merge: true });
    if (collectionName === 'athletes') console.log('[SUCCESS] Athlete saved to Firestore:', { clubId, athleteId: id });
    if (collectionName === 'coaches') console.log('[SUCCESS] Coach saved to Firestore:', { clubId, coachId: id });
    return { synced: true as const };
  } catch (error) {
    console.log('[ERROR] Firestore write failed', error);
    return { synced: false as const };
  }
}

export async function replaceClubCollection<T extends Record<string, unknown> & { id?: string }>(
  collectionName: ClubCollectionName,
  rows: T[],
  clubId = getActiveClubId(),
) {
  const cacheKey = getClubStorageKey(collectionName, clubId);
  const sanitizedRows = rows.map((row, index) => sanitizeForFirestore({ ...row, id: String(row.id ?? `${collectionName}-${Date.now()}-${index}`) }) as T);
  await saveLocalData(cacheKey, sanitizedRows);

  const db = getFirestoreSafe();
  if (!db) return { synced: false as const };

  try {
    const batch = writeBatch(db);
    sanitizedRows.forEach((row, index) => {
      const id = String(row.id ?? `${collectionName}-${Date.now()}-${index}`);
      batch.set(doc(db, 'clubs', clubId, collectionName, id), sanitizeForFirestore({ ...row, id, updatedAt: new Date().toISOString() }), { merge: true });
    });
    await batch.commit();
    return { synced: true as const };
  } catch {
    return { synced: false as const };
  }
}

export async function deleteClubDocument(collectionName: ClubCollectionName, id: string, clubId = getActiveClubId()) {
  const cacheKey = getClubStorageKey(collectionName, clubId);
  const cached = await getLocalData<Array<{ id?: string }>>(cacheKey, []);
  await saveLocalData(cacheKey, cached.filter((item) => item.id !== id));

  const db = getFirestoreSafe();
  if (!db) return { synced: false as const };

  try {
    await deleteDoc(doc(db, 'clubs', clubId, collectionName, id));
    return { synced: true as const };
  } catch {
    return { synced: false as const };
  }
}

export async function clearClubCollection(collectionName: ClubCollectionName, clubId = getActiveClubId()) {
  const cacheKey = getClubStorageKey(collectionName, clubId);
  await removeLocalData(cacheKey);
  const db = getFirestoreSafe();
  if (!db) return { synced: false as const };

  try {
    const snap = await getDocs(collection(db, 'clubs', clubId, collectionName));
    const batch = writeBatch(db);
    snap.docs.forEach((item: { ref: Parameters<typeof batch.delete>[0] }) => batch.delete(item.ref));
    await batch.commit();
    return { synced: true as const };
  } catch {
    return { synced: false as const };
  }
}

export async function readRootDocument<T>(collectionName: RootCollectionName, id: string, fallback: T) {
  const db = getFirestoreSafe();
  if (!db) return fallback;

  try {
    const snap = await getDoc(doc(db, collectionName, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function readRootCollection<T>(collectionName: RootCollectionName, fallback: T[]) {
  const db = getFirestoreSafe();
  if (!db) return fallback;

  try {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map((item: { id: string; data: () => Record<string, unknown> }) => ({ id: item.id, ...item.data() }) as T);
  } catch {
    return fallback;
  }
}

export async function writeRootDocument<T extends Record<string, unknown>>(
  collectionName: RootCollectionName,
  id: string,
  data: T,
) {
  const db = getFirestoreSafe();
  if (!db) return { synced: false as const };

  try {
    const payload = sanitizeForFirestore({ ...data, id, updatedAt: new Date().toISOString() });
    await setDoc(doc(db, collectionName, id), payload, { merge: true });
    if (collectionName === 'users') console.log('[SUCCESS] User saved to Firestore:', { userId: id });
    return { synced: true as const };
  } catch (error) {
    console.log('[ERROR] Firestore write failed', error);
    return { synced: false as const };
  }
}
