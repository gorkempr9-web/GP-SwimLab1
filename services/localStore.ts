const demoStorageKeys = [
  'gp-swimlab-training-plans',
  'gp-swimlab-demo-coaches',
  'gp-swimlab-demo-athletes',
  'gp-swimlab-race-results',
  'gp-swimlab-training-results',
  'gp-swimlab-private-lessons',
  'gp-swimlab-club-board',
  'gp-swimlab-club-calendar',
];

let asyncStorageModule: typeof import('@react-native-async-storage/async-storage').default | null = null;

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

export async function clearLocalDemoData() {
  const AsyncStorage = await getAsyncStorage();
  await Promise.all(demoStorageKeys.map((key) => AsyncStorage.removeItem(key)));
}
