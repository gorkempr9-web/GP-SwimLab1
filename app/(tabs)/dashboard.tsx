import { router } from 'expo-router';
import { BellRing, BrainCircuit, CalendarClock, CheckCircle2, FileText, Flame, Gauge, LucideIcon, Medal, MessageCircle, ShieldCheck } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { nextRace, swimmerStats } from '@/data/mockData';
import { getUpcomingFederationRace } from '@/services/federationCalendar';
import { getUpcomingMeetEntryForRole } from '@/services/meetEntries';
import { panelLabel, useSession, UserRole } from '@/services/session';
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
  const [upcomingOfficialRace, setUpcomingOfficialRace] = useState<ReturnType<typeof getUpcomingFederationRace> | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [fade, translateY]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setUpcomingOfficialRace(getUpcomingFederationRace());
      } catch {
        setUpcomingOfficialRace(null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <PoolPattern />
      <Animated.View style={[styles.content, compact && styles.contentCompact, { opacity: fade, transform: [{ translateY }] }]}>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIdentity}>
              <AppLogo compact={true} size={38} showTitle={false} showSlogan={false} />
              <View style={styles.headerText}>
                <Text style={styles.slogan} numberOfLines={1}>SwimLab</Text>
                <Text style={styles.greeting} numberOfLines={1} adjustsFontSizeToFit={true} minimumFontScale={0.82}>Merhaba, {currentUser.firstName}</Text>
              </View>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreValue}>{swimmerStats.readiness}</Text>
              <Text style={styles.scoreText}>Hazırlık</Text>
            </View>
          </View>
          <Text style={styles.nextRaceLine} numberOfLines={1}>Sonraki yarış: {upcomingEntry ? upcomingEntry.competitionName : nextRace.name} • 18 gün</Text>
          <Text style={styles.raceMeta} numberOfLines={1}>
            {upcomingEntry ? `${upcomingEntry.relayEvent || `${upcomingEntry.distance} ${upcomingEntry.stroke}`} • ${panelLabel(currentUser.role)}` : `${nextRace.event} • ${nextRace.dateLabel}`}
          </Text>
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
                try {
                  const { requestNotificationPermission } = await import('@/services/notifications');
                  const result = await requestNotificationPermission();
                  setNotificationsGranted(result.granted);
                } catch {
                  setNotificationsGranted(false);
                }
              }}
            >
              <Text style={styles.allowButtonText}>İzin ver</Text>
            </Pressable>
          ) : null}
        </View>

        {upcomingOfficialRace && upcomingOfficialRace.daysLeft <= 30 ? (
          <View style={styles.tyfCard}>
            <View style={styles.tyfCopy}>
              <Text style={styles.tyfLabel}>TYF Resmi Takvim</Text>
              <Text style={styles.tyfTitle} numberOfLines={1}>{upcomingOfficialRace.event.title}</Text>
              <Text style={styles.tyfMeta} numberOfLines={1}>{upcomingOfficialRace.daysLeft} gün kaldı • {upcomingOfficialRace.event.city} • {upcomingOfficialRace.event.poolType}</Text>
            </View>
            <Pressable style={styles.detailButton} onPress={() => router.push('/features/club-calendar')}>
              <Text style={styles.detailButtonText}>Detayları gör</Text>
            </Pressable>
          </View>
        ) : null}

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

function getModulesForRole(role: UserRole): Array<{ title: string; icon: LucideIcon; route: string }> {
  const modules = [
    { title: 'Yaris', icon: CalendarClock, route: '/(tabs)/races' },
    { title: 'AI', icon: BrainCircuit, route: '/features/ai-coach' },
    { title: 'PDF', icon: FileText, route: '/features/reports' },
    { title: 'TYF', icon: CalendarClock, route: '/features/tyf-portal' },
    { title: 'Guvenlik', icon: ShieldCheck, route: '/features/security-center' },
    { title: 'Basari', icon: MessageCircle, route: '/features/forum' },
  ];
  if (role === 'coach' || role === 'club_admin') {
    return [{ title: 'Krono', icon: Gauge, route: '/features/live-race-timer' }, ...modules.slice(0, 5)];
  }
  return modules;
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
  content: { flex: 1, paddingHorizontal: horizontalPadding, paddingTop: 6, paddingBottom: 92, gap: 10, justifyContent: 'space-between' },
  contentCompact: { gap: 8, paddingBottom: 84 },
  heroCard: { minHeight: 118, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong, padding: 14, justifyContent: 'space-between', shadowColor: colors.cyan, shadowOpacity: 0.09, shadowRadius: 14, elevation: 4 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap, flexWrap: 'nowrap' },
  heroIdentity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { flex: 1, minWidth: 0 },
  slogan: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  greeting: { color: colors.text, fontWeight: '900', fontSize: 22, marginTop: 2, flexShrink: 1 },
  scoreBadge: { width: 62, height: 50, borderRadius: 18, backgroundColor: colors.cyanSoft, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  scoreValue: { color: colors.cyan, fontWeight: '900', fontSize: 20 },
  scoreText: { color: colors.text, fontWeight: '900', fontSize: 10 },
  nextRaceLine: { color: colors.text, fontWeight: '900', fontSize: 14, marginTop: 10 },
  raceMeta: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4 },
  tyfCard: { minHeight: 70, borderRadius: 24, backgroundColor: colors.surfaceSolid, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.45)', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: colors.gold, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  tyfCopy: { flex: 1, minWidth: 0 },
  tyfLabel: { color: colors.gold, fontWeight: '900', fontSize: 11 },
  tyfTitle: { color: colors.text, fontWeight: '900', fontSize: 15, marginTop: 3 },
  tyfMeta: { color: colors.mutedStrong, fontWeight: '800', fontSize: 12, marginTop: 3 },
  detailButton: { minHeight: 34, borderRadius: 14, backgroundColor: colors.goldSoft, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  detailButtonText: { color: colors.gold, fontWeight: '900', fontSize: 11 },
  notificationCard: { minHeight: 44, borderRadius: 24, backgroundColor: colors.surfaceSolid, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap },
  notificationLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  notificationText: { color: colors.text, fontWeight: '900', fontSize: 13 },
  allowButton: { minHeight: 32, borderRadius: 12, backgroundColor: colors.cyan, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  allowButtonText: { color: colors.background, fontWeight: '900', fontSize: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap },
  statCard: { borderRadius: 24, backgroundColor: colors.surfaceSolid, borderWidth: 1, borderColor: colors.borderStrong, padding: 10, justifyContent: 'space-between' },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statTitle: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12, flex: 1 },
  statValue: { color: colors.text, fontWeight: '900', fontSize: 18 },
  statDetail: { color: colors.muted, fontWeight: '800', fontSize: 11 },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap },
  moduleButton: { borderRadius: 24, backgroundColor: colors.surfaceSolid, borderWidth: 1, borderColor: 'rgba(33, 230, 243, 0.25)', alignItems: 'center', justifyContent: 'center', gap: 6, shadowColor: colors.cyan, shadowOpacity: 0.07, shadowRadius: 9, elevation: 3, paddingHorizontal: 4 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  moduleTitle: { color: colors.text, fontWeight: '900', fontSize: 12, textAlign: 'center' },
});
