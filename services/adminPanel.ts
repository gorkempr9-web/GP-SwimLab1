import { clearClubCollection, readClubCollection, replaceClubCollection } from '@/services/firestoreData';
import { clearLocalClubData, clearLocalDemoData, getLocalData, saveLocalData } from '@/services/localStore';

export type AdminClub = {
  id: string;
  name: string;
  code: string;
};

export type AdminAthlete = {
  id: string;
  fullName: string;
  club: string;
  group?: string;
  birthYear?: string;
  age?: string;
  mainStroke?: string;
  targetEvent?: string;
  lastRaceResult?: string;
};

export type AdminCoach = {
  id: string;
  fullName: string;
  club: string;
  duty?: string;
  group?: string;
  permission?: string;
  trainingPlanCount?: number;
};

export type AdminTrainingPlan = {
  id: string;
  date?: string;
  title: string;
  club: string;
  group?: string;
  totalMeters?: string;
  setCount?: number;
  hasDryland?: boolean;
  coachName?: string;
};

export type AdminRaceResult = {
  id: string;
  athleteName: string;
  club: string;
  competitionName?: string;
  date?: string;
  stroke?: string;
  distance?: string;
  finalTime?: string;
  isPB?: boolean;
};

export type AdminNotification = {
  id: string;
  title: string;
  club: string;
  type?: string;
  date?: string;
  readCount: number;
  unreadCount: number;
};

export type AdminSnapshot = {
  clubs: Array<AdminClub & {
    athleteCount: number;
    coachCount: number;
    trainingPlanCount: number;
    raceResultCount: number;
    notificationCount: number;
  }>;
  athletes: AdminAthlete[];
  coaches: AdminCoach[];
  trainingPlans: AdminTrainingPlan[];
  raceResults: AdminRaceResult[];
  notifications: AdminNotification[];
  storageRows: Array<{ club: string; key: string; count: number }>;
};

export const adminClubs: AdminClub[] = [
  { id: 'mev-koleji', name: 'MEV Koleji', code: 'MEV26' },
  { id: 'baskent-cankaya', name: 'Başkent Çankaya Spor Kulübü', code: 'BASKENT26' },
  { id: 'pilot-club', name: 'SwimLab Pilot Kulüp', code: 'PILOT26' },
];

const clubDataKeys = ['athletes', 'trainingPlans', 'trainingLog', 'notifications', 'raceResults', 'coaches'] as const;

function keyFor(prefix: string, clubId: string) {
  return `${prefix}_${clubId}`;
}

