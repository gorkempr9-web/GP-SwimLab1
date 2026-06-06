export type TrainingStatus = 'planned' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
export type TrainingType = 'Teknik' | 'Dayanıklılık' | 'Hız' | 'Yarış' | 'Toparlanma';
export type TrainingGroup = 'Tüm kulüp' | 'Performans grubu' | 'Küçük yaş grubu' | 'Yarış takımı' | 'Belirli sporcular';
export type TrainingSection = 'Isınma' | 'Ana Set' | 'Teknik' | 'Sprint' | 'Ayak' | 'Soğuma' | 'Kara Antrenmanı';

export type TrainingSet = {
  id: string;
  section: TrainingSection;
  repeat: number;
  distance: number;
  stroke: string;
  drillDescription: string;
  interval: string;
  intensity: string;
  equipment: string;
  note: string;
  calculatedMeters: number;
};

export type TrainingPlan = {
  planId: string;
  title: string;
  date: string;
  day: string;
  time: string;
  group: TrainingGroup;
  type: TrainingType;
  pool: '25m' | '50m';
  totalMeters: string;
  duration: string;
  difficulty: number;
  sections: {
    warmup: string;
    mainSet: string;
    drills: string;
    sprint: string;
    techniqueFocus: string;
    dryland: string;
    cooldown: string;
    coachNote: string;
  };
  sets: TrainingSet[];
  totalSetCount: number;
  sprintMeters: number;
  techniqueMeters: number;
  enduranceMeters: number;
  assignedAthletes: Array<{ athleteId: string; name: string; group: string }>;
  statusByAthlete: Record<string, { status: TrainingStatus; completedAt?: string }>;
  feedbackByAthlete: Record<string, { difficulty: number; feeling: string; note: string }>;
  coachNotesByAthlete: Record<string, string>;
};

export const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const defaultAthletes: Array<{ athleteId: string; name: string; group: string }> = [];
const storageKey = 'gp-swimlab-training-plans';

let trainingPlans: TrainingPlan[] = [];

function persistTrainingPlans() {
  void saveLocalData(storageKey, trainingPlans);
}

export async function hydrateTrainingPlansFromStorage() {
  trainingPlans = await getLocalData<TrainingPlan[]>(storageKey, []);
  return trainingPlans;
}

export function getTrainingPlans() {
  return trainingPlans;
}

export function createTrainingPlan(input: Omit<TrainingPlan, 'planId' | 'assignedAthletes' | 'statusByAthlete' | 'feedbackByAthlete' | 'coachNotesByAthlete'>) {
  const assignedAthletes = input.group === 'Küçük yaş grubu' ? defaultAthletes.filter((athlete) => athlete.group === 'Küçük yaş grubu') : input.group === 'Belirli sporcular' ? defaultAthletes.slice(0, 1) : defaultAthletes;
  const statusByAthlete = assignedAthletes.reduce<TrainingPlan['statusByAthlete']>((acc, athlete) => {
    acc[athlete.athleteId] = { status: 'planned' };
    return acc;
  }, {});
  const plan: TrainingPlan = {
    ...input,
    planId: `tp-${Date.now()}`,
    assignedAthletes,
    statusByAthlete,
    feedbackByAthlete: {},
    coachNotesByAthlete: {},
  };
  trainingPlans = [plan, ...trainingPlans];
  persistTrainingPlans();
  return plan;
}

export function updateTrainingPlanSets(planId: string, sets: TrainingSet[]) {
  const summary = summarizeTrainingSets(sets);
  trainingPlans = trainingPlans.map((plan) => {
    if (plan.planId !== planId) return plan;
    return {
      ...plan,
      sets,
      totalMeters: `${summary.totalMeters}m`,
      totalSetCount: summary.totalSetCount,
      sprintMeters: summary.sprintMeters,
      techniqueMeters: summary.techniqueMeters,
      enduranceMeters: summary.enduranceMeters,
      sections: makeSectionsFromSets(sets, plan.sections.coachNote),
    };
  });
  persistTrainingPlans();
}

export function summarizeTrainingSets(sets: TrainingSet[]) {
  const totalMeters = sets.reduce((sum, set) => sum + set.calculatedMeters, 0);
  const sprintMeters = sets.filter((set) => set.section === 'Sprint').reduce((sum, set) => sum + set.calculatedMeters, 0);
  const techniqueMeters = sets.filter((set) => set.section === 'Teknik' || set.stroke.includes('Drill')).reduce((sum, set) => sum + set.calculatedMeters, 0);
  const enduranceMeters = Math.max(totalMeters - sprintMeters - techniqueMeters, 0);
  const estimatedDuration = `${Math.max(35, Math.round(totalMeters / 55))} dk`;
  return { totalMeters, totalSetCount: sets.length, sprintMeters, techniqueMeters, enduranceMeters, estimatedDuration };
}

