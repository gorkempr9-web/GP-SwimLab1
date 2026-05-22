import { Ban, ShieldAlert, ShieldCheck } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { colors, spacing, typography } from '@/theme/tokens';

const rules = [
  'Küfür, hakaret, aşağılama, alay ve sporcuya saldırı dili yasaktır.',
  'Nefret söylemi, şiddet çağrısı, taciz, cinsel içerik ve siber zorbalık yayınlanmaz.',
  'Doping teşviki ve kendine zarar verme yönlendirmesi engellenir.',
  '18 yaş altı sporcular için veli onayı ve güvenli topluluk kuralları geçerlidir.',
  'Direkt mesajlar varsayılan olarak kapalıdır.',
  'Şikayet edilen içerikler moderasyon kuyruğuna alınır.',
];

export default function CommunityRulesScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard style={styles.hero}>
          <ShieldCheck color={colors.cyan} size={42} />
          <Text style={styles.title}>Topluluk Kuralları</Text>
          <Text style={styles.subtitle}>GP SwimLab sporcu forumu güvenli, saygılı ve performans odaklı bir topluluk olarak yönetilir.</Text>
        </GlassCard>

        <GlassCard style={styles.warning}>
          <ShieldAlert color={colors.gold} size={24} />
          <Text style={styles.warningText}>Topluluk kurallarına aykırı içerik algılandığında gönderi yayınlanmaz ve kullanıcı uyarılır.</Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Yasak içerikler</Text>
          {rules.map((rule) => (
            <View key={rule} style={styles.ruleRow}>
              <Ban color={colors.danger} size={18} />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Moderasyon aksiyonları</Text>
          <Text style={styles.body}>Gönderiyi gizle, yorumu sil, kullanıcıyı sustur ve geçici engel aksiyonları mock moderasyon hazırlığı olarak forum modülünde yer alır.</Text>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  hero: { gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 22 },
  warning: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.goldSoft },
  warningText: { flex: 1, color: colors.text, lineHeight: 21, fontWeight: '700' },
  card: { gap: spacing.md },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  ruleRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  ruleText: { flex: 1, color: colors.mutedStrong, lineHeight: 21, fontWeight: '700' },
  body: { color: colors.muted, lineHeight: 22 },
});
