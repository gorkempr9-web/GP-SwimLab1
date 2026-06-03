import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '@/theme/tokens';

export function GlassCard({ children, style, tone = colors.cyan }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; tone?: string }>) {
  return (
    <LinearGradient colors={[`${tone}18`, colors.surface, colors.surfaceSolid]} style={[styles.card, { borderColor: `${tone}50`, shadowColor: tone }, style]}>
      <View style={[styles.topGlow, { backgroundColor: tone }]} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.md,
    overflow: 'hidden',
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 3,
  },
  topGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    opacity: 0.85,
  },
});
