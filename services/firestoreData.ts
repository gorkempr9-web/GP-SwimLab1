import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { getFirestoreSafe, isFirebaseConfigured } from '@/services/firebase';
import { getActiveClubId, getClubStorageKey, getLocalData, removeLocalData, saveLocalData } from '@/services/localStore';

export type ClubCollectionName = 'athletes' | 'coaches' | 'parents' | 'trainingPlans' | 'trainingLog' | 'raceResults' | 'notifications';
export type RootCollectionName = 'users' | 'inviteCodes';

export function isFirestoreEnabled() {
  return isFirebaseConfigured() && Boolean(getFirestoreSafe());
}

export function clubCollectionPath(clubId: string, collectionName: ClubCollectionName) {
  return `clubs/${clubId}/${collectionName}`;
}

export function rootCollectionPath(collectionName: RootCollectionName) {
  return collectionName;
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
  const cached = await getLocalData<Array<T & { id?: string }>>(cacheKey, []);
  const next = [{ ...data, id }, ...cached.filter((item) => item.id !== id)];
  await saveLocalData(cacheKey, next);

  const db = getFirestoreSafe();
  if (!db) return { synced: false as const };

  try {
    await setDoc(doc(db, 'clubs', clubId, collectionName, id), { ...data, id, updatedAt: new Date().toISOString() }, { merge: true });
    return { synced: true as const };
  } catch {
    return { synced: false as const };
  }
}

export async function replaceClubCollection<T extends Record<string, unknown> & { id?: string }>(
  collectionName: ClubCollectionName,
  rows: T[],
  clubId = getActiveClubId(),
) {
  const cacheKey = getClubStorageKey(collectionName, clubId);
  await saveLocalData(cacheKey, rows);

  const db = getFirestoreSafe();
  if (!db) return { synced: false as const };

  try {
    const batch = writeBatch(db);
    rows.forEach((row, index) => {
      const id = String(row.id ?? `${collectionName}-${Date.now()}-${index}`);
      batch.set(doc(db, 'clubs', clubId, collectionName, id), { ...row, id, updatedAt: new Date().toISOString() }, { merge: true });
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

export async function writeRootDocument<T extends Record<string, unknown>>(
  collectionName: RootCollectionName,
  id: string,
  data: T,
) {
  const db = getFirestoreSafe();
  if (!db) return { synced: false as const };

  try {
    await setDoc(doc(db, collectionName, id), { ...data, id, updatedAt: new Date().toISOString() }, { merge: true });
    return { synced: true as const };
  } catch {
    return { synced: false as const };
  }
}
