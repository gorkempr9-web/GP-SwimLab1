import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { renderSafeTextChildren } from '@/components/SafeTextChildren';
import { colors, spacing } from '@/theme/tokens';

export function GlassCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{renderSafeTextChildren(children)}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
    shadowColor: '#2379FF',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
});
