import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Lock, Mail, ShieldCheck, User } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLocale } from '@/locales';
import { createDemoUser, DemoLoginRole, getCurrentUser, isDemoLoginEnabled, loginWithMockCredentials, validateDemoAccessCodeAsync } from '@/services/auth';
import { InviteCodeRecord, redeemInviteCode } from '@/services/invitations';
import { useSession } from '@/services/session';
import { colors, spacing } from '@/theme/tokens';

const demoOptions: Array<{ role: DemoLoginRole; labelKey: 'athleteDemo' | 'parentDemo' | 'coachDemo' | 'clubManagerDemo' | 'adminDemo' }> = [
  { role: 'athlete', labelKey: 'athleteDemo' },
  { role: 'parent', labelKey: 'parentDemo' },
  { role: 'coach', labelKey: 'coachDemo' },
  { role: 'club_admin', labelKey: 'clubManagerDemo' },
  { role: 'super_admin', labelKey: 'adminDemo' },
];

export default function LoginScreen() {
  const { t } = useLocale();
  const { setCurrentUserProfile } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [demoAccessCode, setDemoAccessCode] = useState('');
  const [demoUnlockedRole, setDemoUnlockedRole] = useState<DemoLoginRole | null>(null);
  const [demoInviteRecord, setDemoInviteRecord] = useState<InviteCodeRecord | null>(null);
  const [showDemoOptions, setShowDemoOptions] = useState(false);
  const demoEnabled = isDemoLoginEnabled();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Giriş bilgileri hatalı');
      return;
    }

    const result = await loginWithMockCredentials(username, password);
    if (!result.success) {
      setError(result.message);
      return;
    }

    const storedUser = await getCurrentUser();
    const user = storedUser?.id === result.user.id ? { ...result.user, ...storedUser } : result.user;
    setCurrentUserProfile(user);
    setError('');
    router.replace(user.profileCreated ? (user.hasSeenAppGuide ? '/(tabs)/dashboard' : '/onboarding-guide') : '/(auth)/create-profile');
  };

  const unlockDemoOptions = async () => {
    const access = await validateDemoAccessCodeAsync(demoAccessCode);
    if (!access.valid) {
      setShowDemoOptions(false);
      setDemoUnlockedRole(null);
      setDemoInviteRecord(null);
      setError(t('demoAccessCodeInvalid'));
      return;
    }

    setError('');
    setDemoUnlockedRole(access.unlockedRole);
    setDemoInviteRecord(access.record ?? null);
    setShowDemoOptions(true);
  };

  const handleDemoLogin = async (role: DemoLoginRole) => {
    const access = await redeemInviteCode(demoAccessCode, role);
    if (!access.valid) {
      setError(access.message === 'Bu kod seçilen rol için geçerli değildir.' ? t('demoCodeRoleMismatch') : access.message);
      return;
    }

    const user = createDemoUser(role, undefined, access.record);
    setCurrentUserProfile(user);
    setError('');
    router.replace(role === 'super_admin' ? '/(tabs)/dashboard' : '/(auth)/create-profile');
  };

  return (
    <LinearGradient colors={['#020A14', '#021526', '#06233C']} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <AppLogo size={110} showSlogan={true} />
            </View>

            <GlassCard style={styles.loginCard}>
              <Text style={styles.cardTitle}>Pilot Giriş</Text>
              <Text style={styles.cardSubtitle}>SwimLab pilot alanına yalnızca izin verilen kullanıcılar giriş yapabilir.</Text>

              <View style={styles.inputBox}>
                <Mail color={colors.cyan} size={20} />
                <TextInput placeholder="Kullanıcı adı veya e-posta" placeholderTextColor={colors.muted} value={username} onChangeText={setUsername} autoCapitalize="none" style={styles.input} />
              </View>

              <View style={styles.inputBox}>
                <Lock color={colors.cyan} size={20} />
                <TextInput placeholder="Şifre" placeholderTextColor={colors.muted} secureTextEntry={true} value={password} onChangeText={setPassword} style={styles.input} />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable onPress={handleLogin}>
                <LinearGradient colors={['#21E6F3', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.loginButton}>
                  <Text style={styles.loginButtonText}>Giriş Yap</Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.footerLinks}>
                <Pressable onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.footerText}>Hesabın yok mu? <Text style={styles.footerLink}>Davet kodu ile kayıt ol</Text></Text>
                </Pressable>
              </View>
            </GlassCard>

            {demoEnabled ? (
              <GlassCard style={styles.demoCard}>
                <View style={styles.demoHeader}>
                  <ShieldCheck color={colors.gold} size={22} />
                  <View style={styles.demoHeaderText}>
                    <Text style={styles.demoTitle}>{t('demoLogin')}</Text>
                    <Text style={styles.demoSubtitle}>{t('demoLoginDescription')}</Text>
                  </View>
                </View>
                <Text style={styles.demoWarning}>{t('demoLoginWarning')}. Gerçek kullanıcı verisi oluşturmaz.</Text>
                <TextInput
                  placeholder={t('enterDemoAccessCode')}
                  placeholderTextColor={colors.muted}
                  value={demoAccessCode}
                  onChangeText={(value) => {
                    setDemoAccessCode(value.toUpperCase());
                    setShowDemoOptions(false);
                    setDemoUnlockedRole(null);
                    setDemoInviteRecord(null);
                  }}
                  autoCapitalize="characters"
                  style={styles.demoCodeInput}
                />
                {showDemoOptions && demoInviteRecord ? <Text style={styles.demoWarning}>{demoInviteRecord.clubName} • {demoInviteRecord.role}</Text> : null}
                <Pressable style={styles.demoToggle} onPress={unlockDemoOptions}>
                  <User color={colors.background} size={18} />
                  <Text style={styles.demoToggleText}>{t('demoLogin')}</Text>
                </Pressable>
                {showDemoOptions ? (
                  <View style={styles.demoGrid}>
                    {demoOptions.filter((option) => !demoUnlockedRole || option.role === demoUnlockedRole).map((option) => (
                      <Pressable key={option.role} style={styles.demoOption} onPress={() => handleDemoLogin(option.role)}>
                        <Text style={styles.demoOptionText}>{t(option.labelKey)}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </GlassCard>
            ) : null}

            <Text style={styles.demoNote}>Bu sistem yalnızca pilot/demo mock giriş içindir. Üretim sürümünde Firebase Auth veya backend auth ile değiştirilecektir.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  hero: { minHeight: 132, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, overflow: 'hidden' },
  loginCard: { gap: spacing.md },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 24 },
  cardSubtitle: { color: colors.muted, fontWeight: '700', lineHeight: 21 },
  inputBox: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '700' },
  errorText: { color: colors.danger, fontWeight: '900' },
  loginButton: { minHeight: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center', shadowColor: colors.cyan, shadowOpacity: 0.28, shadowRadius: 14, elevation: 5 },
  loginButtonText: { color: colors.background, fontWeight: '900', fontSize: 16 },
  footerLinks: { alignItems: 'center', gap: spacing.sm },
  footerText: { color: colors.mutedStrong, fontWeight: '800', textAlign: 'center' },
  footerLink: { color: colors.cyan, fontWeight: '900' },
  demoCard: { gap: spacing.md },
  demoHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  demoHeaderText: { flex: 1, gap: 2 },
  demoTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  demoSubtitle: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 19 },
  demoWarning: { color: colors.gold, fontWeight: '900', lineHeight: 19 },
  demoCodeInput: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '900' },
  demoToggle: { minHeight: 48, borderRadius: 16, backgroundColor: colors.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  demoToggleText: { color: colors.background, fontWeight: '900' },
  demoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  demoOption: { width: '48%', minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, alignItems: 'center', justifyContent: 'center', padding: spacing.sm },
  demoOptionText: { color: colors.text, fontWeight: '900', textAlign: 'center' },
  demoNote: { color: colors.gold, fontWeight: '800', fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
