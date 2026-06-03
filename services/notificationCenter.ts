import { getAppAnnouncements } from '@/services/appAnnouncements';

export type NotificationCategory = 'club' | 'race' | 'training' | 'app';

export type AppNotification = {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  category: NotificationCategory;
  read: boolean;
};

let notificationsState: AppNotification[] = [
  { id: 'n-1', title: 'Bugünkü antrenman 17:30’da', description: 'Performans grubu ana havuzda toplanacak.', dateTime: '01.06.2026 10:00', category: 'training', read: false },
  { id: 'n-2', title: 'Örnek yarışa 18 gün kaldı', description: 'Hazırlık planını ve yarış listesini kontrol et.', dateTime: '01.06.2026 10:05', category: 'race', read: false },
  { id: 'n-3', title: 'GP SwimLab Beta 1.1 yayınlandı', description: 'Bildirimler, rekorlar ve karşılaştırma ekranları eklendi.', dateTime: '01.06.2026 10:10', category: 'app', read: false },
  { id: 'n-4', title: 'Kulüp panosunda yeni duyuru var', description: 'Kulüp yöneticisinin son duyurusunu görüntüleyebilirsin.', dateTime: '01.06.2026 10:15', category: 'club', read: true },
  ...getAppAnnouncements().map((item) => ({
    id: `ann-${item.id}`,
    title: item.title,
    description: item.description,
    dateTime: item.date,
    category: 'app' as const,
    read: false,
  })),
];

export function getNotifications() {
  return [...notificationsState];
}

export function getUnreadNotificationCount() {
  return notificationsState.filter((item) => !item.read).length;
}

export function markNotificationRead(id: string) {
  notificationsState = notificationsState.map((item) => (item.id === id ? { ...item, read: true } : item));
  return getNotifications();
}

export function markAllNotificationsRead() {
  notificationsState = notificationsState.map((item) => ({ ...item, read: true }));
  return getNotifications();
}
