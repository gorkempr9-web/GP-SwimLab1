import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Check, ShieldCheck, User } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { GlassCard } from '@/components/ui/GlassCard';
import { joinClubByCode } from '@/services/invitations';
import { createProfile, updateProfile, calculateAge } from '@/services/userProfile';
import { roleFromUserType, UserRole, useSession } from '@/services/session';
import { colors, spacing } from '@/theme/tokens';

const userTypes = ['Sporcu', 'Veli', 'Antrenör', 'Kulüp Yöneticisi'];
const genders = ['Kadın', 'Erkek', 'Belirtmek istemiyorum'];

export default function CreateProfileScreen() {
  const { currentUser, setCurrentUserProfile } = useSession();
  const [firstName, setFirstName] = useState(currentUser.profileCreated ? currentUser.firstName : '');
  const [lastName, setLastName] = useState(currentUser.profileCreated ? currentUser.lastName : '');
  const [birthYear, setBirthYear] = useState(currentUser.birthYear ?? '');
  const [gender, setGender] = useState(currentUser.gender ?? genders[0]);
  const [club, setClub] = useState(currentUser.club ?? '');
  const [coachName, setCoachName] = useState(currentUser.coachName ?? '');
  const [city, setCity] = useState(currentUser.city ?? '');
  const [category, setCategory] = useState(currentUser.category ?? '');
  const [mainStroke, setMainStroke] = useState(currentUser.mainStroke ?? '');
  const [targetEvent, setTargetEvent] = useState(currentUser.targetEvent ?? '');
  const [phone, setPhone] = useState(currentUser.phone ?? '');
  const [email, setEmail] = useState(currentUser.email ?? '');
  const [guardianName, setGuardianName] = useState(currentUser.guardianName ?? '');
  const [guardianPhone, setGuardianPhone] = useState(currentUser.guardianPhone ?? '');
  const [guardianEmail, setGuardianEmail] = useState(currentUser.guardianEmail ?? '');
  const [userType, setUserType] = useState(labelFromRole(currentUser.role));
  const [kvkkAccepted, setKvkkAccepted] = useState(Boolean(currentUser.kvkkAccepted || currentUser.profileCreated));
  const [explicitConsent, setExplicitConsent] = useState(Boolean(currentUser.explicitConsentAccepted || currentUser.profileCreated));
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [error, setError] = useState('');

  const age = useMemo(() => calculateAge(birthYear), [birthYear]);
  const isUnder18 = age !== null && age < 18;
  const role = roleFromUserType(userType);
  const hasInviteMatch = Boolean(currentUser.inviteCode);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !birthYear.trim() || !club.trim()) {
      setError('Ad, soyad, doğum yılı ve kulüp zorunludur.');
      return;
    }
    if (!kvkkAccepted || !explicitConsent) {
      setError('KVKK ve açık rıza onayları zorunludur.');
      return;
    }
    const payload = {
      firstName,
      lastName,
      birthYear,
      gender,
      club,
      coachName,
      city,
      category,
      groupName: category,
      mainStroke,
      targetEvent,
      phone,
      email,
      guardianName,
      guardianPhone,
      guardianEmail,
      role: role as UserRole,
      kvkkAccepted: true,
      explicitConsentAccepted: true,
      consentAcceptedAt: currentUser.consentAcceptedAt ?? new Date().toISOString(),
    };
    const profile = currentUser.profileCreated ? await updateProfile(currentUser, payload) : await createProfile(currentUser, payload);
    setCurrentUserProfile(profile);
    setError('');
    router.replace(profile.hasSeenAppGuide ? '/(tabs)/dashboard' : '/onboarding-guide');
  };

  const handleJoinByCode = () => {
    const result = joinClubByCode(inviteCode);
    if (!result.valid) {
      setInviteMessage(result.message);
      return;
    }
    setClub(result.clubName);
    if (result.groupName) setCategory(result.groupName);
    setUserType(labelFromRole(result.role));
    setInviteMessage(`${result.code} kodu ile ${result.clubName} kulübüne bağlandın.`);
  };

  return (
    <LinearGradient colors={['#020A14', '#071626', '#0A2740']} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <AppLogo size={78} showSlogan={true} />
              <Text style={styles.title}>{currentUser.profileCreated ? 'Profili Düzenle' : 'Profil Oluştur'}</Text>
              <Text style={styles.subtitle}>SwimLab içinde görünen bilgiler bu profilden alınır.</Text>
            </View>

            <GlassCard style={styles.card}>
              <Text style={styles.cardTitle}>Kullanıcı tipi</Text>
              <ChipGroup options={userTypes} value={userType} onChange={setUserType} />
              {hasInviteMatch ? (
                <View style={styles.inviteBox}>
                  <Text style={styles.label}>Davet kodu eşleşti</Text>
                  <Text style={styles.inviteMessage}>{currentUser.inviteCode} • {currentUser.club ?? 'Kulüp seçilmedi'}{currentUser.groupName ? ` • ${currentUser.groupName}` : ''}</Text>
                </View>
              ) : (
                <View style={styles.inviteBox}>
                  <Text style={styles.label}>Davet Kodum Var</Text>
                  <View style={styles.inviteRow}>
                    <TextInput placeholder="GP-MEV001" placeholderTextColor={colors.muted} value={inviteCode} onChangeText={(value) => setInviteCode(value.toUpperCase())} autoCapitalize="characters" style={[styles.input, styles.inviteInput]} />
                    <Pressable style={styles.applyCodeButton} onPress={handleJoinByCode}>
                      <Text style={styles.applyCodeText}>Eşleştir</Text>
                    </Pressable>
                  </View>
                  {inviteMessage ? <Text style={styles.inviteMessage}>{inviteMessage}</Text> : null}
                </View>
              )}
              <Input label="Ad" value={firstName} onChangeText={setFirstName} />
              <Input label="Soyad" value={lastName} onChangeText={setLastName} />
              <Input label="Doğum yılı" value={birthYear} onChangeText={(value) => setBirthYear(value.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" />
              <Text style={styles.ageText}>Yaş: {age ?? '-'}</Text>
              <Text style={styles.label}>Cinsiyet</Text>
              <ChipGroup options={genders} value={gender} onChange={setGender} />
            </GlassCard>

            <GlassCard style={styles.card}>
              <Text style={styles.cardTitle}>Spor ve kulüp bilgileri</Text>
              <Input label="Kulüp" value={club} onChangeText={setClub} />
              <Input label="Antrenör adı" value={coachName} onChangeText={setCoachName} />
              <Input label="Şehir" value={city} onChangeText={setCity} />
              <Input label="Kategori" value={category} onChangeText={setCategory} />
              <Input label="Ana stil" value={mainStroke} onChangeText={setMainStroke} />
              <Input label="Hedef branş" value={targetEvent} onChangeText={setTargetEvent} />
            </GlassCard>

            <GlassCard style={styles.card}>
              <Text style={styles.cardTitle}>İletişim ve veli bilgisi</Text>
              <Input label="Telefon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <Input label="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <Input label="Veli adı soyadı" value={guardianName} onChangeText={setGuardianName} />
              <Input label="Veli telefonu" value={guardianPhone} onChangeText={setGuardianPhone} keyboardType="phone-pad" />
              <Input label="Veli e-postası" value={guardianEmail} onChangeText={setGuardianEmail} keyboardType="email-address" autoCapitalize="none" />
              {isUnder18 ? <Text style={styles.warningText}>18 yaş altı sporcular için kulüp/antrenör gerekli durumlarda veli iletişim bilgisi isteyebilir.</Text> : null}
            </GlassCard>

            {!currentUser.kvkkAccepted || !currentUser.explicitConsentAccepted ? (
              <GlassCard style={styles.card}>
                <View style={styles.cardHeader}>
                  <ShieldCheck color={colors.cyan} size={22} />
                  <Text style={styles.cardTitle}>KVKK ve onaylar</Text>
                </View>
                <ConsentCheck checked={kvkkAccepted} title="KVKK Aydınlatma Metni" onPress={() => setKvkkAccepted((value) => !value)} />
                <ConsentCheck checked={explicitConsent} title="Açık Rıza" onPress={() => setExplicitConsent((value) => !value)} />
                {isUnder18 ? <ConsentCheck checked={guardianConsent} title="Veli Onayı (opsiyonel)" onPress={() => setGuardianConsent((value) => !value)} /> : null}
              </GlassCard>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <User color={colors.background} size={19} />
              <Text style={styles.saveText}>{currentUser.profileCreated ? 'Bilgileri Kaydet' : 'Profili Oluştur'}</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Input({ label, ...props }: { label: string; value: string; onChangeText: (value: string) => void; keyboardType?: 'default' | 'number-pad' | 'phone-pad' | 'email-address'; autoCapitalize?: 'none' }) {
  return <TextInput placeholder={label} placeholderTextColor={colors.muted} style={styles.input} {...props} />;
}

function ChipGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((option) => (
        <Pressable key={option} style={[styles.chip, value === option && styles.chipActive]} onPress={() => onChange(option)}>
          {value === option ? <Check color={colors.background} size={14} /> : null}
          <Text style={[styles.chipText, value === option && styles.chipTextActive]}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ConsentCheck({ checked, title, onPress }: { checked: boolean; title: string; onPress: () => void }) {
  return (
    <Pressable style={styles.consentRow} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>{checked ? <Check color={colors.background} size={16} strokeWidth={3} /> : null}</View>
      <Text style={styles.consentText}>{title}</Text>
    </Pressable>
  );
}

function labelFromRole(role: UserRole) {
  if (role === 'parent') return 'Veli';
  if (role === 'coach') return 'Antrenör';
  if (role === 'club_admin') return 'Kulüp Yöneticisi';
  return 'Sporcu';
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.mutedStrong, fontWeight: '800', textAlign: 'center' },
  card: { gap: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  label: { color: colors.mutedStrong, fontWeight: '900' },
  input: { minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '800' },
  inviteBox: { gap: spacing.sm, borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, padding: spacing.md },
  inviteRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  inviteInput: { flex: 1 },
  applyCodeButton: { minHeight: 50, borderRadius: 14, backgroundColor: colors.cyan, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
  applyCodeText: { color: colors.background, fontWeight: '900' },
  inviteMessage: { color: colors.gold, fontWeight: '900', lineHeight: 19 },
  ageText: { color: colors.cyan, fontWeight: '900' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { minHeight: 38, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  chipText: { color: colors.mutedStrong, fontWeight: '900' },
  chipTextActive: { color: colors.background },
  warningText: { color: colors.gold, fontWeight: '900', lineHeight: 20 },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  consentText: { color: colors.text, fontWeight: '900', flex: 1 },
  errorText: { color: colors.danger, fontWeight: '900', backgroundColor: colors.dangerSoft, borderRadius: 14, padding: spacing.md },
  saveButton: { minHeight: 52, borderRadius: 18, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  saveText: { color: colors.background, fontWeight: '900', fontSize: 16 },
});


