import { Medal } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { ScoreInfoButton } from '@/components/ScoreInfoButton';
import { getRecords, recordDistances, recordGenders, recordScopes, recordStrokes, RecordGender, RecordScope, SwimRecord } from '@/services/records';
import { colors, spacing, typography } from '@/theme/tokens';

export default function RecordsScreen() {
  const [scope, setScope] = useState<RecordScope>('Dünya Rekorları');
  const [stroke, setStroke] = useState('Serbest');
  const [distance, setDistance] = useState('50m');
  const [gender, setGender] = useState<RecordGender>('Erkek');
  const records = useMemo(() => getRecords({ scope, stroke, distance, gender }), [scope, stroke, distance, gender]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Medal color={colors.gold} size={30} />
          <View>
            <Text style={styles.title}>Rekorlar</Text>
            <Text style={styles.subtitle}>Bilgilendirme amaçlı mock rekor panosu.</Text>
          </View>
        </View>

        <Text style={styles.notice}>Rekor verileri bilgilendirme amaçlıdır. Resmi ve güncel dereceler ilgili federasyonlardan kontrol edilmelidir.</Text>
        <GlassCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>Performans Puanı</Text>
              <Text style={styles.infoText}>FINA ve Rudolph puanlarını kısa açıklamalarla öğren.</Text>
            </View>
            <View style={styles.infoActions}>
              <ScoreInfoButton type="fina" label="FINA" />
              <ScoreInfoButton type="rudolph" label="Rudolph" />
              <ScoreInfoButton type="barriers" label="Barajlar" />
            </View>
          </View>
        </GlassCard>
        <FilterRow options={recordScopes} value={scope} onChange={(value) => setScope(value as RecordScope)} />
        <FilterRow options={recordStrokes} value={stroke} onChange={setStroke} />
        <FilterRow options={recordDistances} value={distance} onChange={setDistance} />
        <FilterRow options={recordGenders} value={gender} onChange={(value) => setGender(value as RecordGender)} />

        {records.map((record) => <RecordCard key={record.id} record={record} />)}
        {!records.length ? <Text style={styles.empty}>Bu filtrede Örnek rekor yok.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterRow({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
      {options.map((option) => (
        <Pressable key={option} style={[styles.chip, value === option && styles.chipActive]} onPress={() => onChange(option)}>
          <Text style={[styles.chipText, value === option && styles.chipTextActive]}>{option}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function RecordCard({ record }: { record: SwimRecord }) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.event}>{record.distance} {record.stroke}</Text>
        <Text style={styles.scope}>{record.scope}</Text>
      </View>
      <Text style={styles.time}>{record.time}</Text>
      <View style={styles.scoreHintRow}>
        <Text style={styles.scoreHint}>Performans puanı rehberi</Text>
        <ScoreInfoButton type="fina" />
        <ScoreInfoButton type="rudolph" />
      </View>
      <Text style={styles.meta}>{record.athleteName} • {record.countryOrClub}</Text>
      <Text style={styles.meta}>{record.date} • {record.poolType} • {record.gender}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4 },
  notice: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 16, padding: spacing.md, lineHeight: 20 },
  infoCard: { gap: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' },
  infoCopy: { flex: 1, minWidth: 180 },
  infoTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  infoText: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4, lineHeight: 19 },
  infoActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filters: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: spacing.md, paddingVertical: 9 },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  chipText: { color: colors.mutedStrong, fontWeight: '900' },
  chipTextActive: { color: colors.background },
  card: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  event: { color: colors.text, fontWeight: '900', fontSize: 18 },
  scope: { color: colors.gold, fontWeight: '900', fontSize: 12 },
  time: { color: colors.cyan, fontWeight: '900', fontSize: 30 },
  scoreHintRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  scoreHint: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  meta: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 20 },
  empty: { color: colors.muted, fontWeight: '800', textAlign: 'center', padding: spacing.lg },
});
