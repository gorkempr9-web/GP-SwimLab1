import { readClubCollection, writeClubDocument } from '@/services/firestoreData';

export type ClubAthlete = {
  id: string;
  name: string;
  birthYear: number;
  gender: 'Kadın' | 'Erkek';
  club: string;
  group: 'Performans' | 'Gelişim' | 'Temel Eğitim';
  mainStroke: string;
  targetEvent: string;
  bestTime: string;
  improvement: number;
  attendance: number;
  score: number;
  status: 'Aktif' | 'Pasif';
  phone?: string;
  email?: string;
  coachNote?: string;
};

let clubAthletes: ClubAthlete[] = [];

export async function hydrateClubAthletes() {
  clubAthletes = await readClubCollection<ClubAthlete>('athletes', []);
  return [...clubAthletes];
}

export function getClubAthletes() {
  return [...clubAthletes];
}

export function addClubAthlete(input: Omit<ClubAthlete, 'id' | 'bestTime' | 'improvement' | 'attendance' | 'score' | 'status'> & Partial<Pick<ClubAthlete, 'bestTime' | 'improvement' | 'attendance' | 'score' | 'status'>>) {
  const athlete: ClubAthlete = {
    ...input,
    id: `athlete-${Date.now()}`,
    bestTime: input.bestTime ?? '-',
    improvement: input.improvement ?? 0,
    attendance: input.attendance ?? 0,
    score: input.score ?? 0,
    status: input.status ?? 'Aktif',
  };
  clubAthletes = [athlete, ...clubAthletes];
  void writeClubDocument('athletes', athlete.id, athlete as unknown as Record<string, unknown>);
  return athlete;
}
