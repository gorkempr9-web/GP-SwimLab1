import { ArrowDown, ArrowUp, Check, Edit3, Plus, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { colors, spacing } from '@/theme/tokens';
import { formatTrainingSet, TrainingSection, TrainingSet } from '@/services/trainingPlans';

const repeats = Array.from({ length: 20 }, (_, index) => String(index + 1));
const distances = ['25', '50', '75', '100', '150', '200', '300', '400', '800', '1500'];
const strokes = ['Serbest', 'Sırtüstü', 'Kurbağalama', 'Kelebek', 'Karışık', 'Ayak', 'Kol', 'Drill', 'Karışık Set'];
const intervals = ['@0:30', '@0:45', '@1:00', '@1:15', '@1:30', '@1:45', '@2:00', '@2:30', '@3:00'];
const intensities = ['Kolay', 'Orta', 'Sert', 'Sprint', 'Race Pace'];
const equipment = ['Yok', 'Tahta', 'Pullbuoy', 'Palet', 'Şnorkel', 'Kürek', 'Lastik'];

export function SetBuilder({
  section,
  sets,
  onChange,
}: {
  section: TrainingSection;
  sets: TrainingSet[];
  onChange: (sets: TrainingSet[]) => void;
}) {
  const [repeat, setRepeat] = useState('');
  const [distance, setDistance] = useState('');
  const [stroke, setStroke] = useState('');
  const [interval, setInterval] = useState('');
  const [intensity, setIntensity] = useState('');
  const [gear, setGear] = useState('Yok');
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const previewSet = useMemo<TrainingSet>(() => makeSet(section, repeat, distance, stroke, interval, intensity, gear, note, editingId ?? `set-${Date.now()}`), [section, repeat, distance, stroke, interval, intensity, gear, note, editingId]);

  const addSet = () => {
    if (editingId) {
      onChange(sets.map((set) => (set.id === editingId ? previewSet : set)));
      setEditingId(null);
      return;
    }
    onChange([...sets, previewSet]);
  };

  const editSet = (set: TrainingSet) => {
    setEditingId(set.id);
    setRepeat(String(set.repeat));
    setDistance(String(set.distance));
    setStroke(set.stroke);
    setInterval(set.interval);
    setIntensity(set.intensity);
    setGear(set.equipment);
    setNote(set.note);
  };

  const moveSet = (id: string, direction: -1 | 1) => {
    const index = sets.findIndex((set) => set.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= sets.length) return;
    const next = [...sets];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    onChange(next);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{section}</Text>
        <Text style={styles.count}>{sets.length} set</Text>
      </View>

      <Text style={styles.label}>Tekrar</Text>
      <ChipGroup options={repeats} value={repeat} onChange={setRepeat} compact={true} />
      <Text style={styles.label}>Mesafe</Text>
      <ChipGroup options={distances} value={distance} onChange={setDistance} />
      <Text style={styles.label}>{section === 'Teknik' ? 'Manuel Drill' : 'Stil'}</Text>
      {section === 'Teknik' ? (
        <TextInput value={stroke} onChangeText={setStroke} placeholder="Drill adını yaz" placeholderTextColor={colors.muted} style={styles.input} />
      ) : (
        <ChipGroup options={strokes} value={stroke} onChange={setStroke} />
      )}
      <Text style={styles.label}>Tempo</Text>
      <ChipGroup options={intervals} value={interval} onChange={setInterval} />
      <TextInput value={interval} onChangeText={setInterval} placeholder="@1:40" placeholderTextColor={colors.muted} style={styles.input} />
      <Text style={styles.label}>Yoğunluk</Text>
      <ChipGroup options={intensities} value={intensity} onChange={setIntensity} />
      <Text style={styles.label}>Ekipman</Text>
      <ChipGroup options={equipment} value={gear} onChange={setGear} />
      <TextInput value={note} onChangeText={setNote} placeholder="Not" placeholderTextColor={colors.muted} style={styles.input} />

      <View style={styles.preview}>
        <Text style={styles.previewLabel}>Önizleme</Text>
        <Text style={styles.previewText}>{formatTrainingSet(previewSet)}</Text>
      </View>
      <AppButton title={editingId ? 'Seti Güncelle' : 'Set Ekle'} icon={Plus} onPress={addSet} />

      {sets.map((set, index) => (
        <View key={set.id} style={styles.setRow}>
          <Text style={styles.setText}>{formatTrainingSet(set)}</Text>
          <View style={styles.actions}>
            <IconButton icon={ArrowUp} onPress={() => moveSet(set.id, -1)} disabled={index === 0} />
            <IconButton icon={ArrowDown} onPress={() => moveSet(set.id, 1)} disabled={index === sets.length - 1} />
            <IconButton icon={Edit3} onPress={() => editSet(set)} />
            <IconButton icon={Trash2} danger={true} onPress={() => onChange(sets.filter((item) => item.id !== set.id))} />
          </View>
        </View>
      ))}
    </View>
  );
}

function makeSet(section: TrainingSection, repeat: string, distance: string, stroke: string, interval: string, intensity: string, equipment: string, note: string, id: string): TrainingSet {
  const repeatValue = Number(repeat) || 1;
  const distanceValue = Number(distance) || 25;
  return {
    id,
    section,
    repeat: repeatValue,
    distance: distanceValue,
    stroke: stroke || (section === 'Teknik' ? 'Manuel Drill' : 'Serbest'),
    drillDescription: section === 'Teknik' ? stroke : '',
    interval,
    intensity: intensity || 'Orta',
    equipment,
    note,
    calculatedMeters: repeatValue * distanceValue,
  };
}

function ChipGroup({ options, value, onChange, compact = false }: { options: string[]; value: string; onChange: (value: string) => void; compact?: boolean }) {
  return (
    <View style={styles.chips}>
      {options.map((option) => (
        <Pressable key={option} style={({ pressed }) => [styles.chip, compact && styles.chipCompact, value === option && styles.chipActive, pressed && styles.pressedChip]} onPress={() => onChange(option)}>
          {value === option ? <Check color={colors.text} size={14} /> : null}
          <Text style={[styles.chipText, value === option && styles.chipTextActive]}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function IconButton({ icon: Icon, onPress, danger = false, disabled = false }: { icon: typeof Trash2; onPress: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <Pressable style={[styles.iconButton, danger && styles.iconDanger, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <Icon color={danger ? colors.danger : colors.cyan} size={15} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.text, fontWeight: '900', fontSize: 17 },
  count: { color: colors.cyan, fontWeight: '900' },
  label: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: colors.glass, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipCompact: { minWidth: 42, alignItems: 'center', paddingHorizontal: spacing.sm },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  pressedChip: { transform: [{ scale: 0.98 }] },
  chipText: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  chipTextActive: { color: colors.text },
  input: { color: colors.text, backgroundColor: colors.glass, borderRadius: 14, borderWidth: 1, borderColor: colors.border, minHeight: 44, paddingHorizontal: spacing.md, fontWeight: '800' },
  preview: { borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, padding: spacing.md, gap: 4 },
  previewLabel: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  previewText: { color: colors.text, fontWeight: '900', lineHeight: 20 },
  setRow: { borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, padding: spacing.md, gap: spacing.sm },
  setText: { color: colors.text, fontWeight: '800', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  iconButton: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  iconDanger: { borderColor: 'rgba(251, 113, 133, 0.42)', backgroundColor: colors.dangerSoft },
  disabled: { opacity: 0.35 },
});
