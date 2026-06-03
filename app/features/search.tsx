import { BarChart3, Lock, Search, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { getPublicAthleteProfiles } from '@/services/clubCompetition';
import { canManageClub, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

export default function SearchScreen() {
  const { currentUser } = useSession();
  const [query, setQuery] = useState('');
  const profiles = useMemo(() => getPublicAthleteProfiles(query), [query]);
  const canSeeClubDetail = canManageClub(currentUser.role);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Search color={colors.coral} size={28} />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Sporcu Ara</Text>
            <Text style={styles.subtitle}>Kulüpler arası derece araması yalnız herkese açık performans bilgilerini gösterir.</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search color={colors.coral} size={18} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Sporcu adı veya soyadı ara" placeholderTextColor={colors.muted} style={styles.searchInput} />
        </View>

        <View style={styles.privacyNote}>
          <Lock color={colors.gold} size={16} />
          <Text style={styles.privacyText}>Telefon, e-posta, veli bilgisi, sağlık verisi, beslenme bilgisi ve özel antrenör notları gösterilmez.</Text>
        </View>

        {profiles.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Arama sonucu yok"
            detail={query.trim() ? 'Bu arama için herkese açık derece profili bulunamadı.' : 'Sporcu adı veya soyadı yazarak herkese açık derece profillerini arayabilirsin.'}
          />
        ) : null}

        {profiles.map((profile) => (
          <GlassCard key={profile.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.meta}>{profile.club} • {profile.category}</Text>
              </View>
              <Text style={styles.publicBadge}>Herkese Açık Derece Profili</Text>
            </View>
            <View style={styles.statRow}>
              <MiniStat label="Dereceler" value={`${profile.results.length}`} />
              <MiniStat label="PB" value={`${profile.pbs.length}`} />
              <MiniStat label="Son yarış" value={profile.results[0]?.finalTime ?? '-'} />
            </View>
            {profile.results.slice(0, 3).map((result) => (
              <View key={result.id} style={styles.resultRow}>
                <BarChart3 color={colors.coral} size={16} />
                <Text style={styles.resultText}>{result.date} • {result.eventName} • {result.finalTime}{result.isPB ? ' • Yeni PB' : ''}</Text>
              </View>
            ))}
            {canSeeClubDetail && profile.canOpenDetail ? <Text style={styles.detailHint}>Kulüp içi detay görünümü Sporcularım ekranında kullanılabilir.</Text> : null}
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerCopy: { flex: 1 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', marginTop: 4, lineHeight: 21 },
  searchBox: { minHeight: 48, borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchInput: { flex: 1, color: colors.text, fontWeight: '800' },
  privacyNote: { flexDirection: 'row', gap: spacing.sm, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(194, 65, 12, 0.22)', backgroundColor: colors.goldSoft, padding: spacing.md },
  privacyText: { color: colors.mutedStrong, fontWeight: '800', flex: 1, lineHeight: 19 },
  card: { gap: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, alignItems: 'flex-start' },
  name: { color: colors.text, fontWeight: '900', fontSize: 18 },
  meta: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4 },
  publicBadge: { color: colors.coral, fontWeight: '900', backgroundColor: colors.coralSoft, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6, fontSize: 10, maxWidth: 128, textAlign: 'center' },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  miniStat: { flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, padding: spacing.sm },
  miniLabel: { color: colors.muted, fontWeight: '900', fontSize: 11 },
  miniValue: { color: colors.text, fontWeight: '900', marginTop: 5 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  resultText: { color: colors.mutedStrong, fontWeight: '800', flex: 1, lineHeight: 19 },
  detailHint: { color: colors.gold, fontWeight: '800' },
});
