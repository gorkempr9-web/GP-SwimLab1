import { TrendingUp } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SectionHeader } from '@/components/SectionHeader';
import { performanceBars } from '@/data/mockData';
import { colors, spacing, typography } from '@/theme/tokens';

export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Performans Analizleri</Text>
        <Text style={styles.subtitle}>PB trendi, yük dengesi ve gelişim grafikleri.</Text>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>100m Serbest gelişim</Text>
            <TrendingUp color={colors.cyan} size={24} />
          </View>
          <View style={styles.chart}>
            {performanceBars.map((bar) => (
              <View key={bar.week} style={styles.barItem}>
                <View style={[styles.bar, { height: bar.value }]} />
                <Text style={styles.barLabel}>{bar.week}</Text>
              </View>
            ))}
          </View>
        </View>

        <SectionHeader title="Analiz özetleri" />
        {['Start reaksiyonu iyileşiyor', 'Son 15m tempo kaybı azaldı', 'Aerobik yük optimum aralıkta'].map((item) => (
          <View key={item} style={styles.insight}>
            <Text style={styles.insightText}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 110 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, marginTop: spacing.sm, marginBottom: spacing.lg },
  chartCard: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  chartTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  chart: { height: 170, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barItem: { alignItems: 'center', gap: spacing.sm },
  bar: { width: 30, borderRadius: 10, backgroundColor: colors.cyan },
  barLabel: { color: colors.muted, fontWeight: '800' },
  insight: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  insightText: { color: colors.text, fontWeight: '800' },
});
