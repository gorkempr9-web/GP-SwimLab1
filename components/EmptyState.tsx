import { LucideIcon, Waves } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '@/components/GlassCard';
import { colors, spacing } from '@/theme/tokens';

export function EmptyState({ title, detail, icon: Icon = Waves, tone = colors.cyan }: { title: string; detail?: string; icon?: LucideIcon; tone?: string }) {
  return (
    <GlassCard style={styles.card} tone={tone}>
      <View style={[styles.iconBadge, { backgroundColor: `${tone}22` }]}>
        <Icon color={tone} size={26} strokeWidth={2.6} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  iconBadge: { width: 56, height: 56, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontWeight: '900', fontSize: 17, textAlign: 'center' },
  detail: { color: colors.mutedStrong, fontWeight: '700', textAlign: 'center', lineHeight: 20 },
});
