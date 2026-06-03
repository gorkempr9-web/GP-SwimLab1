export type ClubPriority = 'normal' | 'important' | 'emergency';
export type NotificationMode = 'push' | 'inApp';
export type ClubBoardCategory = string;
export type CompetitionStatus = string;
export type RaceDay = string;
export type RaceSession = string;
export type AttendanceStatus = string;
export type LiveRaceStatus = string;

export type ClubBoardItem = {
  id: string;
  title: string;
  description: string;
  category: ClubBoardCategory;
  date: string;
  club: string;
  publisher: string;
  seenUsers: string[];
  priority: ClubPriority;
  notification: NotificationMode[];
};

export type ClubCalendarItem = {
  id: string;
  type: string;
  title: string;
  date: string;
  time: string;
  place: string;
  lane: string;
  group: string;
};

export type Competition = {
  id: string;
  name: string;
  city: string;
  poolType: '25m' | '50m';
  startDate: string;
  endDate: string;
  warmupTime: string;
  session: string;
  club: string;
  status: CompetitionStatus;
};

export type RosterAthlete = {
  id: string;
  name: string;
  age?: string;
  club?: string;
  group?: string;
  coach?: string;
  attendance?: string;
  attendanceStatus?: AttendanceStatus;
  lastPb?: string;
  upcomingRace?: string;
  lane: string;
  heat: string;
  day: string;
  session: string;
  events: Record<string, boolean>;
};

export type CompetitionRosterEntry = {
  id: string;
  competitionName?: string;
  competitionDate?: string;
  location?: string;
  athleteId: string;
  athleteName: string;
  raceKind?: 'individual' | 'relay';
  raceDay: RaceDay;
  session: RaceSession;
  heat: string;
  lane: string;
  estimatedTime: string;
  distance: string;
  stroke: string;
  poolType: '25m' | '50m';
  pb: string;
  targetTime: string;
  relayType?: string;
  teamName?: string;
  teamCategory?: string;
  relayAthletes?: RelayAthlete[];
};

export type RelayAthlete = {
  athleteId: string;
  athleteName: string;
  order: number;
  reserve?: boolean;
};

export type LiveRaceEntry = {
  id: string;
  rosterId?: string;
  athleteId?: string;
  athlete: string;
  raceKind?: 'individual' | 'relay';
  competitionName?: string;
  date?: string;
  location?: string;
  poolType?: '25m' | '50m';
  distance?: string;
  stroke?: string;
  event: string;
  raceDay?: RaceDay;
  session?: RaceSession;
  reaction: string;
  split1: string;
  split2: string;
  split3: string;
  split4: string;
  splits?: string[];
  finalTime: string;
  lane: string;
  heat: string;
  rank: string;
  medal: string;
  pb: boolean;
  dsq: boolean;
  dns: boolean;
  status?: LiveRaceStatus;
  note: string;
  relayType?: string;
  teamName?: string;
  teamCategory?: string;
  relayAthletes?: RelayAthlete[];
};

export type CoachAthlete = {
  id: string;
  fullName: string;
  age: string;
  club: string;
  group: string;
  coach: string;
  lastAttendance: string;
  attendanceStatus: AttendanceStatus;
  lastPb: string;
  upcomingRace: string;
};

export type AttendanceRecord = {
  id: string;
  date: string;
  group: string;
  athlete: string;
  status: AttendanceStatus;
  note: string;
};

export type AthleteRaceResult = {
  id: string;
  athleteId: string;
  athleteName: string;
  competitionName: string;
  date: string;
  raceDay: RaceDay;
  location: string;
  poolType: '25m' | '50m';
  session: string;
  eventName: string;
  raceKind?: 'individual' | 'relay';
  distance: string;
  stroke: string;
  heat: string;
  lane: string;
  finalTime: string;
  splits: string[];
  coachNote: string;
  isPB: boolean;
  status: string;
  relayType?: string;
  teamName?: string;
  relayOrder?: number;
  createdByCoachId: string;
  createdAt: string;
};

export type AthletePB = {
  id: string;
  athleteId: string;
  stroke: string;
  distance: string;
  poolType: '25m' | '50m';
  time: string;
};

