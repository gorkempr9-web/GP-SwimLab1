import { Image, ImageStyle, StyleProp, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';

const logoDark = require('@/assets/branding/logo-dark.png');
const logoLight = require('@/assets/branding/logo-light.png');

type AppLogoProps = {
  compact?: boolean;
  size?: number;
  showTitle?: boolean;
  showSlogan?: boolean;
  theme?: 'dark' | 'light';
  imageStyle?: StyleProp<ImageStyle>;
};

export function AppLogo({ compact = false, size, showTitle = true, showSlogan = true, theme = 'dark', imageStyle }: AppLogoProps) {
  const markSize = size ?? (compact ? 26 : 44);
  const logoWidth = Math.max(markSize * (compact ? 3.8 : 4.6), 120);
  const logoHeight = Math.max(markSize * 1.05, 42);

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Image
        source={theme === 'light' ? logoLight : logoDark}
        resizeMode="contain"
        style={[styles.logo, { width: logoWidth, height: logoHeight }, imageStyle]}
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
