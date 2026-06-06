import { StyleSheet, Text, View } from 'react-native';
import { ClubLogo } from '@/components/ClubLogo';
import { colors, spacing } from '@/theme/tokens';

export function ClubBadge({ club, city, compact = false }: { club?: string; city?: string; compact?: boolean }) {
  return (
    <View style={[styles.badge, compact && styles.compact]}>
      <ClubLogo club={club} size={compact ? 28 : 42} />
      <View style={styles.copy}>
        <Text style={styles.club} numberOfLines={1}>{club ?? 'SwimLab Pilot'}</Text>
        {city ? <Text style={styles.city} numberOfLines={1}>{city}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 58,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cyanSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  compact: { minHeight: 44, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  copy: { flex: 1, minWidth: 0 },
  club: { color: colors.text, fontWeight: '900' },
  city: { color: colors.mutedStrong, fontWeight: '800', fontSize: 12, marginTop: 2 },
});
