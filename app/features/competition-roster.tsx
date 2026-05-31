import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronDown, ChevronRight, FileText, Plus, Search, ShieldAlert, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import {
  getAthletePB,
  getPreparedRosterGroups,
  RaceDay,
  RaceSession,
  relayRaceOptions,
  rosterAthletes,
  saveCompetitionRosterEntry,
  saveRelayRosterEntry,
  selectLabel,
  strokeDistances,
} from '@/services/clubCompetition';
import { canManageClub, roleLabel, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

type SheetState = { title: string; options: string[]; selected: string; onSelect: (value: string) => void } | null;

const raceDays: RaceDay[] = [selectLabel, '1. Gün', '2. Gün', '3. Gün', '4. Gün'];
const sessions: RaceSession[] = [selectLabel, 'Sabah Seansı', 'Akşam Seansı'];
const poolTypes = ['25m', '50m'];
const heats = [selectLabel, '1', '2', '3', '4', 'Final'];
const lanes = [selectLabel, '1', '2', '3', '4', '5', '6', '7', '8'];
const raceKinds = ['Bireysel Yarış', 'Bayrak Yarışı'];
const strokes = Object.keys(strokeDistances);
const teamCategories = ['Kadın', 'Erkek', 'Karma', '11-12 Yaş', '13-14 Yaş', '15-16 Yaş', 'Açık Yaş'];
const noPb = 'PB kaydı yok';

export default function CompetitionRosterScreen() {
  const params = useLocalSearchParams<{ source?: string; raceTitle?: string; raceDate?: string; poolType?: '25m' | '50m' }>();
  const { currentUser } = useSession();
  const [groups, setGroups] = useState(() => getPreparedRosterGroups());
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [competitionName, setCompetitionName] = useState(params.raceTitle ?? 'Ankara Bölge Şampiyonası');
  const [competitionDate, setCompetitionDate] = useState(params.raceDate ?? '20.02.2026');
  const [location, setLocation] = useState(params.source === 'TYF' ? 'Ankara' : 'İstanbul');
  const [athleteId, setAthleteId] = useState('ra-1');
  const [athleteSearch, setAthleteSearch] = useState('');
  const [raceKind, setRaceKind] = useState('Bireysel Yarış');
  const [stroke, setStroke] = useState('Serbest');
  const [selectedDistances, setSelectedDistances] = useState<string[]>(['50']);
  const [poolType, setPoolType] = useState<'25m' | '50m'>(params.poolType ?? '50m');
  const [raceDay, setRaceDay] = useState<RaceDay>(selectLabel);
  const [session, setSession] = useState<RaceSession>(selectLabel);
  const [heat, setHeat] = useState(selectLabel);
  const [lane, setLane] = useState(selectLabel);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [targetTimes, setTargetTimes] = useState<Record<string, string>>({});
  const [relayType, setRelayType] = useState(relayRaceOptions[1]);
  const [teamName, setTeamName] = useState('SwimLab A Takımı');
  const [teamCategory, setTeamCategory] = useState('Açık Yaş');
  const [relayAthleteIds, setRelayAthleteIds] = useState(['ra-1', 'ra-3', 'ra-2', 'ra-4']);
  const [message, setMessage] = useState('');
  const [sheet, setSheet] = useState<SheetState>(null);
  const [distanceSheetOpen, setDistanceSheetOpen] = useState(false);

  const canEdit = canManageClub(currentUser.role);
  const selectedAthlete = rosterAthletes.find((athlete) => athlete.id === athleteId) ?? rosterAthletes[0];
  const distanceOptions = strokeDistances[stroke] ?? [];
  const selectedPbRows = selectedDistances.map((distance) => ({
    distance,
    pb: getAthletePB({ athleteId, stroke, distance, poolType }),
  }));
  const athleteOptions = useMemo(() => {
    const normalized = athleteSearch.trim().toLocaleLowerCase('tr');
    return rosterAthletes.filter((athlete) => !normalized || athlete.name.toLocaleLowerCase('tr').includes(normalized));
  }, [athleteSearch]);

  if (!canEdit) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.locked}>
          <ShieldAlert color={colors.gold} size={42} />
          <Text style={styles.title}>Yarış Listesi Hazırla</Text>
          <Text style={styles.subtitle}>Bu alan sadece antrenör ve kulüp yöneticileri içindir. Mevcut rol: {roleLabel(currentUser.role)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const refreshGroups = () => setGroups(getPreparedRosterGroups());
  const toggleDistance = (distance: string) => setSelectedDistances((current) => current.includes(distance) ? current.filter((item) => item !== distance) : [...current, distance]);

  const handleSave = () => {
    if (!competitionName.trim() || !competitionDate.trim()) {
      setMessage('Yarış adı ve tarih zorunludur.');
      return;
    }

    if (raceKind === 'Bayrak Yarışı') {
      if (relayAthleteIds.length < 4) {
        setMessage('En az 4 sporcu seçmelisiniz.');
        return;
      }
      const relayAthletes = relayAthleteIds.map((id, index) => {
        const athlete = rosterAthletes.find((item) => item.id === id) ?? rosterAthletes[0];
        return { athleteId: athlete.id, athleteName: athlete.name, order: index + 1, reserve: index > 3 };
      });
      const saved = saveRelayRosterEntry({ competitionName, competitionDate, location, raceDay, session, heat, lane, estimatedTime, poolType, relayType, teamName, teamCategory, relayAthletes });
      refreshGroups();
      setMessage(`${saved.teamName} - ${saved.relayType} Canlı Giriş bekleyen listesine eklendi.`);
      return;
    }

    if (!selectedAthlete?.id || !stroke || selectedDistances.length < 1) {
      setMessage('En az 1 mesafe seçmelisiniz.');
      return;
    }

    const savedEntries = selectedDistances.map((distance) => saveCompetitionRosterEntry({
      competitionName,
      competitionDate,
      location,
      athleteId,
      athleteName: selectedAthlete.name,
      raceKind: 'individual',
      raceDay,
      session,
      heat,
      lane,
      estimatedTime,
      distance,
      stroke,
      poolType,
      pb: getAthletePB({ athleteId, stroke, distance, poolType }) ?? noPb,
      targetTime: targetTimes[distance] || '-',
    }));
    refreshGroups();
    setMessage(`${selectedAthlete.name} için ${savedEntries.length} yarış Canlı Giriş bekleyen listesine eklendi.`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Yarış Listesi Hazırla</Text>
        <Text style={styles.subtitle}>Sade form ile yarış başlığı oluştur, sporcu/branş ekle ve Canlı Giriş akışına gönder.</Text>

        <AppButton title="Canli Kronometre" icon={Plus} variant="secondary" onPress={() => router.push('/features/live-race-timer')} />

        {params.source === 'TYF' ? (
          <GlassCard style={styles.officialCard}>
            <Text style={styles.officialLabel}>TYF Resmi Takvim</Text>
            <Text style={styles.officialTitle}>{params.raceTitle ?? 'Resmi Yarış'}</Text>
            <Text style={styles.officialMeta}>{params.raceDate ?? '-'} • {params.poolType ?? poolType} • Yarış Listesi Hazırla</Text>
          </GlassCard>
        ) : null}

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <GlassCard style={styles.form}>
          <Text style={styles.blockTitle}>A) Yarış Bilgileri</Text>
          <TextInput value={competitionName} onChangeText={setCompetitionName} placeholder="Yarış adı" placeholderTextColor={colors.muted} style={styles.input} />
          <TextInput value={competitionDate} onChangeText={setCompetitionDate} placeholder="Tarih" placeholderTextColor={colors.muted} style={styles.input} />
          <TextInput value={location} onChangeText={setLocation} placeholder="Yer" placeholderTextColor={colors.muted} style={styles.input} />
          <SelectField label="Havuz tipi" value={poolType} onPress={() => setSheet({ title: 'Havuz tipi', options: poolTypes, selected: poolType, onSelect: (value) => setPoolType(value as '25m' | '50m') })} />

          <Text style={styles.blockTitle}>B) Sporcu Seç</Text>
          <View style={styles.searchBox}>
            <Search color={colors.cyan} size={17} />
            <TextInput value={athleteSearch} onChangeText={setAthleteSearch} placeholder="Sporcu adı veya soyadı ara" placeholderTextColor={colors.muted} style={styles.searchInput} />
          </View>
          <SelectField label="Sporcu" value={selectedAthlete.name} onPress={() => setSheet({ title: 'Sporcu seç', options: athleteOptions.map((athlete) => athlete.name), selected: selectedAthlete.name, onSelect: (value) => setAthleteId(rosterAthletes.find((athlete) => athlete.name === value)?.id ?? athleteId) })} />

          <Text style={styles.blockTitle}>C) Yarış Türü</Text>
          <SelectField label="Yarış türü" value={raceKind} onPress={() => setSheet({ title: 'Yarış türü', options: raceKinds, selected: raceKind, onSelect: setRaceKind })} />

          {raceKind === 'Bireysel Yarış' ? (
            <>
              <Text style={styles.blockTitle}>D) Bireysel Yarış</Text>
              <SelectField label="Stil seç" value={stroke} onPress={() => setSheet({ title: 'Stil seç', options: strokes, selected: stroke, onSelect: (value) => { setStroke(value); setSelectedDistances([]); setTargetTimes({}); } })} />
              <Pressable style={styles.selectField} onPress={() => setDistanceSheetOpen(true)}>
                <View>
                  <Text style={styles.selectLabel}>Mesafeleri Seç</Text>
                  <Text style={styles.selectValue}>{selectedDistances.length ? selectedDistances.map((item) => `${item}m`).join(', ') : 'Seçiniz'}</Text>
                </View>
                <ChevronRight color={colors.cyan} size={18} />
              </Pressable>
              <View style={styles.chipRow}>
                {selectedDistances.map((item) => <Text key={item} style={styles.chip}>{item}m</Text>)}
              </View>
              <InfoPanel title="Seçilen PB'ler">
                {selectedPbRows.map((row) => <Text key={row.distance} style={styles.infoText}>{row.distance}m {stroke}: {row.pb ?? noPb}</Text>)}
              </InfoPanel>
              <InfoPanel title="Hedef Dereceler">
                {selectedDistances.map((item) => (
                  <View key={item} style={styles.targetRow}>
                    <Text style={styles.targetLabel}>{item}m {stroke}</Text>
                    <TextInput value={targetTimes[item] ?? ''} onChangeText={(value) => setTargetTimes((current) => ({ ...current, [item]: value }))} placeholder="Hedef derece" placeholderTextColor={colors.muted} style={styles.targetInput} />
                  </View>
                ))}
              </InfoPanel>
            </>
          ) : (
            <>
              <Text style={styles.blockTitle}>D) Bayrak Yarışı</Text>
              <SelectField label="Bayrak türü" value={relayType} onPress={() => setSheet({ title: 'Bayrak türü', options: relayRaceOptions, selected: relayType, onSelect: setRelayType })} />
              <TextInput value={teamName} onChangeText={setTeamName} placeholder="Takım adı" placeholderTextColor={colors.muted} style={styles.input} />
              <SelectField label="Takım kategorisi" value={teamCategory} onPress={() => setSheet({ title: 'Takım kategorisi', options: teamCategories, selected: teamCategory, onSelect: setTeamCategory })} />
              <Text style={styles.relayTitle}>Sporcuları Toplu Seç</Text>
              {rosterAthletes.map((athlete) => {
                const selected = relayAthleteIds.includes(athlete.id);
                const order = relayAthleteIds.indexOf(athlete.id) + 1;
                return (
                  <Pressable key={athlete.id} style={[styles.relayAthleteRow, selected && styles.relayAthleteActive]} onPress={() => setRelayAthleteIds((current) => selected ? current.filter((id) => id !== athlete.id) : [...current, athlete.id])}>
                    <Text style={[styles.relayAthleteText, selected && styles.relayAthleteTextActive]}>{selected ? `${order}. ` : ''}{athlete.name}{selected && order > 4 ? ' • Yedek' : ''}</Text>
                  </Pressable>
                );
              })}
              <Text style={styles.relayHint}>Takım Sıralaması: Seçim sırasına göre 1-4, sonrası yedek sporcu olur.</Text>
            </>
          )}

          <Text style={styles.blockTitle}>E) Opsiyonel Bilgiler</Text>
          <SelectField label="Yarış günü" value={raceDay} onPress={() => setSheet({ title: 'Yarış günü', options: raceDays, selected: raceDay, onSelect: (value) => setRaceDay(value) })} />
          <SelectField label="Seans" value={session} onPress={() => setSheet({ title: 'Seans', options: sessions, selected: session, onSelect: (value) => setSession(value) })} />
          <SelectField label="Seri" value={heat} onPress={() => setSheet({ title: 'Seri', options: heats, selected: heat, onSelect: setHeat })} />
          <SelectField label="Kulvar" value={lane} onPress={() => setSheet({ title: 'Kulvar', options: lanes, selected: lane, onSelect: setLane })} />
          <TextInput value={estimatedTime} onChangeText={setEstimatedTime} placeholder="Tahmini saat" placeholderTextColor={colors.muted} style={styles.input} />
          <AppButton title="Kaydet" icon={Plus} onPress={handleSave} />
        </GlassCard>

        <Text style={styles.sectionTitle}>Hazırlanan Yarış Listeleri</Text>
        {groups.map((group) => {
          const open = !!openGroups[group.key];
          return (
            <GlassCard key={group.key} style={styles.groupCard}>
              <Pressable style={styles.groupHeader} onPress={() => setOpenGroups((current) => ({ ...current, [group.key]: !current[group.key] }))}>
                <View style={styles.groupCopy}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  <Text style={styles.groupMeta}>Toplam sporcu: {group.totalAthletes} • Toplam start: {group.totalStarts} • Bayrak: {group.relayCount}</Text>
                </View>
                {open ? <ChevronDown color={colors.cyan} size={20} /> : <ChevronRight color={colors.cyan} size={20} />}
              </Pressable>
              {open ? (
                <View style={styles.rows}>
                  {group.entries.map((entry) => <RosterRow key={entry.id} entry={entry} />)}
                  <View style={styles.exportRow}>
                    <AppButton title="PDF mock" icon={FileText} variant="secondary" onPress={() => setMessage(`${group.title} PDF mock hazır.`)} />
                    <AppButton title="CSV mock" icon={FileText} variant="secondary" onPress={() => setMessage(`${group.title} CSV mock hazır.`)} />
                  </View>
                </View>
              ) : null}
            </GlassCard>
          );
        })}
      </ScrollView>
      <SelectionSheet sheet={sheet} onClose={() => setSheet(null)} />
      <DistanceSheet visible={distanceSheetOpen} options={distanceOptions} selected={selectedDistances} onToggle={toggleDistance} onClose={() => setDistanceSheetOpen(false)} />
    </SafeAreaView>
  );
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.infoPanel}>
      <Text style={styles.infoTitle}>{title}</Text>
      <View style={styles.infoBody}>{children}</View>
    </View>
  );
}

