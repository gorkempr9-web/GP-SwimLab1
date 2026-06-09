import { router, useFocusEffect } from 'expo-router';
import { BarChart3, CalendarClock, FileText, Gauge, LucideIcon, Medal, Trophy, Users } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { DimensionValue, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { ScoreInfoButton } from '@/components/ScoreInfoButton';
import { AthleteRaceResult, CompetitionRosterEntry, getAthleteRaceHistory, getUpcomingRacesForAthlete } from '@/services/clubCompetition';
import { useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

export default function RacesScreen() {
  const { currentUser } = useSession();
  if (currentUser.role === 'super_admin') {
    return <AdminSystemScreen />;
  }
  if (currentUser.role === 'coach' || currentUser.role === 'club_admin') {
    return <ManagerRacesScreen role={currentUser.role} />;
  }

  const athleteId = currentUser.role === 'parent' ? currentUser.childAthleteId ?? 'ra-1' : 'ra-1';
  const isParent = currentUser.role === 'parent';
  const [upcoming, setUpcoming] = useState<CompetitionRosterEntry[]>(() => getUpcomingRacesForAthlete(athleteId));
  const [history, setHistory] = useState<AthleteRaceResult[]>(() => getAthleteRaceHistory(athleteId));

  const refresh = useCallback(() => {
    setUpcoming(getUpcomingRacesForAthlete(athleteId));
    setHistory(getAthleteRaceHistory(athleteId));
  }, [athleteId]);

  useFocusEffect(refresh);

  const goals = useMemo(() => {
    const firstUpcoming = upcoming[0];
    const matchingHistory = history.find((result) => result.distance === firstUpcoming?.distance && result.stroke === firstUpcoming?.stroke && result.poolType === firstUpcoming?.poolType);
    return {
      target: firstUpcoming?.targetTime ?? '-',
      pb: matchingHistory?.finalTime ?? firstUpcoming?.pb ?? '-',
      diff: firstUpcoming ? calculateDiff(firstUpcoming.targetTime, matchingHistory?.finalTime ?? firstUpcoming.pb) : '-',
    };
  }, [history, upcoming]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Trophy color={colors.gold} size={28} />
          <View>
            <Text style={styles.title}>Yarış</Text>
            <Text style={styles.subtitle}>{isParent ? 'Çocuğunun yarışları, geçmiş dereceleri ve hedefleri.' : 'Yaklaşan yarışlar, geçmiş dereceler ve hedefler.'}</Text>
          </View>
        </View>

        <SectionTitle icon={CalendarClock} title={isParent ? 'Çocuğumun Yaklaşan Yarışları' : 'Yaklaşan Yarışmalar'} />
        {upcoming.map((race) => <UpcomingRaceCard key={race.id} race={race} />)}
        {!upcoming.length ? <EmptyState title="Henüz yarış eklenmedi" detail="Antrenör yarış listesi hazırladığında burada görünecek." icon={CalendarClock} tone={colors.gold} /> : null}

        <SectionTitle icon={Medal} title={isParent ? 'Çocuğumun Geçmiş Yarışları' : 'Geçmiş Yarışlarım'} />
        <View style={styles.resultInfoRow}>
          <Text style={styles.resultInfoText}>Performans puanları</Text>
          <ScoreInfoButton type="fina" label="FINA" />
          <ScoreInfoButton type="rudolph" label="Rudolph" />
        </View>
        {history.map((race, index) => <HistoryCard key={`${race.competitionName}-${race.date}-${index}`} race={race} />)}
        {!history.length ? <EmptyState title="Henüz yarış sonucu eklenmedi" detail="Sonuç kaydedildiğinde geçmiş yarışlar burada listelenecek." icon={Medal} tone={colors.coral} /> : null}

        <SectionTitle icon={Gauge} title={isParent ? 'Çocuğumun Hedefleri' : 'Hedeflerim'} />
        <GlassCard style={styles.goalCard}>
          <Goal label="Hedef derece" value={goals.target} />
          <Goal label="Mevcut PB" value={goals.pb} />
          <Goal label="Gelişim farkı" value={goals.diff} />
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function AdminSystemScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Trophy color={colors.gold} size={28} />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Sistem</Text>
            <Text style={styles.subtitle}>Admin için pilot veri, sistem durumu ve yönetim kayıtlarına hızlı erişim.</Text>
          </View>
        </View>
        <View style={styles.managerGrid}>
          <ManagerActionCard title="Admin Paneli" detail="Tüm yönetim sekmeleri" icon={BarChart3} route="/features/admin-panel" width="48%" />
          <ManagerActionCard title="Demo Verileri" detail="Kulüp bazlı veri temizliği" icon={FileText} route="/features/admin-panel" width="48%" />
          <ManagerActionCard title="Bildirim Kayıtları" detail="Kulüp bildirimlerini izle" icon={CalendarClock} route="/features/admin-panel" width="48%" />
          <ManagerActionCard title="Yarış Sonuçları" detail="Tüm kulüp sonuçları" icon={Medal} route="/features/admin-panel" width="48%" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ManagerRacesScreen({ role }: { role: 'coach' | 'club_admin' }) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - spacing.lg * 2 - spacing.sm) / 2;
  const isClubAdmin = role === 'club_admin';
  const cards = [
    { title: 'Yarış Takım Listesi', detail: 'Sporcu, branş, seri ve kulvar hazırlığı', icon: Trophy, route: '/features/competition-roster' },
    { title: 'Canlı Yarış Girişi', detail: 'Bekleyen yarışlara sonuç gir', icon: Gauge, route: '/features/live-race' },
    { title: 'Sonuç Gir', detail: 'Derece ve split kaydı', icon: Medal, route: '/features/live-race' },
    { title: 'Sporcu Karşılaştır', detail: 'PB, FINA, Rudolph ve gelişim', icon: BarChart3, route: '/features/athlete-compare' },
    { title: isClubAdmin ? 'Kulüp Sporcu Sonuçları' : 'Sporcu Yarış Sonuçları', detail: 'Sporcu bazlı yarış geçmişi', icon: Users, route: '/features/my-athletes' },
    { title: isClubAdmin ? 'Kulüp Raporu' : 'Takım Raporu', detail: 'PDF rapor ve paylaşım hazırlığı', icon: FileText, route: '/features/competition-report' },
    { title: 'TYF Panelleri', detail: 'Resmi TYF portal, takvim, sonuç ve baraj bağlantıları', icon: CalendarClock, route: '/features/tyf-portal' },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Trophy color={colors.gold} size={28} />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Yarış Merkezi</Text>
            <Text style={styles.subtitle}>Takım listesi, canlı sonuç girişi, sporcu karşılaştırma ve raporları tek yerden yönetin.</Text>
          </View>
        </View>

        <View style={styles.managerGrid}>
          {cards.map((card) => <ManagerActionCard key={card.title} {...card} width={cardWidth} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ManagerActionCard({ title, detail, icon: Icon, route, width }: { title: string; detail: string; icon: LucideIcon; route: string; width: DimensionValue }) {
  return (
    <Pressable style={({ pressed }) => [styles.managerCard, { width }, pressed && styles.pressed]} onPress={() => router.push(route as never)}>
      <View style={styles.managerIcon}>
        <Icon color={colors.cyan} size={22} />
      </View>
      <Text style={styles.managerTitle}>{title}</Text>
      <Text style={styles.managerDetail}>{detail}</Text>
    </Pressable>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Trophy; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Icon color={colors.cyan} size={20} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function UpcomingRaceCard({ race }: { race: CompetitionRosterEntry }) {
  const competitionName = race.competitionName || 'Yarış adı bekleniyor';
  const competitionDate = race.competitionDate || '-';
  const location = race.location || '-';
  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{competitionName}</Text>
        <Text style={styles.daysLeft}>{daysLeft(race.competitionDate ?? '')}</Text>
      </View>
      <Text style={styles.meta}>{competitionDate}  •  {location} ? {race.poolType}  •  {race.session}</Text>
      <Text style={styles.branch}>{race.distance} {race.stroke}</Text>
      <Text style={styles.note}>Yarışa kalan gün ve branş bilgisi antrenör yarış listesinden gelir.</Text>
    </GlassCard>
  );
}

function HistoryCard({ race }: { race: AthleteRaceResult }) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{race.competitionName}</Text>
        <Text style={[styles.typeBadge, race.raceKind === 'relay' && styles.relayBadge]}>{race.raceKind === 'relay' ? 'Bayrak' : 'Bireysel'}</Text>
        {race.isPB ? <Text style={styles.pb}>Yeni PB</Text> : null}
      </View>
      <Text style={styles.meta}>{race.date}  •  {race.eventName}  •  {race.poolType}</Text>
      {race.raceKind === 'relay' ? <Text style={styles.meta}>{race.teamName}  •  {race.relayOrder}. sporcu</Text> : null}
      <Text style={styles.time}>{race.finalTime}</Text>
      <View style={styles.scoreHintRow}>
        <Text style={styles.scoreHint}>FINA/Rudolph rehberi</Text>
        <ScoreInfoButton type="fina" />
        <ScoreInfoButton type="rudolph" />
      </View>
      <Text style={styles.note} numberOfLines={2}>Antrenör notu: {race.coachNote || 'Kısa not yok.'}</Text>
    </GlassCard>
  );
}

function Goal({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.goalItem}>
      <Text style={styles.goalLabel}>{label}</Text>
      <Text style={styles.goalValue}>{value}</Text>
    </View>
  );
}

function calculateDiff(target: string, current: string) {
  const targetSeconds = Number(target);
  const currentSeconds = Number(current);
  if (Number.isNaN(targetSeconds) || Number.isNaN(currentSeconds)) return '-';
  const diff = currentSeconds - targetSeconds;
  return `${diff >= 0 ? '-' : '+'}${Math.abs(diff).toFixed(2)} sn`;
}

function daysLeft(_date: string) {
  return 'Tarih bekleniyor';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', lineHeight: 21, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  resultInfoRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, padding: spacing.sm },
  resultInfoText: { color: colors.mutedStrong, fontWeight: '900', marginRight: spacing.xs },
  card: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18, flex: 1 },
  daysLeft: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  meta: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 20 },
  branch: { color: colors.cyan, fontWeight: '900', fontSize: 16 },
  time: { color: colors.text, fontWeight: '900', fontSize: 24 },
  scoreHintRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  scoreHint: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  note: { color: colors.muted, fontWeight: '700', lineHeight: 20 },
  pb: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  typeBadge: { color: colors.cyan, fontWeight: '900', backgroundColor: colors.cyanSoft, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  relayBadge: { color: colors.gold, backgroundColor: colors.goldSoft },
  goalCard: { flexDirection: 'row', gap: spacing.sm },
  goalItem: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.sm },
  goalLabel: { color: colors.muted, fontWeight: '900', fontSize: 11 },
  goalValue: { color: colors.text, fontWeight: '900', marginTop: 6, fontSize: 16 },
  empty: { color: colors.muted, fontWeight: '800', textAlign: 'center', padding: spacing.md },
  managerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  managerCard: { minHeight: 148, borderRadius: 22, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: spacing.sm, justifyContent: 'space-between' },
  managerIcon: { width: 42, height: 42, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  managerTitle: { color: colors.text, fontWeight: '900', fontSize: 16, lineHeight: 20 },
  managerDetail: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 18, fontSize: 12 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
