import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Check, Lock, Mail, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { GlassCard } from '@/components/ui/GlassCard';
import { UserType } from '@/data/mockUser';
import { useLocale } from '@/locales';
import { startEmailVerification } from '@/services/emailAuth';
import { startPhoneVerification } from '@/services/phoneAuth';
import { roleFromUserType, useSession } from '@/services/session';
import { VerificationMethod } from '@/services/verification';
import { colors, spacing } from '@/theme/tokens';

const userTypes: UserType[] = ['Sporcu', 'Veli', 'Antrenör', 'Kulüp Yöneticisi'];

export default function LoginScreen() {
  const { t } = useLocale();
  const { setRole } = useSession();
  const [userType, setUserType] = useState<UserType>('Sporcu');
  const [method, setMethod] = useState<VerificationMethod>('email');
  const [email, setEmail] = useState('deniz@gpswimlab.demo');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+90');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!email.trim() && !phoneNumber.trim()) {
      setError(t('pleaseEnterEmailOrPhone'));
      return;
    }
    if (!password.trim()) {
      setError(t('pleaseEnterPassword'));
      return;
    }
    if (password.trim().length < 6) {
      setError(t('passwordMinLength'));
      return;
    }
    if (!userType) {
      setError(t('pleaseSelectUserType'));
      return;
    }
    if (!method) {
      setError(t('pleaseSelectVerificationMethod'));
      return;
    }
    if (method === 'email' && !email.trim()) {
      setError(t('pleaseEnterEmailOrPhone'));
      return;
    }
    if (method === 'phone' && !phoneNumber.trim()) {
      setError(t('pleaseEnterEmailOrPhone'));
      return;
    }

    setRole(roleFromUserType(userType));
    const session =
      method === 'email'
        ? await startEmailVerification({ email, userType })
        : await startPhoneVerification({ countryCode, phoneNumber, userType });

    setError('');
    router.push({ pathname: '/(auth)/otp', params: { method, verificationId: session.verificationId, target: session.target, maskedTarget: session.maskedTarget } });
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
              <Text style={styles.cardTitle}>{t('loginTitle')}</Text>
              <Text style={styles.cardSubtitle}>{t('loginSubtitle')}</Text>

              <View style={styles.inputBox}>
                {method === 'email' ? <Mail color={colors.cyan} size={20} /> : <Phone color={colors.cyan} size={20} />}
                {method === 'email' ? (
                  <TextInput placeholder={t('emailOrPhone')} placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
                ) : (
                  <View style={styles.phoneFields}>
                    <TextInput placeholder="+90" placeholderTextColor={colors.muted} value={countryCode} onChangeText={setCountryCode} style={styles.countryInput} />
                    <TextInput placeholder={t('phoneNumber')} placeholderTextColor={colors.muted} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" style={styles.input} />
                  </View>
                )}
              </View>

              <View style={styles.inputBox}>
                <Lock color={colors.cyan} size={20} />
                <TextInput placeholder={t('password')} placeholderTextColor={colors.muted} secureTextEntry={true} value={password} onChangeText={setPassword} style={styles.input} />
              </View>

              <Text style={styles.sectionLabel}>{t('userType')}</Text>
              <ChipGroup options={userTypes} value={userType} onChange={(value) => setUserType(value as UserType)} horizontal={true} />

              <Text style={styles.sectionLabel}>{t('verificationMethod')}</Text>
              <View style={styles.segmented}>
                <MethodButton label="SMS" value="phone" active={method === 'phone'} onPress={setMethod} />
                <MethodButton label={t('emailShort')} value="email" active={method === 'email'} onPress={setMethod} />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable onPress={handleSendCode}>
                <LinearGradient colors={['#21E6F3', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.loginButton}>
                  <Text style={styles.loginButtonText}>{t('loginButton')}</Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.footerLinks}>
                <Pressable onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.footerText}>{t('noAccount')} <Text style={styles.footerLink}>{t('register')}</Text></Text>
                </Pressable>
                <Pressable onPress={() => setError(t('forgotPasswordMock'))}>
                  <Text style={styles.forgot}>{t('forgotPassword')}</Text>
                </Pressable>
              </View>

              <Text style={styles.demoNote}>{t('demoLoginNoteShort')}</Text>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MethodButton({ label, value, active, onPress }: { label: string; value: VerificationMethod; active: boolean; onPress: (method: VerificationMethod) => void }) {
  return (
    <Pressable style={[styles.segment, active && styles.segmentActive]} onPress={() => onPress(value)}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ChipGroup({ options, value, onChange, horizontal = false }: { options: string[]; value: string; onChange: (value: string) => void; horizontal?: boolean }) {
  const content = options.map((option) => {
    const active = value === option;
    const label = option === 'Kulüp Yöneticisi' ? 'Kulüp' : option;
    return (
      <Pressable key={option} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressedChip]} onPress={() => onChange(option)}>
        {active ? <Check color={colors.text} size={14} /> : null}
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      </Pressable>
    );
  });

  return horizontal ? (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {content}
    </ScrollView>
  ) : (
    <View style={styles.chips}>{content}</View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  hero: { minHeight: 132, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, overflow: 'hidden' },
  loginCard: { gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 24 },
  cardSubtitle: { color: colors.muted, fontWeight: '700', lineHeight: 21 },
  inputBox: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '700' },
  phoneFields: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  countryInput: { width: 58, color: colors.text, fontWeight: '900', fontSize: 16 },
  sectionLabel: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  chips: { flexDirection: 'row', gap: spacing.sm },
  chip: { minHeight: 36, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: colors.glass, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan, shadowColor: colors.cyan, shadowOpacity: 0.16, shadowRadius: 10 },
  pressedChip: { transform: [{ scale: 0.98 }] },
  chipText: { color: colors.muted, fontWeight: '900' },
  chipTextActive: { color: colors.text },
  segmented: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: 3 },
  segment: { flex: 1, minHeight: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: colors.cyan },
  segmentText: { color: colors.muted, fontWeight: '900' },
  segmentTextActive: { color: colors.background },
  errorText: { color: colors.danger, fontWeight: '900' },
  loginButton: { minHeight: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center', shadowColor: colors.cyan, shadowOpacity: 0.28, shadowRadius: 14, elevation: 5 },
  loginButtonText: { color: colors.background, fontWeight: '900', fontSize: 16 },
  footerLinks: { alignItems: 'center', gap: spacing.sm },
  footerText: { color: colors.mutedStrong, fontWeight: '800' },
  footerLink: { color: colors.cyan, fontWeight: '900' },
  forgot: { color: colors.muted, fontWeight: '900' },
  demoNote: { color: colors.gold, fontWeight: '800', fontSize: 12, textAlign: 'center' },
});
