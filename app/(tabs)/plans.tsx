import { CheckCircle2, Dumbbell, Edit3, FileText, Plus, Trash2, XCircle } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { canManageClub, useSession } from '@/services/session';
import {
  cancelTrainingPlan,
  createTrainingPlan,
  generateTrainingPlanPdf,
  getPlanSummary,
  getTrainingPlans,
  hydrateTrainingPlansFromStorage,
  makeSectionsFromSets,
  statusLabel,
  summarizeTrainingSets,
  TrainingGroup,
  TrainingPlan,
  TrainingSection,
  TrainingSet,
  TrainingStatus,
  TrainingType,
  updateAthleteTrainingStatus,
  updateCoachNote,
  updateTrainingPlanSets,
} from '@/services/trainingPlans';
import { colors, spacing, typography } from '@/theme/tokens';

const groups: TrainingGroup[] = ['Tüm kulüp', 'Performans grubu', 'Küçük yaş grubu', 'Yarış takımı', 'Belirli sporcular'];
const targets: TrainingType[] = ['Teknik', 'Dayanıklılık', 'Hız', 'Yarış', 'Toparlanma'];
const setSections: TrainingSection[] = ['Isınma', 'Ana Set', 'Teknik', 'Sprint', 'Ayak', 'Soğuma', 'Kara Antrenmanı'];
const strokes = ['Serbest', 'Sırtüstü', 'Kurbağalama', 'Kelebek', 'Karışık', 'Ayak', 'Kol', 'Drill', 'Karışık Set'];

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

