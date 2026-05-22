import { router } from 'expo-router';
import { Award, Building2, CalendarClock, CheckCircle2, Edit3, LogOut, Medal, Settings, ShieldCheck, Trash2, Trophy, UserCircle, Users } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { GlassCard } from '@/components/GlassCard';
import { mockAthlete } from '@/data/mockUser';
import { useLocale } from '@/locales';
import { getEntriesForAthlete, getMeetEntries } from '@/services/meetEntries';
import { roleLabel, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

export default function ProfileScreen() {
  const { t } = useLocale();
  const { currentUser, logout } = useSession();
  const visibleMeetEntries = currentUser.role === 'parent' ? getMeetEntries() : getEntriesForAthlete('a1');

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
            <AppLogo size={80} showTitle={false} />
          </View>
          <Text style={styles.title}>{currentUser.firstName} {currentUser.lastName}</Text>
          <Text style={styles.roleText}>{t('userType')}: {roleLabel(currentUser.role)}</Text>
          <Text style={styles.subtitle}>{mockAthlete.club} • {mockAthlete.category}</Text>
          <View style={styles.verifyRow}>
            <Badge label="Telefon doğrulandı" />
            <Badge label="E-posta doğrulandı" />
          </View>
        </GlassCard>

        <GlassCard style={styles.infoCard}>
          <View style={styles.summaryHeader}>
            <Edit3 color={colors.cyan} size={22} />
            <Text style={styles.cardTitle}>Sporcu Bilgileri</Text>
          </View>
          {[
            ['Ad Soyad', `${currentUser.firstName} ${currentUser.lastName}`],
            ['Yaş', mockAthlete.age],
            ['Kulüp', mockAthlete.club],
            ['Antrenör', mockAthlete.coach],
            ['Şehir', mockAthlete.city],
            ['Kategori', mockAthlete.category],
          ].map(([label, value]) => (
            <View key={label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Award color={colors.cyan} size={22} />
            <Text style={styles.cardTitle}>{t('achievementsBadges')}</Text>
          </View>
          <View style={styles.badgeGrid}>
            {mockAthlete.badges.slice(0, 2).map((badge) => (
              <View key={badge.id} style={styles.miniBadge}>
                <Medal color={colors.gold} size={19} />
                <Text style={styles.miniBadgeTitle}>{badge.title}</Text>
                <Text style={styles.miniBadgeText}>{badge.detail}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        <ProfileRow icon={Trophy} title={t('lastPb')} detail="100m Serbest • 56.84" onPress={() => router.push('/(tabs)/races')} />
        <ProfileRow icon={Building2} title={t('club')} detail={`${mockAthlete.club} • ${mockAthlete.coach}`} />
        {(currentUser.role === 'athlete' || currentUser.role === 'parent') && visibleMeetEntries.length > 0 ? (
          <GlassCard style={styles.meetCard}>
            <View style={styles.summaryHeader}>
              <CalendarClock color={colors.cyan} size={22} />
              <Text style={styles.cardTitle}>{currentUser.role === 'parent' ? 'Sporcunun Yarışları' : 'Gireceğim Yarışlar'}</Text>
            </View>
            {visibleMeetEntries.map((entry) => (
              <View key={entry.id} style={styles.meetRow}>
                <Text style={styles.meetTitle}>{currentUser.role === 'parent' ? `${entry.athleteName} • ` : ''}{entry.competitionName}</Text>
                <Text style={styles.meetDetail}>{entry.date} • {entry.relayEvent || `${entry.distance} ${entry.stroke}`} • {entry.eventType === 'team' ? 'Takım' : 'Ferdi'}</Text>
                <Text style={styles.meetDetail}>Seri {entry.heat || 'Henüz açıklanmadı'} / Kulvar {entry.lane || 'Henüz açıklanmadı'} • PB {entry.pb || '-'}</Text>
                {entry.coachNote ? <Text style={styles.meetNote}>Not: {entry.coachNote}</Text> : null}
              </View>
            ))}
          </GlassCard>
        ) : null}
        <ProfileRow icon={ShieldCheck} title={t('privacy')} detail={t('privacySettingsDetail')} onPress={() => router.push('/features/privacy')} />
        <ProfileRow icon={Users} title="Veli iletişim bilgisi" detail="veli@gpswimlab.demo / +90 555 000 00 00" />
        <ProfileRow icon={Users} title="Topluluk Kuralları" detail="Güvenli başarı paylaşımı ve moderasyon" onPress={() => router.push('/features/community-rules')} />
        <ProfileRow icon={Trash2} title={t('deleteData')} detail="KVKK kapsamında talep oluştur" />
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.md },
  heroCard: { alignItems: 'center', gap: spacing.sm },
  avatar: { width: 104, height: 104, borderRadius: 32, backgroundColor: colors.surfaceSolid, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderStrong },
  title: { ...typography.h1, color: colors.text, textAlign: 'center', marginTop: spacing.sm },
  roleText: { color: colors.gold, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.mutedStrong, textAlign: 'center', fontWeight: '800' },
  verifyRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  badgeText: { color: colors.text, fontWeight: '900', fontSize: 11 },
  summaryCard: { gap: spacing.md },
  infoCard: { gap: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  infoLabel: { color: colors.muted, fontWeight: '800' },
  infoValue: { color: colors.text, fontWeight: '900', flex: 1, textAlign: 'right' },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  badgeGrid: { flexDirection: 'row', gap: spacing.sm },
  miniBadge: { flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, padding: spacing.md, gap: 5 },
  miniBadgeTitle: { color: colors.text, fontWeight: '900' },
  miniBadgeText: { color: colors.muted, fontWeight: '700', lineHeight: 18 },
  meetCard: { gap: spacing.md },
  meetRow: { borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, padding: spacing.md },
  meetTitle: { color: colors.text, fontWeight: '900' },
  meetDetail: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4 },
  meetNote: { color: colors.muted, fontWeight: '700', marginTop: 5, lineHeight: 18 },
  rowButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  pressed: { opacity: 0.82 },
  rowIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1 },
  rowTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  rowDetail: { color: colors.muted, fontWeight: '700', marginTop: 3 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.dangerSoft, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(251, 113, 133, 0.42)', padding: spacing.md },
  logoutCopy: { flex: 1 },
  logoutTitle: { color: colors.danger, fontWeight: '900', fontSize: 16 },
  logoutDetail: { color: colors.mutedStrong, fontWeight: '700', marginTop: 3 },
});
