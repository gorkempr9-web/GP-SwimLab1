import { Image, ImageStyle, StyleProp, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';

const logoDark = require('@/assets/branding/logo-dark.png');
const appIcon = require('@/assets/branding/app-icon.png');

type AppLogoProps = {
  compact?: boolean;
  size?: number;
  showTitle?: boolean;
  showSlogan?: boolean;
  imageStyle?: StyleProp<ImageStyle>;
};

export function AppLogo({ compact = false, size, showTitle = true, showSlogan = true, imageStyle }: AppLogoProps) {
  const markSize = size ?? (compact ? 26 : 44);
  const logoWidth = showTitle ? Math.max(markSize * (compact ? 3.8 : 4.6), 120) : markSize;
  const logoHeight = showTitle ? Math.max(markSize * 1.05, 42) : markSize;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Image
        source={showTitle ? logoDark : appIcon}
        resizeMode="contain"
        style={[styles.logo, { width: logoWidth, height: logoHeight }, !showTitle && { borderRadius: Math.max(10, markSize * 0.22) }, imageStyle]}
      />
      {showTitle && showSlogan ? <Text style={[styles.slogan, compact && styles.sloganCompact]} numberOfLines={1}>Train Beyond Limits</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  wrapCompact: {
    alignItems: 'flex-start',
    gap: 0,
  },
  logo: {
    overflow: 'hidden',
  },
  slogan: { color: colors.coral, fontWeight: '900', fontSize: 11, letterSpacing: 0, marginTop: -2 },
  sloganCompact: { fontSize: 8 },
});
