import { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { AppLogo } from '@/components/AppLogo';
import { colors, spacing } from '@/theme/tokens';

export function EmptyState({ title, detail, icon: Icon }: { title: string; detail?: string; icon?: LucideIcon }) {
  return (
    <View style={styles.wrap}>
      {Icon ? (
        <View style={styles.icon}>
          <Icon color={colors.cyan} size={24} />
        </View>
      ) : <AppLogo compact={true} size={36} showTitle={false} />}
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.lg, alignItems: 'center', gap: spacing.sm },
  icon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontWeight: '900', textAlign: 'center' },
  detail: { color: colors.muted, fontWeight: '700', textAlign: 'center', lineHeight: 20 },
});
