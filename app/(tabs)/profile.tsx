import { router } from 'expo-router';
import { Award, Building2, CheckCircle2, LogOut, Settings, ShieldCheck, Trash2, Trophy, UserCircle, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, DimensionValue, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { ClubLogo } from '@/components/ClubLogo';
import { GlassCard } from '@/components/GlassCard';
import { useLocale } from '@/locales';
import { clearLocalDemoData } from '@/services/localStore';
import { CurrentUser, roleLabel, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

type ProfileFieldKey =
  | 'firstName'
  | 'lastName'
  | 'birthYear'
  | 'age'
  | 'gender'
  | 'city'
  | 'club'
  | 'coachName'
  | 'category'
  | 'mainStroke'
  | 'targetEvent'
  | 'phone'
  | 'email'
  | 'role';

type ProfileField = {
  key: ProfileFieldKey;
  label: string;
  value: string;
  tone: string;
  editable?: boolean;
};

export default function ProfileScreen() {
  const { t } = useLocale();
  const { width } = useWindowDimensions();
  const { currentUser, setCurrentUserProfile, logout } = useSession();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CurrentUser>(currentUser);
  const [message, setMessage] = useState('');
  const cardWidth: DimensionValue = width < 390 ? '100%' : '48%';
  const fullName = getFullName(currentUser);

  const fields = useMemo(() => buildProfileFields(draft), [draft]);

  const handleEdit = () => {
    setDraft(currentUser);
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(currentUser);
    setEditing(false);
  };

  const handleSave = () => {
    const nextBirthYear = draft.birthYear?.trim() ?? '';
    const nextAge = nextBirthYear ? calculateAge(nextBirthYear) : draft.age;
    setCurrentUserProfile({ ...draft, age: nextAge, profileCreated: true });
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(t('logoutConfirmTitle'), t('logoutConfirmMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleClearDemoData = async () => {
    await clearLocalDemoData();
    setMessage('Demo verileri temizlendi.');
  };

  const updateField = (key: ProfileFieldKey, value: string) => {
    if (key === 'role' || key === 'age') return;
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.heroCard}>
          <View style={styles.avatar}>
            <AppLogo size={52} showTitle={false} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.title}>{fullName}</Text>
            <Text style={styles.roleText}>{roleLabel(currentUser.role)} • {currentUser.club ?? 'SwimLab'}</Text>
            {currentUser.role === 'parent' ? <Text style={styles.subtitle}>Çocuğu: {currentUser.childName ?? 'Çocuk sporcu'}</Text> : null}
          </View>
          <ClubLogo club={currentUser.club} size={38} />
          <View style={styles.verifyRow}>
            <Badge label={currentUser.phone ? 'Telefon doğrulandı' : 'Telefon bekliyor'} tone={colors.success} />
            <Badge label={currentUser.email ? 'E-posta doğrulandı' : 'E-posta bekliyor'} tone={colors.cyan} />
          </View>
        </GlassCard>
        <Text style={styles.demoInfo}>{t('demoDataLocalWarning')}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          {editing ? (
            <View style={styles.editActions}>
              <Pressable style={styles.cancelButton} onPress={handleCancel}><Text style={styles.cancelText}>Vazgeç</Text></Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave}><Text style={styles.saveText}>Kaydet</Text></Pressable>
            </View>
          ) : (
            <Pressable style={styles.editButton} onPress={handleEdit}><Text style={styles.editText}>Profili Düzenle</Text></Pressable>
          )}
        </View>

        <View style={styles.infoGrid}>
          {fields.map((field) => (
            <InfoCard key={field.key} field={field} width={cardWidth} editing={editing && field.editable !== false} onChange={updateField} />
          ))}
        </View>

        {currentUser.role === 'parent' ? <ActionRow icon={Users} title="Veli görünümü" detail={`Sadece ${currentUser.childName ?? 'çocuğunuz'} verileri görüntülenir`} /> : null}
        <ActionRow icon={Trophy} title={currentUser.role === 'parent' ? 'Çocuğumun Yarışları' : 'Yarışlarım'} detail="Geçmiş yarışlar ve PB kayıtları" onPress={() => router.push('/(tabs)/races')} />
        <ActionRow icon={Building2} title="Kulüp Bağlantısı" detail={currentUser.club ?? 'Kulüp bilgisi bekliyor'} />
        <ActionRow icon={ShieldCheck} title={t('privacy')} detail={t('privacySettingsDetail')} onPress={() => router.push('/features/privacy')} />
        <ActionRow icon={ShieldCheck} title="Güvenlik Merkezi" detail="Güvenli Hesap • Telefon + E-posta doğrulandı" onPress={() => router.push('/features/security-center')} />
        <ActionRow icon={Users} title="Veli iletişim bilgisi" detail={getGuardianDetail(currentUser)} />
        <ActionRow icon={Trash2} title={t('deleteData')} detail="KVKK kapsamında talep oluştur" />
        <ActionRow icon={Trash2} title={t('clearDemoData')} detail="Cihazda saklanan pilot test verilerini temizle" onPress={handleClearDemoData} />
        <ActionRow icon={UserCircle} title="Uygulama Tanıtımını Tekrar Gör" detail="İlk kullanım rehberini yeniden aç" onPress={() => router.push('/onboarding-guide')} />
        <ActionRow icon={Settings} title={t('settings')} detail={t('settingsDetail')} onPress={() => router.push('/features/settings')} />

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color={colors.danger} size={22} />
          <View style={styles.logoutCopy}>
            <Text style={styles.logoutTitle}>{t('logout')}</Text>
            <Text style={styles.logoutDetail}>{t('logoutDetail')}</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({ field, width, editing, onChange }: { field: ProfileField; width: DimensionValue; editing: boolean; onChange: (key: ProfileFieldKey, value: string) => void }) {
  const Icon = getFieldIcon(field.key);
  return (
    <View style={[styles.infoCard, { width, borderColor: `${field.tone}66` }]}>
      <View style={[styles.infoIcon, { backgroundColor: `${field.tone}24` }]}>
        <Icon color={field.tone} size={20} />
      </View>
      <Text style={styles.infoLabel}>{field.label}</Text>
      {editing ? (
        <TextInput value={field.value} onChangeText={(value) => onChange(field.key, value)} style={styles.infoInput} placeholder={field.label} placeholderTextColor={colors.muted} />
      ) : (
        <Text style={styles.infoValue} numberOfLines={2}>{field.value || '-'}</Text>
      )}
    </View>
  );
}

function ActionRow({ icon: Icon, title, detail, onPress }: { icon: typeof Award; title: string; detail: string; onPress?: () => void }) {
  const tone = getModuleTone(title);
  return (
    <Pressable style={({ pressed }) => [styles.rowButton, { borderColor: `${tone}55` }, pressed && onPress && styles.pressed]} onPress={onPress} disabled={!onPress}>
      <View style={[styles.rowIcon, { backgroundColor: `${tone}22` }]}>
        <Icon color={tone} size={23} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
    </Pressable>
  );
}

function Badge({ label, tone }: { label: string; tone: string }) {
  return (
    <View style={[styles.badge, { borderColor: `${tone}55`, backgroundColor: `${tone}1F` }]}>
      <CheckCircle2 color={tone} size={14} />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function buildProfileFields(user: CurrentUser): ProfileField[] {
  return [
    { key: 'firstName', label: 'Adı', value: user.firstName, tone: colors.cyan },
    { key: 'lastName', label: 'Soyadı', value: user.lastName, tone: colors.blue },
    { key: 'birthYear', label: 'Doğum yılı', value: user.birthYear ?? '', tone: colors.violet },
    { key: 'age', label: 'Yaş', value: user.age ?? calculateAge(user.birthYear ?? ''), tone: colors.gold, editable: false },
    { key: 'gender', label: 'Cinsiyet', value: user.gender ?? '', tone: colors.coral },
    { key: 'city', label: 'Şehir', value: user.city ?? '', tone: colors.blue },
    { key: 'club', label: 'Kulüp', value: user.club ?? '', tone: colors.cyan },
    { key: 'coachName', label: 'Antrenör', value: user.coachName ?? user.specialty ?? '', tone: colors.violet },
    { key: 'category', label: 'Kategori', value: user.category ?? user.groupName ?? '', tone: colors.gold },
    { key: 'mainStroke', label: 'Ana stil', value: user.mainStroke ?? '', tone: colors.success },
    { key: 'targetEvent', label: 'Hedef branş', value: user.targetEvent ?? '', tone: colors.coral },
    { key: 'phone', label: 'Telefon', value: user.phone ?? '', tone: colors.success },
    { key: 'email', label: 'E-posta', value: user.email ?? '', tone: colors.cyan },
    { key: 'role', label: 'Kullanıcı tipi', value: roleLabel(user.role), tone: colors.violet, editable: false },
  ];
}

function getFieldIcon(key: ProfileFieldKey) {
  if (key === 'club' || key === 'city') return Building2;
  if (key === 'coachName' || key === 'role') return UserCircle;
  if (key === 'category' || key === 'targetEvent') return Award;
  if (key === 'mainStroke') return Trophy;
  if (key === 'phone' || key === 'email') return ShieldCheck;
  return UserCircle;
}

function getModuleTone(title: string) {
  if (title.includes('Yarış')) return colors.gold;
  if (title.includes('Güvenlik') || title.includes('Veli')) return colors.success;
  if (title.includes('Kulüp')) return colors.cyan;
  if (title.includes('Tanıtım') || title.includes('Ayar')) return colors.violet;
  if (title.includes('Sil')) return colors.coral;
  return colors.blue;
}

function getFullName(user: CurrentUser) {
  return `${user.firstName} ${user.lastName}`.trim();
}

function calculateAge(birthYear: string) {
  const year = Number(birthYear);
  if (!year || year < 1900) return '';
  return String(new Date().getFullYear() - year);
}

function getGuardianDetail(user: CurrentUser) {
  if (user.role === 'parent') return `${getFullName(user)} • ${user.phone ?? user.email ?? 'İletişim bekliyor'}`;
  return user.guardianName ? (user.guardianPhone ?? user.guardianEmail ?? user.guardianName) : 'Veli bilgisi eklenmedi';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.md },
  heroCard: { alignItems: 'center', gap: spacing.sm, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid },
  avatar: { width: 82, height: 82, borderRadius: 28, backgroundColor: colors.violetSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.24)', shadowColor: colors.violet, shadowOpacity: 0.12, shadowRadius: 18 },
  heroCopy: { alignItems: 'center' },
  title: { ...typography.h1, color: colors.text, textAlign: 'center', marginTop: spacing.sm },
  roleText: { color: colors.gold, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.mutedStrong, textAlign: 'center', fontWeight: '800' },
  verifyRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  badgeText: { color: colors.text, fontWeight: '900', fontSize: 11 },
  demoInfo: { color: colors.gold, fontWeight: '800', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  message: { color: colors.success, fontWeight: '900', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginTop: spacing.sm },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  editButton: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.md, paddingVertical: 9 },
  editText: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  editActions: { flexDirection: 'row', gap: spacing.sm },
  cancelButton: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md, paddingVertical: 9 },
  cancelText: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  saveButton: { borderRadius: 999, backgroundColor: colors.cyan, paddingHorizontal: spacing.md, paddingVertical: 9 },
  saveText: { color: colors.background, fontWeight: '900', fontSize: 12 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  infoCard: { minHeight: 98, borderRadius: 20, borderWidth: 1, backgroundColor: colors.surfaceSolid, padding: spacing.sm, gap: 3, shadowColor: colors.text, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  infoIcon: { width: 30, height: 30, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  infoLabel: { color: colors.mutedStrong, fontWeight: '900', fontSize: 11 },
  infoValue: { color: colors.text, fontWeight: '900', fontSize: 15, lineHeight: 18 },
  infoInput: { minHeight: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, color: colors.text, paddingHorizontal: spacing.sm, fontWeight: '900' },
  rowButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surfaceSolid, borderRadius: 22, borderWidth: 1, padding: spacing.md, shadowColor: colors.text, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  pressed: { opacity: 0.82 },
  rowIcon: { width: 46, height: 46, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1 },
  rowTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  rowDetail: { color: colors.muted, fontWeight: '700', marginTop: 3 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.dangerSoft, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(251, 113, 133, 0.42)', padding: spacing.md },
  logoutCopy: { flex: 1 },
  logoutTitle: { color: colors.danger, fontWeight: '900', fontSize: 16 },
  logoutDetail: { color: colors.mutedStrong, fontWeight: '700', marginTop: 3 },
});
