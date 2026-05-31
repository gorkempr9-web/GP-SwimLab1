import { Platform } from 'react-native';

const channelId = 'gp-swimlab-reminders';
let notificationsModule: typeof import('expo-notifications') | null = null;
let handlerConfigured = false;

type ReminderOptions = {
  title?: string;
  body?: string;
  seconds?: number;
};

async function getNotifications() {
  if (notificationsModule) return notificationsModule;
  notificationsModule = await import('expo-notifications');
  return notificationsModule;
}

async function configureNotificationHandler() {
  if (handlerConfigured) return;
  const Notifications = await getNotifications();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  handlerConfigured = true;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  const Notifications = await getNotifications();
  await Notifications.setNotificationChannelAsync(channelId, {
    name: 'SwimLab Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

export async function requestNotificationPermission() {
  const Notifications = await getNotifications();
  await configureNotificationHandler();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    await ensureAndroidChannel();
    return { granted: true, status: current.status };
  }

  const requested = await Notifications.requestPermissionsAsync();
  if (requested.granted) {
    await ensureAndroidChannel();
  }

  return { granted: requested.granted, status: requested.status };
}

async function scheduleLocalReminder(kind: string, fallbackTitle: string, fallbackBody: string, options: ReminderOptions = {}) {
  const Notifications = await getNotifications();
  await configureNotificationHandler();
  await ensureAndroidChannel();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: options.title ?? fallbackTitle,
      body: options.body ?? fallbackBody,
      data: { kind, source: 'local-mvp' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: options.seconds ?? 2,
      repeats: false,
      channelId,
    },
  });
}

export function scheduleTrainingReminder(options?: ReminderOptions) {
  return scheduleLocalReminder('training', 'Antrenman hatırlatması', 'Bugünkü antrenman planını kontrol et.', options);
}

export async function scheduleRaceCountdownReminder(options?: ReminderOptions) {
  const checkpoints = [
    { label: '7 gün kala', seconds: 2 },
    { label: '3 gün kala', seconds: 4 },
    { label: '1 gün kala', seconds: 6 },
    { label: 'Yarış sabahı', seconds: 8 },
  ];

  const ids = await Promise.all(
    checkpoints.map((checkpoint) =>
      scheduleLocalReminder('race-countdown', `Yarış geri sayımı: ${checkpoint.label}`, 'Race mode hazırlığını kontrol et.', {
        ...options,
        title: options?.title ? `${options.title} - ${checkpoint.label}` : undefined,
        seconds: checkpoint.seconds,
      }),
    ),
  );

  return ids;
}

export function scheduleWaterReminder(options?: ReminderOptions) {
  return scheduleLocalReminder('water', 'Su içme hatırlatması', 'Hidrasyon hedefini güncelle.', options);
}

export function scheduleSleepReminder(options?: ReminderOptions) {
  return scheduleLocalReminder('sleep', 'Uyku / recovery hatırlatması', 'Recovery rutinini ve uyku saatini planla.', options);
}

export function scheduleClubAnnouncementReminder(options?: ReminderOptions) {
  return scheduleLocalReminder('club-announcement', 'Kulüp duyurusu', 'Yeni kulüp duyurusunu kontrol et.', options);
}

export function scheduleStretchingReminder(options?: ReminderOptions) {
  return scheduleLocalReminder('stretching', 'Stretching hatırlatması', 'Kısa mobilite ve esneme rutinini tamamla.', options);
}

export async function cancelAllNotifications() {
  const Notifications = await getNotifications();
  return Notifications.cancelAllScheduledNotificationsAsync();
}
