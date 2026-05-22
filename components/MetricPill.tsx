import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

export function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flex: 1, backgroundColor: '#061F35', borderRadius: 16, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  value: { color: colors.text, fontWeight: '900', fontSize: 16 },
  label: { color: colors.muted, marginTop: 3, fontSize: 11, fontWeight: '700' },
});
