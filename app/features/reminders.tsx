import { BellRing, CalendarClock, Droplets, Moon, ShieldCheck, StretchHorizontal, Trophy } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import { useLocale } from '@/locales';
import { colors, spacing, typography } from '@/theme/tokens';

type ReminderId = 'training' | 'race' | 'water' | 'sleep' | 'stretching' | 'club';

const initialActiveState: Record<ReminderId, boolean> = {
  training: true,
  race: true,
  water: false,
  sleep: true,
  stretching: false,
  club: true,
};

export default function RemindersScreen() {
  const { t } = useLocale();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [message, setMessage] = useState(t('notificationOptional'));
  const [activeState, setActiveState] = useState(initialActiveState);

  const reminderCards = useMemo(
    () => [
      {
        id: 'training' as const,
        title: t('trainingReminder'),
        description: t('trainingReminderDesc'),
        schedule: '17:00',
        icon: BellRing,
        test: async () => {
          const { scheduleTrainingReminder } = await import('@/services/notifications');
          return scheduleTrainingReminder({ title: t('trainingReminder'), body: t('trainingReminderDesc') });
        },
      },
      {
        id: 'race' as const,
        title: t('raceCountdownReminder'),
        description: t('raceCountdownReminderDesc'),
        schedule: '7g / 3g / 1g / sabah',
        icon: Trophy,
        test: async () => {
          const { scheduleRaceCountdownReminder } = await import('@/services/notifications');
          return scheduleRaceCountdownReminder();
        },
        countdown: ['7 gün kala', '3 gün kala', '1 gün kala', 'Yarış sabahı'],
      },
      {
        id: 'water' as const,
        title: t('waterReminder'),
        description: t('waterReminderDesc'),
        schedule: '10:30 - 14:30 - 18:30',
        icon: Droplets,
        test: async () => {
          const { scheduleWaterReminder } = await import('@/services/notifications');
          return scheduleWaterReminder({ title: t('waterReminder'), body: t('waterReminderDesc') });
        },
      },
      {
        id: 'sleep' as const,
        title: t('sleepReminder'),
        description: t('sleepReminderDesc'),
        schedule: '22:00',
        icon: Moon,
        test: async () => {
          const { scheduleSleepReminder } = await import('@/services/notifications');
          return scheduleSleepReminder({ title: t('sleepReminder'), body: t('sleepReminderDesc') });
        },
      },
      {
        id: 'stretching' as const,
        title: t('stretchingReminder'),
        description: t('stretchingReminderDesc'),
        schedule: '20:15',
        icon: StretchHorizontal,
        test: async () => {
          const { scheduleStretchingReminder } = await import('@/services/notifications');
          return scheduleStretchingReminder({ title: t('stretchingReminder'), body: t('stretchingReminderDesc') });
        },
      },
      {
        id: 'club' as const,
        title: t('clubAnnouncementReminder'),
        description: t('clubAnnouncementReminderDesc'),
        schedule: t('instantWhenUrgent'),
        icon: CalendarClock,
        test: async () => {
          const { scheduleClubAnnouncementReminder } = await import('@/services/notifications');
          return scheduleClubAnnouncementReminder({ title: t('clubAnnouncementReminder'), body: t('clubAnnouncementReminderDesc') });
        },
      },
    ],
    [t],
  );

  const handlePermission = async () => {
    const { requestNotificationPermission } = await import('@/services/notifications');
    const result = await requestNotificationPermission();
    setPermissionGranted(result.granted);
    setMessage(result.granted ? t('notificationsEnabled') : t('notificationsDisabled'));
  };

  const handleTest = async (card: (typeof reminderCards)[number]) => {
    if (!permissionGranted) {
      const { requestNotificationPermission } = await import('@/services/notifications');
      const result = await requestNotificationPermission();
      setPermissionGranted(result.granted);
      if (!result.granted) {
        setMessage(t('notificationsDisabled'));
        return;
      }
    }

    await card.test();
    setMessage(card.id === 'race' ? t('raceCountdownPlanned') : t('testNotificationScheduled'));
  };

  const toggleReminder = (id: ReminderId) => {
    setActiveState((current) => ({ ...current, [id]: !current[id] }));
  };

  const handleCancelAll = async () => {
    const { cancelAllNotifications } = await import('@/services/notifications');
    await cancelAllNotifications();
    setActiveState({ training: false, race: false, water: false, sleep: false, stretching: false, club: false });
    setMessage(t('allNotificationsCancelled'));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('notificationsTitle')}</Text>
        <Text style={styles.subtitle}>{t('notificationsSubtitle')}</Text>

        <GlassCard style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <ShieldCheck color={permissionGranted ? colors.success : colors.gold} size={24} />
          </View>
          <View style={styles.permissionCopy}>
            <Text style={styles.permissionTitle}>{permissionGranted ? t('notificationsEnabled') : t('notificationsDisabled')}</Text>
            <Text style={styles.permissionText}>{t('notificationKvkkNote')}</Text>
          </View>
          <Pressable style={styles.permissionButton} onPress={handlePermission}>
            <Text style={styles.permissionButtonText}>{t('allowNotifications')}</Text>
          </Pressable>
        </GlassCard>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {reminderCards.map((card) => (
          <ReminderCard
            key={card.id}
            active={activeState[card.id]}
            title={card.title}
            description={card.description}
            schedule={card.schedule}
            Icon={card.icon}
            countdown={card.countdown}
            onToggle={() => toggleReminder(card.id)}
            onTest={() => handleTest(card)}
          />
        ))}

        <AppButton title={t('cancelAllNotifications')} variant="secondary" onPress={handleCancelAll} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ReminderCard({
  active,
  title,
  description,
  schedule,
  Icon,
  countdown,
  onToggle,
  onTest,
}: {
  active: boolean;
  title: string;
  description: string;
  schedule: string;
  Icon: typeof BellRing;
  countdown?: string[];
  onToggle: () => void;
  onTest: () => void;
}) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <Icon color={colors.cyan} size={22} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <Switch
          value={active}
          onValueChange={onToggle}
          trackColor={{ false: colors.surfaceSoft, true: colors.cyanSoft }}
          thumbColor={active ? colors.cyan : colors.muted}
        />
      </View>
      <View style={styles.scheduleRow}>
        <Text style={styles.scheduleLabel}>Saat / Tarih</Text>
        <Text style={styles.scheduleValue}>{schedule}</Text>
      </View>
      {countdown ? (
        <View style={styles.countdownRow}>
          {countdown.map((item) => (
            <Text key={item} style={styles.countdownPill}>{item}</Text>
          ))}
        </View>
      ) : null}
      <Pressable style={styles.testButton} onPress={onTest}>
        <BellRing color={colors.background} size={16} />
        <Text style={styles.testButtonText}>Test bildirimi gönder</Text>
      </Pressable>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 22, fontWeight: '700' },
  permissionCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  permissionIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.cyanSoft, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  permissionCopy: { flex: 1 },
  permissionTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  permissionText: { color: colors.muted, fontWeight: '700', lineHeight: 18, marginTop: 3 },
  permissionButton: { minHeight: 42, borderRadius: 14, backgroundColor: colors.cyan, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
  permissionButtonText: { color: colors.background, fontWeight: '900' },
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  card: { gap: spacing.md },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  iconBox: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.cyanSoft, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1 },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  cardDescription: { color: colors.muted, fontWeight: '700', lineHeight: 20, marginTop: 4 },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.md },
  scheduleLabel: { color: colors.mutedStrong, fontWeight: '900' },
  scheduleValue: { color: colors.cyan, fontWeight: '900', flex: 1, textAlign: 'right' },
  countdownRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  countdownPill: { color: colors.text, fontWeight: '900', borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.sm, paddingVertical: 7, fontSize: 12 },
  testButton: { minHeight: 44, borderRadius: 15, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  testButtonText: { color: colors.background, fontWeight: '900' },
});
