import { LucideIcon } from 'lucide-react-native';
import { Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

type Props = PressableProps & {
  title: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'danger';
};

export function AppButton({ title, icon: Icon, variant = 'primary', style, ...props }: Props) {
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';

  return (
    <Pressable
      style={(state) => [
        styles.button,
        isSecondary && styles.secondary,
        isDanger && styles.danger,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {Icon ? (
        <View style={[styles.iconBox, (isSecondary || isDanger) && styles.iconBoxSoft]}>
          <Icon color={isSecondary ? colors.cyan : isDanger ? colors.danger : colors.background} size={18} strokeWidth={2.7} />
        </View>
      ) : null}
      <Text style={[styles.title, (isSecondary || isDanger) && styles.softTitle, isDanger && styles.dangerTitle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: colors.cyan,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: colors.cyan,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  secondary: {
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.42)',
  },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  title: { color: colors.background, fontWeight: '900', fontSize: 15 },
  softTitle: { color: colors.text },
  dangerTitle: { color: colors.danger },
  iconBox: { width: 28, height: 28, borderRadius: 10, backgroundColor: 'rgba(2, 21, 38, 0.12)', alignItems: 'center', justifyContent: 'center' },
  iconBoxSoft: { backgroundColor: colors.glass },
});
