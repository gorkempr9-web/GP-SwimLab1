import { deleteClubDocument, readClubCollection, writeClubDocument } from '@/services/firestoreData';
import { getClubStorageKey, getLocalData, saveLocalData } from '@/services/localStore';

export type TrainingStatus = 'planned' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
export type TrainingType = string;
export type TrainingGroup = string;
export type TrainingSection = string;
export type PoolType = '25m' | '50m';

export type AssignedAthlete = {
  athleteId: string;
  name: string;
  group: string;
};

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

export type DrylandExercise = {
  id: string;
  movementName: string;
  sets: string;
  reps: string;
  duration: string;
  rest: string;
  target?: string;
  description: string;
};

export type TrainingPlan = {
  planId: string;
  title: string;
  date: string;
  day: string;
  time: string;
  group: TrainingGroup;
  groups?: TrainingGroup[];
  assignedGroups: TrainingGroup[];
  athleteName: string;
  type: TrainingType;
  pool: PoolType;
  totalMeters: string;
  duration: string;
  difficulty: number;
  coachNote: string;
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
  drylandExercises?: DrylandExercise[];
  totalSetCount: number;
  sprintMeters: number;
  techniqueMeters: number;
  enduranceMeters: number;
  assignedAthletes: AssignedAthlete[];
  statusByAthlete: Record<string, { status: TrainingStatus; completedAt?: string }>;
  feedbackByAthlete: Record<string, { difficulty: number; feeling: string; note: string }>;
  coachNotesByAthlete: Record<string, string>;
  equipment?: string[];
  completedBy?: string[];
  tags?: string[];
  styles?: string[];
  strokes?: string[];
  setTypes?: string[];
};

export type TrainingPlanInput = Omit<TrainingPlan, 'planId' | 'statusByAthlete' | 'feedbackByAthlete' | 'coachNotesByAthlete'>;

export const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const legacyStorageKey = 'gp-swimlab-training-plans';
const storageKey = () => getClubStorageKey('trainingPlans');

let trainingPlans: TrainingPlan[] = [];

function persistTrainingPlans() {
  void saveLocalData(storageKey(), trainingPlans);
}

export async function hydrateTrainingPlansFromStorage() {
  const legacyPlans = await getLocalData<Array<Partial<TrainingPlan> & Record<string, unknown>>>(legacyStorageKey, []);
  const storedPlans = await readClubCollection<Partial<TrainingPlan> & Record<string, unknown>>('trainingPlans', legacyPlans);
  trainingPlans = storedPlans.map(normalizeTrainingPlan);
  persistTrainingPlans();
  return trainingPlans;
}

export function getTrainingPlans() {
  trainingPlans = trainingPlans.map(normalizeTrainingPlan);
  return trainingPlans;
}

export function saveTrainingPlan(input: TrainingPlanInput) {
  const plan = normalizeTrainingPlan({
    ...input,
    planId: `tp-${Date.now()}`,
    statusByAthlete: makeStatusMap(input.assignedAthletes ?? []),
    feedbackByAthlete: {},
    coachNotesByAthlete: {},
  });
  trainingPlans = [plan, ...trainingPlans];
  persistTrainingPlans();
  void writeClubDocument('trainingPlans', plan.planId, plan as unknown as Record<string, unknown>);
  return plan;
}

export const createTrainingPlan = saveTrainingPlan;

export function updateTrainingPlan(planId: string, patch: Partial<TrainingPlanInput>) {
  let updated: TrainingPlan | null = null;
  trainingPlans = trainingPlans.map((plan) => {
    if (plan.planId !== planId) return plan;
    updated = normalizeTrainingPlan({ ...plan, ...patch });
    return updated;
  });
  persistTrainingPlans();
  if (updated !== null) {
    const syncedPlan = updated as TrainingPlan;
    void writeClubDocument('trainingPlans', syncedPlan.planId, syncedPlan as unknown as Record<string, unknown>);
  }
  return updated;
}

export function deleteTrainingPlan(planId: string) {
  trainingPlans = trainingPlans.filter((plan) => plan.planId !== planId);
  persistTrainingPlans();
  void deleteClubDocument('trainingPlans', planId);
}

