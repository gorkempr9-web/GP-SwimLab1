import { LucideIcon } from 'lucide-react-native';
import { Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

type Props = PressableProps & {
  title: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
};

export function AppButton({ title, icon: Icon, variant = 'primary', style, ...props }: Props) {
  return (
    <Pressable
      style={(state) => [
        styles.button,
        variant === 'secondary' && styles.secondary,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      <Text style={[styles.title, variant === 'secondary' && styles.secondaryTitle]}>{title}</Text>
      {Icon ? (
        <View style={styles.iconBox}>
          <Icon color={colors.background} size={20} strokeWidth={2.6} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: colors.cyan,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  secondary: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  title: { color: colors.background, fontWeight: '900', fontSize: 16 },
  secondaryTitle: { color: colors.text },
  iconBox: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(3, 27, 47, 0.12)', alignItems: 'center', justifyContent: 'center' },
});
