import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ChevronDown, ClipboardList, Edit3, FileText, Plus, ShieldAlert, StickyNote, Trash2, UserCircle, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import { generateMeetEntryListPdf, generateTeamResultReportPdf, MeetEntryPdfRow } from '@/services/pdfReports';
import { clearMeetEntries, getMeetEntries, MeetEntry, saveMeetEntries, updateMeetEntry } from '@/services/meetEntries';
import { canManageClub, roleLabel, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

type EventType = 'individual' | 'team';
type Stroke = 'Serbest' | 'Sırtüstü' | 'Kurbağalama' | 'Kelebek' | 'Karışık';
type RelayEvent = '4x50 Serbest' | '4x100 Serbest' | '4x200 Serbest' | '4x50 Karışık' | '4x100 Karışık';
type SheetState = { title: string; options: string[]; selected: string; onConfirm: (value: string) => void } | null;

type ClubAthlete = {
  id: string;
  name: string;
  ageCategory: string;
  club: string;
  group: string;
  lastRaceTime?: string;
  pb?: string;
};

type DraftRace = {
  id: string;
  athleteId: string;
  athleteName: string;
  eventType: EventType;
  distance: string;
  stroke: Stroke;
  relayEvent: RelayEvent | '';
  seedTime: string;
  pb: string;
  heat: string;
  lane: string;
  coachNote: string;
};

const clubAthletes: ClubAthlete[] = [];

const strokes: Stroke[] = ['Serbest', 'Sırtüstü', 'Kurbağalama', 'Kelebek', 'Karışık'];
const distanceByStroke: Record<Stroke, string[]> = {
  Serbest: ['50m', '100m', '200m', '400m', '800m', '1500m'],
  Sırtüstü: ['50m', '100m', '200m'],
  Kurbağalama: ['50m', '100m', '200m'],
  Kelebek: ['50m', '100m', '200m'],
  Karışık: ['100m', '200m', '400m'],
};
const relayEvents: RelayEvent[] = ['4x50 Serbest', '4x100 Serbest', '4x200 Serbest', '4x50 Karışık', '4x100 Karışık'];
const heats = Array.from({ length: 40 }, (_, index) => String(index + 1));
const lanes = Array.from({ length: 10 }, (_, index) => String(index + 1));
const heatOptions = ['Bekleniyor', ...heats];
const laneOptions = ['Bekleniyor', ...lanes];

const emptyRace = (athlete: ClubAthlete): DraftRace => ({
  id: `race-${athlete.id}-${Date.now()}`,
  athleteId: athlete.id,
  athleteName: athlete.name,
  eventType: 'individual',
  distance: '100m',
  stroke: 'Serbest',
  relayEvent: '',
  seedTime: athlete.lastRaceTime ?? '',
  pb: athlete.pb ?? '',
  heat: '',
  lane: '',
  coachNote: '',
});

export default function CoachMeetManagerScreen() {
  const { currentUser } = useSession();
  const canManage = canManageClub(currentUser.role);
  const [competitionName, setCompetitionName] = useState('');
  const [date, setDate] = useState('02.06.2026');
  const [poolType, setPoolType] = useState('50m Uzun Kulvar');
  const [races, setRaces] = useState<DraftRace[]>([]);
  const [editingRace, setEditingRace] = useState<DraftRace | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [message, setMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [liveEntries, setLiveEntries] = useState<MeetEntry[]>(() => getMeetEntries());

  const summary = useMemo(() => {
    const missing = races.filter((race) => getMissingField(race)).length;
    return {
      athletes: new Set(races.map((race) => race.athleteId)).size,
      races: races.length,
      individual: races.filter((race) => race.eventType === 'individual').length,
      team: races.filter((race) => race.eventType === 'team').length,
      missing,
    };
  }, [races]);

  const racesByAthlete = useMemo(() => {
    return clubAthletes.reduce<Record<string, DraftRace[]>>((acc, athlete) => {
      acc[athlete.id] = races.filter((race) => race.athleteId === athlete.id);
      return acc;
    }, {});
  }, [races]);

  const openRaceModal = (athlete: ClubAthlete, race?: DraftRace) => {
    setEditingRace(race ?? emptyRace(athlete));
  };

  const updateEditingRace = (patch: Partial<DraftRace>) => {
    setEditingRace((current) => (current ? { ...current, ...patch } : current));
  };

  const updateRace = (id: string, patch: Partial<DraftRace>) => {
    setRaces((current) => current.map((race) => (race.id === id ? { ...race, ...patch } : race)));
    setIsSaved(false);
  };

  const commitRace = () => {
    if (!editingRace) return;
    const missing = getMissingField(editingRace);
    if (missing) {
      setMessage(`${editingRace.athleteName} için ${missing} eksik.`);
      return;
    }

    setRaces((current) => {
      const exists = current.some((race) => race.id === editingRace.id);
      return exists ? current.map((race) => (race.id === editingRace.id ? editingRace : race)) : [...current, editingRace];
    });
    setEditingRace(null);
    setIsSaved(false);
    setMessage(`${editingRace.athleteName} için yarış eklendi.`);
  };

  const removeRace = (race: DraftRace) => {
    Alert.alert('Yarışı Sil', `${race.athleteName} yarış kaydını silmek istediğine emin misin?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          setRaces((current) => current.filter((item) => item.id !== race.id));
          setIsSaved(false);
          setMessage('Yarış kaydı silindi.');
        },
      },
    ]);
  };

  const saveList = () => {
    const missing = races.find((race) => getMissingField(race));
    if (missing) {
      setMessage(`${missing.athleteName} için ${getMissingField(missing)} eksik.`);
      return;
    }

    clearMeetEntries();
    const saved = saveMeetEntries(toMeetEntries(races, competitionName, date, poolType));
    setLiveEntries(saved);
    setIsSaved(true);
    setMessage('Yarış listesi kaydedildi.');
  };

  const updateLiveEntry = (id: string, patch: Partial<MeetEntry>) => {
    updateMeetEntry(id, patch);
    setLiveEntries(getMeetEntries());
  };

  const saveResult = (entry: MeetEntry, resultTime: string) => {
    const resultSeconds = parseSwimTime(resultTime);
    const pbSeconds = parseSwimTime(entry.pb);
    const isNewPb = resultSeconds !== null && pbSeconds !== null && resultSeconds < pbSeconds;
    updateLiveEntry(entry.id, { resultTime, status: 'completed', isNewPb });
    setMessage(isNewPb ? `${entry.athleteName} yeni PB yaptı.` : `${entry.athleteName} derecesi kaydedildi.`);
  };

  const createPdfRows = (): MeetEntryPdfRow[] =>
    races.map((race) => ({
      meetName: competitionName,
      date,
      poolType,
      athleteName: race.athleteName,
      eventName: race.eventType === 'team' ? race.relayEvent : `${race.distance} ${race.stroke}`,
      eventType: race.eventType === 'team' ? 'Takım' : 'Ferdi',
      distance: race.distance,
      stroke: race.eventType === 'team' ? race.relayEvent : race.stroke,
      heat: race.heat || 'Bekleniyor',
      lane: race.lane || 'Bekleniyor',
      pb: race.pb || '-',
      target: race.eventType === 'team' ? 'Takım' : 'Ferdi',
      result: race.seedTime,
      seedTime: race.seedTime,
      coachNote: race.coachNote,
    }));

  const handleMeetPdf = async () => {
    const report = await generateMeetEntryListPdf(createPdfRows());
    setMessage(report.message);
  };

  const handleTeamPdf = async () => {
    const report = await generateTeamResultReportPdf(createPdfRows());
    setMessage(report.message);
  };

  const handleLiveReportPdf = async () => {
    await generateTeamResultReportPdf(liveEntries.map((entry) => ({
      meetName: entry.competitionName,
      date: entry.date,
      poolType: entry.poolType,
      athleteName: entry.athleteName,
      eventName: entry.relayEvent || `${entry.distance} ${entry.stroke}`,
      eventType: entry.eventType === 'team' ? 'Takım' : 'Ferdi',
      distance: entry.distance,
      stroke: entry.relayEvent || entry.stroke,
      heat: entry.heat || 'Bekleniyor',
      lane: entry.lane || 'Bekleniyor',
      pb: entry.pb || '-',
      target: entry.status.toUpperCase(),
      result: entry.resultTime || '-',
      seedTime: entry.seedTime,
      coachNote: entry.coachNote,
    })));
    setMessage('Yarış sonu takım raporu hazırlandı.');
  };

  if (!canManage) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.locked}>
          <ShieldAlert color={colors.gold} size={42} />
          <Text style={styles.title}>Yarış Takım Listesi</Text>
          <Text style={styles.subtitle}>Bu alan antrenör/kulüp hesabı gerektirir.</Text>
          <Text style={styles.note}>Mevcut rol: {roleLabel(currentUser.role)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Yarış Takım Listesi</Text>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Yarış Bilgileri</Text>
          <TextInput value={competitionName} onChangeText={setCompetitionName} placeholder="Yarış adı" placeholderTextColor={colors.muted} style={styles.input} />
          {false ? <View style={styles.inputRow}>
            <TextInput value={date} onChangeText={setDate} placeholder="Tarih" placeholderTextColor={colors.muted} style={styles.input} />
            <SelectField label="Havuz tipi" value={poolType} onPress={() => setSheet({ title: 'Havuz tipi', options: ['25m Kısa Kulvar', '50m Uzun Kulvar'], selected: poolType, onConfirm: setPoolType })} />
          </View> : null}
        </GlassCard>

        <View style={styles.summaryGrid}>
          <SummaryBox label="Sporcu" value={summary.athletes} />
          <SummaryBox label="Yarış" value={summary.races} />
          <SummaryBox label="Ferdi" value={summary.individual} />
          <SummaryBox label="Takım" value={summary.team} />
          <SummaryBox label="Eksik" value={summary.missing} />
        </View>

        {clubAthletes.map((athlete) => (
          <GlassCard key={athlete.id} style={styles.athleteCard}>
            <View style={styles.athleteHeader}>
              <View style={styles.athleteAvatar}>
                <UserCircle color={colors.cyan} size={34} />
              </View>
              <View style={styles.athleteCopy}>
                <Text style={styles.athleteName}>{athlete.name}</Text>
                <Text style={styles.meta}>{athlete.ageCategory}  •  {athlete.club}</Text>
                <Text style={styles.meta}>{athlete.group}</Text>
                <Text style={styles.pbLine}>PB / Son derece: {athlete.pb || athlete.lastRaceTime || '-'}</Text>
              </View>
              <Pressable style={styles.addRaceButton} onPress={() => openRaceModal(athlete)}>
                <Plus color={colors.background} size={17} />
                <Text style={styles.addRaceText}>Yarış Ekle</Text>
              </Pressable>
            </View>

            {(racesByAthlete[athlete.id] ?? []).map((race) => (
              <View key={race.id} style={styles.raceRow}>
                <View style={styles.raceRowCopy}>
                  <Text style={[styles.raceRowTitle, race.eventType === 'team' && styles.teamRaceChip]}>
                    {race.eventType === 'team' ? 'Takım' : 'Ferdi'} | {race.eventType === 'team' ? race.relayEvent : `${race.distance} ${race.stroke}`}
                  </Text>
                  <Text style={styles.raceRowMeta}>Seri: {race.heat || 'Bekleniyor'}  •  Kulvar: {race.lane || 'Bekleniyor'}</Text>
                  <Text style={styles.raceRowMeta}>PB {race.pb || '-'}  •  Son derece {race.seedTime || '-'}</Text>
                  {race.coachNote ? <Text style={styles.raceNote}>Not: {race.coachNote}</Text> : null}
                </View>
                <View style={styles.rowActions}>
                  <Pressable style={styles.iconAction} onPress={() => openRaceModal(athlete, race)}>
                    <Edit3 color={colors.cyan} size={16} />
                  </Pressable>
                  <Pressable style={styles.iconAction} onPress={() => openRaceModal(athlete, race)}>
                    <StickyNote color={colors.cyan} size={16} />
                  </Pressable>
                  <Pressable style={[styles.iconAction, styles.deleteAction]} onPress={() => removeRace(race)}>
                    <Trash2 color={colors.danger} size={16} />
                  </Pressable>
                </View>
                <View style={styles.quickActionRow}>
                  <Pressable style={styles.quickAction} onPress={() => setSheet({ title: 'Seri Güncelle', options: heatOptions, selected: race.heat || 'Bekleniyor', onConfirm: (value) => updateRace(race.id, { heat: value === 'Bekleniyor' ? '' : value }) })}>
                    <Text style={styles.quickActionText}>Seri Güncelle</Text>
                  </Pressable>
                  <Pressable style={styles.quickAction} onPress={() => setSheet({ title: 'Kulvar Güncelle', options: laneOptions, selected: race.lane || 'Bekleniyor', onConfirm: (value) => updateRace(race.id, { lane: value === 'Bekleniyor' ? '' : value }) })}>
                    <Text style={styles.quickActionText}>Kulvar Güncelle</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </GlassCard>
        ))}

        <AppButton title="Yarış Listesini Kaydet" icon={ClipboardList} onPress={saveList} />
        {isSaved ? (
          <View style={styles.inputRow}>
            <AppButton title="Yarış Listesi PDF" icon={FileText} variant="secondary" onPress={handleMeetPdf} />
            <AppButton title="Takım Raporu PDF" icon={FileText} variant="secondary" onPress={handleTeamPdf} />
          </View>
        ) : null}

        <GlassCard style={styles.card}>
          <View style={styles.liveHeader}>
            <View>
              <Text style={styles.cardTitle}>Yarış Günü Canlı Derece Girişi</Text>
              <Text style={styles.meta}>Kaydedilen yarış listesi yarış günü sırasıyla burada yönetilir.</Text>
            </View>
            <Text style={styles.liveCount}>{liveEntries.length}</Text>
          </View>

          {liveEntries.length === 0 ? (
            <Text style={styles.emptyText}>Önce yarış listesini kaydet.</Text>
          ) : (
            liveEntries.map((entry) => (
              <LiveEntryRow key={entry.id} entry={entry} onResult={saveResult} onUpdate={updateLiveEntry} />
            ))
          )}

          <AppButton title="Toplu PDF Raporu Oluştur" icon={FileText} variant="secondary" onPress={handleLiveReportPdf} />
        </GlassCard>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>

      <RaceModal
        race={editingRace}
        onClose={() => setEditingRace(null)}
        onSave={commitRace}
        updateRace={updateEditingRace}
        openSheet={setSheet}
      />
      <SelectionSheet sheet={sheet} onClose={() => setSheet(null)} />
    </SafeAreaView>
  );
}

function getMissingField(race: DraftRace) {
  if (!race.distance) return 'yarış mesafesi';
  if (race.eventType === 'team' && !race.relayEvent) return 'bayrak yarışı';
  if (race.eventType === 'individual' && !race.stroke) return 'yarış stili';
  return '';
}

function toMeetEntries(races: DraftRace[], competitionName: string, date: string, poolType: string): MeetEntry[] {
  const meetId = `meet-${Date.now()}`;
  return races.map((race) => ({
    id: race.id,
    meetId,
    competitionName,
    date,
    poolType,
    athleteId: race.athleteId,
    athleteName: race.athleteName,
    eventType: race.eventType,
    distance: race.distance,
    stroke: race.eventType === 'team' ? '' : race.stroke,
    relayEvent: race.eventType === 'team' ? race.relayEvent : '',
    seedTime: race.seedTime,
    pb: race.pb,
    heat: race.heat,
    lane: race.lane,
    coachNote: race.coachNote,
    status: 'planned',
    resultTime: '',
    splits: [],
    isNewPb: false,
  }));
}

function parseSwimTime(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes(':')) {
    const [minutes, seconds] = trimmed.split(':');
    const minuteValue = Number(minutes);
    const secondValue = Number(seconds);
    if (Number.isNaN(minuteValue) || Number.isNaN(secondValue)) return null;
    return minuteValue * 60 + secondValue;
  }
  const seconds = Number(trimmed);
  return Number.isNaN(seconds) ? null : seconds;
}

function SummaryBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function SelectField({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable style={styles.selectField} onPress={onPress}>
      <View>
        <Text style={styles.selectLabel}>{label}</Text>
        <Text style={styles.selectValue}>{value || 'Bekleniyor'}</Text>
      </View>
      <ChevronDown color={colors.cyan} size={18} />
    </Pressable>
  );
}

function RaceModal({
  race,
  onClose,
  onSave,
  updateRace,
  openSheet,
}: {
  race: DraftRace | null;
  onClose: () => void;
  onSave: () => void;
  updateRace: (patch: Partial<DraftRace>) => void;
  openSheet: (sheet: SheetState) => void;
}) {
  if (!race) return null;

  return (
    <Modal transparent={true} visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Yarış Ekle</Text>
              <Text style={styles.meta}>{race.athleteName}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X color={colors.text} size={18} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.inputRow}>
              <SelectField
                label="Yarış tipi"
                value={race.eventType === 'team' ? 'Takım' : 'Ferdi'}
                onPress={() =>
                  openSheet({
                    title: 'Yarış tipi',
                    options: ['Ferdi', 'Takım'],
                    selected: race.eventType === 'team' ? 'Takım' : 'Ferdi',
                    onConfirm: (value) => updateRace({ eventType: value === 'Takım' ? 'team' : 'individual', relayEvent: value === 'Takım' ? '4x50 Serbest' : '' }),
                  })
                }
              />
              <SelectField label="Yarış mesafesi" value={race.distance} onPress={() => openSheet({ title: 'Yarış mesafesi', options: distanceByStroke[race.stroke], selected: race.distance, onConfirm: (value) => updateRace({ distance: value }) })} />
            </View>

            {race.eventType === 'team' ? (
              <SelectField label="Bayrak yarışı" value={race.relayEvent} onPress={() => openSheet({ title: 'Bayrak yarışı', options: relayEvents, selected: race.relayEvent, onConfirm: (value) => updateRace({ relayEvent: value as RelayEvent }) })} />
            ) : (
              <SelectField label="Yarış stili" value={race.stroke} onPress={() => openSheet({ title: 'Yarış stili', options: strokes, selected: race.stroke, onConfirm: (value) => updateRace({ stroke: value as Stroke, distance: distanceByStroke[value as Stroke][0] }) })} />
            )}

            <View style={styles.inputRow}>
              <TextInput value={race.seedTime} onChangeText={(value) => updateRace({ seedTime: value })} placeholder="Son yarış derecesi" placeholderTextColor={colors.muted} style={styles.input} />
              <TextInput value={race.pb} onChangeText={(value) => updateRace({ pb: value })} placeholder="PB" placeholderTextColor={colors.muted} style={styles.input} />
            </View>

            <View style={styles.inputRow}>
              <SelectField label="Seri" value={race.heat} onPress={() => openSheet({ title: 'Seri', options: heatOptions, selected: race.heat || 'Bekleniyor', onConfirm: (value) => updateRace({ heat: value === 'Bekleniyor' ? '' : value }) })} />
              <SelectField label="Kulvar" value={race.lane} onPress={() => openSheet({ title: 'Kulvar', options: laneOptions, selected: race.lane || 'Bekleniyor', onConfirm: (value) => updateRace({ lane: value === 'Bekleniyor' ? '' : value }) })} />
            </View>

            <TextInput value={race.coachNote} onChangeText={(value) => updateRace({ coachNote: value })} placeholder="Antrenör Notu" placeholderTextColor={colors.muted} multiline={true} style={[styles.input, styles.noteInput]} />
          </ScrollView>

          <View style={styles.inputRow}>
            <AppButton title="Vazgeç" variant="secondary" onPress={onClose} />
            <AppButton title="Kaydet" onPress={onSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function LiveEntryRow({
  entry,
  onResult,
  onUpdate,
}: {
  entry: MeetEntry;
  onResult: (entry: MeetEntry, resultTime: string) => void;
  onUpdate: (id: string, patch: Partial<MeetEntry>) => void;
}) {
  const [resultTime, setResultTime] = useState(entry.resultTime ?? '');
  const [splitText, setSplitText] = useState((entry.splits ?? []).join(', '));
  const [note, setNote] = useState(entry.coachNote);
  const eventName = entry.relayEvent || `${entry.distance} ${entry.stroke}`;

  useEffect(() => {
    setResultTime(entry.resultTime ?? '');
    setSplitText((entry.splits ?? []).join(', '));
    setNote(entry.coachNote);
  }, [entry]);

  return (
    <View style={styles.liveRow}>
      <View style={styles.liveTop}>
        <View style={styles.liveCopy}>
          <Text style={styles.liveName}>{entry.athleteName}</Text>
          <Text style={styles.liveEvent}>{eventName}</Text>
          <Text style={styles.liveMeta}>Seri {entry.heat || 'Bekleniyor'}  •  Kulvar {entry.lane || 'Bekleniyor'}  •  PB {entry.pb || '-'}</Text>
        </View>
        <View style={[styles.statusPill, entry.status === 'completed' && styles.statusDone, entry.status !== 'planned' && entry.status !== 'completed' && styles.statusWarn]}>
          <Text style={styles.statusText}>{entry.status === 'completed' ? 'Yüzdü' : entry.status === 'dq' ? 'DQ' : entry.status === 'dns' ? 'DNS' : 'Bekliyor'}</Text>
        </View>
      </View>

      {entry.isNewPb ? <Text style={styles.pbBadge}>Yeni PB</Text> : null}

      <View style={styles.inputRow}>
        <TextInput value={resultTime} onChangeText={setResultTime} placeholder="Derece Gir" placeholderTextColor={colors.muted} style={styles.input} />
        <AppButton title="Kaydet" onPress={() => onResult(entry, resultTime)} />
      </View>

      <TextInput
        value={splitText}
        onChangeText={(value) => {
          setSplitText(value);
          onUpdate(entry.id, { splits: value.split(',').map((split) => split.trim()).filter(Boolean) });
        }}
        placeholder="Split Gir"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />

      <TextInput
        value={note}
        onChangeText={(value) => {
          setNote(value);
          onUpdate(entry.id, { coachNote: value });
        }}
        placeholder="Not Ekle"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />

      <View style={styles.quickActionRow}>
        <Pressable style={styles.quickAction} onPress={() => onUpdate(entry.id, { status: 'planned' })}>
          <Text style={styles.quickActionText}>Bekliyor</Text>
        </Pressable>
        <Pressable style={styles.quickAction} onPress={() => onUpdate(entry.id, { status: 'dq' })}>
          <Text style={styles.quickActionText}>DQ</Text>
        </Pressable>
        <Pressable style={styles.quickAction} onPress={() => onUpdate(entry.id, { status: 'dns' })}>
          <Text style={styles.quickActionText}>DNS</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SelectionSheet({ sheet, onClose }: { sheet: SheetState; onClose: () => void }) {
  const [tempValue, setTempValue] = useState('');
  useEffect(() => {
    setTempValue(sheet?.selected || sheet?.options[0] || '');
  }, [sheet]);
  if (!sheet) return null;

  return (
    <Modal transparent={true} visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.optionSheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{sheet.title}</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X color={colors.text} size={18} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.chips}>
            {sheet.options.map((option) => (
              <Pressable key={option} style={({ pressed }) => [styles.chip, tempValue === option && styles.chipActive, pressed && styles.pressedChip]} onPress={() => { sheet.onConfirm(option); onClose(); }}>
                {tempValue === option ? <Check color={colors.text} size={14} /> : null}
                <Text style={[styles.chipText, tempValue === option && styles.chipTextActive]}>{option}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 112, gap: spacing.lg },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 22, textAlign: 'center' },
  locked: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  note: { color: colors.mutedStrong, fontWeight: '800' },
  card: { gap: spacing.md },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  liveHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  liveCount: { minWidth: 38, height: 38, borderRadius: 14, backgroundColor: colors.cyanSoft, color: colors.cyan, fontWeight: '900', textAlign: 'center', textAlignVertical: 'center', paddingTop: 9 },
  emptyText: { color: colors.muted, fontWeight: '800', backgroundColor: colors.surfaceSolid, borderRadius: 14, padding: spacing.md },
  liveRow: { borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.sm },
  liveTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  liveCopy: { flex: 1 },
  liveName: { color: colors.text, fontWeight: '900', fontSize: 16 },
  liveEvent: { color: colors.cyan, fontWeight: '900', marginTop: 4 },
  liveMeta: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4, lineHeight: 18 },
  statusPill: { borderRadius: 999, backgroundColor: colors.surfaceSolid, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 7 },
  statusDone: { backgroundColor: 'rgba(52, 211, 153, 0.12)', borderColor: 'rgba(52, 211, 153, 0.36)' },
  statusWarn: { backgroundColor: colors.dangerSoft, borderColor: 'rgba(251, 113, 133, 0.4)' },
  statusText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  pbBadge: { alignSelf: 'flex-start', color: colors.gold, fontWeight: '900', borderRadius: 999, backgroundColor: colors.goldSoft, paddingHorizontal: spacing.md, paddingVertical: 7 },
  inputRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  input: { flex: 1, minWidth: 132, color: colors.text, backgroundColor: colors.surfaceSolid, borderRadius: 14, borderWidth: 1, borderColor: colors.border, minHeight: 46, paddingHorizontal: spacing.md, fontWeight: '800' },
  noteInput: { minHeight: 92, paddingTop: spacing.md, textAlignVertical: 'top' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summaryBox: { flexGrow: 1, minWidth: '18%', borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md },
  summaryValue: { color: colors.cyan, fontWeight: '900', fontSize: 20 },
  summaryLabel: { color: colors.muted, fontWeight: '900', marginTop: 3 },
  athleteCard: { gap: spacing.md },
  athleteHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  athleteAvatar: { width: 48, height: 48, borderRadius: 18, backgroundColor: colors.cyanSoft, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  athleteCopy: { flex: 1 },
  athleteName: { color: colors.text, fontWeight: '900', fontSize: 18 },
  meta: { color: colors.muted, marginTop: 4, fontWeight: '700' },
  pbLine: { color: colors.gold, marginTop: 7, fontWeight: '900' },
  addRaceButton: { minHeight: 48, borderRadius: 16, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: spacing.md },
  addRaceText: { color: colors.background, fontWeight: '900', fontSize: 12 },
  raceRow: { borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.glass, padding: spacing.md, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm, overflow: 'hidden' },
  raceRowCopy: { flex: 1, minWidth: 190 },
  raceRowTitle: { alignSelf: 'flex-start', color: colors.text, fontWeight: '900', lineHeight: 20, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.md, paddingVertical: 7 },
  teamRaceChip: { borderColor: 'rgba(251, 191, 36, 0.42)', backgroundColor: colors.goldSoft },
  raceRowMeta: { color: colors.mutedStrong, fontWeight: '800', marginTop: 5 },
  raceNote: { color: colors.muted, fontWeight: '700', marginTop: 5, lineHeight: 19 },
  rowActions: { flexDirection: 'row', gap: spacing.xs },
  iconAction: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cyanSoft, borderWidth: 1, borderColor: colors.borderStrong },
  deleteAction: { backgroundColor: colors.dangerSoft, borderColor: 'rgba(251, 113, 133, 0.45)' },
  quickActionRow: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickAction: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.md, paddingVertical: 11, minHeight: 42 },
  quickActionText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  selectField: { flex: 1, minHeight: 58, minWidth: 132, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectLabel: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  selectValue: { color: colors.text, fontWeight: '900', marginTop: 3 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { maxHeight: '88%', backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.lg, gap: spacing.md },
  optionSheet: { maxHeight: '76%', backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.lg, gap: spacing.md },
  modalContent: { gap: spacing.md, paddingBottom: spacing.sm },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  sheetTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  closeButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: colors.glass, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  pressedChip: { transform: [{ scale: 0.98 }] },
  chipText: { color: colors.muted, fontWeight: '900' },
  chipTextActive: { color: colors.text },
});


