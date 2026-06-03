import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getClubProfile } from '@/services/clubProfile';
import { colors, spacing } from '@/theme/tokens';

type ClubLogoProps = {
  club?: string;
  size?: number;
  showName?: boolean;
  onPress?: () => void;
};

export function ClubLogo({ club = 'GP Aquatics', size = 42, showName = true, onPress }: ClubLogoProps) {
  const profile = getClubProfile(club);
  const content = (
    <>
      <View style={[styles.logo, { width: size, height: size, borderRadius: Math.max(14, size / 3) }]}>
        {profile.logoUri ? (
          <Image source={{ uri: profile.logoUri }} style={styles.image} />
        ) : (
          <View style={styles.fallbackMark}>
            <View style={[styles.wave, { width: size * 0.52 }]} />
            <View style={[styles.wave, styles.waveSecond, { width: size * 0.52 }]} />
            <Text style={[styles.logoText, { fontSize: Math.max(11, size * 0.22) }]}>{profile.logoLabel}</Text>
          </View>
        )}
      </View>
      {showName ? <Text style={styles.name} numberOfLines={1}>{profile.name}</Text> : null}
    </>
  );

  if (onPress) {
    return <Pressable style={styles.wrap} onPress={onPress}>{content}</Pressable>;
  }

  return <View style={styles.wrap}>{content}</View>;
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.cyanSoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  image: { width: '100%', height: '100%' },
  fallbackMark: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  wave: { height: 3, borderRadius: 999, backgroundColor: colors.cyan, transform: [{ rotate: '-8deg' }] },
  waveSecond: { opacity: 0.62, transform: [{ rotate: '8deg' }] },
  logoText: { color: colors.cyan, fontWeight: '900' },
  name: { color: colors.text, fontWeight: '900', flexShrink: 1 },
});