export type PreparedRosterGroup = {
  key: string;
  title: string;
  competitionName: string;
  date: string;
  location: string;
  entries: CompetitionRosterEntry[];
  totalAthletes: number;
  totalStarts: number;
  relayCount: number;
};

export const selectLabel = 'Seçiniz';

export const strokeDistances: Record<string, string[]> = {
  Serbest: ['50', '100', '200', '400', '800', '1500'],
  'Sırtüstü': ['50', '100', '200'],
  Kurbağalama: ['50', '100', '200'],
  Kelebek: ['50', '100', '200'],
  Karışık: ['100', '200', '400'],
};

export const athletePBs: AthletePB[] = [];

export const clubBoardItems: ClubBoardItem[] = [];

export const clubAnnouncements = clubBoardItems.filter((item) => item.category === 'Duyurular');
export const emergencyAlerts = clubBoardItems.filter((item) => item.priority === 'emergency');

export const clubCalendarItems: ClubCalendarItem[] = [];

export const clubCalendarEvents = clubCalendarItems;

export const competitions: Competition[] = [];

export const rosterEvents = ['50 SF', '100 SF', '200 IM', '50 Fly', '100 Back', '200 Breast'];
export const relayRaceOptions = [
  '4x50m Serbest Bayrak',
  '4x100m Serbest Bayrak',
  '4x200m Serbest Bayrak',
  '4x50m Karışık Bayrak',
  '4x100m Karışık Bayrak',
  '4x50m Karma Serbest Bayrak',
  '4x100m Karma Serbest Bayrak',
  '4x50m Karma Karışık Bayrak',
  '4x100m Karma Karışık Bayrak',
];

export const rosterAthletes: RosterAthlete[] = [];

let competitionRostersState: CompetitionRosterEntry[] = [];

let liveRaceQueueState: LiveRaceEntry[] = competitionRostersState.map(rosterEntryToLiveRace);

export const competitionRosters = competitionRostersState;
export const liveRaceQueue = liveRaceQueueState;
export const liveRaceEntries = liveRaceQueueState;

export function getCompetitionRosterEntries() {
  return [...competitionRostersState];
}

export function getPreparedRosterGroups(): PreparedRosterGroup[] {
  const grouped = competitionRostersState.reduce<Record<string, CompetitionRosterEntry[]>>((acc, entry) => {
    const competitionName = entry.competitionName ?? 'Yarış adı bekleniyor';
    const date = entry.competitionDate ?? 'Tarih bekleniyor';
    const key = `${date}-${competitionName}`;
    acc[key] = [...(acc[key] ?? []), entry];
    return acc;
  }, {});

  return Object.entries(grouped).map(([key, entries]) => {
    const first = entries[0];
    const competitionName = first.competitionName ?? 'Yarış adı bekleniyor';
    const date = first.competitionDate ?? 'Tarih bekleniyor';
    const athleteIds = new Set(entries.flatMap((entry) => entry.raceKind === 'relay' ? entry.relayAthletes?.map((athlete) => athlete.athleteId) ?? [] : [entry.athleteId]));
    return {
      key,
      title: `${date} ${competitionName} Yarış Listesi`,
      competitionName,
      date,
      location: first.location ?? '-',
      entries,
      totalAthletes: athleteIds.size,
      totalStarts: entries.length,
      relayCount: entries.filter((entry) => entry.raceKind === 'relay').length,
    };
  });
}

export function getLiveRaceQueue() {
  return [...liveRaceQueueState];
}

export function saveCompetitionRosterEntry(entry: Omit<CompetitionRosterEntry, 'id'>) {
  const saved: CompetitionRosterEntry = { ...entry, id: `entry-${Date.now()}` };
  competitionRostersState = [saved, ...competitionRostersState];
  liveRaceQueueState = [rosterEntryToLiveRace(saved), ...liveRaceQueueState];
  return saved;
}

