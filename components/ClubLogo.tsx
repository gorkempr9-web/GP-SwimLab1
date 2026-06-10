import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getClubProfile } from '@/services/clubProfile';
import { colors, spacing } from '@/theme/tokens';

type ClubLogoProps = {
  club?: string;
  size?: number;
  showName?: boolean;
  onPress?: () => void;
};

export function ClubLogo({ club, size = 42, showName = true, onPress }: ClubLogoProps) {
  const profile = getClubProfile(club);
  const label = club ? profile.logoLabel : 'K';
  const content = (
    <>
      <View style={[styles.logo, { width: size, height: size, borderRadius: Math.max(14, size / 3) }]}>
        {profile.logoUri ? (
          <Image source={{ uri: profile.logoUri }} style={styles.image} />
        ) : (
          <View style={styles.fallbackMark}>
            <Text style={[styles.logoText, { fontSize: Math.max(12, size * 0.28) }]}>{label}</Text>
          </View>
        )}
      </View>
      {showName ? <Text style={styles.name} numberOfLines={1}>{club ? profile.name : 'SwimLab Pilot'}</Text> : null}
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
  fallbackMark: { alignItems: 'center', justifyContent: 'center' },
  logoText: { color: colors.text, fontWeight: '900' },
  name: { color: colors.text, fontWeight: '900', flexShrink: 1 },
});
