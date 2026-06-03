import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';

export function SectionHeader({ title, action, tone = colors.cyan }: { title: string; action?: ReactNode; tone?: string }) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: tone }]} />
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.line, { backgroundColor: `${tone}35` }]} />
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.sm },
  dot: { width: 9, height: 9, borderRadius: 999 },
  title: { ...typography.h2, color: colors.text },
  line: { flex: 1, height: 1 },
});
