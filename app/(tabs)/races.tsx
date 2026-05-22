import { Check, ChevronDown, ChevronRight, Plus, TimerReset, Trophy, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import { colors, spacing, typography } from '@/theme/tokens';

const raceTypes = ['İl Yarışı', 'Bölge Yarışı', 'Türkiye Şampiyonası', 'Kulüp İçi Yarış', 'Okul Yarışı', 'Özel Yarış'];
const poolTypes = ['25m Kısa Kulvar', '50m Uzun Kulvar'];
const eventMap: Record<string, string[]> = {
  Serbest: ['50m', '100m', '200m', '400m', '800m', '1500m'],
  Sırtüstü: ['50m', '100m', '200m'],
  Kurbağalama: ['50m', '100m', '200m'],
  Kelebek: ['50m', '100m', '200m'],
  Karışık: ['100m', '200m', '400m'],
  Bayrak: ['4x50 Serbest', '4x100 Serbest', '4x200 Serbest', '4x50 Karışık', '4x100 Karışık'],
};

type SheetState = {
  title: string;
  options: string[];
  selected: string;
  onConfirm: (value: string) => void;
} | null;

type RaceEntry = {
  id: string;
  meetName: string;
  raceType: string;
  poolType: string;
  branch: string;
  time: string;
  splits: string[];
  note: string;
  date: string;
  isPb: boolean;
};

const initialHistory: RaceEntry[] = [
  {
    id: 'r1',
    meetName: 'Marmara Cup',
    raceType: 'Bölge Yarışı',
    poolType: '50m Uzun Kulvar',
    branch: '100m Serbest',
    time: '1:02.35',
    splits: ['30.22', '32.13'],
    note: 'İkinci 50m kontrollü.',
    date: '20.05.2026',
    isPb: true,
  },
  {
    id: 'r2',
    meetName: 'Kulüp Ligi',
    raceType: 'Kulüp İçi Yarış',
    poolType: '25m Kısa Kulvar',
    branch: '50m Serbest',
    time: '28.44',
    splits: ['13.82', '14.62'],
    note: 'Çıkış iyi.',
    date: '12.05.2026',
    isPb: true,
  },
];

export default function RacesScreen() {
  const [history, setHistory] = useState(initialHistory);
  const [meetName, setMeetName] = useState('');
  const [raceType, setRaceType] = useState('');
  const [poolType, setPoolType] = useState('');
  const [category, setCategory] = useState('');
  const [eventName, setEventName] = useState('');
  const [raceDate, setRaceDate] = useState(new Date().toLocaleDateString('tr-TR'));
  const [time, setTime] = useState('');
  const [split1, setSplit1] = useState('');
  const [split2, setSplit2] = useState('');
  const [split3, setSplit3] = useState('');
  const [split4, setSplit4] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [selectionSheet, setSelectionSheet] = useState<SheetState>(null);
  const [branchSheetOpen, setBranchSheetOpen] = useState(false);
  const [splitsOpen, setSplitsOpen] = useState(true);
  const [noteOpen, setNoteOpen] = useState(false);
  const [expandedRaceId, setExpandedRaceId] = useState<string | null>(null);

  const branch = useMemo(() => formatBranch(category, eventName), [category, eventName]);

  const currentBest = useMemo(() => {
    return history
      .filter((race) => race.branch === branch && race.poolType === poolType)
      .map((race) => parseRaceTime(race.time))
      .filter((seconds): seconds is number => seconds !== null)
      .sort((a, b) => a - b)[0];
  }, [branch, history, poolType]);

  const openSelection = (title: string, options: string[], selected: string, onConfirm: (value: string) => void) => {
    setSelectionSheet({ title, options, selected, onConfirm });
  };

  const handleSave = () => {
    const parsedTime = parseRaceTime(time);
    if (!meetName.trim() || !raceType || !poolType || !eventName || !category || !raceDate.trim() || !time.trim()) {
      setMessage('Lütfen yarış adı, tür, havuz, mesafe, stil, tarih ve ana derece alanlarını doldurun.');
      return;
    }

    if (parsedTime === null) {
      setMessage('Derece formatı 28.44, 1:02.35 veya 2:18.90 olmalıdır.');
      return;
    }

    const isPb = currentBest === undefined || parsedTime < currentBest;
    const splits = [split1, split2, split3, split4].map((split) => split.trim()).filter(Boolean);
    const newEntry: RaceEntry = {
      id: `race-${Date.now()}`,
      meetName: meetName.trim() || 'Yarış kaydı',
      raceType,
      poolType: poolType || 'Havuz tipi seçilmedi',
      branch,
      time: time.trim(),
      splits,
      note: note.trim(),
      date: raceDate.trim(),
      isPb,
    };

    setHistory((current) => [newEntry, ...current]);
    setMeetName('');
    setRaceType('');
    setPoolType('');
    setCategory('');
    setEventName('');
    setRaceDate(new Date().toLocaleDateString('tr-TR'));
    setTime('');
    setSplit1('');
    setSplit2('');
    setSplit3('');
    setSplit4('');
    setNote('');
    setSplitsOpen(true);
    setNoteOpen(false);
    setMessage(isPb ? 'Derece kaydedildi. Yeni PB!' : 'Derece kaydedildi.');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Yarış Dereceleri</Text>

        <GlassCard style={styles.formCard}>
          <Text style={styles.cardTitle}>Yeni derece girişi</Text>
          <TextInput placeholder="Yarış adı" placeholderTextColor={colors.muted} value={meetName} onChangeText={setMeetName} style={styles.input} />
          <SelectField label="Yarış türü seç" value={raceType} onPress={() => openSelection('Yarış türü seç', raceTypes, raceType, setRaceType)} />
          <SelectField label="Havuz tipi seç" value={poolType} onPress={() => openSelection('Havuz tipi seç', poolTypes, poolType, setPoolType)} />
          <SelectField label="Mesafe seç" value={eventName} onPress={() => openSelection('Mesafe seç', getDistanceOptions(category), eventName, setEventName)} />
          <SelectField label="Stil seç" value={category} onPress={() => openSelection('Stil seç', Object.keys(eventMap), category, (value) => { setCategory(value); setEventName(eventMap[value][0]); })} />
          <TextInput placeholder="Tarih (22.05.2026)" placeholderTextColor={colors.muted} value={raceDate} onChangeText={setRaceDate} style={styles.input} />

          <ExpandableHeader title="Süre / Split Bilgileri" isOpen={splitsOpen} onPress={() => setSplitsOpen((current) => !current)} />
          {splitsOpen ? (
            <View style={styles.collapsibleBody}>
              <TextInput placeholder="Ana derece (28.44 / 1:02.35)" placeholderTextColor={colors.muted} value={time} onChangeText={setTime} style={styles.input} keyboardType="numbers-and-punctuation" />
              <View style={styles.inputRow}>
                <TextInput placeholder="Split 1" placeholderTextColor={colors.muted} value={split1} onChangeText={setSplit1} style={styles.input} keyboardType="numbers-and-punctuation" />
                <TextInput placeholder="Split 2" placeholderTextColor={colors.muted} value={split2} onChangeText={setSplit2} style={styles.input} keyboardType="numbers-and-punctuation" />
              </View>
              <View style={styles.inputRow}>
                <TextInput placeholder="Split 3" placeholderTextColor={colors.muted} value={split3} onChangeText={setSplit3} style={styles.input} keyboardType="numbers-and-punctuation" />
                <TextInput placeholder="Split 4" placeholderTextColor={colors.muted} value={split4} onChangeText={setSplit4} style={styles.input} keyboardType="numbers-and-punctuation" />
              </View>
            </View>
          ) : null}

          <ExpandableHeader title="Antrenör Notu / Kişisel Not" isOpen={noteOpen} onPress={() => setNoteOpen((current) => !current)} />
          {noteOpen ? <TextInput placeholder="Not" placeholderTextColor={colors.muted} value={note} onChangeText={setNote} multiline={true} style={[styles.input, styles.noteInput]} /> : null}

          {message ? <Text style={styles.message}>{message}</Text> : null}
        </GlassCard>

        <Text style={styles.sectionTitle}>Yarış geçmişi</Text>
        {history.map((race) => {
          const isExpanded = expandedRaceId === race.id;
          return (
            <Pressable key={race.id} onPress={() => setExpandedRaceId(isExpanded ? null : race.id)}>
              <GlassCard style={styles.historyCard}>
                <View style={styles.iconBox}>
                  {race.isPb ? <Trophy color={colors.gold} size={22} /> : <TimerReset color={colors.cyan} size={22} />}
                </View>
                <View style={styles.raceInfo}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.raceTitle}>{race.meetName}</Text>
                    {race.isPb ? <Text style={styles.pbPill}>PB</Text> : null}
                  </View>
                  <Text style={styles.branchText}>{race.branch}</Text>
                  <View style={styles.compactMetaRow}>
                    <Text style={styles.timeText}>{race.time}</Text>
                    <Text style={styles.dateText}>{race.date}</Text>
                  </View>
                  {isExpanded ? (
                    <View style={styles.detailBox}>
                      <Text style={styles.raceMeta}>{race.raceType}</Text>
                      <Text style={styles.raceMeta}>{race.poolType}</Text>
                      {race.splits.length ? <Text style={styles.raceMeta}>Split: {race.splits.join(' / ')}</Text> : null}
                      {race.note ? <Text style={styles.note}>{race.note}</Text> : null}
                    </View>
                  ) : null}
                </View>
                <ChevronDown color={colors.muted} size={18} />
              </GlassCard>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.saveBar}>
        <AppButton title="Kaydet" icon={Plus} onPress={handleSave} />
      </View>

      <SelectionSheet sheet={selectionSheet} onClose={() => setSelectionSheet(null)} />
      <BranchSheet
        visible={branchSheetOpen}
        category={category}
        eventName={eventName}
        onClose={() => setBranchSheetOpen(false)}
        onConfirm={(nextCategory, nextEvent) => {
          setCategory(nextCategory);
          setEventName(nextEvent);
          setBranchSheetOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

function SelectField({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable style={styles.selectField} onPress={onPress}>
      <View>
        <Text style={styles.selectLabel}>{label}</Text>
        <Text style={[styles.selectValue, !value && styles.placeholderValue]}>{value || 'Seç'}</Text>
      </View>
      <ChevronRight color={colors.cyan} size={20} />
    </Pressable>
  );
}

function ExpandableHeader({ title, isOpen, onPress }: { title: string; isOpen: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.expandHeader} onPress={onPress}>
      <Text style={styles.expandTitle}>{title}</Text>
      <ChevronDown color={colors.cyan} size={20} style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }} />
    </Pressable>
  );
}

function SelectionSheet({ sheet, onClose }: { sheet: SheetState; onClose: () => void }) {
  if (!sheet) {
    return null;
  }
  const selected = sheet.selected;
  const setTempValue = (_value: string) => undefined;

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
          <View style={styles.optionList}>
            {sheet.options.map((option) => {
              const active = sheet.selected === option;
              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [styles.sheetOption, active && styles.sheetOptionActive, pressed && styles.pressedOption]}
                  onPress={() => {
                    sheet.onConfirm(option);
                    onClose();
                  }}
                >
                  {active ? <Check color={colors.text} size={15} /> : null}
                  <Text style={[styles.sheetOptionText, active && styles.sheetOptionTextActive]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
          {false ? <View style={styles.sheetActions}>
            <AppButton title="İptal" variant="secondary" onPress={onClose} />
            <AppButton
              title="Seç"
              onPress={() => {
                sheet!.onConfirm(selected);
                setTempValue('');
                onClose();
              }}
            />
          </View> : null}
        </View>
      </View>
    </Modal>
  );
}

function BranchSheet({
  visible,
  category,
  eventName,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  category: string;
  eventName: string;
  onClose: () => void;
  onConfirm: (category: string, eventName: string) => void;
}) {
  const firstCategory = Object.keys(eventMap)[0];
  const [tempCategory, setTempCategory] = useState(category || firstCategory);
  const [tempEvent, setTempEvent] = useState(eventName || eventMap[category || firstCategory][0]);
  const events = eventMap[tempCategory];

  useEffect(() => {
    if (visible) {
      const nextCategory = category || firstCategory;
      setTempCategory(nextCategory);
      setTempEvent(eventName || eventMap[nextCategory][0]);
    }
  }, [category, eventName, firstCategory, visible]);

  const handleCategory = (nextCategory: string) => {
    setTempCategory(nextCategory);
    setTempEvent(eventMap[nextCategory][0]);
  };

  return (
    <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Branş seç</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X color={colors.text} size={18} />
            </Pressable>
          </View>
          <Text style={styles.sheetSectionTitle}>Kategori</Text>
          <View style={styles.optionList}>
            {Object.keys(eventMap).map((option) => (
              <Pressable key={option} style={[styles.sheetOption, tempCategory === option && styles.sheetOptionActive]} onPress={() => handleCategory(option)}>
                <Text style={[styles.sheetOptionText, tempCategory === option && styles.sheetOptionTextActive]}>{option}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.sheetSectionTitle}>Mesafe / yarış tipi</Text>
          <View style={styles.optionList}>
            {events.map((option) => (
              <Pressable key={option} style={({ pressed }) => [styles.sheetOption, tempEvent === option && styles.sheetOptionActive, pressed && styles.pressedOption]} onPress={() => onConfirm(tempCategory, option)}>
                <Text style={[styles.sheetOptionText, tempEvent === option && styles.sheetOptionTextActive]}>{formatBranch(tempCategory, option)}</Text>
              </Pressable>
            ))}
          </View>
          {false ? <View style={styles.sheetActions}>
            <AppButton title="İptal" variant="secondary" onPress={onClose} />
            <AppButton title="Seç" onPress={() => onConfirm(tempCategory, tempEvent)} />
          </View> : null}
        </View>
      </View>
    </Modal>
  );
}

function getDistanceOptions(category: string) {
  if (category && eventMap[category]) {
    return eventMap[category];
  }

  return Array.from(new Set(Object.values(eventMap).flat()));
}

function formatBranch(category: string, eventName: string) {
  if (!category || !eventName) {
    return '';
  }

  return category === 'Bayrak' ? eventName : `${eventName} ${category}`;
}

function parseRaceTime(value: string) {
  const trimmed = value.trim();
  if (/^\d{1,2}\.\d{2}$/.test(trimmed)) {
    return Number(trimmed);
  }

  const match = trimmed.match(/^(\d+):([0-5]?\d)\.(\d{2})$/);
  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]) + Number(`0.${match[3]}`);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 204, gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  formCard: { gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 17, marginBottom: 2 },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  input: { flex: 1, color: colors.text, backgroundColor: colors.surfaceSolid, borderRadius: 14, paddingHorizontal: spacing.md, minHeight: 48, borderWidth: 1, borderColor: colors.border, fontWeight: '800' },
  noteInput: { minHeight: 92, paddingTop: spacing.md, textAlignVertical: 'top' },
  selectField: { minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectLabel: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  selectValue: { color: colors.text, fontWeight: '900', marginTop: 3 },
  placeholderValue: { color: colors.mutedStrong },
  expandHeader: { minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  expandTitle: { color: colors.text, fontWeight: '900' },
  collapsibleBody: { gap: spacing.sm },
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 20, marginTop: spacing.sm },
  historyCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  iconBox: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  raceInfo: { flex: 1 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, alignItems: 'center' },
  raceTitle: { color: colors.text, fontWeight: '900', fontSize: 16, flex: 1 },
  branchText: { color: colors.mutedStrong, marginTop: 4, fontWeight: '800' },
  compactMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginTop: 6 },
  timeText: { color: colors.text, fontWeight: '900', fontSize: 20 },
  dateText: { color: colors.muted, fontWeight: '800' },
  raceMeta: { color: colors.muted, marginTop: 5, fontWeight: '700' },
  detailBox: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.sm },
  pbPill: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  note: { color: colors.mutedStrong, marginTop: 6, lineHeight: 20 },
  saveBar: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: 84, paddingTop: spacing.sm, backgroundColor: 'rgba(3, 20, 38, 0.92)' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  sheet: { maxHeight: '82%', backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.lg, gap: spacing.md },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  closeButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  sheetSectionTitle: { color: colors.mutedStrong, fontWeight: '900', marginTop: spacing.xs },
  optionList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sheetOption: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 9, backgroundColor: colors.surfaceSolid, flexDirection: 'row', alignItems: 'center', gap: 6 },
  sheetOptionActive: { borderColor: colors.cyan, backgroundColor: colors.cyan },
  pressedOption: { transform: [{ scale: 0.98 }] },
  sheetOptionText: { color: colors.mutedStrong, fontWeight: '900' },
  sheetOptionTextActive: { color: colors.text },
  sheetActions: { flexDirection: 'row', gap: spacing.sm },
});
