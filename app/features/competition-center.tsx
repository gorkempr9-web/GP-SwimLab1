import { Clock3, MapPin, Trophy } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { Competition, competitions } from '@/services/clubCompetition';
import { colors, spacing, typography } from '@/theme/tokens';

export default function CompetitionCenterScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Trophy color={colors.gold} size={30} />
          <View>
            <Text style={styles.title}>Yarış Merkezi</Text>
            <Text style={styles.subtitle}>Yarış bilgileri, seans ve havuz takibi.</Text>
          </View>
        </View>
        {competitions.map((competition) => <CompetitionCard key={competition.id} competition={competition} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

function CompetitionCard({ competition }: { competition: Competition }) {
  const statusColor = competition.status === 'aktif' ? colors.success : competition.status === 'tamamlandı' ? colors.muted : colors.gold;
  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleWrap}>
          <Text style={styles.cardTitle}>{competition.name}</Text>
          <View style={styles.locationLine}>
            <MapPin color={colors.cyan} size={15} />
            <Text style={styles.locationText}>{competition.city}</Text>
          </View>
        </View>
        <Text style={[styles.status, { color: statusColor }]}>{competition.status}</Text>
      </View>
      <View style={styles.grid}>
        <Meta label="Havuz tipi" value={competition.poolType} />
        <Meta label="Başlangıç" value={competition.startDate} />
        <Meta label="Bitiş" value={competition.endDate} />
        <Meta label="Isınma" value={competition.warmupTime} />
        <Meta label="Seans" value={competition.session} />
        <Meta label="Kulüp" value={competition.club} />
      </View>
      <View style={styles.footer}>
        <Clock3 color={colors.cyan} size={16} />
        <Text style={styles.footerText}>Örnek: Marmara Cup • İstanbul • 50m • 26 Mayıs • 08:00</Text>
      </View>
    </GlassCard>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', marginTop: 4 },
  card: { gap: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  titleWrap: { flex: 1 },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  locationLine: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  locationText: { color: colors.mutedStrong, fontWeight: '800' },
  status: { fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  meta: { width: '48%', borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.sm },
  metaLabel: { color: colors.muted, fontWeight: '900', fontSize: 11 },
  metaValue: { color: colors.text, fontWeight: '900', marginTop: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  footerText: { color: colors.mutedStrong, fontWeight: '800', flex: 1 },
});
