import { getLocalData, saveLocalData } from '@/services/localStore';

export type RaceResult = {
  id: string;
  athleteId: string;
  athleteName: string;
  competitionName: string;
  competitionType: string;
  location: string;
  date: string;
  poolType: '25m' | '50m';
  distance: string;
  stroke: string;
  officialTime: string;
  splits: string[];
  rank?: string;
  isPB: boolean;
  status: 'valid' | 'DQ' | 'DNS';
  coachNote?: string;
};

export type TrainingResult = {
  id: string;
  athleteId: string;
  athleteName: string;
  trainingDate: string;
  setName: string;
  distance: string;
  stroke: string;
  repeatCount: number;
  time: string;
  restInterval?: string;
  heartRate?: string;
  rpe?: string;
  note?: string;
  equipment?: string;
  coach?: string;
};

const raceResultsKey = 'gp-swimlab-race-results';
const trainingResultsKey = 'gp-swimlab-training-results';

let raceResults: RaceResult[] = [];
let trainingResults: TrainingResult[] = [];

export async function hydrateResults() {
  raceResults = await getLocalData<RaceResult[]>(raceResultsKey, []);
  trainingResults = await getLocalData<TrainingResult[]>(trainingResultsKey, []);
  return { raceResults, trainingResults };
}

export function getRaceResults() {
  return [...raceResults];
}

export function getTrainingResults() {
  return [...trainingResults];
}

export function addRaceResult(input: Omit<RaceResult, 'id' | 'isPB'>) {
  const isPB = checkRacePB(input.athleteId, input.stroke, input.distance, input.poolType, input.officialTime);
  const result: RaceResult = { ...input, id: `race-result-${Date.now()}`, isPB };
  raceResults = [result, ...raceResults];
  void saveLocalData(raceResultsKey, raceResults);
  return result;
}

export function addTrainingResult(input: Omit<TrainingResult, 'id'>) {
  const result: TrainingResult = { ...input, id: `training-result-${Date.now()}` };
  trainingResults = [result, ...trainingResults];
  void saveLocalData(trainingResultsKey, trainingResults);
  return result;
}

export function getOfficialPB(athleteId: string, stroke: string, distance: string, poolType: '25m' | '50m') {
  const matches = raceResults
    .filter((result) => result.status === 'valid' && result.athleteId === athleteId && result.stroke === stroke && result.distance === distance && result.poolType === poolType)
    .sort((a, b) => parseRaceTime(a.officialTime) - parseRaceTime(b.officialTime));
  return matches[0] ?? null;
}

export function checkRacePB(athleteId: string, stroke: string, distance: string, poolType: '25m' | '50m', time: string) {
  const currentPb = getOfficialPB(athleteId, stroke, distance, poolType);
  return !currentPb || parseRaceTime(time) < parseRaceTime(currentPb.officialTime);
}

export function getPerformanceData(filter: 'all' | 'race' | 'training') {
  if (filter === 'race') return { raceResults: getRaceResults(), trainingResults: [] };
  if (filter === 'training') return { raceResults: [], trainingResults: getTrainingResults() };
  return { raceResults: getRaceResults(), trainingResults: getTrainingResults() };
}

function parseRaceTime(value: string) {
  const clean = value.trim().replace(',', '.');
  const parts = clean.split(':').map(Number);
  if (parts.some((part) => Number.isNaN(part))) return Number.POSITIVE_INFINITY;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

// Firestore hazırlığı: users/{userId}/raceResults ve users/{userId}/trainingResults ayrı koleksiyonlar olarak saklanacak.
