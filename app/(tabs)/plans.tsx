import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarDays, CheckCircle2, Dumbbell, Edit3, FileText, Plus, RotateCcw, Trash2, XCircle } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { canManageClub, useSession } from '@/services/session';
import { readClubCollection } from '@/services/firestoreData';
import { addPlanToTrainingLog } from '@/services/trainingLog';
import {
  AssignedAthlete,
  DrylandExercise,
  cancelTrainingPlan,
  deleteTrainingPlan,
  generateTrainingPlanPdf,
  getPlanSummary,
  getTrainingPlans,
  hydrateTrainingPlansFromStorage,
  makeSectionsFromSets,
  normalizeTrainingPlan,
  saveTrainingPlan,
  statusLabel,
  summarizeTrainingSets,
  TrainingGroup,
  TrainingPlan,
  TrainingPlanInput,
  TrainingSection,
  TrainingSet,
  TrainingStatus,
  TrainingType,
  updateAthleteTrainingStatus,
  updateTrainingPlanSets,
} from '@/services/trainingPlans';
import { colors, spacing, typography } from '@/theme/tokens';

const groups: TrainingGroup[] = ['Performans', 'Gelişim', 'Temel Eğitim', 'Yarış Grubu', 'Özel Ders', 'Belirli Sporcular'];
const targets: TrainingType[] = ['Teknik', 'Dayanıklılık', 'Hız', 'Yarış', 'Toparlanma'];
const setSections: TrainingSection[] = ['Isınma', 'Teknik', 'Ana Set', 'Sprint', 'Ayak', 'Soğuma'];
const strokes = ['Serbest', 'Sırtüstü', 'Kurbağalama', 'Kelebek', 'Karışık', 'Ayak', 'Kol', 'Drill'];
const drylandTargets = ['Kuvvet', 'Patlayıcı Kuvvet', 'Mobilite', 'Core', 'Esneklik', 'Rehabilitasyon'];

type DraftSet = {
  section: TrainingSection;
  repeat: string;
  distance: string;
  stroke: string;
  drillDescription: string;
  interval: string;
  equipment: string;
  note: string;
};

const emptyDraft: DraftSet = {
  section: 'Ana Set',
  repeat: '',
  distance: '',
  stroke: 'Serbest',
  drillDescription: '',
  interval: '',
  equipment: '',
  note: '',
};

type DraftDryland = {
  movementName: string;
  sets: string;
  reps: string;
  duration: string;
  rest: string;
  target: string;
  description: string;
};

const emptyDrylandDraft: DraftDryland = {
  movementName: '',
  sets: '',
  reps: '',
  duration: '',
  rest: '',
  target: 'Kuvvet',
  description: '',
};