export function saveRelayRosterEntry(entry: Omit<CompetitionRosterEntry, 'id' | 'raceKind' | 'athleteId' | 'athleteName' | 'distance' | 'stroke' | 'pb' | 'targetTime'>) {
  const saved: CompetitionRosterEntry = {
    ...entry,
    id: `entry-relay-${Date.now()}`,
    raceKind: 'relay',
    athleteId: `relay-${Date.now()}`,
    athleteName: entry.teamName ?? 'SwimLab Bayrak Takımı',
    distance: entry.relayType?.split('m ')[0].replace('m', '') ?? '4x100',
    stroke: entry.relayType?.replace(/^4x\d+m\s/, '') ?? 'Bayrak Yarışı',
    pb: '-',
    targetTime: '-',
  };
  competitionRostersState = [saved, ...competitionRostersState];
  liveRaceQueueState = [rosterEntryToLiveRace(saved), ...liveRaceQueueState];
  return saved;
}

export function getPublicAthleteProfiles(query = '') {
  const normalized = query.trim().toLocaleLowerCase('tr');
  return rosterAthletes
    .filter((athlete) => !normalized || athlete.name.toLocaleLowerCase('tr').includes(normalized))
    .map((athlete) => ({
      id: athlete.id,
      name: athlete.name,
      club: athlete.club ?? 'GP Aquatics',
      category: athlete.group ?? 'Yaş kategorisi yok',
      results: getAthleteRaceHistory(athlete.id),
      pbs: getAthleteRaceHistory(athlete.id).filter((result) => result.isPB),
      canOpenDetail: athlete.club === 'GP Aquatics',
    }));
}

export function updateLiveRaceQueueEntry(id: string, patch: Partial<LiveRaceEntry>) {
  liveRaceQueueState = liveRaceQueueState.map((entry) => entry.id === id ? { ...entry, ...patch } : entry);
  return getLiveRaceQueue();
}

let athleteRaceHistoryState: AthleteRaceResult[] = [];

export function getAthleteRaceHistory(athleteId = 'ra-1') {
  return athleteRaceHistoryState.filter((result) => result.athleteId === athleteId);
}

export function getRaceResultsForAthlete(athleteId = 'ra-1') {
  return getAthleteRaceHistory(athleteId);
}

export function getUpcomingRacesForAthlete(athleteId = 'ra-1') {
  return competitionRostersState.filter((entry) => entry.athleteId === athleteId || entry.relayAthletes?.some((athlete) => athlete.athleteId === athleteId));
}

export function getAthletePB({ athleteId, stroke, distance, poolType }: { athleteId: string; stroke: string; distance: string; poolType: '25m' | '50m' }) {
  const normalizedStroke = normalizeStroke(stroke);
  const candidates = [
    ...athletePBs
      .filter((pb) => pb.athleteId === athleteId && pb.distance === distance && normalizeStroke(pb.stroke) === normalizedStroke && pb.poolType === poolType)
      .map((pb) => pb.time),
    ...athleteRaceHistoryState
      .filter((result) => result.athleteId === athleteId && result.distance === distance && normalizeStroke(result.stroke) === normalizedStroke && result.poolType === poolType && result.status === 'Geçerli')
      .map((result) => result.finalTime),
  ]
    .map((time) => ({ time, seconds: parseRaceSeconds(time) }))
    .filter((item): item is { time: string; seconds: number } => item.seconds !== null)
    .sort((a, b) => a.seconds - b.seconds);

  return candidates[0]?.time ?? null;
}

export function getPersonalBestForEvent(athleteId: string, stroke: string, distance: string, poolType: '25m' | '50m') {
  const normalizedStroke = normalizeStroke(stroke);
  const candidates = [
    ...athleteRaceHistoryState
      .filter((result) => result.athleteId === athleteId && result.distance === distance && normalizeStroke(result.stroke) === normalizedStroke && result.poolType === poolType && result.status === 'Geçerli')
      .map((result) => result.finalTime),
    ...competitionRostersState
      .filter((entry) => entry.athleteId === athleteId && entry.distance === distance && normalizeStroke(entry.stroke) === normalizedStroke && entry.poolType === poolType)
      .map((entry) => entry.pb),
  ]
    .map((time) => ({ time, seconds: parseRaceSeconds(time) }))
    .filter((item): item is { time: string; seconds: number } => item.seconds !== null)
    .sort((a, b) => a.seconds - b.seconds);

  return candidates[0]?.time ?? 'PB kaydı yok';
}

