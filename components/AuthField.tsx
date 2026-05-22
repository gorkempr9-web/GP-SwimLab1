import { LucideIcon } from 'lucide-react-native';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

type Props = TextInputProps & {
  icon: LucideIcon;
};

export function AuthField({ icon: Icon, ...props }: Props) {
  return (
    <View style={styles.field}>
      <Icon color={colors.cyan} size={20} />
      <TextInput placeholderTextColor={colors.muted} style={styles.input} autoCapitalize="none" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  input: { flex: 1, color: colors.text, fontSize: 16 },
});