export function formatTrainingSet(set: TrainingSet) {
  const interval = set.interval ? `\nÇıkış: ${set.interval}` : '';
  const drill = set.drillDescription ? `\nDrill: ${set.drillDescription}` : '';
  const equipment = set.equipment ? `\nEkipman: ${set.equipment}` : '';
  const note = set.note ? `\nNot: ${set.note}` : '';
  return `${set.repeat} x ${set.distance}m ${set.stroke}${drill}${interval}${equipment}${note}`;
}

export function makeSectionsFromSets(sets: TrainingSet[], coachNote = ''): TrainingPlan['sections'] {
  const bySection = (section: TrainingSection) => sets.filter((set) => set.section === section).map(formatTrainingSet).join('\n\n');
  return {
    warmup: bySection('Isınma'),
    mainSet: bySection('Ana Set'),
    drills: bySection('Teknik'),
    sprint: bySection('Sprint'),
    techniqueFocus: bySection('Ayak'),
    dryland: bySection('Kara Antrenmanı'),
    cooldown: bySection('Soğuma'),
    coachNote,
  };
}

export function updateAthleteTrainingStatus(planId: string, athleteId: string, status: TrainingStatus, feedback?: { difficulty: number; feeling: string; note: string }) {
  const completedAt = status === 'completed' ? new Date().toISOString() : undefined;
  trainingPlans = trainingPlans.map((plan) => {
    if (plan.planId !== planId) return plan;
    return {
      ...plan,
      statusByAthlete: { ...plan.statusByAthlete, [athleteId]: { status, completedAt } },
      feedbackByAthlete: feedback ? { ...plan.feedbackByAthlete, [athleteId]: feedback } : plan.feedbackByAthlete,
    };
  });
  persistTrainingPlans();
}

export function updateCoachNote(planId: string, athleteId: string, note: string) {
  trainingPlans = trainingPlans.map((plan) => (plan.planId === planId ? { ...plan, coachNotesByAthlete: { ...plan.coachNotesByAthlete, [athleteId]: note } } : plan));
  persistTrainingPlans();
}

export function cancelTrainingPlan(planId: string) {
  trainingPlans = trainingPlans.map((plan) => ({
    ...plan,
    statusByAthlete: plan.planId === planId
      ? Object.fromEntries(Object.entries(plan.statusByAthlete).map(([athleteId, value]) => [athleteId, { ...value, status: 'cancelled' as TrainingStatus }]))
      : plan.statusByAthlete,
  }));
  persistTrainingPlans();
}

export function getPlanSummary(plan: TrainingPlan) {
  const statuses = Object.values(plan.statusByAthlete);
  const completed = statuses.filter((item) => item.status === 'completed').length;
  const missed = statuses.filter((item) => item.status === 'missed').length;
  const feedbacks = Object.values(plan.feedbackByAthlete);
  const averageDifficulty = feedbacks.length ? Math.round((feedbacks.reduce((sum, item) => sum + item.difficulty, 0) / feedbacks.length) * 10) / 10 : 0;
  return {
    total: plan.assignedAthletes.length,
    completed,
    notCompleted: plan.assignedAthletes.length - completed,
    missed,
    averageDifficulty,
  };
}

export function getTrainingDashboardSummary(role: string) {
  const today = trainingPlans[0];
  if (!today) return role === 'coach' || role === 'club_admin' ? 'Plan yok' : 'Plan atanmadı';
  const summary = getPlanSummary(today);
  if (role === 'coach') return `${summary.completed}/${summary.total} tamamladı`;
  if (role === 'club_admin') return `${trainingPlans.length} plan`;
  if (role === 'parent') return statusLabel(today.statusByAthlete.a1?.status ?? 'planned');
  return statusLabel(today.statusByAthlete.a1?.status ?? 'planned');
}

export function statusLabel(status: TrainingStatus) {
  const labels: Record<TrainingStatus, string> = {
    planned: 'Planlandı',
    in_progress: 'Devam Ediyor',
    completed: 'Tamamlandı',
    missed: 'Yapılmadı',
    cancelled: 'İptal',
  };
  return labels[status];
}

export async function generateTrainingPlanPdf() {
  return {
    success: true,
    message: 'Antrenman planı PDF olarak hazırlandı',
    rows: trainingPlans,
  };
}
import { getLocalData, saveLocalData } from '@/services/localStore';
