import { Globe2, ShieldCheck } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { isOfficialTyfDomain, tyfOfficialLinks, TyfOfficialLink } from '@/services/federationCalendar';
import { colors, spacing, typography } from '@/theme/tokens';

const warning =
  'SwimLab, Türkiye Yüzme Federasyonu’nun resmi sistemi değildir. Resmi yarış başvuruları, lisans ve kulüp işlemleri TYF Portal üzerinden yapılmalıdır. SwimLab yalnızca resmi TYF sayfalarına yönlendirme sağlar.';

export default function TyfPortalScreen() {
  const openOfficialLink = async (link: TyfOfficialLink) => {
    if (!isOfficialTyfDomain(link.url)) return;
    await Linking.openURL(link.url);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <ShieldCheck color={colors.gold} size={30} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>TYF Panelleri</Text>
            <Text style={styles.subtitle}>Resmi TYF portal, takvim, sonuç ve baraj bağlantıları.</Text>
          </View>
        </View>

        <GlassCard style={styles.warningCard}>
          <Text style={styles.warningTitle}>Resmi işlem uyarısı</Text>
          <Text style={styles.warningText}>{warning}</Text>
        </GlassCard>

        <GlassCard style={styles.securityCard}>
          <Text style={styles.securityTitle}>Güvenlik</Text>
          <Text style={styles.securityText}>• Sadece tyf.gov.tr ve portal.tyf.gov.tr domainlerine izin verilir.</Text>
          <Text style={styles.securityText}>• TYF kullanıcı adı ve şifresi SwimLab içinde istenmez veya saklanmaz.</Text>
          <Text style={styles.securityText}>• Linkler cihaz tarayıcısında açılır.</Text>
        </GlassCard>

        {tyfOfficialLinks.map((link) => (
          <Pressable key={link.id} style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]} onPress={() => openOfficialLink(link)}>
            <View style={styles.linkCopy}>
              <Text style={styles.linkTitle}>{link.title}</Text>
              <Text style={styles.linkDescription}>{link.description}</Text>
              <Text style={styles.domain}>{link.url.replace('https://', '')}</Text>
            </View>
            <Globe2 color={colors.coral} size={22} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerIcon: { width: 58, height: 58, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(194, 65, 12, 0.24)', backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '800', marginTop: 4 },
  warningCard: { gap: spacing.sm, borderColor: 'rgba(194, 65, 12, 0.24)', backgroundColor: colors.goldSoft },
  warningTitle: { color: colors.gold, fontWeight: '900', fontSize: 18 },
  warningText: { color: colors.text, fontWeight: '800', lineHeight: 22 },
  securityCard: { gap: spacing.xs },
  securityTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  securityText: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 21 },
  linkButton: { minHeight: 86, borderRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  linkCopy: { flex: 1 },
  linkTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  linkDescription: { color: colors.mutedStrong, fontWeight: '700', lineHeight: 19, marginTop: 4 },
  domain: { color: colors.coral, fontWeight: '900', marginTop: 6 },
});