export function saveLiveRaceResult(entry: LiveRaceEntry) {
  const roster = competitionRostersState.find((item) => `live-${item.id}` === entry.id || item.id === entry.rosterId);
  if (entry.raceKind === 'relay' || roster?.raceKind === 'relay') {
    const relayAthletes = entry.relayAthletes ?? roster?.relayAthletes ?? [];
    const eventName = entry.relayType ?? roster?.relayType ?? entry.event;
    const resultBase = {
      competitionName: entry.competitionName ?? 'Yarış adı bekleniyor',
      date: entry.date ?? roster?.competitionDate ?? '-',
      raceDay: roster?.raceDay ?? entry.raceDay ?? '1. Gün',
      location: entry.location ?? roster?.location ?? '-',
      poolType: roster?.poolType ?? entry.poolType ?? '50m',
      session: roster?.session ?? entry.session ?? 'Sabah Seansı',
      eventName,
      distance: roster?.distance ?? entry.distance ?? '4x100',
      stroke: roster?.stroke ?? entry.stroke ?? 'Bayrak',
      heat: entry.heat,
      lane: entry.lane,
      finalTime: entry.finalTime || '-',
      splits: entry.splits ?? [entry.split1, entry.split2, entry.split3, entry.split4].filter(Boolean),
      coachNote: entry.note,
      isPB: false,
      status: entry.dns ? 'DNS' : entry.dsq ? 'DQ' : 'Geçerli',
      createdByCoachId: 'coach-1',
      createdAt: new Date().toISOString(),
      raceKind: 'relay' as const,
      relayType: eventName,
      teamName: entry.teamName ?? roster?.teamName ?? entry.athlete,
    };
    const relayResults: AthleteRaceResult[] = relayAthletes.map((athlete) => ({
      ...resultBase,
      id: `result-relay-${Date.now()}-${athlete.athleteId}`,
      athleteId: athlete.athleteId,
      athleteName: athlete.athleteName,
      relayOrder: athlete.order,
    }));
    athleteRaceHistoryState = [...relayResults, ...athleteRaceHistoryState];
    updateLiveRaceQueueEntry(entry.id, { ...entry, pb: false, status: entry.dns ? 'DNS' : entry.dsq ? 'DQ' : 'Yüzdü' });
    return relayResults[0] ?? {
      ...resultBase,
      id: `result-relay-${Date.now()}`,
      athleteId: entry.athleteId ?? 'relay',
      athleteName: entry.athlete,
    };
  }

  const eventName = roster ? `${roster.distance} ${roster.stroke}` : entry.event;
  const [distance = '', stroke = ''] = eventName.split(' ');
  const poolType = roster?.poolType ?? entry.poolType ?? '50m';
  const athleteId = roster?.athleteId ?? entry.athleteId ?? 'ra-1';
  const status = entry.dns ? 'DNS' : entry.dsq ? 'DQ' : 'Geçerli';
  const candidateSeconds = parseRaceSeconds(entry.finalTime);
  const previousBest = athleteRaceHistoryState
    .filter((result) => result.athleteId === athleteId && result.distance === distance && result.stroke === stroke && result.poolType === poolType && result.status === 'Geçerli')
    .map((result) => parseRaceSeconds(result.finalTime))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b)[0];
  const isPB = status === 'Geçerli' && candidateSeconds !== null && (previousBest === undefined || candidateSeconds < previousBest);

  const result: AthleteRaceResult = {
    id: `result-${Date.now()}`,
    athleteId,
    athleteName: roster?.athleteName ?? entry.athlete,
    competitionName: entry.competitionName ?? 'Yarış adı bekleniyor',
    date: entry.date ?? roster?.competitionDate ?? '-',
    raceDay: roster?.raceDay ?? entry.raceDay ?? '1. Gün',
    location: entry.location ?? roster?.location ?? '-',
    poolType,
    session: roster?.session ?? entry.session ?? 'Sabah Seansı',
    eventName,
    raceKind: 'individual',
    distance,
    stroke,
    heat: entry.heat,
    lane: entry.lane,
    finalTime: entry.finalTime || '-',
    splits: entry.splits ?? [entry.split1, entry.split2, entry.split3, entry.split4].filter(Boolean),
    coachNote: entry.note,
    isPB,
    status,
    createdByCoachId: 'coach-1',
    createdAt: new Date().toISOString(),
  };

  athleteRaceHistoryState = [result, ...athleteRaceHistoryState];
  updateLiveRaceQueueEntry(entry.id, { ...entry, pb: isPB, status: entry.dns ? 'DNS' : entry.dsq ? 'DQ' : isPB ? 'PB' : 'Yüzdü' });
  return result;
}

