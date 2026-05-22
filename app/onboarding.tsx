import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppLogo } from '@/components/AppLogo';
import { useLocale } from '@/locales';
import { colors, gradients, spacing } from '@/theme/tokens';

const quote = 'Her kulaç bir gelişimdir.';

export default function OnboardingScreen() {
  const { language, setLanguage, t } = useLocale();

  return (
    <LinearGradient colors={gradients.app} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <AppLogo showSlogan={false} />
          <Text style={styles.tagline}>{t('brandTagline')}</Text>
          <Text style={styles.quote}>{quote}</Text>
        </View>

        <View style={styles.bottom}>
          <AppButton title="Giriş Yap" onPress={() => router.push('/(auth)/login')} />
          <AppButton title="Kayıt Ol" variant="secondary" onPress={() => router.push('/(auth)/register')} />

          <View style={styles.links}>
            <Pressable onPress={() => setLanguage(language === 'tr' ? 'en' : 'tr')}>
              <Text style={styles.link}>TR / EN</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/features/privacy')}>
              <Text style={styles.link}>KVKK</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/features/privacy')}>
              <Text style={styles.link}>Gizlilik</Text>
            </Pressable>
          </View>
          <View style={styles.privacyLine}>
            <ShieldCheck color={colors.cyan} size={15} />
            <Text style={styles.privacyText}>Güvenli sporcu verisi</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1, padding: spacing.lg, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  tagline: { color: colors.cyan, fontWeight: '900', fontSize: 16, textAlign: 'center' },
  quote: { color: colors.mutedStrong, fontWeight: '800', fontSize: 15, textAlign: 'center', marginTop: spacing.md },
  bottom: { gap: spacing.md, paddingBottom: spacing.sm },
  links: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.sm },
  link: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  privacyLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  privacyText: { color: colors.muted, fontWeight: '800', fontSize: 12 },
});
