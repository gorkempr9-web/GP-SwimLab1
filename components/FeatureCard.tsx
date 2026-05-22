import { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

export function FeatureCard({ icon: Icon, title, subtitle, onPress }: { icon: LucideIcon; title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.icon}>
        <Icon color={colors.cyan} size={24} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  pressed: { opacity: 0.82 },
  icon: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#063451', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  title: { color: colors.text, fontWeight: '900', fontSize: 16 },
  subtitle: { color: colors.muted, marginTop: 4 },
});
