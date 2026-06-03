import { BarChart3, TrendingUp } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { getAthleteRaceHistory } from '@/services/clubCompetition';
import { useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

const periods = ['Haftalık', 'Aylık', 'Yıllık'];
const strokes = ['Serbest', 'Sırtüstü', 'Kurbağalama', 'Kelebek', 'Karışık'];
const distances = ['50', '100', '200', '400', '800', '1500'];

export default function AnalyticsScreen() {
  const { currentUser } = useSession();
  const [period, setPeriod] = useState('Aylık');
  const [stroke, setStroke] = useState('Serbest');
  const [distance, setDistance] = useState('100');
  const athleteId = currentUser.role === 'parent' ? currentUser.childAthleteId ?? currentUser.id : currentUser.id;
  const history = getAthleteRaceHistory(athleteId);
  const filtered = useMemo(() => history.filter((race) => race.stroke === stroke && race.distance === distance), [distance, history, stroke]);
  const chartTitle = `${distance}m ${stroke} Gelişim Grafiği`;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TrendingUp color={colors.coral} size={28} />
          <View>
            <Text style={styles.title}>Performans Analizi</Text>
            <Text style={styles.subtitle}>{currentUser.role === 'coach' ? 'Sporcu seçerek yarış verisine bağlı analizleri takip et.' : currentUser.role === 'parent' ? 'Çocuğunun gelişim grafiğini takip et.' : 'Yarış sonuçlarına göre PB ve gelişim trendini gör.'}</Text>
          </View>
        </View>

        <FilterStrip options={periods} value={period} onChange={setPeriod} />
        <FilterStrip options={strokes} value={stroke} onChange={setStroke} />
        <FilterStrip options={distances.map((item) => `${item}m`)} value={`${distance}m`} onChange={(value) => setDistance(value.replace('m', ''))} />

        {filtered.length ? (
          <GlassCard style={styles.chartCard} tone={colors.coral}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>{chartTitle}</Text>
              <Text style={styles.periodBadge}>{period}</Text>
            </View>
            <View style={styles.chart}>
              {filtered.slice(-8).map((race) => {
                const seconds = parseTime(race.finalTime);
                const height = seconds ? Math.max(28, 150 - Math.min(seconds, 140)) : 28;
                return (
                  <View key={race.id} style={styles.barItem}>
                    <View style={[styles.bar, { height }]} />
                    <Text style={styles.barLabel}>{race.date.slice(0, 5)}</Text>
                  </View>
                );
              })}
            </View>
            {filtered.map((race) => (
              <View key={race.id} style={styles.resultRow}>
                <BarChart3 color={race.isPB ? colors.coral : colors.blue} size={16} />
                <Text style={styles.resultText}>{race.date} • {race.finalTime}{race.isPB ? ' • PB gelişimi' : ''}{race.splits.length ? ` • Split ${race.splits.join(' / ')}` : ''}</Text>
              </View>
            ))}
          </GlassCard>
        ) : (
          <EmptyState title="Bu branş için henüz analiz verisi yok" detail="Yarış sonucu girildiğinde seçilen stil ve mesafeye göre grafik oluşacak." icon={TrendingUp} tone={colors.coral} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterStrip({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable key={option} style={[styles.chip, active && styles.chipActive]} onPress={() => onChange(option)}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function parseTime(value: string) {
  if (!value || value === '-') return null;
  if (/^\d+(\.\d+)?$/.test(value)) return Number(value);
  const [minutes, rest] = value.split(':');
  if (!rest) return null;
  return Number(minutes) * 60 + Number(rest);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.mutedStrong, marginTop: spacing.xs, fontWeight: '700', lineHeight: 21 },
  filters: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, paddingVertical: 9 },
  chipActive: { backgroundColor: colors.coralSoft, borderColor: 'rgba(249, 115, 22, 0.34)' },
  chipText: { color: colors.muted, fontWeight: '900' },
  chipTextActive: { color: colors.text },
  chartCard: { gap: spacing.md },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  chartTitle: { color: colors.text, fontWeight: '900', fontSize: 18, flex: 1 },
  periodBadge: { color: colors.coral, fontWeight: '900' },
  chart: { height: 170, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', borderRadius: 18, backgroundColor: colors.surfaceSoft, padding: spacing.sm },
  barItem: { alignItems: 'center', gap: spacing.sm },
  bar: { width: 26, borderRadius: 10, backgroundColor: colors.coral },
  barLabel: { color: colors.muted, fontWeight: '800', fontSize: 11 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  resultText: { color: colors.mutedStrong, fontWeight: '800', flex: 1, lineHeight: 19 },
});
