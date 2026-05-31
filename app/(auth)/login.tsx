import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { GlassCard } from '@/components/ui/GlassCard';
import { getCurrentUser, loginWithMockCredentials } from '@/services/auth';
import { useSession } from '@/services/session';
import { colors, spacing } from '@/theme/tokens';

export default function LoginScreen() {
  const { setCurrentUserProfile } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

              <Text style={styles.demoNote}>Bu sistem yalnızca pilot/demo mock giriş içindir. Üretim sürümünde Firebase Auth veya backend auth ile değiştirilecektir.</Text>
            </GlassCard>
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
  demoNote: { color: colors.gold, fontWeight: '800', fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
