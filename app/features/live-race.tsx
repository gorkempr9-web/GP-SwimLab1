import { Check, ChevronDown, ChevronRight, Clock3, ShieldAlert, X } from 'lucide-react-native';
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { getLiveRaceQueue, LiveRaceEntry, rosterAthletes, saveLiveRaceResult } from '@/services/clubCompetition';
import { addSplit, calculateSplits, formatRaceTime, removeSplit, TimerSplit, updateSplit } from '@/services/liveTimer';
import { canManageClub, roleLabel, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

type ResultStatus = 'Geçerli' | 'DQ' | 'DNS';
type EntryMode = 'Kronometre' | 'Elle Giriş';
type OpenMap = Record<string, boolean>;

const statusOptions: ResultStatus[] = ['Geçerli', 'DQ', 'DNS'];

export default function LiveRaceScreen() {
  const { currentUser } = useSession();
  const [entries, setEntries] = useState(() => getLiveRaceQueue());
  const [openCompetitions, setOpenCompetitions] = useState<OpenMap>({});
  const [openAthletes, setOpenAthletes] = useState<OpenMap>({});
  const [editing, setEditing] = useState<LiveRaceEntry | null>(null);
  const [message, setMessage] = useState('');
  const canView = canManageClub(currentUser.role);

  const pendingEntries = entries.filter((entry) => !isCompleted(entry));
  const competitionGroups = useMemo(() => {
    const grouped = entries.reduce<Record<string, LiveRaceEntry[]>>((acc, entry) => {
      const name = entry.competitionName ?? 'Yarış adı bekleniyor';
      const date = entry.date ?? 'Tarih bekleniyor';
      const key = `${name}-${date}`;
      acc[key] = [...(acc[key] ?? []), entry];
      return acc;
    }, {});
    return Object.entries(grouped).map(([key, groupEntries]) => ({
      key,
      title: `${groupEntries[0].date ?? 'Tarih bekleniyor'} ${groupEntries[0].competitionName ?? 'Yarış adı bekleniyor'} Yarış Listesi`,
      entries: groupEntries,
      pending: groupEntries.filter((entry) => !isCompleted(entry)).length,
      completed: groupEntries.filter((entry) => isCompleted(entry)).length,
    }));
  }, [entries]);

  if (!canView) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.locked}>
          <ShieldAlert color={colors.gold} size={42} />
          <Text style={styles.title}>Canlı Yarış Girişi</Text>
          <Text style={styles.subtitle}>Bu alan sadece antrenör ve kulüp yöneticileri içindir. Mevcut rol: {roleLabel(currentUser.role)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const saveEntry = (entry: LiveRaceEntry) => {
    const result = saveLiveRaceResult(entry);
    setEntries(getLiveRaceQueue());
    setEditing(null);
    setMessage(result.isPB ? 'Sonuç kaydedildi. Yeni PB sporcu geçmişine eklendi.' : 'Sonuç kaydedildi. Sporcu geçmişine eklendi.');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Clock3 color={colors.cyan} size={28} />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Canlı Yarış Girişi</Text>
            <Text style={styles.subtitle}>Yarış listesi başlığını aç, sporcuyu seç ve sonucu kronometreyle ya da elle gir.</Text>
          </View>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <GlassCard style={styles.liveList}>
          <Text style={styles.sectionTitle}>Canlı Yarış Listesi</Text>
          {pendingEntries.map((entry) => (
            <View key={`pending-${entry.id}`} style={styles.pendingRow}>
              <View style={styles.pendingCopy}>
                <Text style={styles.pendingTitle}>{entry.raceKind === 'relay' ? (entry.teamName ?? entry.athlete) : entry.athlete}</Text>
                <Text style={styles.meta}>{formatEvent(entry)} • Seri {entry.heat || '-'} / Kulvar {entry.lane || '-'}</Text>
                <Text style={styles.meta}>Tahmini saat: {entry.date || '-'} ? Durum: {getStatus(entry)}</Text>
              </View>
              <Pressable style={styles.resultButton} onPress={() => setEditing(entry)}>
                <Text style={styles.resultButtonText}>Sonuç Gir</Text>
              </Pressable>
            </View>
          ))}
          {!pendingEntries.length ? <EmptyState title="Bekleyen yarış yok" detail="Yarış Takım Listesi hazırlandığında canlı giriş burada başlayacak." icon={Clock3} tone={colors.coral} /> : null}
        </GlassCard>

        {competitionGroups.map((group) => {
          const open = !!openCompetitions[group.key];
          return (
            <GlassCard key={group.key} style={styles.competitionCard}>
              <Pressable style={styles.competitionHeader} onPress={() => setOpenCompetitions((current) => ({ ...current, [group.key]: !current[group.key] }))}>
                <View style={styles.headerCopy}>
                  <Text style={styles.competitionTitle}>{group.title}</Text>
                  <Text style={styles.competitionMeta}>Bekleyen: {group.pending} • Tamamlanan: {group.completed}</Text>
                </View>
                {open ? <ChevronDown color={colors.cyan} size={22} /> : <ChevronRight color={colors.cyan} size={22} />}
              </Pressable>
              {open ? <AthleteRaceAccordion groupKey={group.key} entries={group.entries} openAthletes={openAthletes} setOpenAthletes={setOpenAthletes} setEditing={setEditing} /> : null}
            </GlassCard>
          );
        })}
        {!competitionGroups.length ? <EmptyState title="Henüz yarış listesi yok" detail="Canlı giriş için önce Yarış Takım Listesi ekranından sporcu ve branş ekle." icon={Clock3} tone={colors.gold} /> : null}
      </ScrollView>

      <ResultModal entry={editing} onClose={() => setEditing(null)} onSave={saveEntry} />
    </SafeAreaView>
  );
}

function AthleteRaceAccordion({ groupKey, entries, openAthletes, setOpenAthletes, setEditing }: { groupKey: string; entries: LiveRaceEntry[]; openAthletes: OpenMap; setOpenAthletes: Dispatch<SetStateAction<OpenMap>>; setEditing: (entry: LiveRaceEntry) => void }) {
  const rows = buildAthleteRows(entries);
  return (
    <View style={styles.athleteList}>
      {rows.map(({ athlete, races, pending, completed, pbCount }) => {
        const key = `${groupKey}-${athlete.id}`;
        const open = !!openAthletes[key];
        return (
          <View key={key} style={styles.athleteCard}>
            <Pressable style={styles.athleteHeader} onPress={() => setOpenAthletes((current) => ({ ...current, [key]: !current[key] }))}>
              <View style={styles.athleteTitleBlock}>
                <Text style={styles.athleteName}>{athlete.name}</Text>
                <View style={styles.countRow}>
                  <Count label="Bekleyen" value={pending} />
                  <Count label="Tamamlanan" value={completed} />
                  <Count label="PB" value={pbCount} />
                </View>
              </View>
              {open ? <ChevronDown color={colors.cyan} size={22} /> : <ChevronRight color={colors.cyan} size={22} />}
            </Pressable>
            {open ? <View style={styles.raceList}>{races.map((race) => <RaceCard key={race.id} race={race} onPress={() => setEditing(race)} />)}</View> : null}
          </View>
        );
      })}
    </View>
  );
}

function RaceCard({ race, onPress }: { race: LiveRaceEntry; onPress: () => void }) {
  return (
    <View style={styles.raceCard}>
      <View style={styles.raceTop}>
        <Text style={styles.eventName}>{formatEvent(race)}</Text>
        <Text style={[styles.statusBadge, getStatus(race) === 'PB' && styles.pbBadge]}>{getStatus(race)}</Text>
      </View>
      <Text style={styles.meta}>{race.date ?? '10.05.2026'} • {race.raceDay ?? '1. Gün'} • {race.session ?? 'Sabah Seansı'}</Text>
      <Text style={styles.meta}>Seri {race.heat || '-'} / Kulvar {race.lane || '-'}</Text>
      {race.raceKind === 'relay' ? <Text style={styles.meta}>{race.relayAthletes?.map((athlete) => `${athlete.order}. ${athlete.athleteName}`).join('\n')}</Text> : null}
      <View style={styles.raceActions}>
        <Pressable style={styles.resultButton} onPress={onPress}><Text style={styles.resultButtonText}>Canlı Giriş</Text></Pressable>
        <Pressable style={styles.secondaryResultButton} onPress={onPress}><Text style={styles.secondaryResultText}>Sonuç Gir</Text></Pressable>
      </View>
    </View>
  );
}

function ResultModal({ entry, onClose, onSave }: { entry: LiveRaceEntry | null; onClose: () => void; onSave: (entry: LiveRaceEntry) => void }) {
  const [draft, setDraft] = useState<LiveRaceEntry | null>(entry);
  const [mode, setMode] = useState<EntryMode>('Kronometre');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [timerSplits, setTimerSplits] = useState<TimerSplit[]>([]);
  const [warning, setWarning] = useState('');
  const startedAtRef = useRef(0);
  const baseElapsedRef = useRef(0);

  useEffect(() => {
    setDraft(entry);
    setMode('Kronometre');
    setElapsedMs(0);
    setRunning(false);
    setStarted(false);
    setTimerSplits([]);
    setWarning('');
    baseElapsedRef.current = 0;
  }, [entry]);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      setElapsedMs(baseElapsedRef.current + Date.now() - startedAtRef.current);
    }, 40);
    return () => clearInterval(timer);
  }, [running]);

  if (!draft) return null;

  const status: ResultStatus = draft.dns ? 'DNS' : draft.dsq ? 'DQ' : 'Geçerli';
  const expectedSplits = calculateSplits(draft.distance ?? draft.event, draft.poolType ?? '50m', '50m');
  const displayTime = running ? formatRaceTime(elapsedMs) : draft.finalTime || formatRaceTime(elapsedMs);
  const canSave = Boolean(draft.finalTime.trim()) || draft.dns || draft.dsq;
  const update = (patch: Partial<LiveRaceEntry>) => setDraft((current) => (current ? { ...current, ...patch } : current));

  const startTimer = () => {
    startedAtRef.current = Date.now();
    baseElapsedRef.current = elapsedMs;
    setStarted(true);
    setRunning(true);
    setWarning('');
  };

  const takeSplit = () => {
    if (!started || !running) {
      setWarning('Başlatmadan split alınamaz.');
      return;
    }
    setTimerSplits((current) => addSplit(current, elapsedMs, draft.distance ?? draft.event, draft.poolType ?? '50m', '50m'));
  };

  const stopTimer = () => {
    if (!started) return;
    setRunning(false);
    baseElapsedRef.current = elapsedMs;
    update({ finalTime: formatRaceTime(elapsedMs), splits: timerSplits.map((split) => split.time), split1: timerSplits[0]?.time ?? '', split2: timerSplits[1]?.time ?? '', split3: timerSplits[2]?.time ?? '', split4: timerSplits[3]?.time ?? '' });
  };

  const resetTimer = () => {
    setRunning(false);
    setStarted(false);
    setElapsedMs(0);
    setTimerSplits([]);
    baseElapsedRef.current = 0;
    update({ finalTime: '', splits: [], split1: '', split2: '', split3: '', split4: '' });
  };

  const save = () => {
    if (!canSave) {
      setWarning('Final derece oluşmadan kayıt yapılamaz.');
      return;
    }
    if (mode === 'Kronometre' && timerSplits.length !== expectedSplits.length) {
      setWarning('Split sayısı beklenenden farklı, yine de kaydediliyor.');
    }
    onSave({ ...draft, splits: mode === 'Kronometre' ? timerSplits.map((split) => split.time) : [draft.split1, draft.split2, draft.split3, draft.split4].filter(Boolean) });
  };

  return (
    <Modal transparent={true} visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Canlı Yarış Girişi</Text>
              <Text style={styles.sheetMeta}>{draft.raceKind === 'relay' ? (draft.teamName ?? draft.athlete) : draft.athlete} • {formatEvent(draft)}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}><X color={colors.text} size={18} /></Pressable>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.meta}>{draft.competitionName ?? 'Yarış adı bekleniyor'} • PB {draft.pb ? 'Yeni PB' : draft.finalTime || '-'}</Text>
            <Text style={styles.meta}>{draft.poolType ?? '50m'} • Seri {draft.heat || '-'} / Kulvar {draft.lane || '-'}</Text>
          </View>

          <View style={styles.modeRow}>
            {(['Kronometre', 'Elle Giriş'] as EntryMode[]).map((item) => (
              <Pressable key={item} style={[styles.modeButton, mode === item && styles.modeButtonActive]} onPress={() => setMode(item)}>
                <Text style={[styles.modeText, mode === item && styles.modeTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          {mode === 'Kronometre' ? (
            <View style={styles.timerBlock}>
              <Text style={styles.timerText}>{displayTime}</Text>
              {draft.finalTime ? <Field label="Final Dereceyi Düzenle" value={draft.finalTime} onChangeText={(value) => update({ finalTime: value })} /> : null}
              <View style={styles.timerControls}>
                <Action title="Başlat" disabled={running} onPress={startTimer} />
                <Action title="Split Al" disabled={!running} onPress={takeSplit} />
                <Action title="Durdur" disabled={!running} onPress={stopTimer} />
                <Action title="Sıfırla" variant="secondary" onPress={resetTimer} />
              </View>
              <Text style={styles.meta}>Beklenen splitler: {expectedSplits.length ? expectedSplits.map((item) => `${item}m`).join(', ') : 'Split gerekmez'}</Text>
              {timerSplits.map((split) => (
                <View key={split.id} style={styles.splitRow}>
                  <Text style={styles.splitLabel}>{split.label}</Text>
                  <TextInput value={split.time} onChangeText={(value) => setTimerSplits((current) => updateSplit(current, split.id, value))} style={styles.splitInput} />
                  <Pressable style={styles.deleteSplit} onPress={() => setTimerSplits((current) => removeSplit(current, split.id))}><X color={colors.danger} size={15} /></Pressable>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.manualBlock}>
              <View style={styles.inputGrid}>
                <Field label="Final derece" value={draft.finalTime} onChangeText={(value) => update({ finalTime: value })} />
                <Field label="Split 1" value={draft.split1} onChangeText={(value) => update({ split1: value })} />
                <Field label="Split 2" value={draft.split2} onChangeText={(value) => update({ split2: value })} />
                <Field label="Split 3" value={draft.split3} onChangeText={(value) => update({ split3: value })} />
                <Field label="Split 4" value={draft.split4} onChangeText={(value) => update({ split4: value })} />
              </View>
              <View style={styles.statusRow}>
                {statusOptions.map((item) => (
                  <Pressable key={item} style={[styles.statusOption, status === item && styles.statusOptionActive]} onPress={() => update({ dns: item === 'DNS', dsq: item === 'DQ' })}>
                    {status === item ? <Check color={colors.background} size={14} /> : null}
                    <Text style={[styles.statusOptionText, status === item && styles.statusOptionTextActive]}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <TextInput value={draft.note} onChangeText={(value) => update({ note: value })} placeholder="Antrenör notu" placeholderTextColor={colors.muted} style={styles.noteInput} />
          {warning ? <Text style={styles.warning}>{warning}</Text> : null}
          <Pressable style={[styles.saveButton, !canSave && styles.saveButtonDisabled]} disabled={!canSave} onPress={save}>
            <Text style={styles.saveText}>Kaydet</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder="-" placeholderTextColor={colors.muted} style={styles.input} />
    </View>
  );
}

function Action({ title, onPress, disabled, variant }: { title: string; onPress: () => void; disabled?: boolean; variant?: 'secondary' }) {
  return (
    <Pressable style={[styles.actionButton, variant === 'secondary' && styles.actionSecondary, disabled && styles.actionDisabled]} disabled={disabled} onPress={onPress}>
      <Text style={[styles.actionText, variant === 'secondary' && styles.actionSecondaryText]}>{title}</Text>
    </Pressable>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.countBox}>
      <Text style={styles.countValue}>{value}</Text>
      <Text style={styles.countLabel}>{label}</Text>
    </View>
  );
}

function buildAthleteRows(entries: LiveRaceEntry[]) {
  const individualRows = rosterAthletes
    .map((athlete) => {
      const races = entries.filter((entry) => (entry.athleteId ?? '') === athlete.id || entry.athlete === athlete.name);
      const completed = races.filter((entry) => isCompleted(entry)).length;
      const pbCount = races.filter((entry) => entry.pb).length;
      return { athlete, races, completed, pbCount, pending: Math.max(races.length - completed, 0) };
    })
    .filter((row) => row.races.length > 0);

  const relayRows = entries
    .filter((entry) => entry.raceKind === 'relay')
    .map((entry) => ({ athlete: { id: entry.id, name: entry.teamName ?? entry.athlete }, races: [entry], completed: isCompleted(entry) ? 1 : 0, pbCount: 0, pending: isCompleted(entry) ? 0 : 1 }));

  return [...individualRows, ...relayRows];
}

function isCompleted(entry: LiveRaceEntry) {
  return !!entry.finalTime || entry.status === 'Yüzdü' || entry.status === 'PB' || entry.status === 'DQ' || entry.status === 'DNS' || entry.dsq || entry.dns;
}

function getStatus(entry: LiveRaceEntry) {
  if (entry.dns) return 'DNS';
  if (entry.dsq) return 'DQ';
  if (entry.pb) return 'PB';
  if (isCompleted(entry)) return 'Yüzdü';
  return 'Bekliyor';
}

function formatEvent(entry: LiveRaceEntry) {
  if (entry.raceKind === 'relay') return entry.relayType ?? entry.event;
  const distance = entry.distance ?? entry.event.split(' ')[0] ?? '';
  const stroke = entry.stroke ?? entry.event.split(' ').slice(1).join(' ');
  return `${distance}m ${translateStroke(stroke)}`.trim();
}

function translateStroke(value: string) {
  const normalized = value.toLocaleLowerCase('tr');
  if (normalized.includes('free') || normalized === 'sf' || normalized.includes('serbest')) return 'Serbest';
  if (normalized.includes('back') || normalized.includes('sırt')) return 'Sırtüstü';
  if (normalized.includes('breast') || normalized.includes('kurba')) return 'Kurbağalama';
  if (normalized.includes('fly') || normalized.includes('kelebek')) return 'Kelebek';
  if (normalized.includes('im') || normalized.includes('medley') || normalized.includes('karış')) return 'Karışık';
  return value;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: 12, paddingBottom: 110 },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerCopy: { flex: 1 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', marginTop: 4, lineHeight: 21 },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  liveList: { gap: spacing.sm, padding: 12 },
  pendingRow: { borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, padding: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pendingCopy: { flex: 1 },
  pendingTitle: { color: colors.text, fontWeight: '900' },
  resultButton: { borderRadius: 999, backgroundColor: colors.cyan, paddingHorizontal: spacing.md, paddingVertical: 9 },
  resultButtonText: { color: colors.background, fontWeight: '900', fontSize: 12 },
  secondaryResultButton: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md, paddingVertical: 9 },
  secondaryResultText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  competitionCard: { gap: 10, padding: 12 },
  competitionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  competitionTitle: { color: colors.text, fontWeight: '900', fontSize: 16, lineHeight: 21 },
  competitionMeta: { color: colors.mutedStrong, fontWeight: '800', marginTop: 3, fontSize: 12 },
  athleteList: { gap: 8, marginTop: 6 },
  athleteCard: { borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, padding: 10, gap: 8 },
  athleteHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  athleteTitleBlock: { flex: 1, gap: 7 },
  athleteName: { color: colors.text, fontWeight: '900', fontSize: 17 },
  countRow: { flexDirection: 'row', gap: 7 },
  countBox: { flex: 1, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong, paddingVertical: 6, paddingHorizontal: 7 },
  countValue: { color: colors.cyan, fontWeight: '900', fontSize: 15 },
  countLabel: { color: colors.mutedStrong, fontWeight: '800', fontSize: 10, marginTop: 2 },
  raceList: { gap: 8, marginTop: 4 },
  raceCard: { borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.background, padding: 11, gap: 6 },
  raceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  eventName: { color: colors.text, fontWeight: '900', fontSize: 15, flex: 1 },
  statusBadge: { color: colors.cyan, backgroundColor: colors.cyanSoft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontWeight: '900', fontSize: 11 },
  pbBadge: { color: colors.gold, backgroundColor: colors.goldSoft },
  raceActions: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  meta: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 18, fontSize: 12 },
  empty: { color: colors.muted, fontWeight: '800', textAlign: 'center', padding: spacing.md },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.58)' },
  sheet: { maxHeight: '84%', backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, padding: 16, gap: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  sheetTitle: { color: colors.text, fontWeight: '900', fontSize: 19 },
  sheetMeta: { color: colors.cyan, fontWeight: '900', marginTop: 4 },
  closeButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  infoBox: { borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, padding: spacing.sm },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeButton: { flex: 1, minHeight: 40, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, alignItems: 'center', justifyContent: 'center' },
  modeButtonActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  modeText: { color: colors.text, fontWeight: '900' },
  modeTextActive: { color: colors.background },
  timerBlock: { gap: spacing.sm },
  timerText: { color: colors.text, fontWeight: '900', fontSize: 46, textAlign: 'center' },
  timerControls: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: { width: '48%', minHeight: 44, borderRadius: 14, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center' },
  actionSecondary: { backgroundColor: colors.cyanSoft, borderWidth: 1, borderColor: colors.borderStrong },
  actionDisabled: { opacity: 0.45 },
  actionText: { color: colors.background, fontWeight: '900' },
  actionSecondaryText: { color: colors.cyan },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  splitLabel: { flex: 1, color: colors.text, fontWeight: '900' },
  splitInput: { width: 92, minHeight: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, color: colors.text, textAlign: 'center', fontWeight: '900' },
  deleteSplit: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dangerSoft },
  manualBlock: { gap: spacing.sm },
  inputGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  field: { width: '48%', gap: 4 },
  fieldLabel: { color: colors.mutedStrong, fontWeight: '900', fontSize: 11 },
  input: { minHeight: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, color: colors.text, fontWeight: '900', paddingHorizontal: spacing.sm },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusOption: { flex: 1, minHeight: 36, borderRadius: 12, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  statusOptionActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  statusOptionText: { color: colors.mutedStrong, fontWeight: '900' },
  statusOptionTextActive: { color: colors.background },
  noteInput: { minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, color: colors.text, fontWeight: '800', paddingHorizontal: spacing.sm },
  warning: { color: colors.gold, fontWeight: '900' },
  saveButton: { minHeight: 44, borderRadius: 14, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center' },
  saveButtonDisabled: { opacity: 0.45 },
  saveText: { color: colors.background, fontWeight: '900' },
});
