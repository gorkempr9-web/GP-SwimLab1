import { Image, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';

const logoDark = require('@/assets/branding/logo-dark.png');
const logoLight = require('@/assets/branding/logo-light.png');
const splashLogo = require('@/assets/branding/splash-logo.png');

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
  const useSplashLockup = showSlogan && !compact;
  const source = useSplashLockup ? splashLogo : theme === 'light' ? logoLight : logoDark;
  const logoWidth = Math.round(logoHeight * (useSplashLockup ? 1 : 3));

  return (
    <View style={styles.wrap}>
      <Image
        source={source}
        resizeMode="contain"
        onError={(event) => {
          console.error('[BRANDING] SwimLab logo asset could not be loaded', event.nativeEvent);
        }}
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
