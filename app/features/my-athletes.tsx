import { Award, ChevronDown, ChevronRight, ClipboardList, LucideIcon, Search, ShieldAlert, TrendingUp, Trophy, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { GradientBadge } from '@/components/GradientBadge';
import { generateAthleteListPdf } from '@/services/pdfReports';
import { canManageClub, roleLabel, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

type AthleteStatus = 'Aktif' | 'Pasif';
type ClubGroup = 'Performans' | 'Gelişim' | 'Temel Eğitim';
type Gender = 'Kadın' | 'Erkek';
type SortMode = 'Kulüp puanı' | 'Ada göre' | 'PB gelişimi' | 'Katılım';

type ManagedAthlete = {
  id: string;
  name: string;
  birthYear: number;
  gender: Gender;
  club: string;
  group: ClubGroup;
  mainStroke: string;
  bestTime: string;
  improvement: number;
  attendance: number;
  score: number;
  status: AthleteStatus;
};

const currentYear = new Date().getFullYear();
const groups: ClubGroup[] = ['Performans', 'Gelişim', 'Temel Eğitim'];
const genders: Array<Gender | 'Tümü'> = ['Tümü', 'Kadın', 'Erkek'];
const sortModes: SortMode[] = ['Kulüp puanı', 'Ada göre', 'PB gelişimi', 'Katılım'];

const initialAthletes: ManagedAthlete[] = [];

export default function MyAthletesScreen() {
  const { currentUser } = useSession();
  const [athletes] = useState(initialAthletes);
  const [query, setQuery] = useState('');
  const [ageFilter, setAgeFilter] = useState<string>('Tümü');
  const [groupFilter, setGroupFilter] = useState<ClubGroup | 'Tümü'>('Tümü');
  const [genderFilter, setGenderFilter] = useState<Gender | 'Tümü'>('Tümü');
  const [sortMode, setSortMode] = useState<SortMode>('Kulüp puanı');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');
  const canView = canManageClub(currentUser.role);

  const filteredAthletes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('tr');
    return sortAthletes(
      athletes.filter((athlete) => {
        const ageGroup = getBirthYearGroup(athlete.birthYear);
        const queryOk = !normalizedQuery || athlete.name.toLocaleLowerCase('tr').includes(normalizedQuery);
        const ageOk = ageFilter === 'Tümü' || ageGroup === ageFilter;
        const groupOk = groupFilter === 'Tümü' || athlete.group === groupFilter;
        const genderOk = genderFilter === 'Tümü' || athlete.gender === genderFilter;
        return queryOk && ageOk && groupOk && genderOk;
      }),
      sortMode,
    );
  }, [ageFilter, athletes, genderFilter, groupFilter, query, sortMode]);

  const ageGroups = useMemo(() => buildAgeGroups(filteredAthletes), [filteredAthletes]);
  const ageOptions = useMemo(() => ['Tümü', ...Array.from(new Set(athletes.map((athlete) => getBirthYearGroup(athlete.birthYear))))], [athletes]);
  const clubRanking = useMemo(() => sortAthletes(filteredAthletes, sortMode), [filteredAthletes, sortMode]);

  const handlePdf = async () => {
    const report = await generateAthleteListPdf(
      filteredAthletes.map((athlete) => ({
        name: athlete.name,
        ageCategory: getBirthYearGroup(athlete.birthYear),
        club: athlete.club,
        group: athlete.group,
        lastPb: athlete.bestTime,
        guardianStatus: 'Opsiyonel',
        status: athlete.status,
      })),
    );
    setMessage(report.message);
  };

  if (!canView) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.locked}>
          <ShieldAlert color={colors.gold} size={42} />
          <Text style={styles.title}>Kulüp Sporcuları</Text>
          <Text style={styles.subtitle}>Bu alan antrenör/kulüp hesabı gerektirir. Mevcut rol: {roleLabel(currentUser.role)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Kulüp Sporcuları</Text>
            <Text style={styles.subtitle}>Varsayılan görünüm doğum yılına göre gruplanır.</Text>
          </View>
          <GradientBadge label={`${filteredAthletes.length} sporcu`} tone={colors.coral} icon={Users} />
        </View>

        <AppButton title="Sporcu Listesi PDF" icon={ClipboardList} onPress={handlePdf} />
        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.searchBox}>
          <Search color={colors.coral} size={20} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Sporcu ara" placeholderTextColor={colors.muted} style={styles.searchInput} />
        </View>

        <FilterStrip title="Yaş" options={ageOptions} value={ageFilter} onChange={setAgeFilter} />
        <FilterStrip title="Grup" options={['Tümü', ...groups]} value={groupFilter} onChange={(value) => setGroupFilter(value as ClubGroup | 'Tümü')} />
        <FilterStrip title="Cinsiyet" options={genders} value={genderFilter} onChange={(value) => setGenderFilter(value as Gender | 'Tümü')} />
        <FilterStrip title="Sıralama" options={sortModes} value={sortMode} onChange={(value) => setSortMode(value as SortMode)} />

        <GlassCard style={styles.rankingCard} tone={colors.gold}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.sectionTitle}>Kulüp İçi Sıralama</Text>
              <Text style={styles.meta}>{sortMode} kriterine göre</Text>
            </View>
            <Trophy color={colors.gold} size={24} />
          </View>
          {clubRanking.slice(0, 5).map((athlete, index) => (
            <View key={athlete.id} style={styles.rankRow}>
              <Text style={styles.rankNo}>{index + 1}</Text>
              <View style={styles.rankCopy}>
                <Text style={styles.rankName}>{athlete.name}</Text>
                <Text style={styles.meta}>{athlete.group}  •  {athlete.bestTime}</Text>
              </View>
              <Text style={styles.rankScore}>{athlete.score}</Text>
            </View>
          ))}
        </GlassCard>

        {!ageGroups.length ? (
          <EmptyState title="Henüz sporcu eklenmedi" detail="Filtreleri değiştirerek tekrar deneyebilirsin." icon={Users} tone={colors.coral} />
        ) : null}

        {ageGroups.map((group) => {
          const open = expandedGroups[group.key] ?? true;
          return (
            <GlassCard key={group.key} style={styles.ageGroupCard} tone={colors.coral}>
              <Pressable style={styles.ageHeader} onPress={() => setExpandedGroups((current) => ({ ...current, [group.key]: !open }))}>
                <View>
                  <Text style={styles.ageTitle}>{group.key}</Text>
                  <Text style={styles.meta}>{group.athletes.length} sporcu  •  {group.birthYears.join(', ')}</Text>
                </View>
                {open ? <ChevronDown color={colors.coral} size={22} /> : <ChevronRight color={colors.coral} size={22} />}
              </Pressable>

              <View style={styles.highlightGrid}>
                <HighlightCard icon={Trophy} title="Yaş grubunun en iyisi" athlete={group.bestAthlete} tone={colors.gold} detail={`Puan ${group.bestAthlete.score}`} />
                <HighlightCard icon={TrendingUp} title="En çok gelişen" athlete={group.mostImproved} tone={colors.success} detail={`+${group.mostImproved.improvement.toFixed(1)}%`} />
              </View>

              {open ? (
                <View style={styles.athleteList}>
                  {group.athletes.map((athlete) => <AthleteRow key={athlete.id} athlete={athlete} />)}
                </View>
              ) : null}
            </GlassCard>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterStrip<T extends string>({ title, options, value, onChange }: { title: string; options: T[]; value: T; onChange: (value: T) => void }) {
  return (
    <View style={styles.filterBlock}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {options.map((option) => {
          const active = option === value;
          return (
            <Pressable key={option} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => onChange(option)}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function HighlightCard({ icon: Icon, title, athlete, detail, tone }: { icon: LucideIcon; title: string; athlete: ManagedAthlete; detail: string; tone: string }) {
  return (
    <View style={[styles.highlightCard, { borderColor: `${tone}55`, backgroundColor: `${tone}12` }]}>
      <View style={[styles.highlightIcon, { backgroundColor: `${tone}24` }]}>
        <Icon color={tone} size={19} />
      </View>
      <Text style={styles.highlightTitle}>{title}</Text>
      <Text style={styles.highlightName} numberOfLines={1}>{athlete.name}</Text>
      <Text style={styles.meta}>{detail}</Text>
    </View>
  );
}

function AthleteRow({ athlete }: { athlete: ManagedAthlete }) {
  return (
    <View style={styles.athleteRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{athlete.name.split(' ').slice(-1)[0]}</Text>
      </View>
      <View style={styles.athleteCopy}>
        <Text style={styles.athleteName}>{athlete.name}</Text>
        <Text style={styles.meta}>{athlete.birthYear}  •  {currentYear - athlete.birthYear} yaş ? {athlete.gender}</Text>
        <Text style={styles.meta}>{athlete.group}  •  {athlete.mainStroke}</Text>
      </View>
      <View style={styles.metricBox}>
        <Text style={styles.metricValue}>{athlete.bestTime}</Text>
        <Text style={styles.metricMeta}>+{athlete.improvement.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

function buildAgeGroups(athletes: ManagedAthlete[]) {
  const grouped = athletes.reduce<Record<string, ManagedAthlete[]>>((acc, athlete) => {
    const key = getBirthYearGroup(athlete.birthYear);
    acc[key] = [...(acc[key] ?? []), athlete];
    return acc;
  }, {});
  return Object.entries(grouped)
    .map(([key, groupAthletes]) => ({
      key,
      birthYears: Array.from(new Set(groupAthletes.map((athlete) => String(athlete.birthYear)))),
      athletes: groupAthletes,
      bestAthlete: sortAthletes(groupAthletes, 'Kulüp puanı')[0],
      mostImproved: sortAthletes(groupAthletes, 'PB gelişimi')[0],
    }))
    .filter((group) => group.athletes.length)
    .sort((a, b) => a.key.localeCompare(b.key, 'tr'));
}

function getBirthYearGroup(birthYear: number) {
  const age = currentYear - birthYear;
  if (age <= 10) return '10 yaş ve altı';
  if (age <= 12) return '11-12 yaş';
  if (age <= 14) return '13-14 yaş';
  if (age <= 16) return '15-16 yaş';
  return '17+ yaş';
}

function sortAthletes(athletes: ManagedAthlete[], mode: SortMode) {
  const sorted = [...athletes];
  if (mode === 'Ada göre') return sorted.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  if (mode === 'PB gelişimi') return sorted.sort((a, b) => b.improvement - a.improvement);
  if (mode === 'Katılım') return sorted.sort((a, b) => b.attendance - a.attendance);
  return sorted.sort((a, b) => b.score - a.score);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.md },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.mutedStrong, lineHeight: 21, fontWeight: '700', marginTop: 4 },
  message: { color: colors.text, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  searchBox: { minHeight: 50, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, color: colors.text, fontWeight: '800' },
  filterBlock: { gap: spacing.sm },
  filterTitle: { color: colors.text, fontWeight: '900' },
  filterRow: { gap: spacing.sm, paddingRight: spacing.lg },
  filterChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, paddingVertical: 8 },
  filterChipActive: { backgroundColor: colors.coralSoft, borderColor: 'rgba(249, 115, 22, 0.28)' },
  filterText: { color: colors.muted, fontWeight: '900' },
  filterTextActive: { color: colors.text },
  rankingCard: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  meta: { color: colors.mutedStrong, fontWeight: '700', lineHeight: 19 },
  rankRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: 16, backgroundColor: colors.surfaceSoft, padding: spacing.sm },
  rankNo: { width: 28, height: 28, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.gold, color: '#FFFFFF', textAlign: 'center', textAlignVertical: 'center', fontWeight: '900' },
  rankCopy: { flex: 1 },
  rankName: { color: colors.text, fontWeight: '900' },
  rankScore: { color: colors.gold, fontWeight: '900', fontSize: 18 },
  ageGroupCard: { gap: spacing.md },
  ageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  ageTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  highlightGrid: { flexDirection: 'row', gap: spacing.sm },
  highlightCard: { flex: 1, minHeight: 122, borderRadius: 18, borderWidth: 1, padding: spacing.sm, gap: 4 },
  highlightIcon: { width: 34, height: 34, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  highlightTitle: { color: colors.mutedStrong, fontWeight: '900', fontSize: 11 },
  highlightName: { color: colors.text, fontWeight: '900' },
  athleteList: { gap: spacing.sm },
  athleteRow: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.sm },
  avatar: { width: 42, height: 42, borderRadius: 16, backgroundColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.coral, fontWeight: '900', fontSize: 11 },
  athleteCopy: { flex: 1, minWidth: 0 },
  athleteName: { color: colors.text, fontWeight: '900', fontSize: 16 },
  metricBox: { alignItems: 'flex-end', maxWidth: 104 },
  metricValue: { color: colors.text, fontWeight: '900', textAlign: 'right' },
  metricMeta: { color: colors.success, fontWeight: '900', marginTop: 3 },
});

