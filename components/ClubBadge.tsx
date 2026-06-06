import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

export function ClubBadge({ club, city, compact = false }: { club?: string; city?: string; compact?: boolean }) {
  const label = getClubInitials(club);
  return (
    <View style={[styles.badge, compact && styles.compact]}>
      <View style={[styles.textBadge, compact && styles.textBadgeCompact]}>
        <Text style={[styles.badgeText, compact && styles.badgeTextCompact]}>{label}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.club} numberOfLines={1}>{club ?? 'SwimLab Pilot'}</Text>
        {city ? <Text style={styles.city} numberOfLines={1}>{city}</Text> : null}
      </View>
    </View>
  );
}

function getClubInitials(club?: string) {
  if (!club?.trim()) return 'SL';
  const parts = club.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 3).map((part) => part[0]?.toLocaleUpperCase('tr-TR')).join('');
  return initials || 'SL';
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
  textBadge: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSolid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBadgeCompact: { width: 28, height: 28, borderRadius: 10 },
  badgeText: { color: colors.text, fontWeight: '900', fontSize: 13 },
  badgeTextCompact: { fontSize: 10 },
  copy: { flex: 1, minWidth: 0 },
  club: { color: colors.text, fontWeight: '900' },
  city: { color: colors.mutedStrong, fontWeight: '800', fontSize: 12, marginTop: 2 },
});
