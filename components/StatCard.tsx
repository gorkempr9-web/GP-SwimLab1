import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors, gradients, spacing } from '@/theme/tokens';

export function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon?: LucideIcon }) {
  return (
    <LinearGradient colors={gradients.fallback} style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        {Icon ? (
          <View style={styles.iconBox}>
            <Icon color={colors.cyan} size={18} />
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
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
    shadowColor: colors.cyan,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 2,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  value: { color: colors.text, fontWeight: '900', fontSize: 24 },
  detail: { color: colors.muted, fontWeight: '700' },
  iconBox: { width: 32, height: 32, borderRadius: 12, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
});
