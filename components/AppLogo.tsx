import { Image, ImageStyle, StyleProp, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';

type AppLogoProps = {
  compact?: boolean;
  size?: number;
  showTitle?: boolean;
  showSlogan?: boolean;
  imageStyle?: StyleProp<ImageStyle>;
};

const logoSource = require('@/assets/logo/gpswimlab-logo.png');

export function AppLogo({ compact = false, size, showTitle = true, showSlogan = false, imageStyle }: AppLogoProps) {
  const markSize = size ?? (compact ? 40 : 110);

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Image source={logoSource} resizeMode="contain" style={[styles.mark, { width: markSize, height: markSize }, imageStyle]} />
      {showTitle ? (
        <View style={compact ? styles.titleWrapCompact : styles.titleWrap}>
          <Text style={[styles.title, compact && styles.titleCompact]}>GP SwimLab</Text>
          {showSlogan ? <Text style={styles.slogan}>Train - Analyze - Perform</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  wrapCompact: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    shadowColor: colors.cyan,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  titleWrap: { alignItems: 'center', gap: 4 },
  titleWrapCompact: { alignItems: 'flex-start' },
  title: { color: colors.text, fontWeight: '900', fontSize: 30, letterSpacing: 0 },
  titleCompact: { fontSize: 15 },
  slogan: { color: colors.cyan, fontWeight: '900', fontSize: 12, letterSpacing: 0 },
});
