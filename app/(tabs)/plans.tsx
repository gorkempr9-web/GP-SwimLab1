import { CheckCircle2, Clock3, Dumbbell, FileText, Plus, XCircle } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import { SetBuilder } from '@/components/training/SetBuilder';
import { useLocale } from '@/locales';
import { canManageClub, useSession } from '@/services/session';
import {
  cancelTrainingPlan,
  createTrainingPlan,
  generateTrainingPlanPdf,
  formatTrainingSet,
  getPlanSummary,
  getTrainingPlans,
  statusLabel,
  summarizeTrainingSets,
  TrainingGroup,
  TrainingPlan,
  TrainingSection,
  TrainingStatus,
  TrainingSet,
  TrainingType,
  updateAthleteTrainingStatus,
  updateCoachNote,
  weekDays,
} from '@/services/trainingPlans';
import { colors, spacing, typography } from '@/theme/tokens';

const groups: TrainingGroup[] = ['Tüm kulüp', 'Performans grubu', 'Küçük yaş grubu', 'Yarış takımı', 'Belirli sporcular'];
const types: TrainingType[] = ['Teknik', 'Sprint', 'Dayanıklılık', 'Yarış Pace', 'Recovery', 'Kara Antrenmanı', 'Mobilite'];
const statuses: TrainingStatus[] = ['planned', 'in_progress', 'completed', 'missed', 'cancelled'];
const trainingSections: TrainingSection[] = ['Isınma', 'Drill', 'Ana Set', 'Sprint Seti', 'Teknik Odak', 'Kara Antrenmanı', 'Soğuma'];

