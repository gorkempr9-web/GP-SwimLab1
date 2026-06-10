const demoStorageKeys = [
  'gp-swimlab-training-plans',
  'gp-swimlab-training-log',
  'gp-swimlab-demo-coaches',
  'gp-swimlab-demo-athletes',
  'gp-swimlab-race-results',
  'gp-swimlab-training-results',
  'gp-swimlab-private-lessons',
  'gp-swimlab-club-board',
  'gp-swimlab-club-calendar',
  'gp-swimlab-current-role',
  'gp-swimlab-current-user',
  'session',
  'profile',
  'demoSession',
  'currentUser',
  'userPreferences',
  'notificationReadState',
];

let asyncStorageModule: typeof import('@react-native-async-storage/async-storage').default | null = null;
let activeClubId = 'pilot';

const clubCodeMap: Record<string, string> = {
  MEV26: 'mev-koleji',
  BASKENT26: 'baskent-cankaya',
  PILOT26: 'pilot-club',
  'GP-MEV001': 'mev-koleji',
  'MEV-PERF': 'mev-koleji',
  'COACH-MEV': 'mev-koleji',
  'ATH-MEV': 'mev-koleji',
  'PAR-MEV': 'mev-koleji',
  'GP-BCSK001': 'baskent-cankaya',
  'BCSK-PERF': 'baskent-cankaya',
  'COACH-BCSK': 'baskent-cankaya',
  'ATH-BCSK': 'baskent-cankaya',
  'PAR-BCSK': 'baskent-cankaya',
};

const clubNameById: Record<string, string> = {
  'mev-koleji': 'MEV Koleji',
  'baskent-cankaya': 'Başkent Çankaya Spor Kulübü',
  'pilot-club': 'SwimLab Pilot Kulüp',
};

const pilotClubIds = ['mev-koleji', 'baskent-cankaya', 'pilot-club'];
const clubScopedPrefixes = ['athletes', 'coaches', 'trainingPlans', 'trainingLog', 'notifications', 'raceResults', 'privateLessons', 'clubBoard', 'calendar'];

export function setActiveClubContext(clubId?: string) {
  activeClubId = normalizeClubId(clubId);
}

export function getActiveClubId() {
  return activeClubId;
}

export function getClubStorageKey(prefix: string, clubId = activeClubId) {
  return `${prefix}_${normalizeClubId(clubId)}`;
}

export function resolveClubIdFromCode(code?: string) {
  const normalized = code?.trim().toUpperCase() ?? '';
  if (!normalized) return undefined;
  return clubCodeMap[normalized] ?? normalizeClubId(normalized);
}

export function resolveClubNameFromCode(code?: string) {
  const clubId = resolveClubIdFromCode(code);
  return clubId ? clubNameById[clubId] : undefined;
}

export function resolveClubNameFromId(clubId?: string) {
  return clubNameById[normalizeClubId(clubId)];
}

export function resolveClubIdFromName(name?: string) {
  if (name === 'MEV Koleji') return 'mev-koleji';
  if (name === 'Başkent Çankaya Spor Kulübü') return 'baskent-cankaya';
  if (name === 'SwimLab Pilot Kulüp' || name === 'SwimLab Pilot') return 'pilot-club';
  return normalizeClubId(name);
}

export function normalizeClubId(value?: string) {
  const source = value?.trim() || 'pilot';
  return source
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'pilot';
}

async function getAsyncStorage() {
  if (asyncStorageModule) return asyncStorageModule;
  const module = await import('@react-native-async-storage/async-storage');
  asyncStorageModule = module.default;
  return asyncStorageModule;
}

export async function saveLocalData<T>(key: string, data: T) {
  const AsyncStorage = await getAsyncStorage();
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export async function getLocalData<T>(key: string, fallback: T): Promise<T> {
  try {
    const AsyncStorage = await getAsyncStorage();
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function updateLocalData<T>(key: string, updater: (current: T) => T, fallback: T): Promise<T> {
  const current = await getLocalData<T>(key, fallback);
  const next = updater(current);
  await saveLocalData(key, next);
  return next;
}

export async function removeLocalData(key: string) {
  const AsyncStorage = await getAsyncStorage();
  await AsyncStorage.removeItem(key);
}

export async function clearLocalDemoData() {
  const AsyncStorage = await getAsyncStorage();
  const clubScopedKeys = pilotClubIds.flatMap((clubId) => clubScopedPrefixes.map((prefix) => getClubStorageKey(prefix, clubId)));
  await Promise.all([...demoStorageKeys, ...clubScopedKeys].map((key) => AsyncStorage.removeItem(key)));
}

export async function clearLocalClubData(clubId: string) {
  const AsyncStorage = await getAsyncStorage();
  await Promise.all(clubScopedPrefixes.map((prefix) => AsyncStorage.removeItem(getClubStorageKey(prefix, clubId))));
}
