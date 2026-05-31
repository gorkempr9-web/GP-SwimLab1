import { useFocusEffect } from 'expo-router';
import { CalendarClock, Gauge, Medal, Trophy } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { AthleteRaceResult, CompetitionRosterEntry, getAthleteRaceHistory, getUpcomingRacesForAthlete } from '@/services/clubCompetition';
import { useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

export default function RacesScreen() {
  const { currentUser } = useSession();
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
      target: firstUpcoming?.targetTime ?? '55.90',
      pb: matchingHistory?.finalTime ?? firstUpcoming?.pb ?? '56.84',
      diff: calculateDiff(firstUpcoming?.targetTime ?? '55.90', matchingHistory?.finalTime ?? firstUpcoming?.pb ?? '56.84'),
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
        {!upcoming.length ? <Text style={styles.empty}>Hazırlanmış yarış yok.</Text> : null}

        <SectionTitle icon={Medal} title={isParent ? 'Çocuğumun Geçmiş Yarışları' : 'Geçmiş Yarışlarım'} />
        {history.map((race, index) => <HistoryCard key={`${race.competitionName}-${race.date}-${index}`} race={race} />)}

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

function SectionTitle({ icon: Icon, title }: { icon: typeof Trophy; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Icon color={colors.cyan} size={20} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function UpcomingRaceCard({ race }: { race: CompetitionRosterEntry }) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Marmara Cup</Text>
        <Text style={styles.daysLeft}>{daysLeft('2026-05-26')} gün</Text>
      </View>
      <Text style={styles.meta}>26.05.2026 • İstanbul • {race.poolType} • {race.session}</Text>
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
      <Text style={styles.meta}>{race.date} • {race.eventName} • {race.poolType}</Text>
      {race.raceKind === 'relay' ? <Text style={styles.meta}>{race.teamName} • {race.relayOrder}. sporcu</Text> : null}
      <Text style={styles.time}>{race.finalTime}</Text>
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
  return 4;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', lineHeight: 21, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  card: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18, flex: 1 },
  daysLeft: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  meta: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 20 },
  branch: { color: colors.cyan, fontWeight: '900', fontSize: 16 },
  time: { color: colors.text, fontWeight: '900', fontSize: 24 },
  note: { color: colors.muted, fontWeight: '700', lineHeight: 20 },
  pb: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  typeBadge: { color: colors.cyan, fontWeight: '900', backgroundColor: colors.cyanSoft, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  relayBadge: { color: colors.gold, backgroundColor: colors.goldSoft },
  goalCard: { flexDirection: 'row', gap: spacing.sm },
  goalItem: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.sm },
  goalLabel: { color: colors.muted, fontWeight: '900', fontSize: 11 },
  goalValue: { color: colors.text, fontWeight: '900', marginTop: 6, fontSize: 16 },
  empty: { color: colors.muted, fontWeight: '800', textAlign: 'center', padding: spacing.md },
});
