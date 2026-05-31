import { BellRing, CheckCircle2, Megaphone } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { ClubBoardCategory, ClubBoardItem, clubBoardItems, ClubPriority } from '@/services/clubCompetition';
import { getClubBoardLessonAds, LessonAd } from '@/services/lessonAds';
import { useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

const tabs: ClubBoardCategory[] = ['Duyurular', 'Takvim', 'Yarışlar', 'Kamp', 'Acil Bildirim'];

export default function ClubBoardScreen() {
  const { currentUser } = useSession();
  const [activeTab, setActiveTab] = useState<ClubBoardCategory>('Duyurular');
  const [message, setMessage] = useState('');
  const lessonAds = useMemo(() => getClubBoardLessonAds(currentUser.club), [currentUser.club, activeTab]);
  const visibleItems = useMemo(
    () => clubBoardItems.filter((item) => activeTab === 'Acil Bildirim' ? item.priority === 'emergency' : item.category === activeTab),
    [activeTab],
  );

  const sendEmergencyMock = async () => {
    const { scheduleClubAnnouncementReminder } = await import('@/services/notifications');
    await scheduleClubAnnouncementReminder({ title: 'Acil kulüp bildirimi', body: 'Bu duyuru push + in-app olarak işaretlendi.', seconds: 2 });
    setMessage('Acil duyuru için push + in-app bildirim gönderilecek.');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Megaphone color={colors.cyan} size={28} />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Kulüp Panosu</Text>
            <Text style={styles.subtitle}>Duyuru, takvim, yarış, kamp ve acil bildirim merkezi.</Text>
          </View>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((tab) => (
            <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {activeTab === 'Acil Bildirim' ? (
          <Pressable style={styles.emergencyButton} onPress={sendEmergencyMock}>
            <BellRing color={colors.background} size={18} />
            <Text style={styles.emergencyButtonText}>Acil bildirim mock gönder</Text>
          </Pressable>
        ) : null}

        {visibleItems.map((item) => <BoardCard key={item.id} item={item} />)}
        {activeTab === 'Duyurular' && lessonAds.length ? (
          <>
            <Text style={styles.sectionTitle}>Özel Ders İlanı</Text>
            {lessonAds.map((ad) => <LessonBoardCard key={ad.id} ad={ad} />)}
          </>
        ) : null}
        {!visibleItems.length && !(activeTab === 'Duyurular' && lessonAds.length) ? <Text style={styles.emptyText}>Bu sekmede kayıt yok.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function LessonBoardCard({ ad }: { ad: LessonAd }) {
  return (
    <GlassCard style={[styles.card, { borderLeftColor: colors.cyan }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>{ad.title}</Text>
          <Text style={styles.description}>{ad.branch} • {ad.level} • {ad.schedule}</Text>
        </View>
        <Text style={[styles.priority, { color: colors.cyan }]}>Özel Ders</Text>
      </View>
      <View style={styles.metaGrid}>
        <Meta label="Kulüp" value={ad.clubName} />
        <Meta label="Antrenör" value={ad.coachName} />
        <Meta label="Kontenjan" value={ad.capacity} />
        <Meta label="Durum" value={ad.status === 'active' ? 'Aktif' : 'Pasif'} />
      </View>
    </GlassCard>
  );
}

function BoardCard({ item }: { item: ClubBoardItem }) {
  const accent = priorityColor(item.priority);
  return (
    <GlassCard style={[styles.card, { borderLeftColor: accent }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        <Text style={[styles.priority, { color: accent }]}>{priorityLabel(item.priority)}</Text>
      </View>

      <View style={styles.metaGrid}>
        <Meta label="Kategori" value={item.category} />
        <Meta label="Tarih" value={item.date} />
        <Meta label="Kulüp" value={item.club} />
        <Meta label="Yayınlayan" value={item.publisher} />
      </View>

      <View style={styles.footer}>
        <View style={styles.seenPill}>
          <CheckCircle2 color={colors.cyan} size={15} />
          <Text style={styles.seenText}>{item.seenUsers.length} görüldü</Text>
        </View>
        <Text style={styles.notificationText}>{item.notification.join(' + ')}</Text>
      </View>
    </GlassCard>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function priorityColor(priority: ClubPriority) {
  if (priority === 'emergency') return colors.danger;
  if (priority === 'important') return colors.gold;
  return colors.cyan;
}

function priorityLabel(priority: ClubPriority) {
  if (priority === 'emergency') return 'emergency';
  if (priority === 'important') return 'important';
  return 'normal';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  headerCopy: { flex: 1 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 21, marginTop: 4, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 19 },
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  tabs: { gap: spacing.sm, paddingRight: spacing.lg },
  tab: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: spacing.md, paddingVertical: 9 },
  tabActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  tabText: { color: colors.mutedStrong, fontWeight: '900' },
  tabTextActive: { color: colors.background },
  emergencyButton: { minHeight: 48, borderRadius: 16, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emergencyButtonText: { color: colors.background, fontWeight: '900' },
  card: { gap: spacing.md, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  cardTitleWrap: { flex: 1 },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  description: { color: colors.mutedStrong, lineHeight: 20, fontWeight: '700', marginTop: 5 },
  priority: { fontWeight: '900', fontSize: 12 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metaItem: { width: '48%', borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.sm },
  metaLabel: { color: colors.muted, fontWeight: '900', fontSize: 11 },
  metaValue: { color: colors.text, fontWeight: '900', marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  seenPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.sm, paddingVertical: 7 },
  seenText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  notificationText: { color: colors.cyan, fontWeight: '900' },
  emptyText: { color: colors.muted, fontWeight: '800', textAlign: 'center', padding: spacing.lg },
});
