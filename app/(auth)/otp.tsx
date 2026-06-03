import { router, useLocalSearchParams } from 'expo-router';
import { Mail, Phone, RotateCcw, ShieldCheck } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppLogo } from '@/components/AppLogo';
import { useLocale } from '@/locales';
import { resendEmailOtp } from '@/services/emailAuth';
import { resendPhoneOtp } from '@/services/phoneAuth';
import { useSession } from '@/services/session';
import { getMockCode, VerificationMethod, verifyCode } from '@/services/verification';
import { colors, spacing, typography } from '@/theme/tokens';

export default function OtpScreen() {
  const { t } = useLocale();
  const { currentUser } = useSession();
  const params = useLocalSearchParams<{ verificationId?: string; method?: VerificationMethod; maskedTarget?: string; target?: string; maskedPhone?: string }>();
  const method: VerificationMethod = params.method === 'email' ? 'email' : 'phone';
  const Icon = method === 'email' ? Mail : Phone;
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('');
  const [verificationId, setVerificationId] = useState(params.verificationId ?? `${method}-session`);
  const target = params.target ?? params.maskedTarget ?? params.maskedPhone ?? '';

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleVerify = async () => {
    const result = await verifyCode(method, code, verificationId);

    if (result.success) {
      setMessage(method === 'email' ? t('emailVerified') : t('phoneVerified'));
      router.replace(currentUser.profileCreated ? (currentUser.hasSeenAppGuide ? '/(tabs)/dashboard' : '/onboarding-guide') : '/(auth)/create-profile');
      return;
    }

    setAttempts(result.attempts);
    setMessage(result.message);
  };

  const handleResend = async () => {
    try {
      const session = method === 'email' ? await resendEmailOtp(target) : await resendPhoneOtp(target);
      setVerificationId(session.verificationId);
      setSecondsLeft(session.expiresInSeconds);
      setAttempts(0);
      setCode('');
      const devCode = getMockCode(method);
      setMessage(devCode ? `Yeni geliştirme kodu gönderildi: ${devCode}` : 'Kod yeniden gönderildi.');
      inputRef.current?.focus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Doğrulama servisi henüz aktif değil. Lütfen yönetici ile iletişime geçin.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <AppLogo size={40} showTitle={false} />
        <Icon color={colors.coral} size={42} />
        <Text style={styles.title}>{t('otpTitle')}</Text>
        <Text style={styles.subtitle}>
          {method === 'email' ? t('emailVerification') : t('phoneVerification')} • {target}
        </Text>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
          placeholder={t('otpPlaceholder')}
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus={true}
          style={styles.otpInput}
        />

        <Text style={styles.timer}>{secondsLeft > 0 ? `${secondsLeft} sn` : 'Süre doldu'}</Text>
        {attempts >= 3 ? <Text style={styles.errorMessage}>3 yanlış deneme yapıldı. Lütfen tekrar kod gönder.</Text> : null}
        {message ? <Text style={[styles.message, attempts > 0 && styles.errorMessage]}>{message}</Text> : null}

        <AppButton title={t('verifyOtp')} icon={ShieldCheck} onPress={handleVerify} />
        <Pressable style={styles.resendButton} onPress={handleResend} disabled={secondsLeft > 0}>
          <RotateCcw color={secondsLeft > 0 ? colors.muted : colors.coral} size={18} />
          <Text style={[styles.resendText, secondsLeft > 0 && styles.disabledText]}>{t('resendCode')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 22, fontSize: 16 },
  otpInput: {
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSolid,
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 8,
  },
  timer: { color: colors.gold, fontWeight: '900', textAlign: 'center' },
  message: { color: colors.coral, fontWeight: '900', textAlign: 'center' },
  errorMessage: { color: colors.danger, fontWeight: '900', textAlign: 'center' },
  resendButton: { minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  resendText: { color: colors.text, fontWeight: '900' },
  disabledText: { color: colors.muted },
});
