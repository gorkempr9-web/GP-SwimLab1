import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { renderSafeTextChildren } from '@/components/SafeTextChildren';
import { colors, spacing } from '@/theme/tokens';

export function GradientHero({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <LinearGradient colors={['rgba(33, 230, 243, 0.18)', '#07233D', 'rgba(251, 191, 36, 0.10)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, style]}>
      <View pointerEvents="none" style={styles.lanes}>
        {[0, 1, 2].map((item) => <View key={item} style={[styles.lane, { left: `${24 + item * 22}%` }]} />)}
      </View>
      {renderSafeTextChildren(children)}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 148,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
    overflow: 'hidden',
    shadowColor: colors.cyan,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  lanes: { ...StyleSheet.absoluteFillObject, opacity: 0.07 },
  lane: { position: 'absolute', top: -20, bottom: -20, width: 1, backgroundColor: colors.text, transform: [{ rotate: '10deg' }] },
});
