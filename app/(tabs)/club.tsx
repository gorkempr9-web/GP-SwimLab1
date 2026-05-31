import { router } from 'expo-router';
import { BarChart3, BellRing, Building2, CalendarDays, Clock, FileText, LucideIcon, Megaphone, Plus, Trophy, Users } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { ClubLogo } from '@/components/ClubLogo';
import { GlassCard } from '@/components/GlassCard';
import { canManageClub, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

const clubModules: Array<{ title: string; detail: string; route: string; icon: LucideIcon; managerOnly?: boolean }> = [
  { title: 'Pano', detail: 'Duyuru, kamp ve acil bildirim', route: '/features/club-board', icon: Building2 },
  { title: 'Takvim', detail: 'Haftalık ve aylık kulüp planı', route: '/features/club-calendar', icon: CalendarDays },
  { title: 'TYF Takvimi ve Portal', detail: 'Resmi TYF linklerine yönlendirme', route: '/features/tyf-portal', icon: CalendarDays },
  { title: 'Yarış Listesi', detail: 'Sporcu, branş, seri ve kulvar', route: '/features/competition-roster', icon: Trophy, managerOnly: true },
  { title: 'Canlı Giriş', detail: 'Bekleyen yarış derece girişi', route: '/features/live-race', icon: BellRing, managerOnly: true },
  { title: 'Sporcularım', detail: 'Sporcu atama ve takip', route: '/features/my-athletes', icon: BarChart3, managerOnly: true },
  { title: 'Raporlar', detail: 'PDF, mail ve pano paylaşımı', route: '/features/competition-report', icon: FileText },
  { title: 'Kulüp Reklam Paneli', detail: 'Sponsor ve kampanya kartları', route: '/features/club-ads', icon: Megaphone },
  { title: 'Özel Ders İlanları', detail: 'Antrenör ders ilanları ve talepler', route: '/features/private-lessons', icon: Users },
  { title: 'Antrenör Takvimi', detail: 'Uygunluk ve özel ders saatleri', route: '/features/coach-calendar', icon: Clock },
];

export default function ClubScreen() {
  const { currentUser } = useSession();
  const canUseManagement = canManageClub(currentUser.role);
  const visibleModules = clubModules.filter((module) => canUseManagement || !module.managerOnly);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppLogo compact={true} size={26} />
          <ClubLogo club={currentUser.club} size={42} />
        </View>
        <Text style={styles.title}>Kulüp</Text>
        <Text style={styles.subtitle}>SwimLab kulüp, antrenör ve yarış yönetim merkezi.</Text>

        {canUseManagement ? (
          <Pressable style={styles.logoUpload} onPress={() => router.push('/features/club-ads')}>
            <Plus color={colors.cyan} size={18} />
            <Text style={styles.logoUploadText}>Kulüp logosu ve reklam alanını düzenle</Text>
          </Pressable>
        ) : null}

        <View style={styles.grid}>
          {visibleModules.map((module) => <ClubModule key={module.title} {...module} />)}
        </View>
        {canUseManagement ? (
          <>
            <Pressable style={styles.rosterButton} onPress={() => router.push('/features/competition-center')}>
              <Trophy color={colors.background} size={18} />
              <Text style={styles.rosterText}>Yarış Yönetimi</Text>
            </Pressable>
            <Pressable style={styles.rosterButtonSecondary} onPress={() => router.push('/features/race-day-board')}>
              <BellRing color={colors.cyan} size={18} />
              <Text style={styles.rosterTextSecondary}>Yarış Günü Panosu</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ClubModule({ title, detail, route, icon: Icon }: { title: string; detail: string; route: string; icon: LucideIcon }) {
  return (
    <Pressable style={({ pressed }) => [styles.pressable, pressed && styles.pressed]} onPress={() => router.push(route)}>
      <GlassCard style={styles.card}>
        <View style={styles.iconBox}>
          <Icon color={colors.cyan} size={24} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', lineHeight: 21 },
  logoUpload: { minHeight: 48, borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  logoUploadText: { color: colors.text, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pressable: { width: '48%' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  card: { minHeight: 148, gap: spacing.sm },
  iconBox: { width: 44, height: 44, borderRadius: 15, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  detail: { color: colors.muted, fontWeight: '700', lineHeight: 19 },
  rosterButton: { minHeight: 50, borderRadius: 16, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  rosterText: { color: colors.background, fontWeight: '900' },
  rosterButtonSecondary: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  rosterTextSecondary: { color: colors.text, fontWeight: '900' },
});
