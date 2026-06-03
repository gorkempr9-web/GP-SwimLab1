import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

export function GradientBadge({ label, tone = colors.cyan, icon: Icon }: { label: string; tone?: string; icon?: LucideIcon }) {
  return (
    <LinearGradient colors={[`${tone}3A`, `${tone}16`]} style={[styles.badge, { borderColor: `${tone}55` }]}>
      {Icon ? <Icon color={tone} size={14} strokeWidth={2.7} /> : <View style={[styles.dot, { backgroundColor: tone }]} />}
      <Text style={styles.label}>{label}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 999 },
  label: { color: colors.text, fontWeight: '900', fontSize: 11 },
});
