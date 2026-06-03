import { LucideIcon } from 'lucide-react-native';
import { DimensionValue, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/theme/tokens';

export function ModuleButton({
  title,
  icon: Icon,
  width,
  compact,
  tone = colors.cyan,
  onPress,
}: {
  title: string;
  icon: LucideIcon;
  width: DimensionValue;
  compact?: boolean;
  tone?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.card, { width, height: compact ? 68 : 76, borderColor: `${tone}55`, shadowColor: tone }, pressed && styles.pressed]} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: `${tone}22` }]}>
        <Icon color={tone} size={compact ? 18 : 20} strokeWidth={2.5} />
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: spacing.xs,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.text, fontWeight: '900', fontSize: 12, textAlign: 'center' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
