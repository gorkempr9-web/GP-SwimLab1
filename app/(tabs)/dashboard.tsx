import { router } from 'expo-router';
import { BellRing, CheckCircle2, LucideIcon } from 'lucide-react-native';
import { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { ClubLogo } from '@/components/ClubLogo';
import { EmptyState } from '@/components/EmptyState';
import { renderSafeTextChildren } from '@/components/SafeTextChildren';
import { nextRace, swimmerStats } from '@/data/mockData';
import { getUpcomingMeetEntryForRole } from '@/services/meetEntries';
import { getUnreadNotificationCount } from '@/services/notificationCenter';
import { panelLabel, useSession, UserRole } from '@/services/session';
import { getTrainingDashboardSummary } from '@/services/trainingPlans';
import { getAvailableQuickActions, getQuickActions, QuickAction, resetQuickActions, saveQuickActions } from '@/services/userPreferences';
import { colors, spacing, typography } from '@/theme/tokens';

const pbs: Array<{ event: string; time: string; pool: string; date: string; isNew?: boolean }> = [];

export default function DashboardScreen() {
  const { currentUser } = useSession();
  const { width } = useWindowDimensions();
  const actionColumns = width >= 390 ? 3 : 2;
  const actionWidth = (width - spacing.lg * 2 - spacing.sm * (actionColumns - 1)) / actionColumns;
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const [unreadNotifications] = useState(() => getUnreadNotificationCount());
  const [quickActions, setQuickActions] = useState(() => getQuickActions(currentUser.role));
  const [editing, setEditing] = useState(false);
  const [demoDataMessage, setDemoDataMessage] = useState('');
  const availableActions = useMemo(() => getAvailableQuickActions(currentUser.role), [currentUser.role]);
  const trainingSummary = getTrainingDashboardSummary(currentUser.role);
  const upcomingEntry = getUpcomingMeetEntryForRole(currentUser.role);

  useEffect(() => {
    setQuickActions(getQuickActions(currentUser.role));
  }, [currentUser.role]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start();
  }, [fade, translateY]);

  const selectedIds = quickActions.map((action) => action.id);
  const toggleAction = (action: QuickAction) => {
    const nextIds = selectedIds.includes(action.id)
      ? selectedIds.filter((id) => id !== action.id)
      : [...selectedIds, action.id].slice(0, 6);
    setQuickActions(saveQuickActions(currentUser.role, nextIds));
  };
  const moveAction = (id: string, direction: -1 | 1) => {
    const index = selectedIds.indexOf(id as never);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[target]] = [next[target], next[index]];
    setQuickActions(saveQuickActions(currentUser.role, next));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Animated.View style={[styles.animated, { opacity: fade, transform: [{ translateY }] }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View style={styles.identity}>
                <AppLogo compact={true} size={34} showTitle={true} showSlogan={false} />
                <View style={styles.headerCopy}>
                  <Text style={styles.greeting} numberOfLines={1}>Merhaba, {currentUser.firstName}</Text>
                  <Text style={styles.roleLine} numberOfLines={1}>{panelLabel(currentUser.role)} • {currentUser.club ?? 'SwimLab'}</Text>
                </View>
              </View>
              <Pressable style={styles.bellButton} onPress={() => router.push('/features/notifications')}>
                <BellRing color={colors.coral} size={20} />
                {unreadNotifications ? <Text style={styles.bellBadge}>{unreadNotifications}</Text> : null}
              </Pressable>
            </View>
            <View style={styles.clubStrip}>
              <ClubLogo club={currentUser.club} size={28} showName={true} />
            </View>
          </View>

          <RoleSummary role={currentUser.role} trainingSummary={trainingSummary} upcomingTitle={upcomingEntry?.competitionName || nextRace.name || 'Yaklaşan yarış yok'} />

          {currentUser.id.startsWith('demo-') ? (
            <GlassPanel>
              <Text style={styles.sectionTitle}>Demo Veri</Text>
              <Text style={styles.noticeLine}>Varsayılan demo girişte veriler boş gelir. İstersen pilot test için örnek veri yükleyebilirsin.</Text>
              <Pressable style={styles.sampleButton} onPress={() => setDemoDataMessage('Örnek veri yükleme akışı hazır. Varsayılan demo verileri boş bırakıldı.')}>
                <Text style={styles.sampleButtonText}>Örnek Veri Yükle</Text>
              </Pressable>
              {demoDataMessage ? <Text style={styles.noticeLine}>{demoDataMessage}</Text> : null}
            </GlassPanel>
          ) : null}

          {currentUser.role === 'athlete' || currentUser.role === 'parent' ? <PbCarousel /> : null}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
            <Pressable style={styles.editButton} onPress={() => setEditing((value) => !value)}>
              <Text style={styles.editText}>{editing ? 'Tamam' : 'Hızlı İşlemleri Düzenle'}</Text>
            </Pressable>
          </View>

          {editing ? (
            <GlassPanel>
              <View style={styles.editorHeader}>
                <Text style={styles.editorTitle}>İşlem ekle / çıkar</Text>
                <Pressable onPress={() => setQuickActions(resetQuickActions(currentUser.role))}>
                  <Text style={styles.resetText}>Sıfırla</Text>
                </Pressable>
              </View>
              <View style={styles.editorList}>
                {availableActions.map((action) => {
                  const active = selectedIds.includes(action.id);
                  return (
                    <Pressable key={action.id} style={[styles.editorChip, active && styles.editorChipActive]} onPress={() => toggleAction(action)}>
                      <CheckCircle2 color={active ? colors.background : colors.muted} size={15} />
                      <Text style={[styles.editorChipText, active && styles.editorChipTextActive]}>{action.title}</Text>
                      {active ? (
                        <View style={styles.moveActions}>
                          <Pressable onPress={() => moveAction(action.id, -1)}><Text style={styles.moveText}>↑</Text></Pressable>
                          <Pressable onPress={() => moveAction(action.id, 1)}><Text style={styles.moveText}>↓</Text></Pressable>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </GlassPanel>
          ) : null}

          <View style={styles.quickGrid}>
            {quickActions.slice(0, 6).map((action) => <QuickActionCard key={action.id} action={action} width={actionWidth} />)}
          </View>

          <GlassPanel>
            <Text style={styles.sectionTitle}>Mini Bildirimler</Text>
            <Text style={styles.noticeLine}>Bugünkü antrenman planını kontrol et.</Text>
            <Text style={styles.noticeLine}>Yarış merkezi üzerinden tüm yarış işlemlerine ulaşabilirsin.</Text>
          </GlassPanel>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function RoleSummary({ role, trainingSummary, upcomingTitle }: { role: UserRole; trainingSummary: string; upcomingTitle: string }) {
  if (role === 'coach') {
    return (
      <SummaryCard title="Antrenör Özeti">
        <MiniLink label="Bugünkü Antrenman" value="-" route="/(tabs)/plans" />
        <MiniLink label="Bekleyen Sonuç Girişi" value="0" route="/features/live-race" />
        <MiniLink label="Takım Listesi" value="0" route="/features/competition-roster" />
        <MiniLink label="Yaklaşan Yarış" value="Yok" route="/(tabs)/races" />
      </SummaryCard>
    );
  }
  if (role === 'club_admin') {
    return (
      <SummaryCard title="Kulüp Özeti">
        <MiniLink label="Bugünkü Antrenman" value="-" route="/(tabs)/plans" />
        <MiniLink label="Bekleyen Sonuç Girişi" value="0" route="/features/live-race" />
        <MiniLink label="Takım Listesi" value="0" route="/features/competition-roster" />
        <MiniLink label="Yaklaşan Yarış" value="Yok" route="/(tabs)/races" />
      </SummaryCard>
    );
  }
  return (
    <SummaryCard title="Sporcu Özeti">
      <MiniLink label="Yaklaşan Yarış" value={upcomingTitle} route="/(tabs)/races" />
      <MiniLink label="Son PB" value={swimmerStats.personalBest} route="/(tabs)/races" />
      <MiniLink label="Haftalık Antrenman" value={trainingSummary} route="/(tabs)/plans" />
      <MiniLink label="Kısa Gelişim" value="+4.7%" route="/features/reports" />
    </SummaryCard>
  );
}

function SummaryCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <GlassPanel>
      <Text style={styles.summaryTitle}>{title}</Text>
      <View style={styles.summaryGrid}>{renderSafeTextChildren(children)}</View>
    </GlassPanel>
  );
}

function MiniLink({ label, value, route }: { label: string; value: string; route: string }) {
  return (
    <Pressable style={styles.summaryItem} onPress={() => router.push(route as never)}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={1}>{value}</Text>
    </Pressable>
  );
}

function PbCarousel() {
  if (!pbs.length) {
    return <EmptyState title="Henüz PB kaydı yok" detail="İlk yarış sonucu eklendiğinde kişisel en iyi dereceler burada görünecek." icon={CheckCircle2} tone={colors.gold} />;
  }

  return (
    <View style={styles.pbSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>PB'lerim</Text>
        <Pressable onPress={() => router.push('/(tabs)/races')}>
          <Text style={styles.editText}>Tüm PB'ler</Text>
        </Pressable>
      </View>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pbList}>
        {pbs.map((pb) => (
          <Pressable key={pb.event} style={styles.pbCard} onPress={() => router.push('/(tabs)/races')}>
            <Text style={styles.pbEvent}>{pb.event}</Text>
            <Text style={styles.pbTime}>{pb.time}</Text>
            <Text style={styles.pbMeta}>{pb.pool} • {pb.date}</Text>
            {pb.isNew ? <Text style={styles.newPb}>Yeni PB</Text> : null}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function QuickActionCard({ action, width }: { action: QuickAction; width: number }) {
  const Icon = action.icon;
  const tone = getActionTone(action);
  return (
    <Pressable style={({ pressed }) => [styles.quickCard, { width, borderColor: `${tone}66` }, pressed && styles.pressed]} onPress={() => router.push(action.route as never)}>
      <View style={[styles.quickIconBadge, { backgroundColor: `${tone}24` }]}>
        <Icon color={tone} size={23} />
      </View>
      <Text style={styles.quickTitle} numberOfLines={2}>{action.title}</Text>
    </Pressable>
  );
}

function getActionTone(action: QuickAction) {
  if (action.id.includes('result') || action.id.includes('pb') || action.id.includes('roster') || action.id.includes('tyf')) return colors.gold;
  if (action.id.includes('ai') || action.id.includes('compare')) return colors.violet;
  if (action.id.includes('pdf') || action.id.includes('report')) return colors.teal;
  if (action.id.includes('lesson') || action.id.includes('calendar') || action.id.includes('plan')) return colors.blue;
  if (action.id.includes('notification')) return colors.coral;
  if (action.id.includes('club') || action.id.includes('invite')) return colors.coral;
  return colors.cyan;
}

function GlassPanel({ children }: { children: ReactNode }) {
  return <View style={styles.panel}>{renderSafeTextChildren(children)}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  animated: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  headerCard: { borderRadius: 22, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: spacing.sm, shadowColor: colors.text, shadowOpacity: 0.08, shadowRadius: 18, elevation: 4 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  identity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerCopy: { flex: 1, minWidth: 0 },
  greeting: { ...typography.h2, color: colors.text },
  roleLine: { color: colors.mutedStrong, fontWeight: '800', marginTop: 3 },
  bellButton: { width: 42, height: 42, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.24)', backgroundColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center' },
  bellBadge: { position: 'absolute', right: -3, top: -4, minWidth: 18, height: 18, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.danger, color: colors.text, fontSize: 10, textAlign: 'center', fontWeight: '900' },
  clubStrip: { alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft, paddingHorizontal: 8, paddingVertical: 5 },
  panel: { borderRadius: 22, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: spacing.md, shadowColor: colors.text, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  summaryTitle: { color: colors.text, fontWeight: '900', fontSize: 19 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summaryItem: { width: '48%', minHeight: 74, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, padding: spacing.sm, justifyContent: 'space-between' },
  summaryLabel: { color: colors.mutedStrong, fontWeight: '900', fontSize: 11 },
  summaryValue: { color: colors.text, fontWeight: '900', fontSize: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  editButton: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.sm, paddingVertical: 8 },
  editText: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  pbSection: { gap: spacing.sm },
  pbList: { gap: spacing.sm, paddingRight: spacing.lg },
  pbCard: { width: 148, minHeight: 112, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.38)', backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: 4, shadowColor: colors.gold, shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 },
  pbEvent: { color: colors.text, fontWeight: '900' },
  pbTime: { color: colors.gold, fontWeight: '900', fontSize: 22 },
  pbMeta: { color: colors.mutedStrong, fontWeight: '800', fontSize: 11 },
  newPb: { alignSelf: 'flex-start', color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, marginTop: 4 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickCard: { aspectRatio: 1, borderRadius: 22, borderWidth: 1, backgroundColor: colors.surfaceSolid, padding: spacing.sm, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, shadowColor: colors.text, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  quickIconBadge: { width: 48, height: 48, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { color: colors.text, fontWeight: '900', lineHeight: 17, textAlign: 'center', fontSize: 12 },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  editorTitle: { color: colors.text, fontWeight: '900' },
  resetText: { color: colors.gold, fontWeight: '900' },
  editorList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  editorChip: { minHeight: 38, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 6 },
  editorChipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  editorChipText: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  editorChipTextActive: { color: colors.background },
  moveActions: { flexDirection: 'row', gap: 2 },
  moveText: { color: colors.background, fontWeight: '900', fontSize: 14 },
  noticeLine: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 20 },
  sampleButton: { alignSelf: 'flex-start', borderRadius: 999, backgroundColor: colors.coral, paddingHorizontal: spacing.md, paddingVertical: 10 },
  sampleButtonText: { color: colors.background, fontWeight: '900' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