export async function loadAdminSnapshot(): Promise<AdminSnapshot> {
  const athletes: AdminAthlete[] = [];
  const coaches: AdminCoach[] = [];
  const trainingPlans: AdminTrainingPlan[] = [];
  const raceResults: AdminRaceResult[] = [];
  const notifications: AdminNotification[] = [];
  const storageRows: AdminSnapshot['storageRows'] = [];

  for (const club of adminClubs) {
    const clubAthletes = await readClubCollection<Record<string, unknown>>('athletes', await getLocalData<Record<string, unknown>[]>(keyFor('athletes', club.id), []), club.id);
    const clubCoaches = await readClubCollection<Record<string, unknown>>('coaches', await getLocalData<Record<string, unknown>[]>(keyFor('coaches', club.id), []), club.id);
    const clubPlans = await readClubCollection<Record<string, unknown>>('trainingPlans', await getLocalData<Record<string, unknown>[]>(keyFor('trainingPlans', club.id), []), club.id);
    const clubTrainingLog = await readClubCollection<Record<string, unknown>>('trainingLog', await getLocalData<Record<string, unknown>[]>(keyFor('trainingLog', club.id), []), club.id);
    const clubRaceResults = await readClubCollection<Record<string, unknown>>('raceResults', await getLocalData<Record<string, unknown>[]>(keyFor('raceResults', club.id), []), club.id);
    const clubNotifications = await readClubCollection<Record<string, unknown>>('notifications', await getLocalData<Record<string, unknown>[]>(keyFor('notifications', club.id), []), club.id);

    storageRows.push(
      { club: club.name, key: keyFor('athletes', club.id), count: clubAthletes.length },
      { club: club.name, key: keyFor('coaches', club.id), count: clubCoaches.length },
      { club: club.name, key: keyFor('trainingPlans', club.id), count: clubPlans.length },
      { club: club.name, key: keyFor('trainingLog', club.id), count: clubTrainingLog.length },
      { club: club.name, key: keyFor('raceResults', club.id), count: clubRaceResults.length },
      { club: club.name, key: keyFor('notifications', club.id), count: clubNotifications.length },
    );

    athletes.push(...clubAthletes.map((item: Record<string, unknown>, index: number) => normalizeAthlete(item, club, index)));
    coaches.push(...clubCoaches.map((item: Record<string, unknown>, index: number) => normalizeCoach(item, club, index, clubPlans.length)));
    trainingPlans.push(...clubPlans.map((item: Record<string, unknown>, index: number) => normalizeTrainingPlan(item, club, index)));
    raceResults.push(...clubRaceResults.map((item: Record<string, unknown>, index: number) => normalizeRaceResult(item, club, index)));
    notifications.push(...clubNotifications.map((item: Record<string, unknown>, index: number) => normalizeNotification(item, club, index)));
  }

  const clubs = adminClubs.map((club) => ({
    ...club,
    athleteCount: athletes.filter((item) => item.club === club.name).length,
    coachCount: coaches.filter((item) => item.club === club.name).length,
    trainingPlanCount: trainingPlans.filter((item) => item.club === club.name).length,
    raceResultCount: raceResults.filter((item) => item.club === club.name).length,
    notificationCount: notifications.filter((item) => item.club === club.name).length,
  }));

  return { clubs, athletes, coaches, trainingPlans, raceResults, notifications, storageRows };
}

export async function clearClubAdminData(clubId: string) {
  await Promise.all(clubDataKeys.map((key) => clearClubCollection(key, clubId)));
  await clearLocalClubData(clubId);
  return loadAdminSnapshot();
}

export async function clearAllAdminDemoData() {
  await Promise.all(adminClubs.flatMap((club) => clubDataKeys.map((key) => clearClubCollection(key, club.id))));
  await clearLocalDemoData();
  return loadAdminSnapshot();
}

export async function seedAdminDemoData() {
  const athletes = [
    { id: 'mev-a1', firstName: 'Pilot', lastName: 'Sporcu 1', group: 'Performans', birthYear: '2012', mainStroke: 'Serbest', targetEvent: '100m Serbest', lastRaceResult: '1:10.44' },
    { id: 'mev-a2', firstName: 'Pilot', lastName: 'Sporcu 2', group: 'Gelişim', birthYear: '2014', mainStroke: 'Kelebek', targetEvent: '50m Kelebek', lastRaceResult: '-' },
  ];
  const coaches = [
    { id: 'mev-c1', firstName: 'Pilot', lastName: 'Antrenör', duty: 'Baş Antrenör', group: 'Performans', permission: 'Plan oluşturabilir' },
  ];
  const trainingPlans = [
    { planId: 'mev-tp1', title: 'Performans Planı', date: '08.06.2026', assignedGroups: ['Performans'], totalMeters: '2400m', sets: [{ id: 's1' }], drylandExercises: [] },
  ];
  const raceResults = [
    { id: 'mev-r1', athleteName: 'Pilot Sporcu 1', competitionName: 'Pilot Yarış', date: '08.06.2026', stroke: 'Serbest', distance: '100m', finalTime: '1:10.44', isPB: true },
  ];
  const notifications = [
    { id: 'mev-n1', title: 'Pilot duyuru', category: 'club', dateTime: '08.06.2026 10:00', read: false },
  ];
  await saveLocalData(keyFor('athletes', 'mev-koleji'), athletes);
  await saveLocalData(keyFor('coaches', 'mev-koleji'), coaches);
  await saveLocalData(keyFor('trainingPlans', 'mev-koleji'), trainingPlans);
  await saveLocalData(keyFor('raceResults', 'mev-koleji'), raceResults);
  await saveLocalData(keyFor('notifications', 'mev-koleji'), notifications);
  await Promise.all([
    replaceClubCollection('athletes', athletes, 'mev-koleji'),
    replaceClubCollection('coaches', coaches, 'mev-koleji'),
    replaceClubCollection('trainingPlans', trainingPlans, 'mev-koleji'),
    replaceClubCollection('raceResults', raceResults, 'mev-koleji'),
    replaceClubCollection('notifications', notifications, 'mev-koleji'),
  ]);
  return loadAdminSnapshot();
}