export default function PlansScreen() {
  const { t } = useLocale();
  const { currentUser } = useSession();
  const canEdit = canManageClub(currentUser.role);
  const isAthlete = currentUser.role === 'athlete';
  const isParent = currentUser.role === 'parent';
  const [plans, setPlans] = useState(() => getTrainingPlans());
  const [expandedId, setExpandedId] = useState<string | null>(plans[0]?.planId ?? null);
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState('');

  const plansByDay = useMemo(() => weekDays.map((day) => ({ day, plans: plans.filter((plan) => plan.day === day) })), [plans]);

  const refresh = () => setPlans([...getTrainingPlans()]);

  const handlePdf = async () => {
    const report = await generateTrainingPlanPdf();
    setMessage(report.message);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Antrenman Planları</Text>
            <Text style={styles.subtitle}>{isAthlete ? 'Sana atanmış haftalık planlar.' : isParent ? 'Sporcunun haftalık antrenman planı.' : 'Plan oluştur, ata ve tamamlanma durumunu takip et.'}</Text>
          </View>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {canEdit ? (
          <>
            <Pressable style={styles.createToggle} onPress={() => setShowCreate((value) => !value)}>
              <Plus color={colors.background} size={20} />
              <Text style={styles.createText}>{t('newTrainingPlan')}</Text>
            </Pressable>
            {showCreate ? <CreatePlanForm onCreate={() => { refresh(); setShowCreate(false); setMessage('Antrenman planı oluşturuldu.'); }} /> : null}
          </>
        ) : null}

        <View style={styles.summaryRow}>
          <SummaryCard label="Haftalık Plan" value={String(plans.length)} />
          <SummaryCard label="Bugün" value={plans[0] ? statusLabel(plans[0].statusByAthlete.a1?.status ?? 'planned') : '-'} />
          <SummaryCard label="PDF" value="Hazır" />
        </View>

        <View style={styles.pdfRow}>
          <AppButton title={t('trainingPlanPdf')} icon={FileText} variant="secondary" onPress={handlePdf} />
          <AppButton title="Haftalık Plan PDF" icon={FileText} variant="secondary" onPress={handlePdf} />
        </View>

        <Text style={styles.sectionTitle}>{t('weeklyPlan')}</Text>
        {plansByDay.map(({ day, plans: dayPlans }) => (
          <GlassCard key={day} style={styles.dayCard}>
            <Text style={styles.dayTitle}>{day}</Text>
            {dayPlans.length ? (
              dayPlans.map((plan) => (
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
              ))
            ) : (
              <Text style={styles.emptyText}>Planlı antrenman yok.</Text>
            )}
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function CreatePlanForm({ onCreate }: { onCreate: () => void }) {
  const [title, setTitle] = useState('Yeni Sprint Seti');
  const [date, setDate] = useState('24.05.2026');
  const [day, setDay] = useState('Pazar');
  const [time, setTime] = useState('18:00');
  const [group, setGroup] = useState<TrainingGroup>('Performans grubu');
  const [type, setType] = useState<TrainingType>('Sprint');
  const [pool, setPool] = useState<'25m' | '50m'>('50m');
  const [difficulty, setDifficulty] = useState('8');
  const [coachNote, setCoachNote] = useState('Split takibi yapılacak.');
  const [sets, setSets] = useState<TrainingSet[]>([]);
  const setSummary = summarizeTrainingSets(sets);

  const updateSectionSets = (section: TrainingSection, nextSets: TrainingSet[]) => {
    setSets((current) => [...current.filter((set) => set.section !== section), ...nextSets]);
  };

  const getSectionSets = (section: TrainingSection) => sets.filter((set) => set.section === section);

  const sectionText = (section: TrainingSection) => {
    const text = getSectionSets(section).map(formatTrainingSet).join('\n');
    return text || '-';
  };

  const create = () => {
    createTrainingPlan({
      title,
      date,
      day,
      time,
      group,
      type,
      pool,
      totalMeters: `${setSummary.totalMeters}m`,
      duration: setSummary.estimatedDuration,
      difficulty: Number(difficulty) || 1,
      sections: {
        warmup: sectionText('Isınma'),
        mainSet: sectionText('Ana Set'),
        drills: sectionText('Drill'),
        sprint: sectionText('Sprint Seti'),
        techniqueFocus: sectionText('Teknik Odak'),
        dryland: sectionText('Kara Antrenmanı'),
        cooldown: sectionText('Soğuma'),
        coachNote,
      },
      sets,
      totalSetCount: setSummary.totalSetCount,
      sprintMeters: setSummary.sprintMeters,
      techniqueMeters: setSummary.techniqueMeters,
      enduranceMeters: setSummary.enduranceMeters,
    });
    onCreate();
  };

  return (
    <GlassCard style={styles.formCard}>
      <Text style={styles.cardTitle}>Yeni Antrenman Planı</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Antrenman başlığı" placeholderTextColor={colors.muted} style={styles.input} />
      <View style={styles.inputRow}>
        <TextInput value={date} onChangeText={setDate} placeholder="Tarih" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput value={time} onChangeText={setTime} placeholder="Saat" placeholderTextColor={colors.muted} style={styles.input} />
      </View>
      <ChipGroup options={weekDays} value={day} onChange={setDay} />
      <ChipGroup options={groups} value={group} onChange={(value) => setGroup(value as TrainingGroup)} />
      <ChipGroup options={types} value={type} onChange={(value) => setType(value as TrainingType)} />
      <ChipGroup options={['25m', '50m']} value={pool} onChange={(value) => setPool(value as '25m' | '50m')} />
      <View style={styles.inputRow}>
        <TextInput value={difficulty} onChangeText={(value) => setDifficulty(value.replace(/\D/g, '').slice(0, 2))} placeholder="Zorluk 1-10" placeholderTextColor={colors.muted} keyboardType="number-pad" style={styles.input} />
      </View>
      <View style={styles.setSummary}>
        <SummaryCard label="Toplam Metre" value={`${setSummary.totalMeters}m`} />
        <SummaryCard label="Set" value={String(setSummary.totalSetCount)} />
        <SummaryCard label="Sprint" value={`${setSummary.sprintMeters}m`} />
        <SummaryCard label="Teknik" value={`${setSummary.techniqueMeters}m`} />
        <SummaryCard label="Dayanıklılık" value={`${setSummary.enduranceMeters}m`} />
        <SummaryCard label="Süre" value={setSummary.estimatedDuration} />
      </View>
      {trainingSections.map((section) => (
        <SetBuilder key={section} section={section} sets={getSectionSets(section)} onChange={(nextSets) => updateSectionSets(section, nextSets)} />
      ))}
      <SectionInput label="Antrenör Notu" value={coachNote} onChange={setCoachNote} />
      <AppButton title="Planı Kaydet" icon={Plus} onPress={create} />
    </GlassCard>
  );
}

function TrainingPlanCard({ plan, expanded, canEdit, isAthlete, isParent, onToggle, onRefresh, onMessage }: { plan: TrainingPlan; expanded: boolean; canEdit: boolean; isAthlete: boolean; isParent: boolean; onToggle: () => void; onRefresh: () => void; onMessage: (message: string) => void }) {
  const summary = getPlanSummary(plan);
  const athleteStatus = plan.statusByAthlete.a1?.status ?? 'planned';
  const [feedbackDifficulty, setFeedbackDifficulty] = useState('7');
  const [feeling, setFeeling] = useState('');
  const [note, setNote] = useState('');
  const [coachNote, setCoachNote] = useState('');

  const complete = () => {
    updateAthleteTrainingStatus(plan.planId, 'a1', 'completed', { difficulty: Number(feedbackDifficulty) || 1, feeling, note });
    onRefresh();
    onMessage('Antrenman tamamlandı olarak işaretlendi.');
  };

  const saveCoachNote = (athleteId: string) => {
    updateCoachNote(plan.planId, athleteId, coachNote);
    onRefresh();
    onMessage('Antrenör notu kaydedildi.');
  };

  return (
    <Pressable style={styles.planCard} onPress={onToggle}>
      <View style={styles.planHeader}>
        <View style={styles.planIcon}>
          <Dumbbell color={colors.cyan} size={22} />
        </View>
        <View style={styles.planBody}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planMeta}>{plan.time} • {plan.type} • {plan.group}</Text>
          <Text style={styles.planMeta}>{plan.totalMeters} • {plan.duration} • Zorluk {plan.difficulty}/10</Text>
        </View>
        <StatusPill status={canEdit ? summary.completed === summary.total ? 'completed' : 'planned' : athleteStatus} />
      </View>

      {expanded ? (
        <View style={styles.detail}>
          {plan.sets?.length ? trainingSections.map((section) => {
            const sectionSets = plan.sets.filter((set) => set.section === section);
            return sectionSets.length ? <ProgramSection key={section} title={section} body={sectionSets.map(formatTrainingSet).join('\n')} /> : null;
          }) : (
            <>
              <ProgramSection title="Isınma" body={plan.sections.warmup} />
              <ProgramSection title="Ana Set" body={plan.sections.mainSet} />
              <ProgramSection title="Drill" body={plan.sections.drills} />
              <ProgramSection title="Sprint Seti" body={plan.sections.sprint} />
              <ProgramSection title="Teknik Odak" body={plan.sections.techniqueFocus} />
              <ProgramSection title="Kara Antrenmanı" body={plan.sections.dryland} />
              <ProgramSection title="Soğuma" body={plan.sections.cooldown} />
            </>
          )}
          <ProgramSection title="Antrenör Notu" body={plan.sections.coachNote} />

          {isAthlete ? (
            <View style={styles.feedbackBox}>
              <Text style={styles.cardTitle}>Sporcu Geri Bildirimi</Text>
              <TextInput value={feedbackDifficulty} onChangeText={(value) => setFeedbackDifficulty(value.replace(/\D/g, '').slice(0, 2))} placeholder="Zorluk 1-10" placeholderTextColor={colors.muted} keyboardType="number-pad" style={styles.input} />
              <TextInput value={feeling} onChangeText={setFeeling} placeholder="Kendimi nasıl hissettim?" placeholderTextColor={colors.muted} style={styles.input} />
              <TextInput value={note} onChangeText={setNote} placeholder="Not" placeholderTextColor={colors.muted} multiline={true} style={[styles.input, styles.textArea]} />
              <AppButton title="Tamamladım" icon={CheckCircle2} onPress={complete} />
            </View>
          ) : null}

          {isParent ? <ReadonlyStatus plan={plan} /> : null}

          {canEdit ? (
            <View style={styles.feedbackBox}>
              <Text style={styles.cardTitle}>Tamamlandı Takibi</Text>
              <View style={styles.summaryRow}>
                <SummaryCard label="Toplam" value={String(summary.total)} />
                <SummaryCard label="Tamamlayan" value={String(summary.completed)} />
                <SummaryCard label="Tamamlamayan" value={String(summary.notCompleted)} />
                <SummaryCard label="Ort. Zorluk" value={String(summary.averageDifficulty || '-')} />
              </View>
              {plan.assignedAthletes.map((athlete) => {
                const status = plan.statusByAthlete[athlete.athleteId]?.status ?? 'planned';
                const feedback = plan.feedbackByAthlete[athlete.athleteId];
                return (
                  <View key={athlete.athleteId} style={styles.athleteRow}>
                    <View style={styles.athleteCopy}>
                      <Text style={styles.athleteName}>{athlete.name}</Text>
                      <Text style={styles.planMeta}>{statusLabel(status)}{feedback ? ` • Zorluk ${feedback.difficulty}/10 • ${feedback.feeling}` : ''}</Text>
                    </View>
                    <ChipGroup options={statuses.map(statusLabel)} value={statusLabel(status)} onChange={(label) => {
                      const next = statuses.find((item) => statusLabel(item) === label) ?? 'planned';
                      updateAthleteTrainingStatus(plan.planId, athlete.athleteId, next);
                      onRefresh();
                    }} />
                    <TextInput value={coachNote} onChangeText={setCoachNote} placeholder="Antrenör notu" placeholderTextColor={colors.muted} style={styles.input} />
                    <AppButton title="Not Kaydet" variant="secondary" onPress={() => saveCoachNote(athlete.athleteId)} />
                  </View>
                );
              })}
              <View style={styles.pdfRow}>
                <AppButton title="Düzenle" variant="secondary" onPress={() => onMessage('Düzenleme akışı mock olarak hazır.')} />
                <AppButton title="İptal Et" icon={XCircle} variant="secondary" onPress={() => { cancelTrainingPlan(plan.planId); onRefresh(); onMessage('Antrenman iptal edildi.'); }} />
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

function ReadonlyStatus({ plan }: { plan: TrainingPlan }) {
  return (
    <View style={styles.feedbackBox}>
      <Text style={styles.cardTitle}>Tamamlanma Durumu</Text>
      {plan.assignedAthletes.slice(0, 3).map((athlete) => (
        <Text key={athlete.athleteId} style={styles.planMeta}>{athlete.name}: {statusLabel(plan.statusByAthlete[athlete.athleteId]?.status ?? 'planned')}</Text>
      ))}
    </View>
  );
}

function ProgramSection({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.sectionBox}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
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
  inputRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  input: { flex: 1, minWidth: 120, color: colors.text, backgroundColor: colors.surfaceSolid, borderRadius: 14, borderWidth: 1, borderColor: colors.border, minHeight: 46, paddingHorizontal: spacing.md, fontWeight: '800' },
  textArea: { minHeight: 78, paddingTop: spacing.md, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: colors.glass },
  chipActive: { backgroundColor: colors.cyanSoft, borderColor: colors.borderStrong },
  chipText: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  chipTextActive: { color: colors.text },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summaryCard: { flex: 1, minWidth: 92, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.md },
  summaryValue: { color: colors.cyan, fontWeight: '900', fontSize: 18 },
  summaryLabel: { color: colors.muted, fontWeight: '800', marginTop: 3, fontSize: 12 },
  pdfRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  setSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  dayCard: { gap: spacing.md },
  dayTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  emptyText: { color: colors.muted, fontWeight: '800' },
  planCard: { borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, padding: spacing.md, gap: spacing.md },
  planHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  planIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  planBody: { flex: 1 },
  planTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  planMeta: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4, lineHeight: 18 },
  statusPill: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, paddingVertical: 7 },
  statusDone: { backgroundColor: 'rgba(52, 211, 153, 0.12)', borderColor: 'rgba(52, 211, 153, 0.36)' },
  statusText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  detail: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, gap: spacing.md },
  sectionBox: { borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.md },
  sectionInput: { gap: spacing.sm },
  sectionLabel: { color: colors.cyan, fontWeight: '900', marginBottom: 4 },
  sectionBody: { color: colors.mutedStrong, fontWeight: '700', lineHeight: 20 },
  feedbackBox: { borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.md },
  athleteRow: { gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  athleteCopy: { gap: 2 },
  athleteName: { color: colors.text, fontWeight: '900' },
});
