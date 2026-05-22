import { router } from 'expo-router';
import { BellRing, BrainCircuit, CalendarClock, CheckCircle2, FileText, Flame, Gauge, LucideIcon, Medal, MessageCircle, Salad, Trophy } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { nextRace, swimmerStats } from '@/data/mockData';
import { getUpcomingMeetEntryForRole } from '@/services/meetEntries';
import { panelLabel, useSession, UserRole } from '@/services/session';
import { requestNotificationPermission } from '@/services/notifications';
import { getTrainingDashboardSummary } from '@/services/trainingPlans';
import { colors } from '@/theme/tokens';

const horizontalPadding = 18;
const gap = 10;

type DashboardMetric = { title: string; value: string; detail: string; icon: LucideIcon; tone: string };

export default function DashboardScreen() {
  const { currentUser } = useSession();
  const { width, height } = useWindowDimensions();
  const contentWidth = width - horizontalPadding * 2;
  const statWidth = (contentWidth - gap) / 2;
  const moduleWidth = (contentWidth - gap * 2) / 3;
  const compact = height < 720;
  const modules = getModulesForRole(currentUser.role);
  const trainingSummary = getTrainingDashboardSummary(currentUser.role);
  const performanceCards = getPerformanceCardsForRole(currentUser.role, trainingSummary);
  const upcomingEntry = getUpcomingMeetEntryForRole(currentUser.role);
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [fade, translateY]);

  return (
    <SafeAreaView style={styles.screen}>
      <PoolPattern />
      <Animated.View style={[styles.content, compact && styles.contentCompact, { opacity: fade, transform: [{ translateY }] }]}>
        <View style={styles.header}>
          <AppLogo compact={true} size={52} showSlogan={false} />
          <View style={styles.headerText}>
            <Text style={styles.slogan}>Race-ready swim lab</Text>
            <Text style={styles.greeting}>Merhaba, {currentUser.firstName}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreValue}>{swimmerStats.readiness}</Text>
            <Text style={styles.scoreText}>Hazirlik</Text>
          </View>
        </View>

        <View style={styles.raceCard}>
          <View style={styles.raceCopy}>
            <Text style={styles.raceLabel}>Race Mode</Text>
            <Text style={styles.raceTitle} numberOfLines={1}>{upcomingEntry ? upcomingEntry.competitionName : nextRace.name}</Text>
            <Text style={styles.raceMeta} numberOfLines={1}>
              {upcomingEntry ? `${upcomingEntry.relayEvent || `${upcomingEntry.distance} ${upcomingEntry.stroke}`} - ${panelLabel(currentUser.role)}` : `${nextRace.event} - ${nextRace.dateLabel}`}
            </Text>
          </View>
          <Trophy color={colors.gold} size={30} />
        </View>

        <View style={styles.notificationCard}>
          <View style={styles.notificationLeft}>
            <BellRing color={notificationsGranted ? colors.success : colors.gold} size={18} />
            <Text style={styles.notificationText}>{notificationsGranted ? 'Bildirimler açık' : 'Bildirimler kapalı'}</Text>
          </View>
          {!notificationsGranted ? (
            <Pressable
              style={styles.allowButton}
              onPress={async () => {
                const result = await requestNotificationPermission();
                setNotificationsGranted(result.granted);
              }}
            >
              <Text style={styles.allowButtonText}>İzin ver</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.statsGrid}>
          {performanceCards.map((card) => (
            <MiniStatCard key={card.title} {...card} width={statWidth} compact={compact} />
          ))}
        </View>

        <View style={styles.moduleGrid}>
          {modules.map((module) => (
            <ModuleButton key={module.title} title={module.title} icon={module.icon} width={moduleWidth} compact={compact} onPress={() => router.push(module.route)} />
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

function getPerformanceCardsForRole(role: UserRole, trainingSummary: string): DashboardMetric[] {
  if (role === 'coach' || role === 'club_admin') {
    return [
      { title: 'PB', value: role === 'coach' ? '9' : '18', detail: 'Bu ay', icon: Medal, tone: colors.cyan },
      { title: 'Yuk', value: trainingSummary, detail: 'Plan', icon: Flame, tone: colors.gold },
      { title: 'Hazirlik', value: '87', detail: 'Ortalama', icon: Gauge, tone: '#3B82F6' },
      { title: 'Katilim', value: '89%', detail: 'Son hafta', icon: CheckCircle2, tone: colors.success },
    ];
  }

  return [
    { title: 'PB', value: swimmerStats.personalBest, detail: '100m Serbest', icon: Medal, tone: colors.cyan },
    { title: 'Yuk', value: trainingSummary, detail: 'Bugun', icon: Flame, tone: colors.gold },
    { title: 'Hazirlik', value: `${swimmerStats.readiness}`, detail: 'Race score', icon: Gauge, tone: '#3B82F6' },
    { title: 'Katilim', value: '4/5', detail: 'Bu hafta', icon: CheckCircle2, tone: colors.success },
  ];
}

function getModulesForRole(_role: UserRole): Array<{ title: string; icon: LucideIcon; route: string }> {
  return [
    { title: 'Yaris', icon: CalendarClock, route: '/(tabs)/races' },
    { title: 'AI', icon: BrainCircuit, route: '/features/ai-coach' },
    { title: 'PDF', icon: FileText, route: '/features/reports' },
    { title: 'Beslenme', icon: Salad, route: '/features/nutrition' },
    { title: 'Hatirlatma', icon: BellRing, route: '/features/reminders' },
    { title: 'Basari', icon: MessageCircle, route: '/features/forum' },
  ];
}

function PoolPattern() {
  return (
    <View pointerEvents="none" style={styles.pattern}>
      {[0, 1, 2, 3].map((index) => (
        <View key={index} style={[styles.laneLine, { left: `${16 + index * 23}%` }]} />
      ))}
    </View>
  );
}

function MiniStatCard({ title, value, detail, icon: Icon, tone, width, compact }: DashboardMetric & { width: number; compact: boolean }) {
  return (
    <View style={[styles.statCard, { width, height: compact ? 76 : 84 }]}>
      <View style={styles.statTop}>
        <Icon color={tone} size={18} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statDetail} numberOfLines={1}>{detail}</Text>
    </View>
  );
}

function ModuleButton({ title, icon: Icon, width, compact, onPress }: { title: string; icon: LucideIcon; width: number; compact: boolean; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.moduleButton, { width, height: compact ? 68 : 76 }, pressed && styles.pressed]} onPress={onPress}>
      <Icon color={colors.cyan} size={compact ? 20 : 22} />
      <Text style={styles.moduleTitle} numberOfLines={1}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  pattern: { ...StyleSheet.absoluteFillObject, opacity: 0.05 },
  laneLine: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: colors.cyan },
  content: { flex: 1, paddingHorizontal: horizontalPadding, paddingTop: 8, paddingBottom: 86, gap: 12, justifyContent: 'space-between' },
  contentCompact: { gap: 9, paddingBottom: 78 },
  header: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap },
  headerText: { flex: 1 },
  slogan: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  greeting: { color: colors.text, fontWeight: '900', fontSize: 22, marginTop: 2 },
  scoreBadge: { width: 70, height: 58, borderRadius: 18, backgroundColor: colors.cyanSoft, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  scoreValue: { color: colors.cyan, fontWeight: '900', fontSize: 22 },
  scoreText: { color: colors.text, fontWeight: '900', fontSize: 10 },
  raceCard: { minHeight: 94, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: colors.cyan, shadowOpacity: 0.14, shadowRadius: 16, elevation: 4 },
  raceCopy: { flex: 1, paddingRight: 10 },
  raceLabel: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  raceTitle: { color: colors.text, fontWeight: '900', fontSize: 18, marginTop: 5 },
  raceMeta: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4 },
  notificationCard: { minHeight: 46, borderRadius: 16, backgroundColor: colors.surfaceSolid, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap },
  notificationLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  notificationText: { color: colors.text, fontWeight: '900', fontSize: 13 },
  allowButton: { minHeight: 32, borderRadius: 12, backgroundColor: colors.cyan, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  allowButtonText: { color: colors.background, fontWeight: '900', fontSize: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap },
  statCard: { borderRadius: 18, backgroundColor: colors.surfaceSolid, borderWidth: 1, borderColor: colors.border, padding: 10, justifyContent: 'space-between' },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statTitle: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12, flex: 1 },
  statValue: { color: colors.text, fontWeight: '900', fontSize: 18 },
  statDetail: { color: colors.muted, fontWeight: '800', fontSize: 11 },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap },
  moduleButton: { borderRadius: 18, backgroundColor: colors.surfaceSolid, borderWidth: 1, borderColor: 'rgba(33, 230, 243, 0.25)', alignItems: 'center', justifyContent: 'center', gap: 6, shadowColor: colors.cyan, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3, paddingHorizontal: 4 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  moduleTitle: { color: colors.text, fontWeight: '900', fontSize: 12, textAlign: 'center' },
});