function normalizeAthlete(item: Record<string, unknown>, club: AdminClub, index: number): AdminAthlete {
  const firstName = stringValue(item.firstName) || stringValue(item.name) || 'İsimsiz';
  const lastName = stringValue(item.lastName);
  const birthYear = stringValue(item.birthYear);
  return {
    id: stringValue(item.id) || `${club.id}-athlete-${index}`,
    fullName: `${firstName} ${lastName}`.trim(),
    club: club.name,
    group: stringValue(item.group) || stringValue(item.groupName),
    birthYear,
    age: stringValue(item.age) || calculateAge(birthYear),
    mainStroke: stringValue(item.mainStroke),
    targetEvent: stringValue(item.targetEvent),
    lastRaceResult: stringValue(item.lastRaceResult) || '-',
  };
}

function normalizeCoach(item: Record<string, unknown>, club: AdminClub, index: number, trainingPlanCount: number): AdminCoach {
  const firstName = stringValue(item.firstName) || stringValue(item.name) || 'İsimsiz';
  const lastName = stringValue(item.lastName);
  return {
    id: stringValue(item.id) || `${club.id}-coach-${index}`,
    fullName: `${firstName} ${lastName}`.trim(),
    club: club.name,
    duty: stringValue(item.duty) || stringValue(item.role),
    group: stringValue(item.group) || stringValue(item.groupName),
    permission: stringValue(item.permission),
    trainingPlanCount,
  };
}

function normalizeTrainingPlan(item: Record<string, unknown>, club: AdminClub, index: number): AdminTrainingPlan {
  const sets = Array.isArray(item.sets) ? item.sets : [];
  const dryland = Array.isArray(item.drylandExercises) ? item.drylandExercises : [];
  return {
    id: stringValue(item.planId) || stringValue(item.id) || `${club.id}-plan-${index}`,
    date: stringValue(item.date),
    title: stringValue(item.title) || 'İsimsiz plan',
    club: club.name,
    group: arrayValue(item.assignedGroups).join(', ') || stringValue(item.group) || stringValue(item.athleteName),
    totalMeters: stringValue(item.totalMeters),
    setCount: sets.length,
    hasDryland: dryland.length > 0,
    coachName: stringValue(item.coachName) || '-',
  };
}

function normalizeRaceResult(item: Record<string, unknown>, club: AdminClub, index: number): AdminRaceResult {
  return {
    id: stringValue(item.id) || `${club.id}-race-${index}`,
    athleteName: stringValue(item.athleteName) || stringValue(item.athlete) || '-',
    club: club.name,
    competitionName: stringValue(item.competitionName),
    date: stringValue(item.date),
    stroke: stringValue(item.stroke),
    distance: stringValue(item.distance),
    finalTime: stringValue(item.finalTime),
    isPB: Boolean(item.isPB),
  };
}

function normalizeNotification(item: Record<string, unknown>, club: AdminClub, index: number): AdminNotification {
  const read = Boolean(item.read);
  return {
    id: stringValue(item.id) || `${club.id}-notification-${index}`,
    title: stringValue(item.title) || 'İsimsiz bildirim',
    club: club.name,
    type: stringValue(item.category) || stringValue(item.type),
    date: stringValue(item.dateTime) || stringValue(item.date),
    readCount: read ? 1 : 0,
    unreadCount: read ? 0 : 1,
  };
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function calculateAge(birthYear: string) {
  const year = Number(birthYear);
  if (!year) return '';
  return String(new Date().getFullYear() - year);
}
