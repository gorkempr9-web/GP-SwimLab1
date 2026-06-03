import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Building2, Check, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppLogo } from '@/components/AppLogo';
import { AuthField } from '@/components/AuthField';
import { GlassCard } from '@/components/ui/GlassCard';
import { UserType } from '@/data/mockUser';
import { useLocale } from '@/locales';
import { registerWithInviteCode } from '@/services/auth';
import { validateInviteCode } from '@/services/invitations';
import { startEmailVerification } from '@/services/emailAuth';
import { startPhoneVerification } from '@/services/phoneAuth';
import { roleFromUserType, useSession } from '@/services/session';
import { VerificationMethod } from '@/services/verification';
import { colors, spacing } from '@/theme/tokens';

const userTypes: UserType[] = ['Sporcu', 'Veli', 'Antrenör', 'Kulüp Yöneticisi'];
const countryCodes = ['+90', '+1', '+44', '+49'];

export default function RegisterScreen() {
  const { t } = useLocale();
  const { setCurrentUserProfile } = useSession();
  const [fullName, setFullName] = useState('');
  const [club, setClub] = useState('');
  const [childName, setChildName] = useState('');
  const [password, setPassword] = useState('');
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [explicitConsent, setExplicitConsent] = useState(false);
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [userType, setUserType] = useState<UserType>('Sporcu');
  const [age, setAge] = useState('');
  const [method, setMethod] = useState<VerificationMethod>('phone');
  const [countryCode, setCountryCode] = useState('+90');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  const athleteAge = Number(age);
  const isUnder18Athlete = userType === 'Sporcu' && age.trim() !== '' && !Number.isNaN(athleteAge) && athleteAge < 18;

  const validateBase = () => {
    const invite = validateInviteCode(inviteCode);
    if (!invite.valid) return invite.message;
    if (!fullName.trim()) return t('fullNameRequired');
    if (!email.trim() && !phoneNumber.trim()) return t('emailOrPhoneRequired');
    if (!password.trim()) return t('passwordRequired');
    if (password.trim().length < 6) return t('passwordMinLength');
    if (!kvkkAccepted || !explicitConsent) return t('consentRequired');
    return '';
  };

  const handleStartVerification = async () => {
    const baseError = validateBase();
    if (baseError) {
      setError(baseError);
      return;
    }
    if (method === 'phone' && !phoneNumber.trim()) {
      setError(t('phoneRequired'));
      return;
    }
    if (method === 'email' && !email.trim()) {
      setError(t('emailRequired'));
      return;
    }

    const registerResult = await registerWithInviteCode(
      {
        fullName,
        role: roleFromUserType(userType),
        club,
        email,
        phone: phoneNumber.trim() ? `${countryCode.trim()} ${phoneNumber.trim()}` : undefined,
        childName,
        guardianEmail,
        guardianPhone,
        specialty: userType === 'Antrenör' ? 'Yüzme antrenörü' : userType === 'Kulüp Yöneticisi' ? 'Kulüp operasyonları' : undefined,
      },
      inviteCode,
    );

    if (!registerResult.success) {
      setError(registerResult.message);
      return;
    }

    try {
      const session =
        method === 'phone'
          ? await startPhoneVerification({ countryCode, phoneNumber, userType, guardianPhoneNumber: guardianPhone })
          : await startEmailVerification({ email, userType, guardianEmail });

      setCurrentUserProfile(registerResult.user);
      setError('');
      router.push({ pathname: '/(auth)/otp', params: { method, verificationId: session.verificationId, target: session.target, maskedTarget: session.maskedTarget } });
    } catch (otpError) {
      setError(otpError instanceof Error ? otpError.message : 'Doğrulama servisi henüz aktif değil. Lütfen yönetici ile iletişime geçin.');
    }
  };

  return (
    <LinearGradient colors={['#020A14', '#021526', '#06233C']} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <AppLogo size={90} showSlogan={true} />
            </View>

            <GlassCard style={styles.card}>
              <Text style={styles.cardTitle}>{t('accountInfo')}</Text>
              <Text style={styles.pilotNote}>SwimLab şu anda pilot test sürümündedir. Veriler demo/test amaçlıdır.</Text>
              <Text style={styles.label}>Kullanıcı tipi seç</Text>
              <ChipGroup options={userTypes} value={userType} onChange={(value) => setUserType(value as UserType)} />
              <View style={styles.inviteBox}>
                <Text style={styles.inviteLabel}>Davet Kodu</Text>
                <Text style={styles.inviteHelp}>Pilot test için size verilen davet kodunu girin.</Text>
                <TextInput placeholder="SWIMLAB100" placeholderTextColor={colors.muted} value={inviteCode} onChangeText={(value) => setInviteCode(value.toUpperCase())} autoCapitalize="characters" style={styles.input} />
              </View>
              <AuthField icon={User} placeholder={t('fullName')} value={fullName} onChangeText={setFullName} />
              <AuthField icon={Building2} placeholder={t('clubTeam')} value={club} onChangeText={setClub} />
              {userType === 'Veli' ? <AuthField icon={User} placeholder="Çocuk adı soyadı" value={childName} onChangeText={setChildName} /> : null}
              <AuthField icon={Mail} placeholder={t('emailAddress')} keyboardType="email-address" value={email} onChangeText={setEmail} />
              <AuthField icon={Lock} placeholder={t('password')} secureTextEntry={true} value={password} onChangeText={setPassword} />
            </GlassCard>

            <GlassCard style={styles.card}>
              <View style={styles.cardHeader}>
                {method === 'phone' ? <Phone color={colors.cyan} size={22} /> : <Mail color={colors.cyan} size={22} />}
                <Text style={styles.cardTitle}>{t('verificationMethod')}</Text>
              </View>
              <View style={styles.segmented}>
                <MethodButton label="SMS" value="phone" active={method === 'phone'} onPress={setMethod} />
                <MethodButton label={t('emailShort')} value="email" active={method === 'email'} onPress={setMethod} />
              </View>

              {userType === 'Sporcu' ? <TextInput placeholder={t('age')} placeholderTextColor={colors.muted} value={age} onChangeText={(value) => setAge(value.replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" style={styles.input} /> : null}

              {method === 'phone' ? (
                <>
                  <ChipGroup options={countryCodes} value={countryCode} onChange={setCountryCode} />
                  <TextInput placeholder={t('phoneNumber')} placeholderTextColor={colors.muted} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" style={styles.input} />
                </>
              ) : (
                <TextInput placeholder={t('emailAddress')} placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
              )}

              {isUnder18Athlete ? (
                <>
                  <Text style={styles.guardianInfo}>18 yaş altı sporcular için kulüp/antrenör gerekli durumlarda veli iletişim bilgisi isteyebilir.</Text>
                  <TextInput placeholder={t('guardianPhone')} placeholderTextColor={colors.muted} value={guardianPhone} onChangeText={setGuardianPhone} keyboardType="phone-pad" style={styles.input} />
                  <TextInput placeholder={t('guardianEmail')} placeholderTextColor={colors.muted} value={guardianEmail} onChangeText={setGuardianEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
                </>
              ) : null}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <AppButton title={method === 'phone' ? t('startSmsVerification') : t('startEmailVerification')} icon={method === 'phone' ? Phone : Mail} onPress={handleStartVerification} />
            </GlassCard>

            <GlassCard style={styles.card}>
              <View style={styles.cardHeader}>
                <ShieldCheck color={colors.cyan} size={22} />
                <Text style={styles.cardTitle}>{t('privacyConsents')}</Text>
              </View>
              <ConsentCheck checked={kvkkAccepted} title={t('kvkkDisclosure')} body={t('kvkkDisclosureText')} onPress={() => setKvkkAccepted((value) => !value)} />
              <ConsentCheck checked={explicitConsent} title={t('explicitConsent')} body={t('explicitConsentText')} onPress={() => setExplicitConsent((value) => !value)} />
              {isUnder18Athlete ? <ConsentCheck checked={guardianConsent} title={t('guardianConsentUnder18')} body="Opsiyonel veli bilgilendirme onayı." onPress={() => setGuardianConsent((value) => !value)} /> : null}
              <Pressable onPress={() => router.push('/features/privacy')}>
                <Text style={styles.privacyLink}>{t('openPrivacyPage')}</Text>
              </Pressable>
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

function ChipGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((option) => (
        <Pressable key={option} style={[styles.chip, value === option && styles.chipActive]} onPress={() => onChange(option)}>
          {value === option ? <Check color={colors.text} size={14} /> : null}
          <Text style={[styles.chipText, value === option && styles.chipTextActive]}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ConsentCheck({ checked, title, body, onPress }: { checked: boolean; title: string; body: string; onPress: () => void }) {
  return (
    <Pressable style={styles.consentRow} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Check color={colors.background} size={16} strokeWidth={3} /> : null}
      </View>
      <View style={styles.consentCopy}>
        <Text style={styles.consentTitle}>{title}</Text>
        <Text style={styles.consentBody}>{body}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  card: { gap: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  pilotNote: { color: colors.gold, fontWeight: '800', lineHeight: 20, backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  inviteBox: { gap: spacing.sm, borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, padding: spacing.md },
  inviteLabel: { color: colors.text, fontWeight: '900', fontSize: 15 },
  inviteHelp: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 19 },
  segmented: { flexDirection: 'row', borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: 4 },
  segment: { flex: 1, minHeight: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: colors.cyan },
  segmentText: { color: colors.muted, fontWeight: '900' },
  segmentTextActive: { color: colors.background },
  label: { color: colors.mutedStrong, fontWeight: '900' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 9, backgroundColor: colors.glass, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  chipText: { color: colors.muted, fontWeight: '900' },
  chipTextActive: { color: colors.text },
  input: { color: colors.text, backgroundColor: colors.surfaceSolid, borderRadius: 14, borderWidth: 1, borderColor: colors.border, minHeight: 50, paddingHorizontal: spacing.md, fontWeight: '800' },
  errorText: { color: colors.danger, fontWeight: '900' },
  guardianInfo: { color: colors.gold, fontWeight: '800', lineHeight: 20, backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  consentRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxChecked: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  consentCopy: { flex: 1 },
  consentTitle: { color: colors.text, fontWeight: '900' },
  consentBody: { color: colors.muted, lineHeight: 20, marginTop: 4 },
  privacyLink: { color: colors.cyan, fontWeight: '900', textAlign: 'center' },
});