export default function PlansScreen() {
  const { currentUser } = useSession();
  const canEdit = canManageClub(currentUser.role);
  const isAthlete = currentUser.role === 'athlete';
  const isParent = currentUser.role === 'parent';
  const [plans, setPlans] = useState(() => getTrainingPlans());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    hydrateTrainingPlansFromStorage().then((storedPlans) => {
      setPlans([...storedPlans]);
      setExpandedId(storedPlans[0]?.planId ?? null);
    });
  }, []);

  const visiblePlans = useMemo(() => {
    if (isAthlete) {
      return plans.filter((plan) => !plan.assignedAthletes.length || plan.assignedAthletes.some((athlete) => athlete.athleteId === currentUser.id));
    }
    if (isParent) {
      return plans.filter((plan) => !plan.assignedAthletes.length || plan.assignedAthletes.some((athlete) => athlete.athleteId === currentUser.childAthleteId));
    }
    return plans;
  }, [currentUser.childAthleteId, currentUser.id, isAthlete, isParent, plans]);

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
          <Text style={styles.subtitle}>{canEdit ? 'Manuel set oluştur, sporcuya veya gruba ata.' : 'Sana atanmış planları ve set detaylarını takip et.'}</Text>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {canEdit ? (
          <>
            <Pressable style={styles.createToggle} onPress={() => setShowCreate((value) => !value)}>
              <Plus color={colors.background} size={20} />
              <Text style={styles.createText}>Yeni Antrenman Planı</Text>
            </Pressable>
            {showCreate ? (
              <CreatePlanForm
                onCreate={() => {
                  refresh();
                  setShowCreate(false);
                  setMessage('Antrenman planı oluşturuldu.');
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
                isParent={isParent}
                onToggle={() => setExpandedId(expandedId === plan.planId ? null : plan.planId)}
                onRefresh={refresh}
                onMessage={setMessage}
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

function CreatePlanForm({ onCreate }: { onCreate: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [group, setGroup] = useState<TrainingGroup>('Belirli sporcular');
  const [target, setTarget] = useState<TrainingType>('Teknik');
  const [pool, setPool] = useState<'25m' | '50m'>('50m');
  const [sets, setSets] = useState<TrainingSet[]>([]);
  const [coachNote, setCoachNote] = useState('');
  const [draft, setDraft] = useState<DraftSet>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const summary = useMemo(() => summarizeTrainingSets(sets), [sets]);

  const upsertSet = () => {
    const set = makeSet(draft, editingId ?? `set-${Date.now()}`);
    if (!set.repeat || !set.distance) {
      setError('Set sayısı ve mesafe zorunludur.');
      return;
    }
    setSets((current) => (editingId ? current.map((item) => (item.id === editingId ? set : item)) : [...current, set]));
    setDraft(emptyDraft);
    setEditingId(null);
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
  };

  const create = () => {
    if (!title.trim() || !date.trim()) {
      setError('Plan adı ve tarih zorunludur.');
      return;
    }
    if (!sets.length) {
      setError('En az bir set eklemelisin.');
      return;
    }

    createTrainingPlan({
      title: title.trim(),
      date: date.trim(),
      day: inferDayLabel(date),
      time: '',
      group,
      type: target,
      pool,
      totalMeters: `${summary.totalMeters}m`,
      duration: duration.trim() || '-',
      difficulty: 1,
      sections: makeSectionsFromSets(sets, coachNote),
      sets,
      totalSetCount: summary.totalSetCount,
      sprintMeters: summary.sprintMeters,
      techniqueMeters: summary.techniqueMeters,
      enduranceMeters: summary.enduranceMeters,
    });
    onCreate();
  };

  return (
    <GlassCard style={styles.formCard}>
      <Text style={styles.cardTitle}>Yeni Antrenman Planı</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Plan adı" placeholderTextColor={colors.muted} style={styles.input} />
      <View style={styles.inputRow}>
        <TextInput value={date} onChangeText={setDate} placeholder="Tarih" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput value={duration} onChangeText={setDuration} placeholder="Süre" placeholderTextColor={colors.muted} style={styles.input} />
      </View>
      <Text style={styles.smallLabel}>Grup / Sporcu seçimi</Text>
      <ChipGroup options={groups} value={group} onChange={(value) => setGroup(value as TrainingGroup)} />
      <Text style={styles.smallLabel}>Hedef</Text>
      <ChipGroup options={targets} value={target} onChange={(value) => setTarget(value as TrainingType)} />
      <Text style={styles.smallLabel}>Havuz tipi</Text>
      <ChipGroup options={['25m', '50m']} value={pool} onChange={(value) => setPool(value as '25m' | '50m')} />

      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Toplam</Text>
        <Text style={styles.totalValue}>{summary.totalMeters}m</Text>
      </View>

      <SetDraftForm draft={draft} onChange={setDraft} onSubmit={upsertSet} editing={Boolean(editingId)} />
      {sets.map((set) => <SetCard key={set.id} set={set} onEdit={() => editSet(set)} onDelete={() => setSets((current) => current.filter((item) => item.id !== set.id))} />)}
      <SectionInput label="Antrenör notu" value={coachNote} onChange={setCoachNote} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <AppButton title="Planı Kaydet" icon={Plus} onPress={create} />
    </GlassCard>
  );
}

function TrainingPlanCard({ plan, expanded, canEdit, isAthlete, isParent, onToggle, onRefresh, onMessage }: { plan: TrainingPlan; expanded: boolean; canEdit: boolean; isAthlete: boolean; isParent: boolean; onToggle: () => void; onRefresh: () => void; onMessage: (message: string) => void }) {
  const summary = getPlanSummary(plan);
  const athleteStatus = plan.statusByAthlete.a1?.status ?? 'planned';
  const [coachNote, setCoachNote] = useState('');
  const [editableSets, setEditableSets] = useState(plan.sets);
  const [draft, setDraft] = useState<DraftSet>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  const complete = () => {
    updateAthleteTrainingStatus(plan.planId, 'a1', 'completed', { difficulty: 1, feeling: 'Tamamlandı', note: '' });
    onRefresh();
    onMessage('Antrenman tamamlandı olarak işaretlendi.');
  };

  const saveCoachNote = (athleteId: string) => {
    updateCoachNote(plan.planId, athleteId, coachNote);
    onRefresh();
    onMessage('Antrenör notu kaydedildi.');
  };

  const saveSets = () => {
    updateTrainingPlanSets(plan.planId, editableSets);
    onRefresh();
    onMessage('Setler güncellendi.');
  };

  const upsertSet = () => {
    const set = makeSet(draft, editingId ?? `set-${Date.now()}`);
    setEditableSets((current) => (editingId ? current.map((item) => (item.id === editingId ? set : item)) : [...current, set]));
    setDraft(emptyDraft);
    setEditingId(null);
  };

  return (
    <Pressable style={styles.planCard} onPress={onToggle}>
      <View style={styles.planHeader}>
        <View style={styles.planIcon}>
          <Dumbbell color={colors.cyan} size={22} />
        </View>
        <View style={styles.planBody}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planMeta}>{plan.date} • {plan.group}</Text>
          <Text style={styles.planMeta}>{plan.totalMeters} • {plan.duration} • {plan.pool}</Text>
        </View>
        <StatusPill status={canEdit ? summary.completed === summary.total && summary.total > 0 ? 'completed' : 'planned' : athleteStatus} />
      </View>

      {expanded ? (
        <View style={styles.detail}>
          {plan.sets.length ? plan.sets.map((set) => <SetReadOnly key={set.id} set={set} />) : <Text style={styles.planMeta}>Bu planda set yok.</Text>}
          {isAthlete ? <AppButton title="Tamamlandı İşaretle" icon={CheckCircle2} onPress={complete} /> : null}
          {isParent ? <ReadonlyStatus plan={plan} /> : null}
          {canEdit ? (
            <View style={styles.feedbackBox}>
              <Text style={styles.cardTitle}>Setleri Düzenle</Text>
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
              <AppButton title="Setleri Kaydet" variant="secondary" onPress={saveSets} />
              <Text style={styles.cardTitle}>Tamamlandı Takibi</Text>
              <View style={styles.summaryRow}>
                <SummaryCard label="Toplam" value={String(summary.total)} />
                <SummaryCard label="Tamamlayan" value={String(summary.completed)} />
                <SummaryCard label="Tamamlamayan" value={String(summary.notCompleted)} />
              </View>
              {plan.assignedAthletes.map((athlete) => {
                const status = plan.statusByAthlete[athlete.athleteId]?.status ?? 'planned';
                return (
                  <View key={athlete.athleteId} style={styles.athleteRow}>
                    <Text style={styles.athleteName}>{athlete.name}</Text>
                    <Text style={styles.planMeta}>{statusLabel(status)}</Text>
                    <TextInput value={coachNote} onChangeText={setCoachNote} placeholder="Antrenör notu" placeholderTextColor={colors.muted} style={styles.input} />
                    <AppButton title="Not Kaydet" variant="secondary" onPress={() => saveCoachNote(athlete.athleteId)} />
                  </View>
                );
              })}
              <View style={styles.pdfRow}>
                <AppButton title="İptal Et" icon={XCircle} variant="secondary" onPress={() => { cancelTrainingPlan(plan.planId); onRefresh(); onMessage('Antrenman iptal edildi.'); }} />
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

function SetDraftForm({ draft, onChange, onSubmit, editing }: { draft: DraftSet; onChange: (draft: DraftSet) => void; onSubmit: () => void; editing: boolean }) {
  const update = (patch: Partial<DraftSet>) => onChange({ ...draft, ...patch });
  return (
    <View style={styles.setForm}>
      <Text style={styles.cardTitle}>Set Oluştur</Text>
      <Text style={styles.smallLabel}>Set tipi</Text>
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
        <Text style={styles.addSetText}>{editing ? 'Seti Güncelle' : '+ Set Ekle'}</Text>
      </Pressable>
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
      {set.drillDescription ? <Text style={styles.setMeta}>Drill: {set.drillDescription}</Text> : null}
      {set.interval ? <Text style={styles.setMeta}>Çıkış: {set.interval}</Text> : null}
      {set.equipment ? <Text style={styles.setMeta}>Ekipman: {set.equipment}</Text> : null}
      {set.note ? <Text style={styles.setMeta}>Not: {set.note}</Text> : null}
      <Text style={styles.setMeters}>{set.calculatedMeters}m</Text>
    </View>
  );
}

function ReadonlyStatus({ plan }: { plan: TrainingPlan }) {
  return (
    <View style={styles.feedbackBox}>
      <Text style={styles.cardTitle}>Tamamlanma Durumu</Text>
      {plan.assignedAthletes.length ? plan.assignedAthletes.slice(0, 3).map((athlete) => (
        <Text key={athlete.athleteId} style={styles.planMeta}>{athlete.name}: {statusLabel(plan.statusByAthlete[athlete.athleteId]?.status ?? 'planned')}</Text>
      )) : <Text style={styles.planMeta}>Atanmış sporcu bilgisi yok.</Text>}
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.lg },
  header: { gap: spacing.sm },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 22, fontWeight: '700' },
  message: { color: colors.cyan, fontWeight: '900', backgroundColor: colors.cyanSoft, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.md },
  createToggle: { minHeight: 50, borderRadius: 18, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  createText: { color: colors.background, fontWeight: '900', fontSize: 16 },
  formCard: { gap: spacing.md },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  input: { flex: 1, minHeight: 46, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '800' },
  textArea: { minHeight: 76, textAlignVertical: 'top', paddingTop: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  smallLabel: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 19 },
  totalBox: { borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: colors.mutedStrong, fontWeight: '900' },
  totalValue: { color: colors.cyan, fontWeight: '900', fontSize: 24 },
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
  athleteRow: { gap: spacing.sm, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.md },
  athleteName: { color: colors.text, fontWeight: '900' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: colors.glass },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  chipText: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  chipTextActive: { color: colors.background },
});
