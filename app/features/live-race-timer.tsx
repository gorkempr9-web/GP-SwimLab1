import { router, useLocalSearchParams } from 'expo-router';
import { Check, RotateCcw, ShieldAlert, X } from 'lucide-react-native';
import { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { LiveRaceEntry, rosterAthletes, strokeDistances } from '@/services/clubCompetition';
import { addSplit, calculateSplits, formatRaceTime, removeSplit, saveRaceResult, SplitInterval, TimerSplit, updateSplit } from '@/services/liveTimer';
import { canManageClub, roleLabel, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

const distances = ['50', '100', '200', '400', '800', '1500'];
const strokes = Object.keys(strokeDistances);
const poolTypes: Array<'25m' | '50m'> = ['25m', '50m'];
const splitIntervals: SplitInterval[] = ['25m', '50m'];

export default function LiveRaceTimerScreen() {
  const params = useLocalSearchParams<{ athleteId?: string; competitionName?: string; distance?: string; stroke?: string; poolType?: '25m' | '50m' }>();
  const { currentUser } = useSession();
  const [athleteId, setAthleteId] = useState(params.athleteId ?? rosterAthletes[0]?.id ?? 'ra-1');
  const [competitionName, setCompetitionName] = useState(params.competitionName ?? '');
  const [distance, setDistance] = useState(params.distance ?? '100');
  const [stroke, setStroke] = useState(params.stroke ?? 'Serbest');
  const [poolType, setPoolType] = useState<'25m' | '50m'>(params.poolType ?? '50m');
  const [splitInterval, setSplitInterval] = useState<SplitInterval>('50m');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [finalTime, setFinalTime] = useState('');
  const [splits, setSplits] = useState<TimerSplit[]>([]);
  const [startNote, setStartNote] = useState('');
  const [turnNote, setTurnNote] = useState('');
  const [finishNote, setFinishNote] = useState('');
  const [generalNote, setGeneralNote] = useState('');
  const [message, setMessage] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const baseElapsedRef = useRef(0);

  const selectedAthlete = rosterAthletes.find((athlete) => athlete.id === athleteId) ?? rosterAthletes[0];
  const expectedSplits = useMemo(() => calculateSplits(distance, poolType, splitInterval), [distance, poolType, splitInterval]);
  const displayTime = running ? formatRaceTime(elapsedMs) : finalTime || formatRaceTime(elapsedMs);

  useEffect(() => {
    if (!running) return undefined;
    intervalRef.current = setInterval(() => {
      setElapsedMs(baseElapsedRef.current + Date.now() - startedAtRef.current);
    }, 40);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  if (!canManageClub(currentUser.role)) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.locked}>
          <ShieldAlert color={colors.gold} size={42} />
          <Text style={styles.title}>Canlı Yarış Kronometresi</Text>
          <Text style={styles.subtitle}>Bu alan sadece antrenör ve kulüp yöneticileri içindir. Mevcut rol: {roleLabel(currentUser.role)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const startTimer = () => {
    startedAtRef.current = Date.now();
    baseElapsedRef.current = elapsedMs;
    setStarted(true);
    setRunning(true);
    setMessage('');
  };

  const takeSplit = () => {
    if (!started || !running) {
      setMessage('Başlatmadan split alınamaz.');
      return;
    }
    setSplits((current) => addSplit(current, elapsedMs, distance, poolType, splitInterval));
  };

  const stopTimer = () => {
    if (!started) return;
    setRunning(false);
    baseElapsedRef.current = elapsedMs;
    setFinalTime(formatRaceTime(elapsedMs));
  };

  const resetTimer = () => {
    setRunning(false);
    setStarted(false);
    setElapsedMs(0);
    setFinalTime('');
    setSplits([]);
    baseElapsedRef.current = 0;
    setMessage('');
  };

  const persistResult = () => {
    if (!finalTime.trim()) {
      setMessage('Final derece olmadan kayıt yapılamaz.');
      return;
    }

    const doSave = () => {
      const entry: LiveRaceEntry = {
        id: `timer-${Date.now()}`,
        athleteId,
        athlete: selectedAthlete?.name ?? 'İsimsiz Sporcu',
        raceKind: 'individual',
        competitionName,
        date: new Date().toLocaleDateString('tr-TR'),
        location: selectedAthlete?.club ?? 'GP Aquatics',
        poolType,
        distance,
        stroke,
        event: `${distance} ${stroke}`,
        raceDay: '1. Gün',
        session: 'Canlı Kronometre',
        reaction: '',
        split1: splits[0]?.time ?? '',
        split2: splits[1]?.time ?? '',
        split3: splits[2]?.time ?? '',
        split4: splits[3]?.time ?? '',
        splits: splits.map((split) => split.time),
        finalTime,
        lane: '-',
        heat: '-',
        rank: '',
        medal: '',
        pb: false,
        dsq: false,
        dns: false,
        status: 'Yüzdü',
        note: [startNote && `Start: ${startNote}`, turnNote && `Dönüş: ${turnNote}`, finishNote && `Son 15m: ${finishNote}`, generalNote].filter(Boolean).join(' | '),
      };
      const result = saveRaceResult(entry);
      setMessage(result.isPB ? 'Sonuç kaydedildi. Yeni PB!' : 'Sonuç kaydedildi.');
    };

    if (splits.length !== expectedSplits.length) {
      Alert.alert('Split uyarısı', 'Split sayısı beklenenden farklı, yine de kaydetmek istiyor musunuz?', [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Kaydet', onPress: doSave },
      ]);
      return;
    }

    doSave();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Canlı Yarış Kronometresi</Text>
            <Text style={styles.subtitle}>Yarış sırasında derece ve splitleri hızlı kaydet.</Text>
          </View>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <X color={colors.text} size={18} />
          </Pressable>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.blockTitle}>Yarış ayarları</Text>
          <TextInput value={competitionName} onChangeText={setCompetitionName} placeholder="Yarış adı" placeholderTextColor={colors.muted} style={styles.input} />
          <Text style={styles.label}>Sporcu</Text>
          <ChipRow options={rosterAthletes.map((athlete) => athlete.id)} value={athleteId} onChange={setAthleteId} labelFor={(id) => rosterAthletes.find((athlete) => athlete.id === id)?.name ?? id} />
          <Text style={styles.label}>Mesafe</Text>
          <ChipRow options={distances} value={distance} onChange={setDistance} labelFor={(item) => `${item}m`} />
          <Text style={styles.label}>Stil</Text>
          <ChipRow options={strokes} value={stroke} onChange={setStroke} />
          <Text style={styles.label}>Havuz tipi</Text>
          <ChipRow options={poolTypes} value={poolType} onChange={(value) => setPoolType(value as '25m' | '50m')} />
          {poolType === '25m' ? (
            <>
              <Text style={styles.label}>Split aralığı</Text>
              <ChipRow options={splitIntervals} value={splitInterval} onChange={(value) => setSplitInterval(value as SplitInterval)} />
            </>
          ) : null}
        </GlassCard>

        <GlassCard style={styles.timerCard}>
          <Text style={styles.timerText}>{displayTime}</Text>
          {finalTime ? <TextInput value={finalTime} onChangeText={setFinalTime} placeholder="Final Derece" placeholderTextColor={colors.muted} style={styles.finalInput} /> : null}
          <View style={styles.controlGrid}>
            <ActionButton title="Başlat" disabled={running} onPress={startTimer} />
            <ActionButton title="Split Al" onPress={takeSplit} />
            <ActionButton title="Durdur" disabled={!running} onPress={stopTimer} />
            <ActionButton title="Sıfırla" variant="secondary" onPress={resetTimer} icon={<RotateCcw color={colors.cyan} size={15} />} />
          </View>
          <Text style={styles.expectedText}>Beklenen splitler: {expectedSplits.length ? expectedSplits.map((item) => `${item}m`).join(', ') : '50m yarışta split gerekmez'}</Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.blockTitle}>Splitler</Text>
          {splits.length ? splits.map((split) => (
            <View key={split.id} style={styles.splitRow}>
              <Text style={styles.splitLabel}>{split.label}</Text>
              <TextInput value={split.time} onChangeText={(value) => setSplits((current) => updateSplit(current, split.id, value))} style={styles.splitInput} />
              <Pressable style={styles.deleteSplit} onPress={() => setSplits((current) => removeSplit(current, split.id))}>
                <X color={colors.danger} size={16} />
              </Pressable>
            </View>
          )) : <Text style={styles.emptyText}>Henüz split alınmadı.</Text>}
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.blockTitle}>Antrenör notu</Text>
          <TextInput value={startNote} onChangeText={setStartNote} placeholder="Start notu" placeholderTextColor={colors.muted} style={styles.input} />
          <TextInput value={turnNote} onChangeText={setTurnNote} placeholder="Dönüş notu" placeholderTextColor={colors.muted} style={styles.input} />
          <TextInput value={finishNote} onChangeText={setFinishNote} placeholder="Son 15m notu" placeholderTextColor={colors.muted} style={styles.input} />
          <TextInput value={generalNote} onChangeText={setGeneralNote} placeholder="Genel not" placeholderTextColor={colors.muted} style={[styles.input, styles.noteInput]} multiline={true} />
        </GlassCard>

        {message ? <Text style={[styles.message, message.includes('PB') && styles.pbMessage]}>{message}</Text> : null}
        <Pressable style={styles.saveButton} onPress={persistResult}>
          <Text style={styles.saveText}>Kaydet</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ChipRow({ options, value, onChange, labelFor }: { options: string[]; value: string; onChange: (value: string) => void; labelFor?: (value: string) => string }) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => (
        <Pressable key={option} style={[styles.chip, value === option && styles.chipActive]} onPress={() => onChange(option)}>
          {value === option ? <Check color={colors.background} size={14} /> : null}
          <Text style={[styles.chipText, value === option && styles.chipTextActive]}>{labelFor ? labelFor(option) : option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ActionButton({ title, onPress, disabled, variant, icon }: { title: string; onPress: () => void; disabled?: boolean; variant?: 'secondary'; icon?: ReactNode }) {
  return (
    <Pressable style={[styles.actionButton, variant === 'secondary' && styles.secondaryButton, disabled && styles.disabledButton]} disabled={disabled} onPress={onPress}>
      {icon}
      <Text style={[styles.actionText, variant === 'secondary' && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.mutedStrong, fontWeight: '800', marginTop: 6, lineHeight: 20 },
  closeButton: { width: 38, height: 38, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  card: { gap: spacing.md },
  timerCard: { gap: spacing.md, alignItems: 'center' },
  blockTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  label: { color: colors.mutedStrong, fontWeight: '900' },
  input: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '800' },
  noteInput: { minHeight: 82, paddingTop: spacing.md, textAlignVertical: 'top' },
  timerText: { color: colors.text, fontSize: 54, fontWeight: '900', letterSpacing: 0 },
  finalInput: { minHeight: 46, minWidth: 170, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.goldSoft, color: colors.text, textAlign: 'center', fontWeight: '900', fontSize: 20 },
  controlGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  actionButton: { minHeight: 48, minWidth: '45%', borderRadius: 16, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, paddingHorizontal: spacing.md },
  secondaryButton: { backgroundColor: colors.cyanSoft, borderWidth: 1, borderColor: colors.borderStrong },
  disabledButton: { opacity: 0.45 },
  actionText: { color: colors.background, fontWeight: '900' },
  secondaryText: { color: colors.cyan },
  expectedText: { color: colors.muted, fontWeight: '800', textAlign: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { minHeight: 38, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  chipText: { color: colors.mutedStrong, fontWeight: '900' },
  chipTextActive: { color: colors.background },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  splitLabel: { flex: 1, color: colors.text, fontWeight: '900' },
  splitInput: { width: 92, minHeight: 40, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, textAlign: 'center', fontWeight: '900' },
  deleteSplit: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dangerSoft },
  emptyText: { color: colors.muted, fontWeight: '800' },
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 16, padding: spacing.md, textAlign: 'center' },
  pbMessage: { color: colors.success, backgroundColor: 'rgba(34,197,94,0.12)' },
  saveButton: { minHeight: 54, borderRadius: 18, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  saveText: { color: colors.background, fontWeight: '900', fontSize: 16 },
});
