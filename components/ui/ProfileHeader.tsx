import { UserCircle } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';
import { GlassCard } from './GlassCard';

export function ProfileHeader({ name, role, club, category }: { name: string; role: string; club: string; category: string }) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.avatar}>
        <UserCircle color={colors.cyan} size={72} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.role}>{role}</Text>
      <Text style={styles.meta}>{club} • {category}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.sm },
  avatar: { width: 112, height: 112, borderRadius: 34, backgroundColor: colors.surfaceSolid, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderStrong },
  name: { ...typography.h1, color: colors.text, textAlign: 'center', marginTop: spacing.sm },
  role: { color: colors.gold, fontWeight: '900', textAlign: 'center' },
  meta: { color: colors.mutedStrong, textAlign: 'center', fontWeight: '800' },
});