function RosterRow({ entry }: { entry: ReturnType<typeof getPreparedRosterGroups>[number]['entries'][number] }) {
  const branch = entry.raceKind === 'relay' ? entry.relayType : `${entry.distance}m ${entry.stroke}`;
  return (
    <View style={styles.rosterRow}>
      <Text style={styles.rowTitle}>{entry.raceKind === 'relay' ? entry.teamName : entry.athleteName}</Text>
      <Text style={styles.rowMeta}>{branch} • PB {entry.pb || noPb} • Hedef {entry.targetTime === '-' ? 'boş' : entry.targetTime || 'boş'}</Text>
      <Text style={styles.rowMeta}>{entry.raceDay} • {entry.session} • Seri {entry.heat} • Kulvar {entry.lane}</Text>
      {entry.raceKind === 'relay' ? <Text style={styles.rowMeta}>{entry.relayAthletes?.map((athlete) => `${athlete.order}. ${athlete.athleteName}${athlete.reserve ? ' (Yedek)' : ''}`).join('\n')}</Text> : null}
    </View>
  );
}

function SelectField({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable style={styles.selectField} onPress={onPress}>
      <View>
        <Text style={styles.selectLabel}>{label}</Text>
        <Text style={styles.selectValue}>{value || selectLabel}</Text>
      </View>
      <ChevronRight color={colors.cyan} size={18} />
    </Pressable>
  );
}