export default function PlansScreen() {
  const { currentUser } = useSession();
  const canEdit = canManageClub(currentUser.role);
  const isAthlete = currentUser.role === 'athlete';
  const isParent = currentUser.role === 'parent';
  const [plans, setPlans] = useState(() => getTrainingPlans());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [prefill, setPrefill] = useState<TrainingPlanInput | null>(null);
  const [availableGroups, setAvailableGroups] = useState<TrainingGroup[]>(groups);
  const [message, setMessage] = useState('');

  useEffect(() => {
    hydrateTrainingPlansFromStorage().then((storedPlans) => {
      setPlans([...storedPlans]);
      setExpandedId(storedPlans[0]?.planId ?? null);
    });
    readClubCollection<Record<string, unknown>>('groups', []).then((rows) => {
      const dynamicGroups = rows
        .filter((row: Record<string, unknown>) => row.isActive !== false)
        .map((row: Record<string, unknown>) => (typeof row.name === 'string' ? row.name : ''))
        .filter(Boolean) as TrainingGroup[];
      if (dynamicGroups.length) setAvailableGroups([...dynamicGroups, 'Belirli Sporcular']);
    });
  }, []);

  const visiblePlans = useMemo(() => {
    if (isAthlete) {
      const userGroup = currentUser.groupName || currentUser.category || '';
      return plans.filter((plan) => {
        const safePlan = normalizeTrainingPlan(plan);
        return safePlan.assignedAthletes.some((athlete) => athlete.athleteId === currentUser.id) || safePlan.assignedGroups.includes(userGroup as TrainingGroup);
      });
    }
    if (isParent) {
      return plans.filter((plan) => normalizeTrainingPlan(plan).assignedAthletes.some((athlete) => athlete.athleteId === currentUser.childAthleteId));
    }
    return plans;
  }, [currentUser.category, currentUser.childAthleteId, currentUser.groupName, currentUser.id, isAthlete, isParent, plans]);

  const refresh = () => setPlans([...getTrainingPlans()]);

  const handlePdf = async () => {
    const report = await generateTrainingPlanPdf();
    setMessage(report.message);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Antrenman Planları</Text>
          <Text style={styles.subtitle}>{canEdit ? 'Set set manuel plan oluştur, sporcuya veya gruba ata.' : 'Sana atanan antrenmanları ve set detaylarını takip et.'}</Text>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {canEdit ? (
          <>
            <View style={styles.topActions}>
              <Pressable style={styles.createToggle} onPress={() => setShowCreate((value) => !value)}>
                <Plus color={colors.background} size={20} />
                <Text style={styles.createText}>Yeni Antrenman Planı</Text>
              </Pressable>
            </View>
            {showCreate ? (
              <CreatePlanForm
                prefill={prefill}
                groupOptions={availableGroups}
                onCreate={(plan) => {
                  addPlanToTrainingLog(plan);
                  refresh();
                  setShowCreate(false);
                  setPrefill(null);
                  setExpandedId(plan.planId);
                  setMessage('Antrenman planı kaydedildi ve günlüğe işlendi.');
                }}
              />
            ) : null}
          </>
        ) : null}

        {visiblePlans.length ? (
          <>
            <View style={styles.summaryRow}>
              <SummaryCard label="Plan" value={String(visiblePlans.length)} />
              <SummaryCard label="Toplam Metre" value={`${visiblePlans.reduce((sum, plan) => sum + numericMeters(plan.totalMeters), 0)}m`} />
              <SummaryCard label="PDF" value="Hazır" />
            </View>
            <AppButton title="Antrenman Planı PDF" icon={FileText} variant="secondary" onPress={handlePdf} />
            <Text style={styles.sectionTitle}>Plan Listesi</Text>
            {visiblePlans.map((plan) => (
              <TrainingPlanCard
                key={plan.planId}
                plan={plan}
                expanded={expandedId === plan.planId}
                canEdit={canEdit}
                isAthlete={isAthlete}
                onToggle={() => setExpandedId(expandedId === plan.planId ? null : plan.planId)}
                onRefresh={refresh}
                onMessage={setMessage}
                onRepeat={(draft) => {
                  setPrefill(draft);
                  setShowCreate(true);
                  setMessage('Antrenman tekrar için forma kopyalandı. Tarih ve atamayı güncelleyebilirsin.');
                }}
              />
            ))}
          </>
        ) : (
          <EmptyState title="Henüz antrenman planı oluşturulmadı." detail={canEdit ? 'İlk planı oluşturmak için Yeni Antrenman Planı butonunu kullan.' : 'Antrenör plan eklediğinde burada görünecek.'} icon={Dumbbell} tone={colors.coral} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CreatePlanForm({ onCreate, prefill, groupOptions }: { onCreate: (plan: TrainingPlan) => void; prefill: TrainingPlanInput | null; groupOptions: TrainingGroup[] }) {
  const [title, setTitle] = useState(prefill?.title ?? '');
  const [date, setDate] = useState(prefill?.date ?? formatDateInput(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState(prefill?.duration ?? '');
  const [athleteName, setAthleteName] = useState(prefill?.athleteName ?? '');
  const [assignedGroups, setAssignedGroups] = useState<TrainingGroup[]>(prefill?.assignedGroups?.length ? prefill.assignedGroups : ['Performans']);
  const [target, setTarget] = useState<TrainingType>(prefill?.type ?? 'Teknik');
  const [pool, setPool] = useState<'25m' | '50m'>(prefill?.pool ?? '50m');
  const [sets, setSets] = useState<TrainingSet[]>(prefill?.sets ?? []);
  const [drylandExercises, setDrylandExercises] = useState<DrylandExercise[]>(prefill?.drylandExercises ?? []);
  const [drylandDraft, setDrylandDraft] = useState<DraftDryland>(emptyDrylandDraft);
  const [editingDrylandId, setEditingDrylandId] = useState<string | null>(null);
  const [coachNote, setCoachNote] = useState(prefill?.coachNote ?? '');
  const [draft, setDraft] = useState<DraftSet>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSetForm, setShowSetForm] = useState(true);
  const [error, setError] = useState('');

  const summary = useMemo(() => summarizeTrainingSets(sets), [sets]);

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (selectedDate) setDate(formatDateInput(selectedDate));
  };

  const upsertDryland = () => {
    if (!drylandDraft.movementName.trim()) {
      setError('Kara antrenmanı için hareket adı zorunludur.');
      return;
    }
    if (!drylandDraft.sets.trim()) {
      setError('Kara antrenmanı için set alanı zorunludur.');
      return;
    }
    if (!drylandDraft.reps.trim() && !drylandDraft.duration.trim()) {
      setError('Kara antrenmanı için tekrar veya süre alanından biri zorunludur.');
      return;
    }
    if (!drylandDraft.rest.trim()) {
      setError('Kara antrenmanı için dinlenme alanı zorunludur.');
      return;
    }
    if (!drylandDraft.target.trim()) {
      setError('Kara antrenmanı için hedef alanı zorunludur.');
      return;
    }
    const exercise: DrylandExercise = {
      id: editingDrylandId ?? `dry-${Date.now()}`,
      movementName: drylandDraft.movementName.trim(),
      sets: drylandDraft.sets.trim(),
      reps: drylandDraft.reps.trim(),
      duration: drylandDraft.duration.trim(),
      rest: drylandDraft.rest.trim(),
      target: drylandDraft.target.trim(),
      description: drylandDraft.description.trim(),
    };
    setDrylandExercises((current) => editingDrylandId ? current.map((item) => item.id === editingDrylandId ? exercise : item) : [...current, exercise]);
    setDrylandDraft(emptyDrylandDraft);
    setEditingDrylandId(null);
    setError('');
  };

  const editDryland = (exercise: DrylandExercise) => {
    setEditingDrylandId(exercise.id);
    setDrylandDraft({
      movementName: exercise.movementName,
      sets: exercise.sets,
      reps: exercise.reps,
      duration: exercise.duration,
      rest: exercise.rest,
      target: exercise.target || 'Kuvvet',
      description: exercise.description,
    });
  };

  const upsertSet = () => {
    const set = makeSet(draft, editingId ?? `set-${Date.now()}`);
    if (!set.repeat || !set.distance || !set.stroke || !set.interval.trim()) {
      setError('Havuz antrenmanı için set sayısı, mesafe, stil ve çıkış aralığı zorunludur.');
      return;
    }
    setSets((current) => (editingId ? current.map((item) => (item.id === editingId ? set : item)) : [...current, set]));
    setDraft(emptyDraft);
    setEditingId(null);
    setShowSetForm(false);
    setError('');
  };

  const editSet = (set: TrainingSet) => {
    setEditingId(set.id);
    setDraft({
      section: set.section,
      repeat: String(set.repeat),
      distance: String(set.distance),
      stroke: set.stroke,
      drillDescription: set.drillDescription,
      interval: set.interval,
      equipment: set.equipment,
      note: set.note,
    });
    setShowSetForm(true);
  };

  const create = () => {
    if (!title.trim() || !date.trim()) {
      setError('Plan adı ve tarih zorunludur.');
      return;
    }
    if (!sets.length && !drylandExercises.length) {
      setError('En az bir havuz seti veya kara egzersizi eklemelisiniz.');
      return;
    }
    const assignedAthletes = athleteName.trim() ? [{ athleteId: `athlete-${athleteName.trim().toLowerCase().replace(/\s+/g, '-')}`, name: athleteName.trim(), group: assignedGroups[0] }] : [];
    const plan = saveTrainingPlan({
      title: title.trim(),
      date: date.trim(),
      day: inferDayLabel(date),
      time: '',
      group: assignedGroups[0] ?? 'Performans',
      assignedGroups,
      athleteName: athleteName.trim(),
      type: target,
      pool,
      totalMeters: `${summary.totalMeters}m`,
      duration: duration.trim() || '-',
      difficulty: 1,
      coachNote,
      sections: makeSectionsFromSets(sets, coachNote),
      sets,
      totalSetCount: summary.totalSetCount,
      sprintMeters: summary.sprintMeters,
      techniqueMeters: summary.techniqueMeters,
      enduranceMeters: summary.enduranceMeters,
      assignedAthletes,
      drylandExercises,
    });
    onCreate(plan);
  };

  return (
    <GlassCard style={styles.formCard}>
      <Text style={styles.cardTitle}>Yeni Antrenman Planı</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Plan adı" placeholderTextColor={colors.muted} style={styles.input} />
      <View style={styles.inputRow}>
        <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <CalendarDays color={colors.cyan} size={18} />
          <Text style={styles.dateButtonText}>{date || 'Tarih seç'}</Text>
        </Pressable>
        <TextInput value={duration} onChangeText={setDuration} placeholder="Süre" placeholderTextColor={colors.muted} style={styles.input} />
      </View>
      {showDatePicker ? (
        <DateTimePicker
          value={parseDateInput(date)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      ) : null}
      <TextInput value={athleteName} onChangeText={setAthleteName} placeholder="Sporcu seçimi / adı" placeholderTextColor={colors.muted} style={styles.input} />
      <Text style={styles.smallLabel}>Grup seçimi</Text>
      <MultiChipGroup options={groupOptions} values={assignedGroups} onChange={setAssignedGroups} />
      <Text style={styles.smallLabel}>Hedef</Text>
      <ChipGroup options={targets} value={target} onChange={(value) => setTarget(value as TrainingType)} />

      <View style={styles.totalBox}>
        <View>
          <Text style={styles.totalLabel}>Havuz</Text>
          <Text style={styles.totalValue}>{summary.totalMeters}m</Text>
        </View>
        <View>
          <Text style={styles.totalLabel}>Kara</Text>
          <Text style={styles.totalValue}>{drylandExercises.length} egzersiz</Text>
        </View>
      </View>

      <View style={styles.trainingSectionBlock}>
        <Text style={styles.sectionTitle}>Havuz Antrenmanı</Text>
        <Text style={styles.planMeta}>Set sayısı, mesafe, stil ve çıkış aralığı bu bölümde zorunludur.</Text>
        <Text style={styles.smallLabel}>Havuz tipi</Text>
        <ChipGroup options={['25m', '50m']} value={pool} onChange={(value) => setPool(value as '25m' | '50m')} />
        <Pressable style={styles.setToggle} onPress={() => setShowSetForm((value) => !value)}>
          <Plus color={colors.cyan} size={18} />
          <Text style={styles.setToggleText}>{showSetForm ? 'Set formunu kapat' : '+ Set Ekle'}</Text>
        </Pressable>
        {showSetForm ? <SetDraftForm draft={draft} onChange={setDraft} onSubmit={upsertSet} editing={Boolean(editingId)} /> : null}
        {sets.map((set) => <SetCard key={set.id} set={set} onEdit={() => editSet(set)} onDelete={() => setSets((current) => current.filter((item) => item.id !== set.id))} />)}
      </View>

      <View style={styles.trainingSectionBlock}>
        <Text style={styles.sectionTitle}>Kara Antrenmanı</Text>
        <Text style={styles.planMeta}>Hareket adı, set, tekrar veya süre, dinlenme ve hedef bu bölümde zorunludur. Havuz seti olmadan da plan kaydedilebilir.</Text>
        <DrylandDraftForm draft={drylandDraft} onChange={setDrylandDraft} onSubmit={upsertDryland} editing={Boolean(editingDrylandId)} />
        {drylandExercises.map((exercise) => (
          <DrylandCard
            key={exercise.id}
            exercise={exercise}
            onEdit={() => editDryland(exercise)}
            onDelete={() => setDrylandExercises((current) => current.filter((item) => item.id !== exercise.id))}
          />
        ))}
      </View>
      <SectionInput label="Antrenör notu" value={coachNote} onChange={setCoachNote} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <AppButton title="Planı Kaydet" icon={Plus} onPress={create} />
    </GlassCard>
  );
}

function TrainingPlanCard({ plan, expanded, canEdit, isAthlete, onToggle, onRefresh, onMessage, onRepeat }: { plan: TrainingPlan; expanded: boolean; canEdit: boolean; isAthlete: boolean; onToggle: () => void; onRefresh: () => void; onMessage: (message: string) => void; onRepeat: (draft: TrainingPlanInput) => void }) {
  const safePlan = normalizeTrainingPlan(plan);
  const summary = getPlanSummary(safePlan);
  const safeAssignedAthletes = safePlan.assignedAthletes ?? [];
  const safeAssignedGroups = safePlan.assignedGroups ?? [];
  const safeSets = safePlan.sets ?? [];
  const safeDrylandExercises = safePlan.drylandExercises ?? [];
  const groupLabel = safePlan.athleteName || safeAssignedGroups.join(', ') || 'Tüm kulüp';
  const poolMetersLabel = safePlan.totalMeters || '0m';
  const drylandCountLabel = `${safeDrylandExercises.length} egzersiz`;
  const athleteId = safeAssignedAthletes[0]?.athleteId ?? 'a1';
  const athleteStatus = safePlan.statusByAthlete?.[athleteId]?.status ?? 'planned';

  const complete = () => {
    updateAthleteTrainingStatus(safePlan.planId, athleteId, 'completed', { difficulty: 1, feeling: 'Tamamlandı', note: '' });
    onRefresh();
    onMessage('Antrenman tamamlandı olarak işaretlendi.');
  };

  const saveSets = (sets: TrainingSet[]) => {
    updateTrainingPlanSets(plan.planId, sets);
    onRefresh();
    onMessage('Setler güncellendi.');
  };

  return (
    <Pressable style={styles.planCard} onPress={onToggle}>
      <View style={styles.planHeader}>
        <View style={styles.planIcon}>
          <Dumbbell color={colors.cyan} size={22} />
        </View>
        <View style={styles.planBody}>
          <Text style={styles.planTitle}>{safePlan.title}</Text>
          <Text style={styles.planMeta}>{safePlan.date || '-'} • {groupLabel}</Text>
          <Text style={styles.planMeta}>Havuz: {poolMetersLabel} • Kara: {drylandCountLabel} • Toplam süre: {safePlan.duration || '-'}</Text>
        </View>
        <StatusPill status={canEdit ? summary.completed === summary.total && summary.total > 0 ? 'completed' : 'planned' : athleteStatus} />
      </View>

      {expanded ? (
        <View style={styles.detail}>
          {safeSets.length ? (
            <View style={styles.trainingSectionBlock}>
              <Text style={styles.cardTitle}>Havuz Antrenmanı</Text>
              <Text style={styles.planMeta}>Havuz: {poolMetersLabel}</Text>
              {safeSets.map((set) => <SetReadOnly key={set.id} set={set} />)}
            </View>
          ) : null}
          {safeDrylandExercises.length ? (
            <View style={styles.trainingSectionBlock}>
              <Text style={styles.cardTitle}>Kara Antrenmanı</Text>
              <Text style={styles.planMeta}>Kara: {drylandCountLabel}</Text>
              {safeDrylandExercises.map((exercise) => <DrylandReadOnly key={exercise.id} exercise={exercise} />)}
            </View>
          ) : null}
          {!safeSets.length && !safeDrylandExercises.length ? <Text style={styles.planMeta}>Bu planda havuz seti veya kara egzersizi yok.</Text> : null}
          {isAthlete ? <AppButton title="Tamamlandı İşaretle" icon={CheckCircle2} onPress={complete} /> : null}
          {canEdit ? (
            <PlanManagePanel
              plan={safePlan}
              onSaveSets={saveSets}
              onRefresh={onRefresh}
              onMessage={onMessage}
              onRepeat={onRepeat}
            />
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

function PlanManagePanel({ plan, onSaveSets, onRefresh, onMessage, onRepeat }: { plan: TrainingPlan; onSaveSets: (sets: TrainingSet[]) => void; onRefresh: () => void; onMessage: (message: string) => void; onRepeat: (draft: TrainingPlanInput) => void }) {
  const safePlan = normalizeTrainingPlan(plan);
  const [editableSets, setEditableSets] = useState(safePlan.sets);
  const [draft, setDraft] = useState<DraftSet>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  const upsertSet = () => {
    const set = makeSet(draft, editingId ?? `set-${Date.now()}`);
    setEditableSets((current) => (editingId ? current.map((item) => (item.id === editingId ? set : item)) : [...current, set]));
    setDraft(emptyDraft);
    setEditingId(null);
  };

  return (
    <View style={styles.feedbackBox}>
      <Text style={styles.cardTitle}>Plan Aksiyonları</Text>
      <SetDraftForm draft={draft} onChange={setDraft} onSubmit={upsertSet} editing={Boolean(editingId)} />
      {editableSets.map((set) => (
        <SetCard
          key={set.id}
          set={set}
          onEdit={() => {
            setEditingId(set.id);
            setDraft({
              section: set.section,
              repeat: String(set.repeat),
              distance: String(set.distance),
              stroke: set.stroke,
              drillDescription: set.drillDescription,
              interval: set.interval,
              equipment: set.equipment,
              note: set.note,
            });
          }}
          onDelete={() => setEditableSets((current) => current.filter((item) => item.id !== set.id))}
        />
      ))}
      <View style={styles.pdfRow}>
        <AppButton title="Setleri Kaydet" variant="secondary" onPress={() => onSaveSets(editableSets)} />
        <AppButton title="Antrenmanı Tekrarla" icon={RotateCcw} variant="secondary" onPress={() => onRepeat({ ...safePlan, date: '', day: '', time: '' })} />
        <AppButton title="Planı Sil" icon={Trash2} variant="secondary" onPress={() => { deleteTrainingPlan(safePlan.planId); onRefresh(); onMessage('Plan silindi.'); }} />
        <AppButton title="İptal Et" icon={XCircle} variant="secondary" onPress={() => { cancelTrainingPlan(safePlan.planId); onRefresh(); onMessage('Antrenman iptal edildi.'); }} />
      </View>
    </View>
  );
}

function SetDraftForm({ draft, onChange, onSubmit, editing }: { draft: DraftSet; onChange: (draft: DraftSet) => void; onSubmit: () => void; editing: boolean }) {
  const update = (patch: Partial<DraftSet>) => onChange({ ...draft, ...patch });
  return (
    <View style={styles.setForm}>
      <Text style={styles.cardTitle}>Set Oluştur</Text>
      <Text style={styles.smallLabel}>Bölüm tipi</Text>
      <ChipGroup options={setSections} value={draft.section} onChange={(value) => update({ section: value as TrainingSection })} />
      <View style={styles.inputRow}>
        <TextInput value={draft.repeat} onChangeText={(value) => update({ repeat: value.replace(/\D/g, '') })} placeholder="Set sayısı" placeholderTextColor={colors.muted} keyboardType="number-pad" style={styles.input} />
        <TextInput value={draft.distance} onChangeText={(value) => update({ distance: value.replace(/\D/g, '') })} placeholder="Mesafe" placeholderTextColor={colors.muted} keyboardType="number-pad" style={styles.input} />
      </View>
      <Text style={styles.smallLabel}>Stil</Text>
      <ChipGroup options={strokes} value={draft.stroke} onChange={(value) => update({ stroke: value })} />
      <SectionInput label="Drill / Açıklama" value={draft.drillDescription} onChange={(value) => update({ drillDescription: value })} />
      <TextInput value={draft.interval} onChangeText={(value) => update({ interval: value })} placeholder="Çıkış aralığı / dinlenme" placeholderTextColor={colors.muted} style={styles.input} />
      <TextInput value={draft.equipment} onChangeText={(value) => update({ equipment: value })} placeholder="Ekipman" placeholderTextColor={colors.muted} style={styles.input} />
      <TextInput value={draft.note} onChangeText={(value) => update({ note: value })} placeholder="Not" placeholderTextColor={colors.muted} style={styles.input} />
      <Pressable style={styles.addSetButton} onPress={onSubmit}>
        <Plus color={colors.background} size={18} />
        <Text style={styles.addSetText}>{editing ? 'Seti Güncelle' : 'Set Ekle'}</Text>
      </Pressable>
    </View>
  );
}

function DrylandDraftForm({ draft, onChange, onSubmit, editing }: { draft: DraftDryland; onChange: (draft: DraftDryland) => void; onSubmit: () => void; editing: boolean }) {
  const update = (patch: Partial<DraftDryland>) => onChange({ ...draft, ...patch });
  return (
    <View style={styles.setForm}>
      <Text style={styles.cardTitle}>Kara Antrenmanı</Text>
      <TextInput value={draft.movementName} onChangeText={(value) => update({ movementName: value })} placeholder="Hareket adı" placeholderTextColor={colors.muted} style={styles.input} />
      <View style={styles.inputRow}>
        <TextInput value={draft.sets} onChangeText={(value) => update({ sets: value.replace(/\D/g, '') })} placeholder="Set" placeholderTextColor={colors.muted} keyboardType="number-pad" style={styles.input} />
        <TextInput value={draft.reps} onChangeText={(value) => update({ reps: value.replace(/\D/g, '') })} placeholder="Tekrar" placeholderTextColor={colors.muted} keyboardType="number-pad" style={styles.input} />
      </View>
      <View style={styles.inputRow}>
        <TextInput value={draft.duration} onChangeText={(value) => update({ duration: value })} placeholder="Süre" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput value={draft.rest} onChangeText={(value) => update({ rest: value })} placeholder="Dinlenme" placeholderTextColor={colors.muted} style={styles.input} />
      </View>
      <Text style={styles.smallLabel}>Hedef</Text>
      <ChipGroup options={drylandTargets} value={draft.target} onChange={(value) => update({ target: value })} />
      <SectionInput label="Açıklama" value={draft.description} onChange={(value) => update({ description: value })} />
      <Pressable style={styles.addSetButton} onPress={onSubmit}>
        <Plus color={colors.background} size={18} />
        <Text style={styles.addSetText}>{editing ? 'Egzersizi Güncelle' : 'Kara Egzersizi Ekle'}</Text>
      </Pressable>
    </View>
  );
}

function DrylandCard({ exercise, onEdit, onDelete }: { exercise: DrylandExercise; onEdit: () => void; onDelete: () => void }) {
  return (
    <View style={styles.setCard}>
      <DrylandReadOnly exercise={exercise} />
      <View style={styles.setActions}>
        <Pressable style={styles.iconAction} onPress={onEdit}>
          <Edit3 color={colors.cyan} size={15} />
          <Text style={styles.iconActionText}>Düzenle</Text>
        </Pressable>
        <Pressable style={[styles.iconAction, styles.deleteAction]} onPress={onDelete}>
          <Trash2 color={colors.danger} size={15} />
          <Text style={styles.deleteText}>Sil</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DrylandReadOnly({ exercise }: { exercise: DrylandExercise }) {
  return (
    <View style={styles.setReadOnly}>
      <Text style={styles.setTitle}>{exercise.movementName}</Text>
      <Text style={styles.setMeta}>Set: {exercise.sets || '-'} • Tekrar: {exercise.reps || '-'} • Süre: {exercise.duration || '-'}</Text>
      {exercise.target ? <Text style={styles.setMeta}>Hedef: {exercise.target}</Text> : null}
      {exercise.rest ? <Text style={styles.setMeta}>Dinlenme: {exercise.rest}</Text> : null}
      {exercise.description ? <Text style={styles.setMeta}>Açıklama: {exercise.description}</Text> : null}
    </View>
  );
}

function SetCard({ set, onEdit, onDelete }: { set: TrainingSet; onEdit: () => void; onDelete: () => void }) {
  return (
    <View style={styles.setCard}>
      <SetReadOnly set={set} />
      <View style={styles.setActions}>
        <Pressable style={styles.iconAction} onPress={onEdit}>
          <Edit3 color={colors.cyan} size={15} />
          <Text style={styles.iconActionText}>Düzenle</Text>
        </Pressable>
        <Pressable style={[styles.iconAction, styles.deleteAction]} onPress={onDelete}>
          <Trash2 color={colors.danger} size={15} />
          <Text style={styles.deleteText}>Sil</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SetReadOnly({ set }: { set: TrainingSet }) {
  return (
    <View style={styles.setReadOnly}>
      <Text style={styles.setTitle}>{set.repeat} x {set.distance}m {set.stroke}</Text>
      <Text style={styles.setMeta}>Bölüm: {set.section}</Text>
      {set.drillDescription ? <Text style={styles.setMeta}>Drill: {set.drillDescription}</Text> : null}
      {set.interval ? <Text style={styles.setMeta}>Çıkış: {set.interval}</Text> : null}
      {set.equipment ? <Text style={styles.setMeta}>Ekipman: {set.equipment}</Text> : null}
      {set.note ? <Text style={styles.setMeta}>Not: {set.note}</Text> : null}
      <Text style={styles.setMeters}>{set.calculatedMeters}m</Text>
    </View>
  );
}

function SectionInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.sectionInput}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholder={label} placeholderTextColor={colors.muted} multiline={true} style={[styles.input, styles.textArea]} />
    </View>
  );
}

function StatusPill({ status }: { status: TrainingStatus }) {
  const done = status === 'completed';
  return (
    <View style={[styles.statusPill, done && styles.statusDone]}>
      <Text style={styles.statusText}>{statusLabel(status)}</Text>
    </View>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function ChipGroup({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((option) => (
        <Pressable key={option} style={[styles.chip, value === option && styles.chipActive]} onPress={() => onChange(option)}>
          <Text style={[styles.chipText, value === option && styles.chipTextActive]}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function MultiChipGroup({ options, values, onChange }: { options: readonly TrainingGroup[]; values: TrainingGroup[]; onChange: (value: TrainingGroup[]) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const active = values.includes(option);
        return (
          <Pressable
            key={option}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => {
              const next = active ? values.filter((item) => item !== option) : [...values, option];
              onChange(next.length ? next : [option]);
            }}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function makeSet(draft: DraftSet, id: string): TrainingSet {
  const repeat = Number(draft.repeat) || 0;
  const distance = Number(draft.distance) || 0;
  return {
    id,
    section: draft.section,
    repeat,
    distance,
    stroke: draft.stroke || 'Serbest',
    drillDescription: draft.drillDescription.trim(),
    interval: draft.interval.trim(),
    intensity: draft.section,
    equipment: draft.equipment.trim(),
    note: draft.note.trim(),
    calculatedMeters: repeat * distance,
  };
}

function numericMeters(value: string) {
  return Number(value.replace(/\D/g, '')) || 0;
}

function inferDayLabel(date: string) {
  return date.trim() || 'Plan';
}

function formatDateInput(date: Date) {
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function parseDateInput(value: string) {
  const parts = value.split('.');
  const parsed = parts.length === 3 ? new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.lg },
  header: { gap: spacing.sm },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 22, fontWeight: '700' },
  message: { color: colors.cyan, fontWeight: '900', backgroundColor: colors.cyanSoft, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.md },
  topActions: { gap: spacing.sm },
  createToggle: { minHeight: 50, borderRadius: 18, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  createText: { color: colors.background, fontWeight: '900', fontSize: 16 },
  formCard: { gap: spacing.md },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  input: { flex: 1, minHeight: 46, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '800' },
  dateButton: { flex: 1, minHeight: 46, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dateButtonText: { color: colors.text, fontWeight: '900' },
  textArea: { minHeight: 76, textAlignVertical: 'top', paddingTop: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  smallLabel: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 19 },
  trainingSectionBlock: { borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, padding: spacing.md, gap: spacing.sm },
  totalBox: { borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: colors.mutedStrong, fontWeight: '900' },
  totalValue: { color: colors.cyan, fontWeight: '900', fontSize: 24 },
  setToggle: { minHeight: 44, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  setToggleText: { color: colors.cyan, fontWeight: '900' },
  setForm: { borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: spacing.sm },
  addSetButton: { minHeight: 46, borderRadius: 16, backgroundColor: colors.coral, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  addSetText: { color: colors.background, fontWeight: '900' },
  errorText: { color: colors.danger, fontWeight: '900' },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summaryCard: { minWidth: '30%', flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.md },
  summaryValue: { color: colors.text, fontWeight: '900', fontSize: 18 },
  summaryLabel: { color: colors.mutedStrong, fontWeight: '800', marginTop: 2, fontSize: 12 },
  pdfRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  planCard: { borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: spacing.md },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  planIcon: { width: 46, height: 46, borderRadius: 18, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  planBody: { flex: 1, gap: 3 },
  planTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  planMeta: { color: colors.muted, fontWeight: '800', lineHeight: 19 },
  statusPill: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  statusDone: { backgroundColor: colors.successSoft, borderColor: 'rgba(34, 197, 94, 0.45)' },
  statusText: { color: colors.text, fontWeight: '900', fontSize: 11 },
  detail: { gap: spacing.md },
  drylandList: { gap: spacing.sm },
  setCard: { borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, padding: spacing.md, gap: spacing.sm },
  setReadOnly: { gap: 4 },
  setTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  setMeta: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 19 },
  setMeters: { color: colors.cyan, fontWeight: '900', marginTop: 2 },
  setActions: { flexDirection: 'row', gap: spacing.sm },
  iconAction: { borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.sm, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  deleteAction: { backgroundColor: colors.dangerSoft, borderColor: 'rgba(251, 113, 133, 0.42)' },
  iconActionText: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  deleteText: { color: colors.danger, fontWeight: '900', fontSize: 12 },
  sectionInput: { gap: spacing.sm },
  sectionLabel: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  feedbackBox: { borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, padding: spacing.md, gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: colors.glass },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  chipText: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  chipTextActive: { color: colors.background },
});
