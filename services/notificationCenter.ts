import { getAppAnnouncements } from '@/services/appAnnouncements';
import { readClubCollection, replaceClubCollection } from '@/services/firestoreData';
import { getClubStorageKey, getLocalData, saveLocalData } from '@/services/localStore';

export type NotificationCategory = 'club' | 'race' | 'training' | 'app' | 'academy' | 'privateLesson' | 'admin';

export type AppNotification = {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  category: NotificationCategory;
  read: boolean;
  route?: string;
};

const legacyStorageKey = 'gp-swimlab-notifications';
const storageKey = () => getClubStorageKey('notifications');

const seedNotifications: AppNotification[] = [
  { id: 'n-1', title: "Bugünkü antrenman 17:30'da", description: 'Performans grubu ana havuzda toplanacak.', dateTime: '01.06.2026 10:00', category: 'training', route: '/(tabs)/plans', read: false },
  { id: 'n-2', title: 'Yarışa 18 gün kaldı', description: 'Hazırlık planını ve yarış listesini kontrol et.', dateTime: '01.06.2026 10:05', category: 'race', route: '/(tabs)/races', read: false },
  { id: 'n-3', title: 'SwimLab Beta 1.1 yayınlandı', description: 'Bildirimler, rekorlar ve karşılaştırma ekranları eklendi.', dateTime: '01.06.2026 10:10', category: 'app', read: false },
  { id: 'n-4', title: 'Kulüp panosunda yeni duyuru var', description: 'Kulüp yöneticisinin son duyurusunu görüntüleyebilirsin.', dateTime: '01.06.2026 10:15', category: 'club', route: '/(tabs)/club', read: true },
  ...getAppAnnouncements().map((item) => ({
    id: `ann-${item.id}`,
    title: item.title,
    description: item.description,
    dateTime: item.date,
    category: 'app' as const,
    read: false,
  })),
];

let notificationsState: AppNotification[] = [...seedNotifications];
let hydrated = false;

function persistNotifications() {
  void saveLocalData(storageKey(), notificationsState);
  void replaceClubCollection('notifications', notificationsState as unknown as Array<Record<string, unknown> & { id?: string }>);
}

export async function hydrateNotifications() {
  if (hydrated) return getNotifications();
  const legacy = await getLocalData<AppNotification[] | null>(legacyStorageKey, null);
  const remoteOrCached = await readClubCollection<AppNotification>('notifications', Array.isArray(legacy) ? legacy : seedNotifications);
  notificationsState = mergeWithSeed(remoteOrCached);
  hydrated = true;
  persistNotifications();
  return getNotifications();
}

export function getNotifications() {
  return [...notificationsState];
}

export function getUnreadNotificationCount() {
  return notificationsState.filter((item) => !item.read).length;
}

export function markNotificationRead(id: string) {
  notificationsState = notificationsState.map((item) => (item.id === id ? { ...item, read: true } : item));
  persistNotifications();
  return getNotifications();
}

export function markAllNotificationsRead() {
  notificationsState = notificationsState.map((item) => ({ ...item, read: true }));
  persistNotifications();
  return getNotifications();
}

function mergeWithSeed(stored: AppNotification[]) {
  const storedById = new Map(stored.map((item) => [item.id, item]));
  const merged = seedNotifications.map((seed) => ({ ...seed, read: storedById.get(seed.id)?.read ?? seed.read }));
  const custom = stored.filter((item) => !seedNotifications.some((seed) => seed.id === item.id));
  return [...merged, ...custom];
}
