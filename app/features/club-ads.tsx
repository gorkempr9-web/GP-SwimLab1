import { CheckCircle2, Megaphone, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClubLogo } from '@/components/ClubLogo';
import { GlassCard } from '@/components/GlassCard';
import { clubAds, setMockClubLogo } from '@/services/clubProfile';
import { canManageClub, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

export default function ClubAdsScreen() {
  const { currentUser } = useSession();
  const canEdit = canManageClub(currentUser.role);
  const [logoSelected, setLogoSelected] = useState(false);
  const [title, setTitle] = useState('Yeni kulüp kampanyası');
  const [description, setDescription] = useState('Kısa duyuru metni');
  const [active, setActive] = useState(true);
  const visibleAds = clubAds.filter((ad) => ad.club === (currentUser.club ?? 'GP Aquatics'));

  const handleLogoMock = () => {
    setLogoSelected(true);
    setMockClubLogo('mock-local-logo');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Kulüp Reklam Paneli</Text>
        <Text style={styles.subtitle}>Sponsor, kampanya ve kulüp duyuruları sade kartlar halinde görünür.</Text>

        <GlassCard style={styles.logoCard}>
          <ClubLogo club={currentUser.club} size={54} />
          {canEdit ? (
            <Pressable style={styles.logoButton} onPress={handleLogoMock}>
              <Plus color={colors.background} size={17} />
              <Text style={styles.logoButtonText}>{logoSelected ? 'Logo seçildi' : 'Logo Yükle'}</Text>
            </Pressable>
          ) : null}
        </GlassCard>

        {canEdit ? (
          <GlassCard style={styles.form}>
            <Text style={styles.cardTitle}>Sponsor / kampanya kartı</Text>
            <View style={styles.imageMock}>
              <Plus color={colors.cyan} size={22} />
              <Text style={styles.imageMockText}>Görsel alanı</Text>
            </View>
            <TextInput value={title} onChangeText={setTitle} placeholder="Başlık" placeholderTextColor={colors.muted} style={styles.input} />
            <TextInput value={description} onChangeText={setDescription} placeholder="Açıklama" placeholderTextColor={colors.muted} style={[styles.input, styles.textArea]} multiline={true} />
            <View style={styles.dateRow}>
              <Text style={styles.datePill}>Başlangıç: 24.05.2026</Text>
              <Text style={styles.datePill}>Bitiş: 30.06.2026</Text>
            </View>
            <Pressable style={styles.activeRow} onPress={() => setActive((value) => !value)}>
              {active ? <CheckCircle2 color={colors.success} size={24} /> : <X color={colors.muted} size={24} />}
              <Text style={styles.activeText}>{active ? 'Aktif' : 'Pasif'}</Text>
            </Pressable>
          </GlassCard>
        ) : null}

        {visibleAds.map((ad) => (
          <GlassCard key={ad.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Megaphone color={colors.gold} size={24} />
              <Text style={styles.status}>{ad.active ? 'Aktif' : 'Pasif'}</Text>
            </View>
            <Text style={styles.cardTitle}>{ad.title}</Text>
            <Text style={styles.body}>{ad.description}</Text>
            <Text style={styles.meta}>{ad.sponsor} • {ad.startDate} - {ad.endDate}</Text>
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, marginBottom: spacing.sm, fontWeight: '700', lineHeight: 21 },
  logoCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  logoButton: { minHeight: 42, borderRadius: 14, backgroundColor: colors.cyan, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoButtonText: { color: colors.background, fontWeight: '900' },
  form: { gap: spacing.md },
  imageMock: { minHeight: 96, borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  imageMockText: { color: colors.cyan, fontWeight: '900' },
  input: { minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '800' },
  textArea: { minHeight: 82, textAlignVertical: 'top', paddingTop: spacing.md },
  dateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  datePill: { color: colors.mutedStrong, fontWeight: '800', borderRadius: 999, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: 7 },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  activeText: { color: colors.text, fontWeight: '900' },
  card: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: { color: colors.success, fontWeight: '900' },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 19 },
  body: { color: colors.mutedStrong, lineHeight: 22, fontWeight: '700' },
  meta: { color: colors.muted, fontWeight: '800' },
});
