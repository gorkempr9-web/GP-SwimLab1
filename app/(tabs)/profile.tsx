import { router } from 'expo-router';
import { Award, Building2, CheckCircle2, LogOut, Settings, ShieldCheck, Trash2, Trophy, UserCircle, Users } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { ClubLogo } from '@/components/ClubLogo';
import { GlassCard } from '@/components/GlassCard';
import { useLocale } from '@/locales';
import { canManageClub, CurrentUser, roleLabel, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

export default function ProfileScreen() {
  const { t } = useLocale();
  const { currentUser, logout } = useSession();
  const fullName = getFullName(currentUser);
  const isManager = canManageClub(currentUser.role);

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

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.heroCard}>
          <View style={styles.avatar}>
            <AppLogo size={56} showTitle={false} />
          </View>
          <Text style={styles.title}>{fullName}</Text>
          <Text style={styles.roleText}>Rol: {roleLabel(currentUser.role)}</Text>
          <ClubLogo club={currentUser.club} size={38} />
          {currentUser.role === 'parent' ? <Text style={styles.subtitle}>Çocuğu: {currentUser.childName ?? 'Çocuk sporcu'}</Text> : null}
          <View style={styles.verifyRow}>
            <Badge label={currentUser.phone ? 'Telefon doğrulandı' : 'Telefon bekliyor'} />
            <Badge label={currentUser.email ? 'E-posta doğrulandı' : 'E-posta bekliyor'} />
          </View>
        </GlassCard>

        {isManager ? (
          <CoachProfile fullName={fullName} role={roleLabel(currentUser.role)} club={currentUser.club ?? 'GP Aquatics'} specialty={currentUser.specialty ?? '-'} />
        ) : (
          <AthleteOrParentProfile currentUser={currentUser} />
        )}

        <ProfileRow icon={UserCircle} title="Profili Düzenle" detail="Bilgileri güncelle ve kaydet" onPress={() => router.push('/(auth)/create-profile')} />
        <ProfileRow icon={Building2} title="Kulüp Bağlantısı" detail={currentUser.club ?? 'GP Aquatics'} />
        <ProfileRow icon={ShieldCheck} title={t('privacy')} detail={t('privacySettingsDetail')} onPress={() => router.push('/features/privacy')} />
        <ProfileRow icon={ShieldCheck} title="Güvenlik Merkezi" detail="Güvenli Hesap • Telefon + E-posta doğrulandı" onPress={() => router.push('/features/security-center')} />
        {currentUser.role === 'parent' ? <ProfileRow icon={Users} title="Veli görünümü" detail={`Sadece ${currentUser.childName ?? 'çocuğunuz'} verileri görüntülenir`} /> : null}
        <ProfileRow icon={Users} title="Veli iletişim bilgisi" detail={getGuardianDetail(currentUser)} />
        <ProfileRow icon={Trash2} title={t('deleteData')} detail="KVKK kapsamında talep oluştur" />
        <ProfileRow icon={UserCircle} title="Uygulama Tanıtımını Tekrar Gör" detail="İlk kullanım rehberini yeniden aç" onPress={() => router.push('/onboarding-guide')} />
        <ProfileRow icon={Settings} title={t('settings')} detail={t('settingsDetail')} onPress={() => router.push('/features/settings')} />

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

function CoachProfile({ fullName, role, club, specialty }: { fullName: string; role: string; club: string; specialty: string }) {
  const rows = [
    ['Ad Soyad', fullName],
    ['Rol', role],
    ['Kulüp', club],
    ['Branş / uzmanlık', specialty],
    ['Sorumlu sporcu sayısı', '24'],
    ['Aktif yarış listeleri', '3'],
    ['İletişim doğrulama durumu', 'Telefon + e-posta doğrulandı'],
    ['Kulüp bağlantısı', 'Aktif'],
  ];

  return (
    <GlassCard style={styles.infoCard}>
      <View style={styles.summaryHeader}>
        <UserCircle color={colors.cyan} size={22} />
        <Text style={styles.cardTitle}>{role === 'Kulüp Yöneticisi' ? 'Kulüp Yöneticisi Bilgileri' : 'Antrenör Bilgileri'}</Text>
      </View>
      {rows.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
    </GlassCard>
  );
}

function AthleteOrParentProfile({ currentUser }: { currentUser: CurrentUser }) {
  const isParent = currentUser.role === 'parent';
  const athleteName = isParent ? currentUser.childName ?? 'Çocuk sporcu' : getFullName(currentUser);

  return (
    <>
      <GlassCard style={styles.infoCard}>
        <View style={styles.summaryHeader}>
          <Award color={colors.cyan} size={22} />
          <Text style={styles.cardTitle}>{isParent ? 'Çocuk Sporcu Bilgileri' : 'Sporcu Bilgileri'}</Text>
        </View>
        {isParent ? <InfoRow label="Veli" value={getFullName(currentUser)} /> : null}
        <InfoRow label="Sporcu" value={athleteName} />
        <InfoRow label="Kulüp" value={currentUser.club ?? 'GP Aquatics'} />
        <InfoRow label="E-posta" value={currentUser.email ?? '-'} />
        <InfoRow label="Telefon" value={currentUser.phone ?? '-'} />
      </GlassCard>
      <ProfileRow icon={Trophy} title={isParent ? 'Çocuğumun Yarışları' : 'Yarışlarım'} detail="Geçmiş yarışlar ve PB kayıtları" onPress={() => router.push('/(tabs)/races')} />
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function ProfileRow({ icon: Icon, title, detail, onPress }: { icon: typeof Award; title: string; detail: string; onPress?: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.rowButton, pressed && onPress && styles.pressed]} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowIcon}>
        <Icon color={colors.cyan} size={22} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
    </Pressable>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <CheckCircle2 color={colors.cyan} size={14} />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function getFullName(user: CurrentUser) {
  return `${user.firstName} ${user.lastName}`.trim();
}

function getGuardianDetail(user: CurrentUser) {
  if (user.role === 'parent') return `${getFullName(user)} • ${user.phone ?? user.email ?? 'İletişim bekliyor'}`;
  return user.guardianName ?? user.guardianPhone ?? user.guardianEmail ?? 'Veli bilgisi eklenmedi';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.md },
  heroCard: { alignItems: 'center', gap: spacing.sm, borderColor: colors.borderStrong },
  avatar: { width: 84, height: 84, borderRadius: 28, backgroundColor: colors.surfaceSolid, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderStrong },
  title: { ...typography.h1, color: colors.text, textAlign: 'center', marginTop: spacing.sm },
  roleText: { color: colors.gold, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.mutedStrong, textAlign: 'center', fontWeight: '800' },
  verifyRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  badgeText: { color: colors.text, fontWeight: '900', fontSize: 11 },
  infoCard: { gap: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  infoLabel: { color: colors.muted, fontWeight: '800' },
  infoValue: { color: colors.text, fontWeight: '900', flex: 1, textAlign: 'right' },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  rowButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.md },
  pressed: { opacity: 0.82 },
  rowIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1 },
  rowTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  rowDetail: { color: colors.muted, fontWeight: '700', marginTop: 3 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.dangerSoft, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(251, 113, 133, 0.42)', padding: spacing.md },
  logoutCopy: { flex: 1 },
  logoutTitle: { color: colors.danger, fontWeight: '900', fontSize: 16 },
  logoutDetail: { color: colors.mutedStrong, fontWeight: '700', marginTop: 3 },
});
