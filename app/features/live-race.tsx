import { Check, ChevronDown, ChevronRight, Clock3, ShieldAlert, X } from 'lucide-react-native';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { getLiveRaceQueue, LiveRaceEntry, rosterAthletes, saveLiveRaceResult } from '@/services/clubCompetition';
import { canManageClub, roleLabel, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

type ResultStatus = 'Geçerli' | 'DQ' | 'DNS';
type OpenMap = Record<string, boolean>;

const statusOptions: ResultStatus[] = ['Geçerli', 'DQ', 'DNS'];

export default function LiveRaceScreen() {
  const { currentUser } = useSession();
  const [entries, setEntries] = useState(() => getLiveRaceQueue());
  const [openCompetitions, setOpenCompetitions] = useState<OpenMap>({ 'Marmara Cup-10.05.2026': true });
  const [openAthletes, setOpenAthletes] = useState<OpenMap>({});
  const [editing, setEditing] = useState<LiveRaceEntry | null>(null);
  const [message, setMessage] = useState('');
  const canView = canManageClub(currentUser.role);

  const competitionGroups = useMemo(() => {
    const grouped = entries.reduce<Record<string, LiveRaceEntry[]>>((acc, entry) => {
      const name = entry.competitionName ?? 'Marmara Cup';
      const date = entry.date ?? '10.05.2026';
      const key = `${name}-${date}`;
      acc[key] = [...(acc[key] ?? []), entry];
      return acc;
    }, {});
    return Object.entries(grouped).map(([key, groupEntries]) => ({
      key,
      title: `${groupEntries[0].date ?? '10.05.2026'} ${groupEntries[0].competitionName ?? 'Marmara Cup'} Yarış Listesi`,
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
          <Text style={styles.title}>Canlı Giriş</Text>
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
            <Text style={styles.title}>Canlı Giriş</Text>
            <Text style={styles.subtitle}>Yarış listesi başlığını aç, sporcuyu seç ve sonucu hızlıca gir.</Text>
          </View>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

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
      </ScrollView>

      <ResultModal entry={editing} onChange={setEditing} onClose={() => setEditing(null)} onSave={saveEntry} />
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
            {open ? (
              <View style={styles.raceList}>
                {races.map((race) => <RaceCard key={race.id} race={race} onPress={() => setEditing(race)} />)}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function RaceCard({ race, onPress }: { race: LiveRaceEntry; onPress: () => void }) {
  return (
    <Pressable style={styles.raceCard} onPress={onPress}>
      <View style={styles.raceTop}>
        <Text style={styles.eventName}>{formatEvent(race)}</Text>
        <Text style={[styles.statusBadge, getStatus(race) === 'PB' && styles.pbBadge]}>{getStatus(race)}</Text>
      </View>
      {race.raceKind === 'relay' ? <Text style={styles.meta}>{race.teamName} • {race.teamCategory}</Text> : null}
      <Text style={styles.meta}>{race.date ?? '10.05.2026'} • {race.raceDay ?? '1. Gün'} • {race.session ?? 'Sabah Seansı'}</Text>
      <Text style={styles.meta}>Seri {race.heat || '-'} / Kulvar {race.lane || '-'}</Text>
      {race.raceKind === 'relay' ? <Text style={styles.meta}>{race.relayAthletes?.map((athlete) => `${athlete.order}. ${athlete.athleteName}`).join('\n')}</Text> : null}
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

function ResultModal({ entry, onChange, onClose, onSave }: { entry: LiveRaceEntry | null; onChange: (entry: LiveRaceEntry) => void; onClose: () => void; onSave: (entry: LiveRaceEntry) => void }) {
  if (!entry) return null;
  const selectedStatus: ResultStatus = entry.dns ? 'DNS' : entry.dsq ? 'DQ' : 'Geçerli';
  const update = (patch: Partial<LiveRaceEntry>) => onChange({ ...entry, ...patch });

  return (
    <Modal transparent={true} visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Yarış Sonucu Gir</Text>
              <Text style={styles.sheetMeta}>{entry.raceKind === 'relay' ? entry.teamName : entry.athlete} • {formatEvent(entry)}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X color={colors.text} size={18} />
            </Pressable>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.meta}>{entry.competitionName ?? 'Marmara Cup'} • {entry.date ?? '10.05.2026'}</Text>
            <Text style={styles.meta}>{entry.poolType ?? '50m'} • {entry.session ?? 'Sabah Seansı'} • Seri {entry.heat || '-'} / Kulvar {entry.lane || '-'}</Text>
            {entry.raceKind === 'relay' ? <Text style={styles.meta}>{entry.relayAthletes?.map((athlete) => `${athlete.order}. ${athlete.athleteName}`).join('\n')}</Text> : null}
          </View>

          <View style={styles.inputGrid}>
            <Field label={entry.raceKind === 'relay' ? 'Toplam derece' : 'Derece'} value={entry.finalTime} onChangeText={(value) => update({ finalTime: value })} />
            <Field label="Split 1" value={entry.split1} onChangeText={(value) => update({ split1: value })} />
            <Field label="Split 2" value={entry.split2} onChangeText={(value) => update({ split2: value })} />
            <Field label="Split 3" value={entry.split3} onChangeText={(value) => update({ split3: value })} />
            <Field label="Split 4" value={entry.split4} onChangeText={(value) => update({ split4: value })} />
          </View>

          <View style={styles.statusRow}>
            {statusOptions.map((status) => (
              <Pressable key={status} style={[styles.statusOption, selectedStatus === status && styles.statusOptionActive]} onPress={() => update({ dns: status === 'DNS', dsq: status === 'DQ' })}>
                {selectedStatus === status ? <Check color={colors.background} size={14} /> : null}
                <Text style={[styles.statusOptionText, selectedStatus === status && styles.statusOptionTextActive]}>{status}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput value={entry.note} onChangeText={(value) => update({ note: value })} placeholder="Antrenör notu" placeholderTextColor={colors.muted} style={styles.noteInput} />
          <Pressable style={styles.saveButton} onPress={() => onSave(entry)}>
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
    .map((entry) => {
      const completed = isCompleted(entry) ? 1 : 0;
      return {
        athlete: { id: entry.id, name: entry.teamName ?? entry.athlete },
        races: [entry],
        completed,
        pbCount: 0,
        pending: completed ? 0 : 1,
      };
    });

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
  if (normalized.includes('relay') || normalized.includes('bayrak')) return 'Bayrak';
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
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
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
  raceCard: { borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.background, padding: 11, gap: 4 },
  raceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  eventName: { color: colors.text, fontWeight: '900', fontSize: 15, flex: 1 },
  statusBadge: { color: colors.cyan, backgroundColor: colors.cyanSoft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontWeight: '900', fontSize: 11 },
  pbBadge: { color: colors.gold, backgroundColor: colors.goldSoft },
  meta: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 18, fontSize: 12 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.58)' },
  sheet: { maxHeight: '78%', backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, padding: 16, gap: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  sheetTitle: { color: colors.text, fontWeight: '900', fontSize: 19 },
  sheetMeta: { color: colors.cyan, fontWeight: '900', marginTop: 4 },
  closeButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  infoBox: { borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, padding: spacing.sm },
  inputGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  field: { width: '48%', gap: 4 },
  fieldLabel: { color: colors.mutedStrong, fontWeight: '900', fontSize: 11 },
  input: { minHeight: 36, borderRadius: 12, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, color: colors.text, fontWeight: '900', paddingHorizontal: spacing.sm },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusOption: { flex: 1, minHeight: 36, borderRadius: 12, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  statusOptionActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  statusOptionText: { color: colors.mutedStrong, fontWeight: '900' },
  statusOptionTextActive: { color: colors.background },
  noteInput: { minHeight: 40, borderRadius: 12, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, color: colors.text, fontWeight: '800', paddingHorizontal: spacing.sm },
  saveButton: { minHeight: 42, borderRadius: 14, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: colors.background, fontWeight: '900' },
});
