import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors, gradients, radii, spacing } from '@/theme/tokens';

export function StatCard({ label, value, detail, icon: Icon, tone = colors.cyan }: { label: string; value: string; detail: string; icon?: LucideIcon; tone?: string }) {
  return (
    <LinearGradient colors={[`${tone}20`, gradients.fallback[1], gradients.fallback[2]]} style={[styles.card, { borderColor: `${tone}55`, shadowColor: tone }]}>
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: tone }]}>{label}</Text>
        {Icon ? (
          <View style={[styles.iconBox, { backgroundColor: `${tone}22` }]}>
            <Icon color={tone} size={18} />
          </View>
        ) : null}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47.8%',
    minHeight: 104,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    justifyContent: 'space-between',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 2,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontWeight: '900', fontSize: 12 },
  value: { color: colors.text, fontWeight: '900', fontSize: 24 },
  detail: { color: colors.muted, fontWeight: '700' },
  iconBox: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
