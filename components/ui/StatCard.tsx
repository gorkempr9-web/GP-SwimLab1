import { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

export function StatCard({ title, value, detail, icon: Icon, tone = colors.cyan }: { title: string; value: string; detail: string; icon?: LucideIcon; tone?: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        {Icon ? (
          <View style={[styles.icon, { backgroundColor: `${tone}1A` }]}>
            <Icon color={tone} size={19} />
          </View>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
      <Text style={styles.detail} numberOfLines={1}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 94,
    borderRadius: 22,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 30, height: 30, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  value: { color: colors.text, fontWeight: '900', fontSize: 22 },
  detail: { color: colors.muted, fontWeight: '800', fontSize: 11 },
});
