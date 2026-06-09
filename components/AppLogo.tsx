import { Image, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';

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
  const logoHeight = size ?? (compact ? 34 : 68);
  const source = theme === 'light' ? logoLight : logoDark;
  const logoWidth = Math.round(logoHeight * (showTitle || showSlogan ? 3.4 : 3.0));

  return (
    <View style={styles.wrap}>
      <Image
        source={source}
        resizeMode="contain"
        style={[styles.logo, { width: logoWidth, height: logoHeight }, imageStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  logo: {
    flexShrink: 0,
    overflow: 'visible',
  },
});
