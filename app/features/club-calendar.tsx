import { router } from 'expo-router';
import { CalendarDays, Clock, MapPin, ShieldCheck } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { GlassCard } from '@/components/GlassCard';
import { ClubCalendarItem, clubCalendarItems } from '@/services/clubCompetition';
import { FederationCalendarEvent, getFederationCalendarEvents } from '@/services/federationCalendar';
import { canManageClub, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

type ViewMode = 'weekly' | 'monthly';
type FilterMode = 'all' | 'club' | 'tyf' | 'races' | 'training';

type CalendarSourceItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  place: string;
  lane: string;
  group: string;
  type: string;
  color: string;
  source: 'club' | 'tyf';
  federationEvent?: FederationCalendarEvent;
};

const filters: Array<{ id: FilterMode; label: string }> = [
  { id: 'all', label: 'Tüm Etkinlikler' },
  { id: 'club', label: 'Kulüp' },
  { id: 'tyf', label: 'TYF Resmi Takvim' },
  { id: 'races', label: 'Yarışlar' },
  { id: 'training', label: 'Antrenmanlar' },
];

const monthDate = new Date(2026, 5, 1);
const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function ClubCalendarScreen() {
  const { currentUser } = useSession();
  const officialEvents = getFederationCalendarEvents();
  const [mode, setMode] = useState<ViewMode>('monthly');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selectedDate, setSelectedDate] = useState(officialEvents[0]?.startDate ?? '04.06.2026');

  const allItems = useMemo(() => mergeCalendarItems(clubCalendarItems, officialEvents), [officialEvents]);
  const visibleItems = useMemo(() => allItems.filter((item) => filterItem(item, filter)), [allItems, filter]);
  const grouped = useMemo(() => groupByDate(visibleItems), [visibleItems]);
  const selectedItems = grouped[selectedDate] ?? [];
  const monthDays = useMemo(() => buildMonthDays(monthDate), []);
  const canPrepareRoster = canManageClub(currentUser.role);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppLogo compact={true} size={40} showTitle={false} />
          <CalendarDays color={colors.cyan} size={28} />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Kulüp Takvimi</Text>
            <Text style={styles.subtitle}>Kulüp planı ve TYF resmi yarış takvimi aynı görünümde.</Text>
          </View>
        </View>

        <View style={styles.segmented}>
          <ModeButton label="Haftalık" active={mode === 'weekly'} onPress={() => setMode('weekly')} />
          <ModeButton label="Aylık" active={mode === 'monthly'} onPress={() => setMode('monthly')} />
        </View>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((item) => (
            <Pressable key={item.id} style={[styles.filterChip, filter === item.id && styles.filterChipActive]} onPress={() => setFilter(item.id)}>
              <Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {mode === 'monthly' ? (
          <GlassCard style={styles.calendarCard}>
            <Text style={styles.monthTitle}>Haziran 2026</Text>
            <View style={styles.weekRow}>
              {weekDays.map((day) => <Text key={day} style={styles.weekLabel}>{day}</Text>)}
            </View>
            <View style={styles.monthGrid}>
              {monthDays.map((day, index) => {
                const dateKey = day ? formatDateKey(day) : `empty-${index}`;
                const events = day ? grouped[dateKey] ?? [] : [];
                const active = selectedDate === dateKey;
                return (
                  <Pressable key={dateKey} style={[styles.dayCell, active && styles.dayCellActive]} disabled={!day} onPress={() => day && setSelectedDate(dateKey)}>
                    <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>{day ? day.getDate() : ''}</Text>
                    <View style={styles.dotRow}>
                      {events.slice(0, 3).map((event) => <View key={event.id} style={[styles.dot, { backgroundColor: event.color }]} />)}
                    </View>
                    {events.some((event) => event.source === 'tyf') ? <Text style={styles.tyfMini}>TYF</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>
        ) : (
          <View style={styles.weekList}>
            {monthDays.filter((day): day is Date => day !== null).slice(0, 7).map((day) => {
              const dateKey = formatDateKey(day);
              const events = grouped[dateKey] ?? [];
              return (
                <Pressable key={dateKey} style={[styles.weekDayCard, selectedDate === dateKey && styles.weekDayCardActive]} onPress={() => setSelectedDate(dateKey)}>
                  <Text style={styles.weekDayNumber}>{day.getDate()}</Text>
                  <Text style={styles.weekDayCount}>{events.length} etkinlik</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>Seçilen gün</Text>
        {selectedItems.map((item) => <CalendarCard key={item.id} item={item} canPrepareRoster={canPrepareRoster} />)}
        {!selectedItems.length ? <Text style={styles.empty}>Bu gün için etkinlik yok.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ModeButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.modeButton, active && styles.modeButtonActive]} onPress={onPress}>
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </Pressable>
  );
}

function CalendarCard({ item }: { item: CalendarSourceItem; canPrepareRoster: boolean }) {
  return (
    <View style={[styles.eventCard, { borderLeftColor: item.color }]}>
      <View style={styles.eventHeader}>
        <Text style={[styles.type, { color: item.color }]}>{item.source === 'tyf' ? 'TYF Resmi Takvim' : item.type}</Text>
        {item.source === 'tyf' ? (
          <View style={styles.officialBadge}>
            <ShieldCheck color={colors.gold} size={13} />
            <Text style={styles.officialText}>Resmi Yarış</Text>
          </View>
        ) : (
          <Text style={styles.date}>{item.date}</Text>
        )}
      </View>
      <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
      <Info icon={Clock} value={item.time} />
      <Info icon={MapPin} value={`${item.place} • ${item.lane}`} />
      <Text style={styles.group}>{item.group}</Text>
      {false ? (
        <Pressable
          style={styles.prepareButton}
          onPress={() => router.push({
            pathname: '/features/competition-roster',
            params: {
              source: 'TYF',
              raceTitle: item.federationEvent?.title,
              raceDate: item.federationEvent?.startDate,
              poolType: item.federationEvent?.poolType,
            },
          })}
        >
          <Text style={styles.prepareText}>Yarış Listesi Hazırla</Text>
        </Pressable>
      ) : item.federationEvent ? (
        <Pressable style={styles.detailButton} onPress={() => router.push('/features/tyf-portal')}>
          <Text style={styles.detailText}>Detayları gör</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Info({ icon: Icon, value }: { icon: typeof Clock; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Icon color={colors.cyan} size={15} />
      <Text style={styles.infoText} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function mergeCalendarItems(clubItems: ClubCalendarItem[], federationItems: FederationCalendarEvent[]): CalendarSourceItem[] {
  const club = clubItems.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    time: item.time,
    place: item.place,
    lane: item.lane,
    group: item.group,
    type: item.type,
    color: getClubColor(item.type),
    source: 'club' as const,
  }));
  const federation = federationItems.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.startDate,
    time: 'TYF',
    place: event.city,
    lane: event.poolType,
    group: event.category,
    type: event.eventType,
    color: colors.gold,
    source: 'tyf' as const,
    federationEvent: event,
  }));
  return [...club, ...federation];
}

function getClubColor(type: ClubCalendarItem['type']) {
  if (type === 'antrenman') return colors.cyan;
  if (type === 'yarış') return '#60A5FA';
  if (type === 'kamp') return '#A78BFA';
  if (type === 'veli toplantısı') return colors.success;
  return colors.gold;
}

function filterItem(item: CalendarSourceItem, filter: FilterMode) {
  if (filter === 'all') return true;
  if (filter === 'club') return item.source === 'club';
  if (filter === 'tyf') return item.source === 'tyf';
  if (filter === 'races') return item.source === 'tyf' || item.type === 'yarış';
  return item.type === 'antrenman';
}

function groupByDate(items: CalendarSourceItem[]) {
  return items.reduce<Record<string, CalendarSourceItem[]>>((acc, item) => {
    acc[item.date] = [...(acc[item.date] ?? []), item];
    return acc;
  }, {});
}

function buildMonthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days: Array<Date | null> = Array.from({ length: startOffset }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(month.getFullYear(), month.getMonth(), day));
  }
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function formatDateKey(date: Date) {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  headerCopy: { flex: 1 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', marginTop: 4, lineHeight: 20 },
  segmented: { flexDirection: 'row', borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: 4 },
  modeButton: { flex: 1, minHeight: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modeButtonActive: { backgroundColor: colors.cyan },
  modeText: { color: colors.muted, fontWeight: '900' },
  modeTextActive: { color: colors.background },
  filterRow: { gap: spacing.sm, paddingRight: spacing.lg },
  filterChip: { minHeight: 36, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
  filterChipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  filterText: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  filterTextActive: { color: colors.background },
  calendarCard: { gap: spacing.sm, shadowColor: colors.cyan, shadowOpacity: 0.06, shadowRadius: 12 },
  monthTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  weekRow: { flexDirection: 'row' },
  weekLabel: { flex: 1, color: colors.mutedStrong, fontWeight: '900', textAlign: 'center', fontSize: 11 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.285%', aspectRatio: 0.86, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: 4 },
  dayCellActive: { borderColor: colors.cyan, backgroundColor: colors.cyanSoft },
  dayNumber: { color: colors.text, fontWeight: '900', fontSize: 12 },
  dayNumberActive: { color: colors.cyan },
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 5, minHeight: 5 },
  dot: { width: 5, height: 5, borderRadius: 999 },
  tyfMini: { color: colors.gold, fontWeight: '900', fontSize: 9, marginTop: 3, backgroundColor: colors.goldSoft, borderRadius: 999, paddingHorizontal: 3, alignSelf: 'flex-start' },
  weekList: { flexDirection: 'row', gap: spacing.sm },
  weekDayCard: { width: 88, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.sm },
  weekDayCardActive: { borderColor: colors.cyan, backgroundColor: colors.cyanSoft },
  weekDayNumber: { color: colors.text, fontWeight: '900', fontSize: 18 },
  weekDayCount: { color: colors.mutedStrong, fontWeight: '800', fontSize: 11, marginTop: 4 },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  eventCard: { borderLeftWidth: 4, borderRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.sm, shadowColor: colors.cyan, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, alignItems: 'center' },
  type: { fontWeight: '900', fontSize: 12 },
  date: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  officialBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.35)', paddingHorizontal: 8, paddingVertical: 5 },
  officialText: { color: colors.gold, fontWeight: '900', fontSize: 11 },
  eventTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { color: colors.mutedStrong, fontWeight: '800', flex: 1 },
  group: { color: colors.gold, fontWeight: '900' },
  prepareButton: { minHeight: 40, borderRadius: 16, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  prepareText: { color: colors.background, fontWeight: '900' },
  detailButton: { minHeight: 38, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.35)', backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  detailText: { color: colors.gold, fontWeight: '900' },
  empty: { color: colors.muted, fontWeight: '800', textAlign: 'center', padding: spacing.md },
});
