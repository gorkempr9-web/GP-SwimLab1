import { clearClubCollection, ensurePilotClubDocuments, getDataSourceStatus, pilotClubDocuments, readClubCollection, readRootCollection, replaceClubCollection, writeClubDocument, writeRootDocument } from '@/services/firestoreData';
import { clearLocalClubData, clearLocalDemoData, getLocalData, saveLocalData } from '@/services/localStore';

export type AdminClub = {
  id: string;
  name: string;
  code: string;
  city?: string;
  district?: string;
  managerName?: string;
  phone?: string;
  email?: string;
  note?: string;
  type?: string;
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

export type AdminGroup = {
  id: string;
  name: string;
  club: string;
  description?: string;
  level?: string;
  coachIds: string[];
  athleteIds: string[];
  isActive: boolean;
  createdAt?: string;
};

export type AdminAuditLog = {
  id: string;
  actorUserId: string;
  actorName: string;
  role: string;
  clubId: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  details?: string;
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
  groups: AdminGroup[];
  trainingPlans: AdminTrainingPlan[];
  raceResults: AdminRaceResult[];
  notifications: AdminNotification[];
  auditLogs: AdminAuditLog[];
  storageRows: Array<{ club: string; key: string; count: number }>;
  dataSource: ReturnType<typeof getDataSourceStatus>;
};

export const adminClubs: AdminClub[] = [
  { id: 'mev-koleji', name: 'MEV Koleji', code: 'MEV26' },
  { id: 'baskent-cankaya', name: 'Başkent Çankaya Spor Kulübü', code: 'BASKENT26' },
  { id: 'pilot-club', name: 'SwimLab Pilot Kulüp', code: 'PILOT26' },
];

const clubDataKeys = ['athletes', 'trainingPlans', 'trainingLog', 'notifications', 'raceResults', 'coaches', 'groups'] as const;

function keyFor(prefix: string, clubId: string) {
  return `${prefix}_${clubId}`;
}

export async function loadAdminSnapshot(): Promise<AdminSnapshot> {
  await ensurePilotClubDocuments();
  const rootClubs = await readRootCollection<AdminClub>('clubs', pilotClubDocuments.map((club) => ({ ...club })));
  const visibleClubs: AdminClub[] = rootClubs.length ? rootClubs.map(normalizeClub) : adminClubs;
  const athletes: AdminAthlete[] = [];
  const coaches: AdminCoach[] = [];
  const groups: AdminGroup[] = [];
  const trainingPlans: AdminTrainingPlan[] = [];
  const raceResults: AdminRaceResult[] = [];
  const notifications: AdminNotification[] = [];
  const auditLogs = await readRootCollection<AdminAuditLog>('auditLogs', []);
  const storageRows: AdminSnapshot['storageRows'] = [];

  for (const club of visibleClubs) {
    const clubAthletes = await readClubCollection<Record<string, unknown>>('athletes', await getLocalData<Record<string, unknown>[]>(keyFor('athletes', club.id), []), club.id);
    const clubCoaches = await readClubCollection<Record<string, unknown>>('coaches', await getLocalData<Record<string, unknown>[]>(keyFor('coaches', club.id), []), club.id);
    const clubGroups = await readClubCollection<Record<string, unknown>>('groups', await getLocalData<Record<string, unknown>[]>(keyFor('groups', club.id), []), club.id);
    const clubPlans = await readClubCollection<Record<string, unknown>>('trainingPlans', await getLocalData<Record<string, unknown>[]>(keyFor('trainingPlans', club.id), []), club.id);
    const clubTrainingLog = await readClubCollection<Record<string, unknown>>('trainingLog', await getLocalData<Record<string, unknown>[]>(keyFor('trainingLog', club.id), []), club.id);
    const clubRaceResults = await readClubCollection<Record<string, unknown>>('raceResults', await getLocalData<Record<string, unknown>[]>(keyFor('raceResults', club.id), []), club.id);
    const clubNotifications = await readClubCollection<Record<string, unknown>>('notifications', await getLocalData<Record<string, unknown>[]>(keyFor('notifications', club.id), []), club.id);

    storageRows.push(
      { club: club.name, key: keyFor('athletes', club.id), count: clubAthletes.length },
      { club: club.name, key: keyFor('coaches', club.id), count: clubCoaches.length },
      { club: club.name, key: keyFor('groups', club.id), count: clubGroups.length },
      { club: club.name, key: keyFor('trainingPlans', club.id), count: clubPlans.length },
      { club: club.name, key: keyFor('trainingLog', club.id), count: clubTrainingLog.length },
      { club: club.name, key: keyFor('raceResults', club.id), count: clubRaceResults.length },
      { club: club.name, key: keyFor('notifications', club.id), count: clubNotifications.length },
    );

    athletes.push(...clubAthletes.map((item: Record<string, unknown>, index: number) => normalizeAthlete(item, club, index)));
    coaches.push(...clubCoaches.map((item: Record<string, unknown>, index: number) => normalizeCoach(item, club, index, clubPlans.length)));
    groups.push(...clubGroups.map((item: Record<string, unknown>, index: number) => normalizeGroup(item, club, index)));
    trainingPlans.push(...clubPlans.map((item: Record<string, unknown>, index: number) => normalizeTrainingPlan(item, club, index)));
    raceResults.push(...clubRaceResults.map((item: Record<string, unknown>, index: number) => normalizeRaceResult(item, club, index)));
    notifications.push(...clubNotifications.map((item: Record<string, unknown>, index: number) => normalizeNotification(item, club, index)));
  }

  const clubs = visibleClubs.map((club) => ({
    ...club,
    athleteCount: athletes.filter((item) => item.club === club.name).length,
    coachCount: coaches.filter((item) => item.club === club.name).length,
    trainingPlanCount: trainingPlans.filter((item) => item.club === club.name).length,
    raceResultCount: raceResults.filter((item) => item.club === club.name).length,
    notificationCount: notifications.filter((item) => item.club === club.name).length,
  }));

  return { clubs, athletes, coaches, groups, trainingPlans, raceResults, notifications, auditLogs, storageRows, dataSource: getDataSourceStatus() };
}

export async function createAdminAthlete(clubId: string, input: Record<string, string>) {
  const id = `athlete-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const payload = {
    id,
    firstName: input.firstName,
    lastName: input.lastName,
    name: `${input.firstName} ${input.lastName}`.trim(),
    birthDate: input.birthDate,
    birthYear: (input.birthDate.match(/\d{4}/) ?? [''])[0],
    gender: input.gender,
    phone: normalizeTurkishPhone(input.phone),
    email: input.email,
    group: input.group,
    mainStroke: input.mainStroke,
    targetEvent: input.targetEvent,
    guardianName: input.guardianName,
    guardianPhone: normalizeTurkishPhone(input.guardianPhone),
    guardianEmail: input.guardianEmail,
    coachNote: input.coachNote,
    createdAt,
    updatedAt: createdAt,
  };
  await writeClubDocument('athletes', id, payload, clubId);
  await recordAuditLog({ action: 'sporcu ekleme', entityType: 'athlete', entityId: id, clubId, details: payload.name });
  return loadAdminSnapshot();
}

export async function createAdminCoach(clubId: string, input: Record<string, string>) {
  const id = `coach-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const payload = {
    id,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: normalizeTurkishPhone(input.phone),
    email: input.email,
    duty: input.duty,
    group: input.group,
    permission: input.permission,
    createdAt,
    updatedAt: createdAt,
  };
  await writeClubDocument('coaches', id, payload, clubId);
  await recordAuditLog({ action: 'antrenör ekleme', entityType: 'coach', entityId: id, clubId, details: `${input.firstName ?? ''} ${input.lastName ?? ''}`.trim() });
  return loadAdminSnapshot();
}

export async function createAdminUser(input: Record<string, string>) {
  const id = `user-${Date.now()}`;
  const createdAt = new Date().toISOString();
  await writeRootDocument('users', id, { ...input, id, createdAt, updatedAt: createdAt });
  await recordAuditLog({ action: 'kullanıcı oluşturma', entityType: 'user', entityId: id, clubId: input.clubId || '-', details: `${input.firstName ?? ''} ${input.lastName ?? ''}`.trim() });
  return loadAdminSnapshot();
}

export async function createAdminClub(input: Record<string, string>) {
  const code = input.code?.trim().toUpperCase() || `CLUB-${Date.now()}`;
  const id = input.id || slugify(input.name || code) || `club-${Date.now()}`;
  const createdAt = new Date().toISOString();
  await writeRootDocument('clubs', id, {
    id,
    name: input.name?.trim() || 'Yeni Kulüp',
    code,
    city: input.city?.trim() || '-',
    district: input.district?.trim() || '',
    managerName: input.managerName?.trim() || '',
    phone: normalizeTurkishPhone(input.phone),
    email: input.email?.trim() || '',
    note: input.note?.trim() || '',
    isActive: true,
    type: input.type?.trim() || 'custom',
    createdAt,
    updatedAt: createdAt,
  });
  await recordAuditLog({ action: 'kulüp ekleme', entityType: 'club', entityId: id, clubId: id, details: input.name?.trim() || code });
  return loadAdminSnapshot();
}

export async function createAdminGroup(clubId: string, input: Record<string, string>) {
  const id = input.id || slugify(input.name || `group-${Date.now()}`) || `group-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const payload = {
    id,
    name: input.name?.trim() || 'Yeni Grup',
    description: input.description?.trim() || '',
    level: input.level?.trim() || '',
    coachIds: splitCsv(input.coachIds),
    athleteIds: splitCsv(input.athleteIds),
    isActive: input.isActive !== 'false',
    createdAt,
    updatedAt: createdAt,
  };
  await writeClubDocument('groups', id, payload, clubId);
  await recordAuditLog({ action: 'grup oluşturma', entityType: 'group', entityId: id, clubId, details: payload.name });
  return loadAdminSnapshot();
}

export async function ensureDemoClubs() {
  await ensurePilotClubDocuments();
  return loadAdminSnapshot();
}

export async function clearClubAdminData(clubId: string) {
  await Promise.all(clubDataKeys.map((key) => clearClubCollection(key, clubId)));
  await clearLocalClubData(clubId);
  await recordAuditLog({ action: 'demo veri temizleme', entityType: 'clubData', entityId: clubId, clubId, details: 'Kulüp bazlı demo veri temizlendi' });
  return loadAdminSnapshot();
}

export async function clearAllAdminDemoData() {
  await Promise.all(adminClubs.flatMap((club) => clubDataKeys.map((key) => clearClubCollection(key, club.id))));
  await clearLocalDemoData();
  await recordAuditLog({ action: 'demo veri temizleme', entityType: 'allDemoData', entityId: 'all', clubId: 'all-clubs', details: 'Tüm demo verileri temizlendi' });
  return loadAdminSnapshot();
}

export async function seedAdminDemoData() {
  const athletes = [
    { id: 'mev-a1', firstName: 'Pilot', lastName: 'Sporcu 1', group: 'Performans', birthYear: '2012', mainStroke: 'Serbest', targetEvent: '100m Serbest', lastRaceResult: '1:10.44' },
    { id: 'mev-a2', firstName: 'Pilot', lastName: 'Sporcu 2', group: 'GeliÅŸim', birthYear: '2014', mainStroke: 'Kelebek', targetEvent: '50m Kelebek', lastRaceResult: '-' },
  ];
  const coaches = [
    { id: 'mev-c1', firstName: 'Pilot', lastName: 'Antrenör', duty: 'Baş Antrenör', group: 'Performans', permission: 'Plan oluşturabilir' },
  ];
  const trainingPlans = [
    { planId: 'mev-tp1', title: 'Performans PlanÄ±', date: '08.06.2026', assignedGroups: ['Performans'], totalMeters: '2400m', sets: [{ id: 's1' }], drylandExercises: [] },
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

function normalizeGroup(item: Record<string, unknown>, club: AdminClub, index: number): AdminGroup {
  return {
    id: stringValue(item.id) || `${club.id}-group-${index}`,
    name: stringValue(item.name) || 'İsimsiz grup',
    club: club.name,
    description: stringValue(item.description),
    level: stringValue(item.level),
    coachIds: arrayValue(item.coachIds),
    athleteIds: arrayValue(item.athleteIds),
    isActive: item.isActive !== false,
    createdAt: stringValue(item.createdAt),
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

function normalizeClub(item: AdminClub & Record<string, unknown>): AdminClub {
  const id = stringValue(item.id) || slugify(stringValue(item.name) || stringValue(item.code));
  return {
    id,
    name: stringValue(item.name) || id || 'Kulüp',
    code: stringValue(item.code) || '-',
    city: stringValue(item.city),
    district: stringValue(item.district),
    managerName: stringValue(item.managerName),
    phone: stringValue(item.phone),
    email: stringValue(item.email),
    note: stringValue(item.note),
    type: stringValue(item.type),
  };
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function splitCsv(value?: string) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function recordAuditLog(input: {
  actorUserId?: string;
  actorName?: string;
  role?: string;
  clubId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
}) {
  const id = `audit-${Date.now()}-${Math.round(Math.random() * 1000)}`;
  const createdAt = new Date().toISOString();
  await writeRootDocument('auditLogs', id, {
    id,
    actorUserId: input.actorUserId || 'system',
    actorName: input.actorName || 'System',
    role: input.role || 'super_admin',
    clubId: input.clubId || '-',
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    createdAt,
    updatedAt: createdAt,
    details: input.details || '',
  });
}

function calculateAge(birthYear: string) {
  const year = Number(birthYear);
  if (!year) return '';
  return String(new Date().getFullYear() - year);
}

export function normalizeTurkishPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const withoutCountry = digits.startsWith('90') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits;
  return withoutCountry.length === 10 && withoutCountry.startsWith('5') ? `+90${withoutCountry}` : value.trim();
}

export function isValidTurkishGsm(value: string) {
  return /^\+905\d{9}$/.test(normalizeTurkishPhone(value));
}

export function slugify(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/[ğ]/g, 'g')
    .replace(/[ü]/g, 'u')
    .replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


