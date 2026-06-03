import { Gauge, ShieldAlert, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { ScoreInfoButton, ScoreInfoType } from '@/components/ScoreInfoButton';
import { canManageClub, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

const athletes: Array<{ id: string; name: string; pb: string; last: string; progress: string; fina: string; rudolph: string; attendance: string }> = [];
const strokes = ['Serbest', 'Sırtüstü', 'Kurbağalama', 'Kelebek', 'Karışık'];
const distances = ['50m', '100m', '200m', '400m'];

export default function AthleteCompareScreen() {
  const { currentUser } = useSession();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stroke, setStroke] = useState('Serbest');
  const [distance, setDistance] = useState('50m');
  const selected = useMemo(() => athletes.filter((item) => selectedIds.includes(item.id)), [selectedIds]);

  if (!canManageClub(currentUser.role)) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.locked}>
          <ShieldAlert color={colors.gold} size={42} />
          <Text style={styles.title}>Sporcu Karşılaştır</Text>
          <Text style={styles.subtitle}>Bu özellik antrenör ve kulüp yöneticileri için kullanılabilir.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const toggleAthlete = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Users color={colors.cyan} size={30} />
          <View>
            <Text style={styles.title}>Sporcu Karşılaştır</Text>
            <Text style={styles.subtitle}>2 sporcu seç, 3 sporcuya kadar karşılaştırma hazır.</Text>
          </View>
        </View>
        {athletes.length < 2 ? <EmptyState icon={Users} title="Karşılaştırma için en az 2 sporcu seçiniz." detail="Kulüp sporcuları eklendiğinde PB, son yarış, FINA/Rudolph ve gelişim karşılaştırması burada görünecek." tone={colors.coral} /> : null}
        {athletes.length >= 2 ? <ChipRow options={athletes.map((item) => item.id)} value={selectedIds} onToggle={toggleAthlete} labelFor={(id) => athletes.find((item) => item.id === id)?.name ?? id} /> : null}
        <ChipRow options={strokes} value={[stroke]} onToggle={setStroke} />
        <ChipRow options={distances} value={[distance]} onToggle={setDistance} />

        {selected.map((athlete) => (
          <GlassCard key={athlete.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{athlete.name}</Text>
              <Text style={styles.event}>{distance} {stroke}</Text>
            </View>
            <View style={styles.metricGrid}>
              <Metric label="PB" value={athlete.pb} />
              <Metric label="Son yarış" value={athlete.last} />
              <Metric label="Gelişim" value={athlete.progress} tone={colors.success} />
              <Metric label="FINA" value={athlete.fina} infoType="fina" />
              <Metric label="Rudolph" value={athlete.rudolph} infoType="rudolph" />
              <Metric label="Katılım" value={athlete.attendance} />
            </View>
            <View style={styles.mockChart}>
              {[0.25, 0.48, 0.36, 0.64, 0.72, 0.86].map((height, index) => <View key={index} style={[styles.chartBar, { height: 18 + height * 46 }]} />)}
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function ChipRow({ options, value, onToggle, labelFor }: { options: string[]; value: string[]; onToggle: (value: string) => void; labelFor?: (value: string) => string }) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const active = value.includes(option);
        return (
          <Pressable key={option} style={[styles.chip, active && styles.chipActive]} onPress={() => onToggle(option)}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{labelFor ? labelFor(option) : option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Metric({ label, value, tone = colors.cyan, infoType }: { label: string; value: string; tone?: string; infoType?: ScoreInfoType }) {
  return (
    <View style={styles.metric}>
      <Gauge color={tone} size={15} />
      <View style={styles.metricLabelRow}>
        <Text style={styles.metricLabel}>{label}</Text>
        {infoType ? <ScoreInfoButton type={infoType} /> : null}
      </View>
      <Text style={[styles.metricValue, { color: tone }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: spacing.md, paddingVertical: 9 },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  chipText: { color: colors.mutedStrong, fontWeight: '900' },
  chipTextActive: { color: colors.background },
  card: { gap: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  event: { color: colors.gold, fontWeight: '900' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metric: { width: '31%', minHeight: 78, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.sm, justifyContent: 'space-between' },
  metricLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  metricLabel: { color: colors.muted, fontWeight: '900', fontSize: 11 },
  metricValue: { fontWeight: '900', fontSize: 16 },
  mockChart: { height: 82, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', padding: spacing.sm },
  chartBar: { width: 18, borderRadius: 999, backgroundColor: colors.cyan },
});