function SelectionSheet({ sheet, onClose }: { sheet: SheetState; onClose: () => void }) {
  if (!sheet) return null;
  return (
    <Modal transparent={true} visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{sheet.title}</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X color={colors.text} size={18} />
            </Pressable>
          </View>
          <View style={styles.options}>
            {sheet.options.map((option) => {
              const active = option === sheet.selected;
              return (
                <Pressable key={option} style={[styles.option, active && styles.optionActive]} onPress={() => { sheet.onSelect(option); onClose(); }}>
                  {active ? <Check color={colors.background} size={14} /> : null}
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DistanceSheet({ visible, options, selected, onToggle, onClose }: { visible: boolean; options: string[]; selected: string[]; onToggle: (value: string) => void; onClose: () => void }) {
  if (!visible) return null;
  return (
    <Modal transparent={true} visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Mesafeleri Seç</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X color={colors.text} size={18} />
            </Pressable>
          </View>
          <View style={styles.options}>
            {options.map((option) => {
              const active = selected.includes(option);
              return (
                <Pressable key={option} style={[styles.option, active && styles.optionActive]} onPress={() => onToggle(option)}>
                  {active ? <Check color={colors.background} size={14} /> : <View style={styles.emptyCheck} />}
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}m</Text>
                </Pressable>
              );
            })}
          </View>
          <AppButton title="Tamam" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  content: { padding: spacing.lg, gap: 12, paddingBottom: 116 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', lineHeight: 21 },
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 18, padding: spacing.md },
  officialCard: { gap: 4, borderColor: 'rgba(245, 158, 11, 0.45)', shadowColor: colors.gold, shadowOpacity: 0.09, shadowRadius: 12 },
  officialLabel: { color: colors.gold, fontWeight: '900', fontSize: 12 },
  officialTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  officialMeta: { color: colors.mutedStrong, fontWeight: '800' },
  form: { gap: 10 },
  blockTitle: { color: colors.cyan, fontWeight: '900', fontSize: 14, marginTop: 4 },
  input: { minHeight: 44, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, color: colors.text, fontWeight: '800', paddingHorizontal: spacing.md },
  searchBox: { minHeight: 44, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchInput: { color: colors.text, fontWeight: '800', flex: 1 },
  selectField: { minHeight: 50, borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectLabel: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  selectValue: { color: colors.text, fontWeight: '900', marginTop: 3 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { color: colors.background, backgroundColor: colors.cyan, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, fontWeight: '900', fontSize: 12 },
  infoPanel: { borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, padding: spacing.md, gap: 8 },
  infoTitle: { color: colors.cyan, fontWeight: '900' },
  infoBody: { gap: 6 },
  infoText: { color: colors.text, fontWeight: '800' },
  targetRow: { gap: 5 },
  targetLabel: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  targetInput: { minHeight: 40, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, color: colors.text, fontWeight: '800', paddingHorizontal: spacing.md },
  relayTitle: { color: colors.text, fontWeight: '900', fontSize: 15 },
  relayAthleteRow: { minHeight: 40, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, justifyContent: 'center' },
  relayAthleteActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  relayAthleteText: { color: colors.mutedStrong, fontWeight: '900' },
  relayAthleteTextActive: { color: colors.background },
  relayHint: { color: colors.muted, fontWeight: '800', lineHeight: 19 },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  groupCard: { gap: spacing.sm, padding: 12 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  groupCopy: { flex: 1 },
  groupTitle: { color: colors.text, fontWeight: '900', fontSize: 16, lineHeight: 21 },
  groupMeta: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4, fontSize: 12 },
  rows: { gap: spacing.sm, marginTop: spacing.sm },
  rosterRow: { borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: 4 },
  rowTitle: { color: colors.text, fontWeight: '900' },
  rowMeta: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 18 },
  exportRow: { flexDirection: 'row', gap: spacing.sm },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { maxHeight: '76%', backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.lg, gap: spacing.md },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  closeButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  options: { gap: spacing.sm },
  option: { minHeight: 44, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  optionActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  optionText: { color: colors.mutedStrong, fontWeight: '900' },
  optionTextActive: { color: colors.background },
  emptyCheck: { width: 14, height: 14, borderRadius: 4, borderWidth: 1, borderColor: colors.borderStrong },
});
