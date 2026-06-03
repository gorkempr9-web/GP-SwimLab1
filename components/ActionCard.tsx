import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { DimensionValue, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/theme/tokens';

export function ActionCard({
  title,
  detail,
  icon: Icon,
  tone = colors.cyan,
  width = '48%',
  onPress,
}: {
  title: string;
  detail?: string;
  icon: LucideIcon;
  tone?: string;
  width?: DimensionValue;
  onPress?: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.wrapper, { width }, pressed && onPress && styles.pressed]} onPress={onPress} disabled={!onPress}>
      <LinearGradient colors={[`${tone}20`, colors.surfaceSolid]} style={[styles.card, { borderColor: `${tone}55`, shadowColor: tone }]}>
        <View style={[styles.iconBadge, { backgroundColor: `${tone}24` }]}>
          <Icon color={tone} size={24} strokeWidth={2.7} />
        </View>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {detail ? <Text style={styles.detail} numberOfLines={2}>{detail}</Text> : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { minHeight: 132 },
  card: {
    flex: 1,
    minHeight: 132,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
    justifyContent: 'space-between',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  iconBadge: { width: 46, height: 46, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontWeight: '900', fontSize: 16, lineHeight: 20 },
  detail: { color: colors.mutedStrong, fontWeight: '700', fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] },
});
