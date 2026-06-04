import { CheckCircle2, Dumbbell, FileText, Plus, XCircle } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { useLocale } from '@/locales';
import { canManageClub, useSession } from '@/services/session';
import {
  cancelTrainingPlan,
  createTrainingPlan,
  generateTrainingPlanPdf,
  getPlanSummary,
  getTrainingPlans,
  hydrateTrainingPlansFromStorage,
  statusLabel,
  TrainingGroup,
  TrainingPlan,
  TrainingStatus,
  TrainingType,
  updateAthleteTrainingStatus,
  updateCoachNote,
  weekDays,
} from '@/services/trainingPlans';
import { colors, spacing, typography } from '@/theme/tokens';

const groups: TrainingGroup[] = ['Tüm kulüp', 'Performans grubu', 'Küçük yaş grubu', 'Yarış takımı', 'Belirli sporcular'];
const types: TrainingType[] = ['Teknik', 'Sprint', 'Dayanıklılık', 'Yarış Pace', 'Recovery', 'Kara Antrenmanı', 'Mobilite'];
const statuses: TrainingStatus[] = ['planned', 'in_progress', 'completed', 'missed', 'cancelled'];

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

  useEffect(() => {
    hydrateTrainingPlansFromStorage().then((storedPlans) => {
      setPlans([...storedPlans]);
      setExpandedId(storedPlans[0]?.planId ?? null);
    });
  }, []);

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

        <Text style={styles.demoInfo}>{t('demoDataLocalWarning')}</Text>
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

        {plans.length ? (
          <>
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
            {plansByDay.map(({ day, plans: dayPlans }) => dayPlans.length ? (
              <GlassCard key={day} style={styles.dayCard}>
                <Text style={styles.dayTitle}>{day}</Text>
                {dayPlans.map((plan) => (
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
              </GlassCard>
            ) : null)}
          </>
        ) : (
          <EmptyState title="Henüz antrenman planı yok" detail={canEdit ? 'İlk planı oluşturmak için Yeni Antrenman Planı butonunu kullan.' : 'Antrenör plan eklediğinde burada görünecek.'} icon={Dumbbell} tone={colors.coral} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CreatePlanForm({ onCreate }: { onCreate: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [group, setGroup] = useState<TrainingGroup>('Belirli sporcular');
  const [type, setType] = useState<TrainingType>('Teknik');
  const [pool, setPool] = useState<'25m' | '50m'>('50m');
  const [difficulty, setDifficulty] = useState('');
  const [mainSet, setMainSet] = useState('');
  const [techniqueNote, setTechniqueNote] = useState('');
  const [dryland, setDryland] = useState('');
  const [equipment, setEquipment] = useState('');
  const [coachNote, setCoachNote] = useState('');
  const [manualDrill, setManualDrill] = useState('');
  const [showManualDrill, setShowManualDrill] = useState(false);
  const [error, setError] = useState('');

  const create = () => {
    if (!title.trim() || !date.trim()) {
      setError('Plan adı ve tarih zorunludur.');
      return;
    }

    createTrainingPlan({
      title,
      date,
      day: day || 'Pazartesi',
      time,
      group,
      type,
      pool,
      totalMeters: '-',
      duration: duration || '-',
      difficulty: Number(difficulty) || 1,
      sections: {
        warmup: '',
        mainSet,
        drills: manualDrill,
        sprint: '',
        techniqueFocus: techniqueNote,
        dryland,
        cooldown: '',
        coachNote: `${coachNote}${equipment ? `\nEkipman: ${equipment}` : ''}`,
      },
      sets: [],
      totalSetCount: 0,
      sprintMeters: 0,
      techniqueMeters: 0,
      enduranceMeters: 0,
    });
    setError('');
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
      <View style={styles.inputRow}>
        <TextInput value={time} onChangeText={setTime} placeholder="Saat" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput value={difficulty} onChangeText={(value) => setDifficulty(value.replace(/\D/g, '').slice(0, 2))} placeholder="Zorluk 1-10" placeholderTextColor={colors.muted} keyboardType="number-pad" style={styles.input} />
      </View>
      <Text style={styles.smallLabel}>Gün</Text>
      <ChipGroup options={weekDays} value={day} onChange={setDay} />
      <Text style={styles.smallLabel}>Grup / sporcu seçimi</Text>
      <ChipGroup options={groups} value={group} onChange={(value) => setGroup(value as TrainingGroup)} />
      <Text style={styles.smallLabel}>Plan türü</Text>
      <ChipGroup options={types} value={type} onChange={(value) => setType(value as TrainingType)} />
      <Text style={styles.smallLabel}>Havuz</Text>
      <ChipGroup options={['25m', '50m']} value={pool} onChange={(value) => setPool(value as '25m' | '50m')} />
      <SectionInput label="Ana set" value={mainSet} onChange={setMainSet} />
      <SectionInput label="Teknik not" value={techniqueNote} onChange={setTechniqueNote} />
      <SectionInput label="Kara antrenmanı" value={dryland} onChange={setDryland} />
      <SectionInput label="Ekipman" value={equipment} onChange={setEquipment} />
      {showManualDrill ? <SectionInput label="Manuel Drill" value={manualDrill} onChange={setManualDrill} /> : null}
      <Pressable style={styles.secondaryButton} onPress={() => setShowManualDrill((value) => !value)}>
        <Text style={styles.secondaryText}>Manuel Drill Ekle</Text>
      </Pressable>
      <SectionInput label="Antrenör notu" value={coachNote} onChange={setCoachNote} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
          <Text style={styles.planMeta}>{plan.time || 'Saat yok'} • {plan.type} • {plan.group}</Text>
          <Text style={styles.planMeta}>{plan.totalMeters} • {plan.duration} • Zorluk {plan.difficulty}/10</Text>
        </View>
        <StatusPill status={canEdit ? summary.completed === summary.total && summary.total > 0 ? 'completed' : 'planned' : athleteStatus} />
      </View>

      {expanded ? (
        <View style={styles.detail}>
          <ProgramSection title="Ana Set" body={plan.sections.mainSet} />
          <ProgramSection title="Drill" body={plan.sections.drills} />
          <ProgramSection title="Teknik Not" body={plan.sections.techniqueFocus} />
          <ProgramSection title="Kara Antrenmanı" body={plan.sections.dryland} />
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
      <Text style={styles.sectionBody}>{body || 'Boş'}</Text>
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
  demoInfo: { color: colors.gold, fontWeight: '800', lineHeight: 19, fontSize: 12 },
  message: { color: colors.cyan, fontWeight: '900', backgroundColor: colors.cyanSoft, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.md },
  createToggle: { minHeight: 50, borderRadius: 18, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  createText: { color: colors.background, fontWeight: '900', fontSize: 16 },
  formCard: { gap: spacing.md },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  input: { minHeight: 46, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '800' },
  textArea: { minHeight: 84, textAlignVertical: 'top', paddingTop: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  smallLabel: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  secondaryButton: { minHeight: 44, borderRadius: 15, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: colors.cyan, fontWeight: '900' },
  errorText: { color: colors.danger, fontWeight: '900' },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summaryCard: { minWidth: '30%', flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.md },
  summaryValue: { color: colors.text, fontWeight: '900', fontSize: 18 },
  summaryLabel: { color: colors.mutedStrong, fontWeight: '800', marginTop: 2, fontSize: 12 },
  pdfRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 19 },
  dayCard: { gap: spacing.md },
  dayTitle: { color: colors.cyan, fontWeight: '900', fontSize: 18 },
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
  sectionBox: { borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, padding: spacing.md, gap: 4 },
  sectionInput: { gap: spacing.sm },
  sectionLabel: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  sectionBody: { color: colors.text, fontWeight: '800', lineHeight: 20 },
  feedbackBox: { borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, padding: spacing.md, gap: spacing.sm },
  athleteRow: { gap: spacing.sm, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.md },
  athleteCopy: { gap: 2 },
  athleteName: { color: colors.text, fontWeight: '900' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: colors.glass },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  chipText: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  chipTextActive: { color: colors.background },
});
