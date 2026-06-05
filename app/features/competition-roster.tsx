import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronDown, ChevronRight, FileText, Plus, Search, ShieldAlert, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { renderSafeTextChildren } from '@/components/SafeTextChildren';
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
  const [competitionName, setCompetitionName] = useState(params.raceTitle ?? '');
  const [competitionDate, setCompetitionDate] = useState(params.raceDate ?? '');
  const [location, setLocation] = useState('');
  const [athleteId, setAthleteId] = useState(rosterAthletes[0]?.id ?? '');
  const [athleteSearch, setAthleteSearch] = useState('');
  const [raceKind, setRaceKind] = useState('Bireysel Yarış');
  const [stroke, setStroke] = useState('Serbest');
  const [selectedDistances, setSelectedDistances] = useState<string[]>([]);
  const [poolType, setPoolType] = useState<'25m' | '50m'>(params.poolType ?? '50m');
  const [raceDay, setRaceDay] = useState<RaceDay>(selectLabel);
  const [session, setSession] = useState<RaceSession>(selectLabel);
  const [heat, setHeat] = useState(selectLabel);
  const [lane, setLane] = useState(selectLabel);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [targetTimes, setTargetTimes] = useState<Record<string, string>>({});
  const [relayType, setRelayType] = useState(relayRaceOptions[0] ?? '4x50m Serbest Bayrak');
  const [teamName, setTeamName] = useState('');
  const [teamCategory, setTeamCategory] = useState('Açık Yaş');
  const [relayAthleteIds, setRelayAthleteIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [sheet, setSheet] = useState<SheetState>(null);
  const [distanceSheetOpen, setDistanceSheetOpen] = useState(false);

  const canEdit = canManageClub(currentUser.role);
  const selectedAthlete = rosterAthletes.find((athlete) => athlete.id === athleteId);
  const distanceOptions = strokeDistances[stroke] ?? [];
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
        const athlete = rosterAthletes.find((item) => item.id === id);
        return { athleteId: athlete?.id ?? id, athleteName: athlete?.name ?? 'İsimsiz Sporcu', order: index + 1, reserve: index > 3 };
      });
      const saved = saveRelayRosterEntry({ competitionName, competitionDate, location, raceDay, session, heat, lane, estimatedTime, poolType, relayType, teamName: teamName || 'İsimsiz Takım', teamCategory, relayAthletes });
      refreshGroups();
      setMessage(`${saved.teamName ?? 'İsimsiz Takım'} canlı sonuç bekleyen listesine eklendi.`);
      return;
    }

    if (!selectedAthlete?.id) {
      setMessage('Henüz sporcu eklenmedi.');
      return;
    }
    if (selectedDistances.length < 1) {
      setMessage('En az 1 mesafe seçmelisiniz.');
      return;
    }

    const savedEntries = selectedDistances.map((distance) => saveCompetitionRosterEntry({
      competitionName,
      competitionDate,
      location,
      athleteId: selectedAthlete.id,
      athleteName: selectedAthlete.name ?? 'İsimsiz Sporcu',
      raceKind: 'individual',
      raceDay,
      session,
      heat,
      lane,
      estimatedTime,
      distance,
      stroke,
      poolType,
      pb: getAthletePB({ athleteId: selectedAthlete.id, stroke, distance, poolType }) ?? noPb,
      targetTime: targetTimes[distance] || '-',
    }));
    refreshGroups();
    setMessage(`${selectedAthlete.name ?? 'İsimsiz Sporcu'} için ${savedEntries.length} yarış canlı sonuç bekleyen listesine eklendi.`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Yarış Listesi Hazırla</Text>
        <Text style={styles.subtitle}>Takım listesi, canlı sonuç girişi ve rapor akışını tek yarış merkezi altında yönetin.</Text>

        {params.source === 'TYF' ? (
          <GlassCard style={styles.officialCard}>
            <Text style={styles.officialLabel}>TYF Panelleri</Text>
            <Text style={styles.officialTitle}>{params.raceTitle ?? 'Yarış seçilmedi'}</Text>
            <Text style={styles.officialMeta}>{params.raceDate ?? '-'} • {params.poolType ?? poolType} • Yarış Listesi Hazırla</Text>
          </GlassCard>
        ) : null}

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <GlassCard style={styles.form}>
          <Text style={styles.blockTitle}>Yarış Bilgileri</Text>
          <TextInput value={competitionName} onChangeText={setCompetitionName} placeholder="Yarış adı" placeholderTextColor={colors.muted} style={styles.input} />
          <TextInput value={competitionDate} onChangeText={setCompetitionDate} placeholder="Tarih" placeholderTextColor={colors.muted} style={styles.input} />
          <TextInput value={location} onChangeText={setLocation} placeholder="Yer" placeholderTextColor={colors.muted} style={styles.input} />
          <SelectField label="Havuz tipi" value={poolType} onPress={() => setSheet({ title: 'Havuz tipi', options: poolTypes, selected: poolType, onSelect: (value) => setPoolType(value as '25m' | '50m') })} />

          <Text style={styles.blockTitle}>Sporcu Seç</Text>
          {rosterAthletes.length === 0 ? (
            <EmptyState title="Henüz sporcu eklenmedi." detail="Kulüp sporcuları eklendiğinde yarış listesi buradan hazırlanacak." icon={Search} tone={colors.coral} />
          ) : (
            <>
              <View style={styles.searchBox}>
                <Search color={colors.coral} size={17} />
                <TextInput value={athleteSearch} onChangeText={setAthleteSearch} placeholder="Sporcu adı veya soyadı ara" placeholderTextColor={colors.muted} style={styles.searchInput} />
              </View>
              <SelectField label="Sporcu" value={selectedAthlete?.name ?? 'İsimsiz Sporcu'} onPress={() => setSheet({ title: 'Sporcu seç', options: athleteOptions.map((athlete) => athlete.name ?? 'İsimsiz Sporcu'), selected: selectedAthlete?.name ?? '', onSelect: (value) => setAthleteId(rosterAthletes.find((athlete) => athlete.name === value)?.id ?? athleteId) })} />
            </>
          )}

          <Text style={styles.blockTitle}>Yarış Türü</Text>
          <SelectField label="Yarış türü" value={raceKind} onPress={() => setSheet({ title: 'Yarış türü', options: raceKinds, selected: raceKind, onSelect: setRaceKind })} />

          {raceKind === 'Bireysel Yarış' ? (
            <>
              <SelectField label="Stil seç" value={stroke} onPress={() => setSheet({ title: 'Stil seç', options: strokes, selected: stroke, onSelect: (value) => { setStroke(value); setSelectedDistances([]); setTargetTimes({}); } })} />
              <Pressable style={styles.selectField} onPress={() => setDistanceSheetOpen(true)}>
                <View>
                  <Text style={styles.selectLabel}>Mesafeleri Seç</Text>
                  <Text style={styles.selectValue}>{selectedDistances.length ? selectedDistances.map((item) => `${item}m`).join(', ') : 'Seçiniz'}</Text>
                </View>
                <ChevronRight color={colors.coral} size={18} />
              </Pressable>
              {selectedDistances.length ? (
                <InfoPanel title="Seçilen PBler">
                  {selectedDistances.map((distance) => <Text key={distance} style={styles.infoText}>{distance}m {stroke}: {selectedAthlete ? getAthletePB({ athleteId: selectedAthlete.id, stroke, distance, poolType }) ?? noPb : noPb}</Text>)}
                </InfoPanel>
              ) : null}
              {selectedDistances.length ? (
                <InfoPanel title="Hedef Dereceler">
                  {selectedDistances.map((item) => (
                    <View key={item} style={styles.targetRow}>
                      <Text style={styles.targetLabel}>{item}m {stroke}</Text>
                      <TextInput value={targetTimes[item] ?? ''} onChangeText={(value) => setTargetTimes((current) => ({ ...current, [item]: value }))} placeholder="Hedef derece" placeholderTextColor={colors.muted} style={styles.targetInput} />
                    </View>
                  ))}
                </InfoPanel>
              ) : null}
            </>
          ) : (
            <>
              <SelectField label="Bayrak türü" value={relayType} onPress={() => setSheet({ title: 'Bayrak türü', options: relayRaceOptions, selected: relayType, onSelect: setRelayType })} />
              <TextInput value={teamName} onChangeText={setTeamName} placeholder="Takım adı" placeholderTextColor={colors.muted} style={styles.input} />
              <SelectField label="Takım kategorisi" value={teamCategory} onPress={() => setSheet({ title: 'Takım kategorisi', options: teamCategories, selected: teamCategory, onSelect: setTeamCategory })} />
            </>
          )}

          <Text style={styles.blockTitle}>Opsiyonel Bilgiler</Text>
          <SelectField label="Yarış günü" value={raceDay} onPress={() => setSheet({ title: 'Yarış günü', options: raceDays, selected: raceDay, onSelect: (value) => setRaceDay(value as RaceDay) })} />
          <SelectField label="Seans" value={session} onPress={() => setSheet({ title: 'Seans', options: sessions, selected: session, onSelect: (value) => setSession(value as RaceSession) })} />
          <SelectField label="Seri" value={heat} onPress={() => setSheet({ title: 'Seri', options: heats, selected: heat, onSelect: setHeat })} />
          <SelectField label="Kulvar" value={lane} onPress={() => setSheet({ title: 'Kulvar', options: lanes, selected: lane, onSelect: setLane })} />
          <TextInput value={estimatedTime} onChangeText={setEstimatedTime} placeholder="Tahmini saat" placeholderTextColor={colors.muted} style={styles.input} />
          <AppButton title="Kaydet" icon={Plus} onPress={handleSave} />
        </GlassCard>

        <Text style={styles.sectionTitle}>Hazırlanan Yarış Listeleri</Text>
        {groups.length === 0 ? <EmptyState title="Henüz yarış listesi oluşturulmadı." detail="Sporcu ve branş eklendiğinde listeler burada görünecek." icon={FileText} tone={colors.coral} /> : null}
        {groups.map((group) => {
          const open = !!openGroups[group.key];
          return (
            <GlassCard key={group.key} style={styles.groupCard}>
              <Pressable style={styles.groupHeader} onPress={() => setOpenGroups((current) => ({ ...current, [group.key]: !current[group.key] }))}>
                <View style={styles.groupCopy}>
                  <Text style={styles.groupTitle}>{group.title ?? 'Yarış seçilmedi'}</Text>
                  <Text style={styles.groupMeta}>Toplam sporcu: {group.totalAthletes} • Toplam start: {group.totalStarts} • Bayrak: {group.relayCount}</Text>
                </View>
                {open ? <ChevronDown color={colors.coral} size={20} /> : <ChevronRight color={colors.coral} size={20} />}
              </Pressable>
              {open ? (
                <View style={styles.rows}>
                  {group.entries.map((entry) => <RosterRow key={entry.id} entry={entry} />)}
                  <View style={styles.exportRow}>
                    <AppButton title="PDF mock" icon={FileText} variant="secondary" onPress={() => setMessage(`${group.title} PDF hazır.`)} />
                    <AppButton title="CSV mock" icon={FileText} variant="secondary" onPress={() => setMessage(`${group.title} CSV hazır.`)} />
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
      <View style={styles.infoBody}>{renderSafeTextChildren(children)}</View>
    </View>
  );
}

function RosterRow({ entry }: { entry: ReturnType<typeof getPreparedRosterGroups>[number]['entries'][number] }) {
  const branch = entry.raceKind === 'relay' ? entry.relayType ?? 'Bayrak Yarışı' : `${entry.distance ?? '-'}m ${entry.stroke ?? '-'}`;
  return (
    <View style={styles.rosterRow}>
      <Text style={styles.rowTitle}>{entry.raceKind === 'relay' ? entry.teamName ?? 'İsimsiz Takım' : entry.athleteName ?? 'İsimsiz Sporcu'}</Text>
      <Text style={styles.rowMeta}>{branch} • PB {entry.pb || noPb} • Hedef {entry.targetTime === '-' ? 'boş' : entry.targetTime || 'boş'}</Text>
      <Text style={styles.rowMeta}>{entry.raceDay || selectLabel} • {entry.session || selectLabel} • Seri {entry.heat || selectLabel} • Kulvar {entry.lane || selectLabel}</Text>
      {entry.raceKind === 'relay' ? <Text style={styles.rowMeta}>{entry.relayAthletes?.map((athlete) => `${athlete.order}. ${athlete.athleteName}${athlete.reserve ? ' (Yedek)' : ''}`).join('\n') || 'Takım sıralaması yok'}</Text> : null}
      <Pressable style={styles.enterResultButton} onPress={() => router.push('/features/live-race')}>
        <Text style={styles.enterResultText}>Sonuç Gir</Text>
      </Pressable>
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
      <ChevronRight color={colors.coral} size={18} />
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
                  {active ? <Check color={colors.surfaceSolid} size={14} /> : null}
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
                  {active ? <Check color={colors.surfaceSolid} size={14} /> : <View style={styles.emptyCheck} />}
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
  officialCard: { gap: 4, borderColor: 'rgba(194, 65, 12, 0.28)', shadowColor: colors.gold, shadowOpacity: 0.08, shadowRadius: 12 },
  officialLabel: { color: colors.gold, fontWeight: '900', fontSize: 12 },
  officialTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  officialMeta: { color: colors.mutedStrong, fontWeight: '800' },
  form: { gap: 10 },
  blockTitle: { color: colors.coral, fontWeight: '900', fontSize: 14, marginTop: 4 },
  input: { minHeight: 44, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, color: colors.text, fontWeight: '800', paddingHorizontal: spacing.md },
  searchBox: { minHeight: 44, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchInput: { color: colors.text, fontWeight: '800', flex: 1 },
  selectField: { minHeight: 50, borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectLabel: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  selectValue: { color: colors.text, fontWeight: '900', marginTop: 3 },
  infoPanel: { borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.coralSoft, padding: spacing.md, gap: 8 },
  infoTitle: { color: colors.coral, fontWeight: '900' },
  infoBody: { gap: 6 },
  infoText: { color: colors.text, fontWeight: '800' },
  targetRow: { gap: 5 },
  targetLabel: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  targetInput: { minHeight: 40, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, color: colors.text, fontWeight: '800', paddingHorizontal: spacing.md },
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
  enterResultButton: { alignSelf: 'flex-start', borderRadius: 999, backgroundColor: colors.coral, paddingHorizontal: spacing.md, paddingVertical: 8, marginTop: 4 },
  enterResultText: { color: colors.surfaceSolid, fontWeight: '900', fontSize: 12 },
  exportRow: { flexDirection: 'row', gap: spacing.sm },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  sheet: { maxHeight: '76%', backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.lg, gap: spacing.md },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  closeButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  options: { gap: spacing.sm },
  option: { minHeight: 44, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  optionActive: { backgroundColor: colors.coral, borderColor: colors.coral },
  optionText: { color: colors.mutedStrong, fontWeight: '900' },
  optionTextActive: { color: colors.surfaceSolid },
  emptyCheck: { width: 14, height: 14, borderRadius: 4, borderWidth: 1, borderColor: colors.borderStrong },
});