function parseRaceSeconds(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '-') return null;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  const match = trimmed.match(/^(\d+):([0-5]?\d)(\.\d+)?$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]) + Number(match[3] ?? 0);
}

function normalizeStroke(value: string) {
  const normalized = value.toLocaleLowerCase('tr');
  if (normalized.includes('free') || normalized === 'sf' || normalized.includes('serbest')) return 'serbest';
  if (normalized.includes('back') || normalized.includes('sırt')) return 'sırtüstü';
  if (normalized.includes('breast') || normalized.includes('kurba')) return 'kurbağalama';
  if (normalized.includes('fly') || normalized.includes('kelebek')) return 'kelebek';
  if (normalized.includes('im') || normalized.includes('medley') || normalized.includes('karış')) return 'karışık';
  return normalized;
}

function rosterEntryToLiveRace(entry: CompetitionRosterEntry): LiveRaceEntry {
  return {
    id: `live-${entry.id}`,
    rosterId: entry.id,
    athleteId: entry.athleteId,
    athlete: entry.athleteName,
    raceKind: entry.raceKind ?? 'individual',
    competitionName: entry.competitionName ?? 'Yarış adı bekleniyor',
    date: entry.competitionDate ?? '-',
    location: entry.location ?? '-',
    poolType: entry.poolType,
    distance: entry.distance,
    stroke: entry.stroke,
    event: `${entry.distance} ${entry.stroke}`,
    raceDay: entry.raceDay,
    session: entry.session,
    reaction: '',
    split1: '',
    split2: '',
    split3: '',
    split4: '',
    finalTime: '',
    lane: entry.lane,
    heat: entry.heat,
    rank: '',
    medal: '',
    pb: false,
    dsq: false,
    dns: false,
    status: 'Bekliyor',
    note: '',
    relayType: entry.relayType,
    teamName: entry.teamName,
    teamCategory: entry.teamCategory,
    relayAthletes: entry.relayAthletes,
  };
}

export const coachAthletes: CoachAthlete[] = rosterAthletes.map((athlete) => ({
  id: athlete.id,
  fullName: athlete.name,
  age: athlete.age ?? '-',
  club: athlete.club ?? 'GP Aquatics',
  group: athlete.group ?? 'Performans Grubu',
  coach: athlete.coach ?? 'Antrenör bilgisi yok',
  lastAttendance: athlete.attendance ?? '90%',
  attendanceStatus: athlete.attendanceStatus ?? 'Katıldı',
  lastPb: athlete.lastPb ?? '-',
  upcomingRace: athlete.upcomingRace ?? '-',
}));

export const attendanceRecords: AttendanceRecord[] = [];

export const raceDayItems: Array<{ id: string; time: string; athlete: string; event: string; lane: string; heat: string; status: string }> = [];

export function summarizeRoster(athletes: RosterAthlete[]) {
  const totalRaces = athletes.reduce((sum, athlete) => sum + Object.values(athlete.events).filter(Boolean).length, 0);
  const totalMeters = athletes.reduce((sum, athlete) => {
    return sum + Object.entries(athlete.events).reduce((eventSum, [eventName, selected]) => {
      if (!selected) return eventSum;
      const distance = Number(eventName.split(' ')[0]);
      return eventSum + (Number.isNaN(distance) ? 0 : distance);
    }, 0);
  }, 0);
  const sessions = new Set(athletes.map((athlete) => athlete.session)).size;
  const heats = athletes.map((athlete) => athlete.heat).join(', ');
  const dayDistribution = athletes.reduce<Record<string, number>>((acc, athlete) => {
    acc[athlete.day] = (acc[athlete.day] ?? 0) + Object.values(athlete.events).filter(Boolean).length;
    return acc;
  }, {});

  return { totalRaces, totalMeters, sessions, heats, dayDistribution };
}
