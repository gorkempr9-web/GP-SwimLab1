import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/theme/tokens';

type AppLogoProps = {
  compact?: boolean;
  size?: number;
  showTitle?: boolean;
  showSlogan?: boolean;
  imageStyle?: StyleProp<ViewStyle>;
};

const swim = '#FFFFFF';
const lab = '#19E7FF';

export function AppLogo({ compact = false, size, showTitle = true, showSlogan = true, imageStyle }: AppLogoProps) {
  const markSize = size ?? (compact ? 22 : 34);

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={[styles.mark, { width: markSize, height: markSize * 0.72 }, imageStyle]}>
        <View style={[styles.wave, { width: markSize * 0.72, top: markSize * 0.2 }]} />
        <View style={[styles.wave, styles.waveSecond, { width: markSize * 0.72, top: markSize * 0.42 }]} />
      </View>

      {showTitle ? (
        <View style={styles.titleWrap}>
          <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={1}>
            <Text style={styles.swim}>Swim</Text>
            <Text style={styles.lab}>Lab</Text>
          </Text>
          {showSlogan ? <Text style={[styles.slogan, compact && styles.sloganCompact]} numberOfLines={1}>Train • Race • Improve</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderRadius: 18,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  wrapCompact: {
    gap: 5,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wave: {
    position: 'absolute',
    height: 3,
    borderRadius: 999,
    backgroundColor: lab,
    transform: [{ rotate: '-8deg' }],
  },
  waveSecond: {
    opacity: 0.72,
    transform: [{ rotate: '8deg' }],
  },
  titleWrap: { alignItems: 'flex-start', justifyContent: 'center' },
  title: { fontWeight: '900', fontSize: 28, letterSpacing: 0 },
  titleCompact: { fontSize: 16 },
  swim: { color: swim },
  lab: { color: lab },
  slogan: { color: colors.mutedStrong, fontWeight: '900', fontSize: 11, letterSpacing: 0, marginTop: 2 },
  sloganCompact: { fontSize: 8 },
});
