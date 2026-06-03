import { router } from 'expo-router';
import { BarChart3, BellRing, Building2, CalendarDays, FileText, LucideIcon, Megaphone, Plus, Trophy, Users } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionCard } from '@/components/ActionCard';
import { AppLogo } from '@/components/AppLogo';
import { ClubBadge } from '@/components/ClubBadge';
import { ClubLogo } from '@/components/ClubLogo';
import { GlassCard } from '@/components/GlassCard';
import { GradientBadge } from '@/components/GradientBadge';
import { canManageClub, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

const clubModules: Array<{ title: string; detail: string; route: string; icon: LucideIcon; tone: string; managerOnly?: boolean }> = [
  { title: 'Pano', detail: 'Duyuru, kamp ve acil bildirim', route: '/features/club-board', icon: Building2, tone: colors.cyan },
  { title: 'Takvim', detail: 'Haftalık ve aylık kulüp planı', route: '/features/club-calendar', icon: CalendarDays, tone: colors.blue },
  { title: 'TYF Panelleri', detail: 'Resmi TYF portal, takvim, sonuç ve baraj bağlantıları', route: '/features/tyf-portal', icon: CalendarDays, tone: colors.gold },
  { title: 'Yarış Listesi', detail: 'Sporcu, branş, seri ve kulvar', route: '/features/competition-roster', icon: Trophy, tone: colors.gold, managerOnly: true },  { title: 'Sporcularım', detail: 'Sporcu atama ve takip', route: '/features/my-athletes', icon: BarChart3, tone: colors.success, managerOnly: true },
  { title: 'Raporlar', detail: 'PDF, mail ve pano paylaşımı', route: '/features/competition-report', icon: FileText, tone: colors.teal },
  { title: 'Reklam Paneli', detail: 'Sponsor ve kampanya kartları', route: '/features/club-ads', icon: Megaphone, tone: colors.violet },
  { title: 'Özel Ders', detail: 'İlanlar ve ders talepleri', route: '/features/private-lessons', icon: Users, tone: colors.blue },];

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

        <GlassCard style={styles.clubHero} tone={colors.coral}>
          <ClubBadge club={currentUser.club} city={currentUser.city ?? 'Ankara'} />
          <Text style={styles.title}>Kulüp</Text>
          <Text style={styles.subtitle}>Kulüp, antrenör ve yarış yönetimi için sade merkez.</Text>
          <View style={styles.statsRow}>            <GradientBadge label={canUseManagement ? 'Yönetim aktif' : 'Görüntüleme'} tone={canUseManagement ? colors.success : colors.blue} />
          </View>
        </GlassCard>

        {canUseManagement ? (
          <Pressable style={styles.logoUpload} onPress={() => router.push('/features/club-ads')}>
            <Plus color={colors.coral} size={18} />
            <Text style={styles.logoUploadText}>Kulüp logosu ve reklam alanını düzenle</Text>
          </Pressable>
        ) : null}

        <View style={styles.grid}>
          {visibleModules.map((module) => (
            <ActionCard
              key={module.title}
              title={module.title}
              detail={module.detail}
              icon={module.icon}
              tone={module.tone}
              width="48%"
              onPress={() => router.push(module.route as never)}
            />
          ))}
        </View>

        {canUseManagement ? (
          <>
            <Pressable style={styles.rosterButton} onPress={() => router.push('/features/competition-center')}>
              <Trophy color="#FFFFFF" size={18} />
              <Text style={styles.rosterText}>Yarış Yönetimi</Text>
            </Pressable>
            <Pressable style={styles.rosterButtonSecondary} onPress={() => router.push('/features/race-day-board')}>
              <BellRing color={colors.coral} size={18} />
              <Text style={styles.rosterTextSecondary}>Yarış Günü Panosu</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  clubHero: { gap: spacing.sm },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.mutedStrong, fontWeight: '700', lineHeight: 21 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  logoUpload: {
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.24)',
    backgroundColor: colors.coralSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  logoUploadText: { color: colors.text, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  rosterButton: {
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: colors.coral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: colors.coral,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },
  rosterText: { color: '#FFFFFF', fontWeight: '900' },
  rosterButtonSecondary: {
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.24)',
    backgroundColor: colors.surfaceSolid,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  rosterTextSecondary: { color: colors.text, fontWeight: '900' },
});

