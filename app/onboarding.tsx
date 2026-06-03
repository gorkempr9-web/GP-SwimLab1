import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BarChart3, Building2, Clock, Trophy } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppLogo } from '@/components/AppLogo';
import { useLocale } from '@/locales';
import { colors, gradients, spacing } from '@/theme/tokens';

const features = [
  { labelKey: 'onboardingFeatureRace', Icon: Trophy, tone: colors.coral },
  { labelKey: 'onboardingFeatureAnalysis', Icon: BarChart3, tone: colors.violet },
  { labelKey: 'onboardingFeatureClub', Icon: Building2, tone: colors.info },
  { labelKey: 'onboardingFeatureLive', Icon: Clock, tone: colors.success },
] as const;

export default function OnboardingScreen() {
  const { language, setLanguage, t } = useLocale();

  return (
    <LinearGradient colors={gradients.app} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.heroCard}>
            <AppLogo size={58} showSlogan={false} />
            <Text style={styles.tagline}>Train Beyond Limits</Text>
            <Text style={styles.quote}>{t('onboardingShortSubtitle')}</Text>
          </View>

          <View style={styles.featureGrid}>
            {features.map((feature) => (
              <Feature key={feature.labelKey} label={t(feature.labelKey)} Icon={feature.Icon} tone={feature.tone} />
            ))}
          </View>
        </View>

        <View style={styles.bottom}>
          <AppButton title={t('start')} onPress={() => router.push('/(auth)/login')} />
          <AppButton title={t('register')} variant="secondary" onPress={() => router.push('/(auth)/register')} />

          <View style={styles.links}>
            <Pressable onPress={() => setLanguage(language === 'tr' ? 'en' : 'tr')}>
              <Text style={styles.link}>TR / EN</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/features/privacy')}>
              <Text style={styles.link}>KVKK</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/features/privacy')}>
              <Text style={styles.link}>{t('privacy')}</Text>
            </Pressable>
          </View>
          <View style={styles.privacyLine}>
            <Text style={styles.privacyIcon}>✓</Text>
            <Text style={styles.privacyText}>{t('secureAthleteData')}</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Feature({ label, Icon, tone }: { label: string; Icon: LucideIcon; tone: string }) {
  return (
    <View style={[styles.feature, { borderColor: `${tone}38`, backgroundColor: `${tone}14` }]}>
      <View style={[styles.iconBadge, { backgroundColor: `${tone}20` }]}>
        <Icon color={tone} size={20} />
      </View>
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1, padding: spacing.lg, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  heroCard: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSolid,
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  tagline: { color: colors.coral, fontWeight: '900', fontSize: 22, textAlign: 'center' },
  quote: { color: colors.mutedStrong, fontWeight: '800', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  featureGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  feature: {
    width: '48%',
    minHeight: 94,
    borderRadius: 22,
    borderWidth: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSolid,
  },
  iconBadge: { width: 38, height: 38, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  featureText: { color: colors.text, fontWeight: '900', fontSize: 13, lineHeight: 18 },
  bottom: { gap: spacing.md, paddingBottom: spacing.sm },
  links: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.sm },
  link: { color: colors.text, fontWeight: '900', fontSize: 12 },
  privacyLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  privacyIcon: { color: colors.success, fontWeight: '900', fontSize: 14 },
  privacyText: { color: colors.muted, fontWeight: '800', fontSize: 12 },
});