export function assignTrainingPlan(planId: string, assignedAthletes: AssignedAthlete[], assignedGroups: TrainingGroup[]) {
  return updateTrainingPlan(planId, {
    assignedAthletes: assignedAthletes ?? [],
    assignedGroups: assignedGroups ?? [],
    group: assignedGroups?.[0] ?? 'T?m kul?p',
  });
}

export function updateTrainingPlanSets(planId: string, sets: TrainingSet[]) {
  const safeSets = normalizeTrainingSets(sets);
  const summary = summarizeTrainingSets(safeSets);
  return updateTrainingPlan(planId, {
    sets: safeSets,
    totalMeters: `${summary.totalMeters}m`,
    totalSetCount: summary.totalSetCount,
    sprintMeters: summary.sprintMeters,
    techniqueMeters: summary.techniqueMeters,
    enduranceMeters: summary.enduranceMeters,
  });
}

export function completeTrainingPlan(planId: string, athleteId: string, feedback?: { difficulty: number; feeling: string; note: string }) {
  updateAthleteTrainingStatus(planId, athleteId, 'completed', feedback);
}

export function updateAthleteTrainingStatus(planId: string, athleteId: string, status: TrainingStatus, feedback?: { difficulty: number; feeling: string; note: string }) {
  const completedAt = status === 'completed' ? new Date().toISOString() : undefined;
  trainingPlans = trainingPlans.map((rawPlan) => {
    const plan = normalizeTrainingPlan(rawPlan);
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
  trainingPlans = trainingPlans.map((rawPlan) => {
    const plan = normalizeTrainingPlan(rawPlan);
    return plan.planId === planId ? { ...plan, coachNotesByAthlete: { ...plan.coachNotesByAthlete, [athleteId]: note } } : plan;
  });
  persistTrainingPlans();
}

export function cancelTrainingPlan(planId: string) {
  trainingPlans = trainingPlans.map((rawPlan) => {
    const plan = normalizeTrainingPlan(rawPlan);
    if (plan.planId !== planId) return plan;
    return {
      ...plan,
      statusByAthlete: Object.fromEntries(Object.entries(plan.statusByAthlete).map(([athleteId, value]) => [athleteId, { ...value, status: 'cancelled' as TrainingStatus }])),
    };
  });
  persistTrainingPlans();
}

export function repeatTrainingPlan(plan: TrainingPlan): TrainingPlanInput {
  const normalizedPlan = normalizeTrainingPlan(plan);
  const summary = summarizeTrainingSets(normalizedPlan.sets);
  return {
    ...normalizedPlan,
    title: `${normalizedPlan.title} - Tekrar`,
    date: '',
    day: '',
    time: '',
    totalMeters: `${summary.totalMeters}m`,
    sets: normalizedPlan.sets.map((set) => ({ ...set, id: `set-${Date.now()}-${set.id}` })),
    sections: makeSectionsFromSets(normalizedPlan.sets, normalizedPlan.coachNote),
    totalSetCount: summary.totalSetCount,
    sprintMeters: summary.sprintMeters,
    techniqueMeters: summary.techniqueMeters,
    enduranceMeters: summary.enduranceMeters,
  };
}

export function summarizeTrainingSets(sets: TrainingSet[] = []) {
  const safeSets = normalizeTrainingSets(sets);
  const totalMeters = safeSets.reduce((sum, set) => sum + set.calculatedMeters, 0);
  const sprintMeters = safeSets.filter((set) => set.section === 'Sprint').reduce((sum, set) => sum + set.calculatedMeters, 0);
  const techniqueMeters = safeSets.filter((set) => set.section === 'Teknik' || set.stroke === 'Drill').reduce((sum, set) => sum + set.calculatedMeters, 0);
  const enduranceMeters = Math.max(totalMeters - sprintMeters - techniqueMeters, 0);
  const estimatedDuration = `${Math.max(35, Math.round(totalMeters / 55))} dk`;
  return { totalMeters, totalSetCount: safeSets.length, sprintMeters, techniqueMeters, enduranceMeters, estimatedDuration };
}

export function formatTrainingSet(set: TrainingSet) {
  const safeSet = normalizeTrainingSet(set);
  const section = `Bölüm: ${safeSet.section}`;
  const drill = safeSet.drillDescription ? `\nDrill: ${safeSet.drillDescription}` : '';
  const interval = safeSet.interval ? `\nÇıkış: ${safeSet.interval}` : '';
  const equipment = safeSet.equipment ? `\nEkipman: ${safeSet.equipment}` : '';
  const note = safeSet.note ? `\nNot: ${safeSet.note}` : '';
  return `${safeSet.repeat} x ${safeSet.distance}m ${safeSet.stroke}\n${section}${drill}${interval}${equipment}${note}`;
}

export function makeSectionsFromSets(sets: TrainingSet[] = [], coachNote = ''): TrainingPlan['sections'] {
  const safeSets = normalizeTrainingSets(sets);
  const bySection = (section: TrainingSection) => safeSets.filter((set) => set.section === section).map(formatTrainingSet).join('\n\n');
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

export function getPlanSummary(plan: TrainingPlan) {
  const normalizedPlan = normalizeTrainingPlan(plan);
  const statuses = Object.values(normalizedPlan.statusByAthlete);
  const completed = statuses.filter((item) => item.status === 'completed').length;
  const missed = statuses.filter((item) => item.status === 'missed').length;
  const feedbacks = Object.values(normalizedPlan.feedbackByAthlete);
  const averageDifficulty = feedbacks.length ? Math.round((feedbacks.reduce((sum, item) => sum + item.difficulty, 0) / feedbacks.length) * 10) / 10 : 0;
  return {
    total: normalizedPlan.assignedAthletes.length,
    completed,
    notCompleted: Math.max(normalizedPlan.assignedAthletes.length - completed, 0),
    missed,
    averageDifficulty,
  };
}

export function getTrainingDashboardSummary(role: string) {
  const today = trainingPlans[0] ? normalizeTrainingPlan(trainingPlans[0]) : null;
  if (!today) return role === 'coach' || role === 'club_admin' ? 'Plan yok' : 'Plan atanmadı';
  const summary = getPlanSummary(today);
  if (role === 'coach') return `${summary.completed}/${summary.total} tamamladı`;
  if (role === 'club_admin') return `${trainingPlans.length} plan`;
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
    rows: getTrainingPlans(),
  };
}

export function normalizeTrainingPlan(input: Partial<TrainingPlan> & Record<string, unknown>): TrainingPlan {
  const rawSets = Array.isArray(input.sets) ? input.sets : [];
  const sets = normalizeTrainingSets(rawSets as TrainingSet[]);
  const drylandExercises = normalizeDrylandExercises(Array.isArray(input.drylandExercises) ? input.drylandExercises as Partial<DrylandExercise>[] : []);
  const assignedAthletes = Array.isArray(input.assignedAthletes) ? (input.assignedAthletes as AssignedAthlete[]).map(normalizeAssignedAthlete) : [];
  const groups = arrayOfStrings(input.groups);
  const assignedGroups = arrayOfStrings(input.assignedGroups).length
    ? arrayOfStrings(input.assignedGroups)
    : groups.length
      ? groups
      : [typeof input.group === 'string' && input.group ? input.group : 'Tüm kulüp'];
  const summary = summarizeTrainingSets(sets);
  const statusByAthlete = isRecord(input.statusByAthlete) ? input.statusByAthlete as TrainingPlan['statusByAthlete'] : {};
  const coachNote = typeof input.coachNote === 'string' ? input.coachNote : getSectionCoachNote(input.sections);
  return {
    planId: typeof input.planId === 'string' && input.planId ? input.planId : `tp-${Date.now()}`,
    title: typeof input.title === 'string' && input.title ? input.title : 'Antrenman Planı',
    date: typeof input.date === 'string' ? input.date : '',
    day: typeof input.day === 'string' ? input.day : '',
    time: typeof input.time === 'string' ? input.time : '',
    group: assignedGroups[0] ?? 'T?m kul?p',
    groups,
    assignedGroups,
    athleteName: typeof input.athleteName === 'string' ? input.athleteName : '',
    type: typeof input.type === 'string' ? input.type : 'Teknik',
    pool: input.pool === '25m' || input.pool === '50m' ? input.pool : '50m',
    totalMeters: `${summary.totalMeters}m`,
    duration: typeof input.duration === 'string' && input.duration ? input.duration : '-',
    difficulty: typeof input.difficulty === 'number' ? input.difficulty : 1,
    coachNote,
    sections: makeSectionsFromSets(sets, coachNote),
    sets,
    drylandExercises,
    totalSetCount: summary.totalSetCount,
    sprintMeters: summary.sprintMeters,
    techniqueMeters: summary.techniqueMeters,
    enduranceMeters: summary.enduranceMeters,
    assignedAthletes,
    statusByAthlete: Object.keys(statusByAthlete).length ? statusByAthlete : makeStatusMap(assignedAthletes),
    feedbackByAthlete: isRecord(input.feedbackByAthlete) ? input.feedbackByAthlete as TrainingPlan['feedbackByAthlete'] : {},
    coachNotesByAthlete: isRecord(input.coachNotesByAthlete) ? input.coachNotesByAthlete as TrainingPlan['coachNotesByAthlete'] : {},
    equipment: arrayOfStrings(input.equipment),
    completedBy: arrayOfStrings(input.completedBy),
    tags: arrayOfStrings(input.tags),
    styles: arrayOfStrings(input.styles),
    strokes: arrayOfStrings(input.strokes),
    setTypes: arrayOfStrings(input.setTypes),
  };
}

function makeStatusMap(assignedAthletes: AssignedAthlete[] = []) {
  return assignedAthletes.reduce<TrainingPlan['statusByAthlete']>((acc, athlete) => {
    acc[athlete.athleteId] = { status: 'planned' };
    return acc;
  }, {});
}

function normalizeTrainingSets(sets: Array<Partial<TrainingSet>> = []) {
  return Array.isArray(sets) ? sets.map(normalizeTrainingSet) : [];
}

function normalizeTrainingSet(set: Partial<TrainingSet>): TrainingSet {
  const repeat = typeof set.repeat === 'number' ? set.repeat : Number(set.repeat) || 0;
  const distance = typeof set.distance === 'number' ? set.distance : Number(set.distance) || 0;
  return {
    id: typeof set.id === 'string' && set.id ? set.id : `set-${Date.now()}`,
    section: typeof set.section === 'string' && set.section ? set.section : 'Ana Set',
    repeat,
    distance,
    stroke: typeof set.stroke === 'string' && set.stroke ? set.stroke : 'Serbest',
    drillDescription: typeof set.drillDescription === 'string' ? set.drillDescription : '',
    interval: typeof set.interval === 'string' ? set.interval : '',
    intensity: typeof set.intensity === 'string' ? set.intensity : '',
    equipment: typeof set.equipment === 'string' ? set.equipment : '',
    note: typeof set.note === 'string' ? set.note : '',
    calculatedMeters: typeof set.calculatedMeters === 'number' ? set.calculatedMeters : repeat * distance,
  };
}

function normalizeDrylandExercises(exercises: Array<Partial<DrylandExercise>> = []) {
  return Array.isArray(exercises) ? exercises.map(normalizeDrylandExercise) : [];
}

function normalizeDrylandExercise(exercise: Partial<DrylandExercise>): DrylandExercise {
  return {
    id: typeof exercise.id === 'string' && exercise.id ? exercise.id : `dry-${Date.now()}`,
    movementName: typeof exercise.movementName === 'string' ? exercise.movementName : '',
    sets: typeof exercise.sets === 'string' ? exercise.sets : '',
    reps: typeof exercise.reps === 'string' ? exercise.reps : '',
    duration: typeof exercise.duration === 'string' ? exercise.duration : '',
    rest: typeof exercise.rest === 'string' ? exercise.rest : '',
    target: typeof exercise.target === 'string' ? exercise.target : '',
    description: typeof exercise.description === 'string' ? exercise.description : '',
  };
}

function normalizeAssignedAthlete(value: Partial<AssignedAthlete>): AssignedAthlete {
  return {
    athleteId: typeof value.athleteId === 'string' && value.athleteId ? value.athleteId : `athlete-${Date.now()}`,
    name: typeof value.name === 'string' ? value.name : '-',
    group: typeof value.group === 'string' ? value.group : 'Tüm kulüp',
  };
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function getSectionCoachNote(value: unknown) {
  return isRecord(value) && typeof value.coachNote === 'string' ? value.coachNote : '';
}
