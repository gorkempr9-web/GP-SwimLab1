import { Clock3, Medal } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { raceDayItems } from '@/services/clubCompetition';
import { colors, spacing, typography } from '@/theme/tokens';

export default function RaceDayBoardScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Yarış Günü Panosu</Text>
        <Text style={styles.subtitle}>Canlı akış, ısınma, heat, lane ve durum takibi.</Text>
        {raceDayItems.map((item) => (
          <GlassCard key={item.id} style={styles.card}>
            <View style={styles.timeBox}>
              <Clock3 color={colors.cyan} size={18} />
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.athlete}>{item.athlete}</Text>
              <Text style={styles.meta}>{item.event} • Lane {item.lane} • Heat {item.heat}</Text>
            </View>
            <View style={styles.statusPill}>
              <Medal color={colors.gold} size={15} />
              <Text style={styles.status}>{item.status}</Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', lineHeight: 21 },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  timeBox: { width: 66, alignItems: 'center', gap: 5 },
  time: { color: colors.cyan, fontWeight: '900' },
  copy: { flex: 1 },
  athlete: { color: colors.text, fontWeight: '900', fontSize: 17 },
  meta: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4 },
  statusPill: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.sm, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  status: { color: colors.text, fontWeight: '900', fontSize: 12 },
});
