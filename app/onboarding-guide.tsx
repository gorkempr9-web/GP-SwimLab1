import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CalendarDays, ChevronLeft, ChevronRight, Dumbbell, Lock, Megaphone, Trophy, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { GlassCard } from '@/components/GlassCard';
import { useLocale } from '@/locales';
import { CurrentUser, useSession } from '@/services/session';
import { colors, spacing } from '@/theme/tokens';

const guideSlides = [
  {
    icon: Trophy,
    titleKey: 'appGuideWelcome',
    descriptionKey: 'appGuideWelcomeDesc',
    mockTitle: 'Tek panel',
    mockRows: ['Yarış', 'Antrenman', 'Kulüp'],
  },
  {
    icon: CalendarDays,
    titleKey: 'appGuideRaceTracking',
    descriptionKey: 'appGuideRaceTrackingDesc',
    mockTitle: 'Yarış takibi',
    mockRows: ['50m Serbest', 'Yeni PB', '18 gün kaldı'],
  },
  {
    icon: Users,
    titleKey: 'appGuideClubManagement',
    descriptionKey: 'appGuideClubManagementDesc',
    mockTitle: 'Canlı giriş',
    mockRows: ['Sporcu seç', 'Derece gir', 'PB kontrol'],
  },
  {
    icon: Megaphone,
    titleKey: 'appGuideClubCalendar',
    descriptionKey: 'appGuideClubCalendarDesc',
    mockTitle: 'Bugün',
    mockRows: ['18:00 Antrenman', 'TYF resmi yarış', 'Acil duyuru'],
  },
  {
    icon: Dumbbell,
    titleKey: 'appGuidePrivateLessons',
    descriptionKey: 'appGuidePrivateLessonsDesc',
    mockTitle: 'Uygun saatler',
    mockRows: ['Pzt 16:00', 'Cum 18:30', 'Talep gönder'],
  },
  {
    icon: Lock,
    titleKey: 'appGuidePrivacy',
    descriptionKey: 'appGuidePrivacyDesc',
    mockTitle: 'Rol bazlı erişim',
    mockRows: ['Sporcu', 'Veli', 'Antrenör'],
  },
] as const;

export default function OnboardingGuideScreen() {
  const { currentUser, setCurrentUserProfile } = useSession();
  const { t } = useLocale();
  const [index, setIndex] = useState(0);
  const slide = guideSlides[index];
  const Icon = slide.icon;
  const isFirst = index === 0;
  const isLast = index === guideSlides.length - 1;
  const roleNote = useMemo(() => getRoleNote(currentUser, t), [currentUser, t]);

  const finishGuide = () => {
    setCurrentUserProfile({ ...currentUser, hasSeenAppGuide: true });
    router.replace('/(tabs)/dashboard');
  };

  return (
    <LinearGradient colors={['#020A14', '#071626', '#0A2A45']} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <AppLogo size={44} showSlogan={false} />
          <Pressable style={styles.skipButton} onPress={finishGuide}>
            <Text style={styles.skipText}>{t('skip')}</Text>
          </Pressable>
        </View>

        <GlassCard style={styles.card}>
          <View style={styles.iconOrb}>
            <Icon color={colors.cyan} size={42} />
          </View>
          <Text style={styles.title}>{t(slide.titleKey)}</Text>
          <Text style={styles.description}>{t(slide.descriptionKey)}</Text>

          <View style={styles.mockup}>
            <View style={styles.mockHeader}>
              <View style={styles.mockDot} />
              <Text style={styles.mockTitle}>{slide.mockTitle}</Text>
            </View>
            {slide.mockRows.map((row) => (
              <View key={row} style={styles.mockRow}>
                <View style={styles.mockLine} />
                <Text style={styles.mockText}>{row}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.roleNote}>{roleNote}</Text>
        </GlassCard>

        <View style={styles.dots}>
          {guideSlides.map((item, itemIndex) => (
            <View key={item.titleKey} style={[styles.dot, itemIndex === index && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable style={[styles.secondaryButton, isFirst && styles.disabledButton]} onPress={() => setIndex((value) => Math.max(0, value - 1))} disabled={isFirst}>
            <ChevronLeft color={isFirst ? colors.muted : colors.text} size={18} />
            <Text style={[styles.secondaryText, isFirst && styles.disabledText]}>{t('back')}</Text>
          </Pressable>

          <Pressable style={styles.primaryButton} onPress={isLast ? finishGuide : () => setIndex((value) => value + 1)}>
            <Text style={styles.primaryText}>{isLast ? t('appGuideStartUsing') : t('next')}</Text>
            {!isLast ? <ChevronRight color={colors.background} size={18} /> : null}
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function getRoleNote(user: CurrentUser, t: ReturnType<typeof useLocale>['t']) {
  if (user.role === 'parent') return t('appGuideParentNote');
  if (user.role === 'coach') return t('appGuideCoachNote');
  if (user.role === 'club_admin') return t('appGuideClubAdminNote');
  return t('appGuideAthleteNote');
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skipButton: { minHeight: 40, paddingHorizontal: spacing.md, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  skipText: { color: colors.cyan, fontWeight: '900' },
  card: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  iconOrb: { width: 88, height: 88, borderRadius: 30, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 27, fontWeight: '900', textAlign: 'center' },
  description: { color: colors.mutedStrong, fontSize: 16, fontWeight: '700', lineHeight: 23, textAlign: 'center' },
  mockup: { width: '100%', borderRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: spacing.sm },
  mockHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  mockDot: { width: 10, height: 10, borderRadius: 99, backgroundColor: colors.cyan },
  mockTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  mockRow: { minHeight: 34, borderRadius: 14, backgroundColor: colors.glass, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  mockLine: { width: 28, height: 5, borderRadius: 99, backgroundColor: colors.cyan },
  mockText: { color: colors.mutedStrong, fontWeight: '800' },
  roleNote: { color: colors.gold, fontWeight: '900', lineHeight: 20, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 99, backgroundColor: colors.borderStrong },
  dotActive: { width: 28, backgroundColor: colors.cyan },
  footer: { flexDirection: 'row', gap: spacing.sm },
  secondaryButton: { minHeight: 50, borderRadius: 17, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  disabledButton: { opacity: 0.45 },
  secondaryText: { color: colors.text, fontWeight: '900' },
  disabledText: { color: colors.muted },
  primaryButton: { flex: 1, minHeight: 50, borderRadius: 17, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  primaryText: { color: colors.background, fontWeight: '900', textAlign: 'center' },
});

