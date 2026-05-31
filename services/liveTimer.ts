import { LiveRaceEntry, saveLiveRaceResult } from '@/services/clubCompetition';

export type SplitInterval = '25m' | '50m';
export type TimerSplit = {
  id: string;
  label: string;
  distance: number;
  time: string;
};

export function formatRaceTime(ms: number) {
  const safeMs = Math.max(0, ms);
  const totalCentiseconds = Math.floor(safeMs / 10);
  const minutes = Math.floor(totalCentiseconds / 6000);
  const seconds = Math.floor((totalCentiseconds % 6000) / 100);
  const centiseconds = totalCentiseconds % 100;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

export function calculateSplits(distance: string | number, poolType: '25m' | '50m', splitInterval: SplitInterval = '50m') {
  const raceDistance = Number(String(distance).replace(/\D/g, ''));
  const interval = poolType === '25m' && splitInterval === '25m' ? 25 : 50;
  if (!raceDistance || raceDistance <= interval) return [];

  const splitDistances: number[] = [];
  for (let marker = interval; marker < raceDistance; marker += interval) {
    splitDistances.push(marker);
  }
  return splitDistances;
}

export function addSplit(current: TimerSplit[], elapsedMs: number, distance: string | number, poolType: '25m' | '50m', splitInterval: SplitInterval = '50m') {
  const expected = calculateSplits(distance, poolType, splitInterval);
  const nextIndex = current.length;
  const nextDistance = expected[nextIndex] ?? expected[expected.length - 1] ?? Number(String(distance).replace(/\D/g, ''));
  const split: TimerSplit = {
    id: `split-${Date.now()}-${nextIndex}`,
    label: `Split ${nextIndex + 1} - ${nextDistance}m`,
    distance: nextDistance,
    time: formatRaceTime(elapsedMs),
  };
  return [...current, split];
}

export function updateSplit(splits: TimerSplit[], id: string, time: string) {
  return splits.map((split) => (split.id === id ? { ...split, time } : split));
}

export function removeSplit(splits: TimerSplit[], id: string) {
  return splits.filter((split) => split.id !== id);
}

export function checkPersonalBest(entry: LiveRaceEntry) {
  const result = saveLiveRaceResult(entry);
  return result.isPB;
}

export function saveRaceResult(entry: LiveRaceEntry) {
  return saveLiveRaceResult(entry);
}
