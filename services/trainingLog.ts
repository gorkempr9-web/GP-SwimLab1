import { readClubCollection, writeClubDocument } from '@/services/firestoreData';
import { getClubStorageKey, getLocalData, saveLocalData } from '@/services/localStore';
import { normalizeTrainingPlan, repeatTrainingPlan, TrainingPlan, TrainingPlanInput } from '@/services/trainingPlans';

export type TrainingLogEntry = {
  id: string;
  planId: string;
  date: string;
  title: string;
  target: string;
  pool: string;
  groupLabel: string;
  totalMeters: string;
  duration: string;
  setCount: number;
  coachNote: string;
  styles: string[];
  plan: TrainingPlan;
};

const legacyStorageKey = 'gp-swimlab-training-log';
const storageKey = () => getClubStorageKey('trainingLog');
let trainingLog: TrainingLogEntry[] = [];

export async function hydrateTrainingLogFromStorage() {
  const legacyLog = await getLocalData<Array<Partial<TrainingLogEntry> & Record<string, unknown>>>(legacyStorageKey, []);
  const storedLog = await readClubCollection<Partial<TrainingLogEntry> & Record<string, unknown>>('trainingLog', legacyLog);
  trainingLog = storedLog.map(normalizeTrainingLogEntry);
  void saveLocalData(storageKey(), trainingLog);
  return trainingLog;
}

export function getTrainingLog() {
  return trainingLog;
}

export function addPlanToTrainingLog(plan: TrainingPlan) {
  const safePlan = normalizeTrainingPlan(plan);
  const entry: TrainingLogEntry = {
    id: `tl-${Date.now()}`,
    planId: safePlan.planId,
    date: safePlan.date,
    title: safePlan.title,
    target: safePlan.type,
    pool: safePlan.pool,
    groupLabel: safePlan.athleteName || (safePlan.assignedGroups ?? []).join(', ') || safePlan.group || 'Tüm kulüp',
    totalMeters: safePlan.totalMeters,
    duration: safePlan.duration,
    setCount: (safePlan.sets ?? []).length,
    coachNote: safePlan.coachNote,
    styles: Array.from(new Set((safePlan.sets ?? []).map((set) => set.stroke))),
    plan: safePlan,
  };
  trainingLog = [entry, ...trainingLog.filter((item) => item.planId !== plan.planId)];
  void saveLocalData(storageKey(), trainingLog);
  void writeClubDocument('trainingLog', entry.id, entry as unknown as Record<string, unknown>);
  return entry;
}

function normalizeTrainingLogEntry(input: Partial<TrainingLogEntry> & Record<string, unknown>): TrainingLogEntry {
  const plan = normalizeTrainingPlan(isRecord(input.plan) ? input.plan as Partial<TrainingPlan> & Record<string, unknown> : {});
  const styles = Array.isArray(input.styles) ? input.styles.filter((item): item is string => typeof item === 'string') : Array.from(new Set((plan.sets ?? []).map((set) => set.stroke)));
  return {
    id: typeof input.id === 'string' && input.id ? input.id : `tl-${Date.now()}`,
    planId: typeof input.planId === 'string' && input.planId ? input.planId : plan.planId,
    date: typeof input.date === 'string' ? input.date : plan.date,
    title: typeof input.title === 'string' && input.title ? input.title : plan.title,
    target: typeof input.target === 'string' ? input.target : plan.type,
    pool: typeof input.pool === 'string' ? input.pool : plan.pool,
    groupLabel: typeof input.groupLabel === 'string' && input.groupLabel ? input.groupLabel : plan.athleteName || (plan.assignedGroups ?? []).join(', ') || 'Tüm kulüp',
    totalMeters: typeof input.totalMeters === 'string' ? input.totalMeters : plan.totalMeters,
    duration: typeof input.duration === 'string' ? input.duration : plan.duration,
    setCount: typeof input.setCount === 'number' ? input.setCount : (plan.sets ?? []).length,
    coachNote: typeof input.coachNote === 'string' ? input.coachNote : plan.coachNote,
    styles,
    plan,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function repeatTrainingLogEntry(entryId: string): TrainingPlanInput | null {
  const entry = trainingLog.find((item) => item.id === entryId);
  return entry ? repeatTrainingPlan(entry.plan) : null;
}
