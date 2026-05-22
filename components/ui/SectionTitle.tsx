import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  title: { color: colors.text, fontWeight: '900', fontSize: 18 },
  action: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
});
