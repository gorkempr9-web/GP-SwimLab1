import { CalendarDays, Dumbbell, RotateCcw } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { canManageClub, useSession } from '@/services/session';
import { addPlanToTrainingLog, getTrainingLog, hydrateTrainingLogFromStorage, TrainingLogEntry } from '@/services/trainingLog';
import { saveTrainingPlan } from '@/services/trainingPlans';
import { colors, spacing, typography } from '@/theme/tokens';

const groupOrder = ['Performans', 'Gelişim', 'Temel Eğitim', 'Yarış Grubu', 'Özel Ders'];
const filters = ['Tümü', 'Hafta', 'Ay', 'Yıl'];

export default function TrainingLogScreen() {
  const { currentUser } = useSession();
  const canView = canManageClub(currentUser.role);
  const [entries, setEntries] = useState<TrainingLogEntry[]>(() => getTrainingLog());
  const [filter, setFilter] = useState('Tümü');
  const [groupFilter, setGroupFilter] = useState('Tümü');
  const [message, setMessage] = useState('');

  useEffect(() => {
    hydrateTrainingLogFromStorage().then((items) => setEntries([...items]));
  }, []);

  const visibleEntries = useMemo(() => {
    const filtered = entries.filter((entry) => {
      const groupMatch = groupFilter === 'Tümü' || entry.groupLabel.includes(groupFilter);
      const dateMatch = filter === 'Tümü' || matchesDateFilter(entry.date, filter);
      return groupMatch && dateMatch;
    });
    return filtered.sort((a, b) => groupRank(a.groupLabel) - groupRank(b.groupLabel));
  }, [entries, filter, groupFilter]);

  const repeat = (entry: TrainingLogEntry) => {
    const draft = {
      ...entry.plan,
      title: `${entry.title} - Tekrar`,
      date: new Date().toISOString().slice(0, 10),
      day: '',
      time: '',
    };
    const plan = saveTrainingPlan(draft);
    addPlanToTrainingLog(plan);
    setEntries([...getTrainingLog()]);
    setMessage('Antrenman tekrar planı olarak oluşturuldu.');
  };

  if (!canView) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <EmptyState title="Bu alan antrenör ve kulüp yöneticileri için kullanılabilir." icon={Dumbbell} tone={colors.coral} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Antrenman Günlüğüm</Text>
          <Text style={styles.subtitle}>Yıl boyunca gönderdiğin antrenmanları arşivle, filtrele ve tekrar kullan.</Text>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Text style={styles.label}>Dönem</Text>
        <ChipGroup options={filters} value={filter} onChange={setFilter} />
        <Text style={styles.label}>Grup</Text>
        <ChipGroup options={['Tümü', ...groupOrder]} value={groupFilter} onChange={setGroupFilter} />

        {visibleEntries.length ? visibleEntries.map((entry) => <TrainingLogCard key={entry.id} entry={entry} onRepeat={() => repeat(entry)} />) : <EmptyState title="Henüz antrenman kaydı yok." detail="Plan kaydettiğinde antrenman günlüğüne otomatik düşer." icon={CalendarDays} tone={colors.cyan} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function TrainingLogCard({ entry, onRepeat }: { entry: TrainingLogEntry; onRepeat: () => void }) {
  const stylesLabel = (entry.styles ?? []).join(', ') || '-';
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBadge}>
          <Dumbbell color={colors.cyan} size={20} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{entry.title}</Text>
          <Text style={styles.cardMeta}>{entry.date} • {entry.groupLabel}</Text>
          <Text style={styles.cardMeta}>{entry.totalMeters} • {entry.duration} • {entry.pool}</Text>
        </View>
      </View>
      <View style={styles.infoGrid}>
        <Info label="Hedef" value={entry.target} />
        <Info label="Set" value={String(entry.setCount)} />
        <Info label="Stil" value={stylesLabel} />
      </View>
      {entry.coachNote ? <Text style={styles.note}>Not: {entry.coachNote}</Text> : null}
      <AppButton title="Antrenmanı Tekrarla" icon={RotateCcw} variant="secondary" onPress={onRepeat} />
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

function ChipGroup({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((option) => (
        <Pressable key={option} style={[styles.chip, value === option && styles.chipActive]} onPress={() => onChange(option)}>
          <Text style={[styles.chipText, value === option && styles.chipTextActive]}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function matchesDateFilter(date: string, filter: string) {
  if (!date || filter === 'Tümü') return true;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return true;
  const now = new Date();
  const diffDays = Math.abs(now.getTime() - parsed.getTime()) / 86400000;
  if (filter === 'Hafta') return diffDays <= 7;
  if (filter === 'Ay') return diffDays <= 31;
  if (filter === 'Yıl') return diffDays <= 366;
  return true;
}

function groupRank(groupLabel: string) {
  const index = groupOrder.findIndex((group) => groupLabel.includes(group));
  return index === -1 ? 99 : index;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.md },
  header: { gap: spacing.sm },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', lineHeight: 22 },
  message: { color: colors.cyan, fontWeight: '900', backgroundColor: colors.cyanSoft, borderRadius: 16, padding: spacing.md },
  label: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: colors.glass },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  chipText: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  chipTextActive: { color: colors.background },
  card: { borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: spacing.md },
  cardHeader: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  iconBadge: { width: 46, height: 46, borderRadius: 18, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  cardMeta: { color: colors.muted, fontWeight: '800', lineHeight: 19 },
  infoGrid: { flexDirection: 'row', gap: spacing.sm },
  infoBox: { flex: 1, borderRadius: 16, backgroundColor: colors.cyanSoft, padding: spacing.sm },
  infoValue: { color: colors.text, fontWeight: '900' },
  infoLabel: { color: colors.mutedStrong, fontWeight: '800', fontSize: 11, marginTop: 2 },
  note: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 20 },
});
