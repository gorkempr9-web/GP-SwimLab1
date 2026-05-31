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
  Sırtüstü: ['50', '100', '200'],
  Kurbağalama: ['50', '100', '200'],
  Kelebek: ['50', '100', '200'],
  Karışık: ['100', '200', '400'],
};

export const athletePBs: AthletePB[] = [
  { id: 'pb-deniz-50-free-50', athleteId: 'ra-1', stroke: 'Serbest', distance: '50', poolType: '50m', time: '32.23' },
  { id: 'pb-deniz-100-free-50', athleteId: 'ra-1', stroke: 'Serbest', distance: '100', poolType: '50m', time: '1:10.44' },
  { id: 'pb-deniz-200-free-50', athleteId: 'ra-1', stroke: 'Serbest', distance: '200', poolType: '50m', time: '2:38.90' },
  { id: 'pb-deniz-50-back-50', athleteId: 'ra-1', stroke: 'Sırtüstü', distance: '50', poolType: '50m', time: '36.10' },
  { id: 'pb-ece-50-fly-50', athleteId: 'ra-2', stroke: 'Kelebek', distance: '50', poolType: '50m', time: '34.55' },
  { id: 'pb-ece-100-fly-50', athleteId: 'ra-2', stroke: 'Kelebek', distance: '100', poolType: '50m', time: '1:18.20' },
];

export const clubBoardItems: ClubBoardItem[] = [
  { id: 'board-1', title: 'GP Aquatics Yaz Kampı', description: '14 günlük yüksek performans kampı', category: 'Kamp', date: '10.06.2026', club: 'GP Aquatics', publisher: 'Kulüp Yönetimi', seenUsers: ['Deniz', 'Ece'], priority: 'important', notification: ['push', 'inApp'] },
  { id: 'board-2', title: 'Antrenman saat değişikliği', description: 'Performans grup antrenmanı 18:00 olarak güncellendi.', category: 'Takvim', date: '24.05.2026', club: 'GP Aquatics', publisher: 'Baş Antrenör', seenUsers: ['Deniz', 'Mert'], priority: 'normal', notification: ['inApp'] },
  { id: 'board-3', title: 'Marmara Cup toplantısı', description: 'Yarış kafilesi ve seans planı paylaşılacak.', category: 'Yarışlar', date: '25.05.2026', club: 'GP Aquatics', publisher: 'Yarış Koordinatörü', seenUsers: ['Deniz'], priority: 'emergency', notification: ['push', 'inApp'] },
  { id: 'board-4', title: 'Veli bilgilendirmesi', description: 'KVKK ve yarış günü izin formları kontrol edilecek.', category: 'Duyurular', date: '26.05.2026', club: 'GP Aquatics', publisher: 'Kulüp Sekreterliği', seenUsers: ['Veli: Ece'], priority: 'important', notification: ['inApp'] },
];

export const clubAnnouncements = clubBoardItems.filter((item) => item.category === 'Duyurular');
export const emergencyAlerts = clubBoardItems.filter((item) => item.priority === 'emergency');

export const clubCalendarItems: ClubCalendarItem[] = [
  { id: 'cc-1', type: 'antrenman', title: 'Race pace', date: '24.05.2026', time: '18:00', place: '50m havuz', lane: 'Kulvar 3-6', group: 'Performans grup' },
  { id: 'cc-2', type: 'yarış', title: 'Marmara Cup', date: '26.05.2026', time: '08:00', place: 'Olimpik havuz', lane: 'Kulvar 1-8', group: 'Yarış takımı' },
  { id: 'cc-3', type: 'kamp', title: 'Yaz kampı', date: '10.06.2026', time: '09:30', place: 'Kamp havuzu', lane: 'Kulvar 2-7', group: 'Performans grup' },
  { id: 'cc-4', type: 'veli toplantısı', title: 'Marmara Cup veli toplantısı', date: '25.05.2026', time: '20:00', place: 'Kulüp salonu', lane: '-', group: 'Veliler' },
  { id: 'cc-5', type: 'beslenme görüşmesi', title: 'Yarış haftası beslenme', date: '23.05.2026', time: '19:00', place: 'Online', lane: '-', group: 'Yarış takımı' },
];

export const clubCalendarEvents = clubCalendarItems;

export const competitions: Competition[] = [
  { id: 'comp-1', name: 'Marmara Cup', city: 'İstanbul', poolType: '50m', startDate: '26 Mayıs', endDate: '28 Mayıs', warmupTime: '08:00', session: 'Sabah seansı', club: 'GP Aquatics', status: 'yaklaşıyor' },
  { id: 'comp-2', name: 'Bölge Şampiyonası', city: 'Bursa', poolType: '25m', startDate: '12 Haziran', endDate: '14 Haziran', warmupTime: '09:00', session: 'Öğleden sonra', club: 'GP Aquatics', status: 'aktif' },
  { id: 'comp-3', name: 'Kulüp Ligi', city: 'İzmir', poolType: '50m', startDate: '05 Mayıs', endDate: '06 Mayıs', warmupTime: '07:45', session: 'Final', club: 'GP Aquatics', status: 'tamamlandı' },
];

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

export const rosterAthletes: RosterAthlete[] = [
  { id: 'ra-1', name: 'Deniz Arslan', age: '15', club: 'GP Aquatics', group: 'Yarış Grubu', coach: 'Görkem Pınar', attendance: '96%', attendanceStatus: 'Katıldı', lastPb: '100 SF 56.84', upcomingRace: 'Marmara Cup', lane: '4', heat: '2', day: '1. Gün', session: 'Sabah Seansı', events: { '50 SF': true, '100 SF': true, '200 IM': false, '50 Fly': true, '100 Back': false, '200 Breast': false } },
  { id: 'ra-2', name: 'Ece Yılmaz', age: '14', club: 'GP Aquatics', group: 'Performans Grubu', coach: 'Ece Koç', attendance: '91%', attendanceStatus: 'Geç Kaldı', lastPb: '50 Fly 28.02', upcomingRace: 'Marmara Cup', lane: '5', heat: 'Final', day: '1. Gün', session: 'Sabah Seansı', events: { '50 SF': false, '100 SF': true, '200 IM': true, '50 Fly': true, '100 Back': false, '200 Breast': false } },
  { id: 'ra-3', name: 'Mert Kaya', age: '16', club: 'GP Aquatics', group: 'Masters', coach: 'Görkem Pınar', attendance: '88%', attendanceStatus: 'Raporlu', lastPb: '200 IM 2:18.90', upcomingRace: 'Bölge Şampiyonası', lane: '3', heat: '1', day: '2. Gün', session: 'Akşam Seansı', events: { '50 SF': true, '100 SF': false, '200 IM': true, '50 Fly': false, '100 Back': true, '200 Breast': true } },
  { id: 'ra-4', name: 'Zeynep Demir', age: '15', club: 'GP Aquatics', group: 'Küçük Yaş', coach: 'Ece Koç', attendance: '84%', attendanceStatus: 'Katıldı', lastPb: '100 Breast 1:18.40', upcomingRace: 'Marmara Cup', lane: '6', heat: '3', day: '2. Gün', session: 'Sabah Seansı', events: { '50 SF': false, '100 SF': false, '200 IM': false, '50 Fly': false, '100 Back': false, '200 Breast': true } },
];

let competitionRostersState: CompetitionRosterEntry[] = [
  { id: 'entry-1', athleteId: 'ra-1', athleteName: 'Deniz Arslan', raceDay: '1. Gün', session: 'Sabah Seansı', heat: '2', lane: '4', estimatedTime: '09:10', distance: '50', stroke: 'Serbest', poolType: '50m', pb: '32.90', targetTime: '32.20' },
  { id: 'entry-2', athleteId: 'ra-1', athleteName: 'Deniz Arslan', raceDay: '1. Gün', session: 'Akşam Seansı', heat: '3', lane: '5', estimatedTime: '10:20', distance: '100', stroke: 'Serbest', poolType: '50m', pb: '56.84', targetTime: '55.90' },
  { id: 'entry-3', athleteId: 'ra-1', athleteName: 'Deniz Arslan', raceDay: '2. Gün', session: 'Akşam Seansı', heat: '1', lane: '5', estimatedTime: '18:10', distance: '200', stroke: 'Karışık', poolType: '50m', pb: '2:18.90', targetTime: '2:17.50' },
  { id: 'entry-4', athleteId: 'ra-2', athleteName: 'Ece Yılmaz', raceDay: '1. Gün', session: 'Sabah Seansı', heat: 'Final', lane: '5', estimatedTime: '09:40', distance: '50', stroke: 'Kelebek', poolType: '50m', pb: '28.02', targetTime: '27.80' },
  { id: 'entry-5', athleteId: 'ra-3', athleteName: 'Mert Kaya', raceDay: '2. Gün', session: 'Akşam Seansı', heat: '1', lane: '3', estimatedTime: '17:20', distance: '200', stroke: 'Karışık', poolType: '50m', pb: '2:18.90', targetTime: '2:17.80' },
  { id: 'entry-6', athleteId: 'ra-4', athleteName: 'Zeynep Demir', raceDay: '2. Gün', session: 'Sabah Seansı', heat: '3', lane: '6', estimatedTime: '11:10', distance: '200', stroke: 'Kurbağalama', poolType: '50m', pb: '2:52.40', targetTime: '2:50.90' },
  {
    id: 'entry-relay-1',
    athleteId: 'relay-team-1',
    athleteName: 'SwimLab A Takımı',
    raceKind: 'relay',
    raceDay: '2. Gün',
    session: 'Akşam Seansı',
    heat: '3',
    lane: '5',
    estimatedTime: '18:40',
    distance: '4x100',
    stroke: 'Serbest Bayrak',
    poolType: '50m',
    pb: '3:59.20',
    targetTime: '3:58.00',
    relayType: '4x100m Serbest Bayrak',
    teamName: 'SwimLab A Takımı',
    teamCategory: 'Açık Yaş Erkek',
    relayAthletes: [
      { athleteId: 'ra-1', athleteName: 'Deniz Arslan', order: 1 },
      { athleteId: 'ra-3', athleteName: 'Mert Kaya', order: 2 },
      { athleteId: 'ra-2', athleteName: 'Ece Yılmaz', order: 3 },
      { athleteId: 'ra-4', athleteName: 'Zeynep Demir', order: 4 },
    ],
  },
];

let liveRaceQueueState: LiveRaceEntry[] = competitionRostersState.map(rosterEntryToLiveRace);

export const competitionRosters = competitionRostersState;
export const liveRaceQueue = liveRaceQueueState;
export const liveRaceEntries = liveRaceQueueState;

export function getCompetitionRosterEntries() {
  return [...competitionRostersState];
}

export function getPreparedRosterGroups(): PreparedRosterGroup[] {
  const grouped = competitionRostersState.reduce<Record<string, CompetitionRosterEntry[]>>((acc, entry) => {
    const competitionName = entry.competitionName ?? 'Marmara Cup';
    const date = entry.competitionDate ?? '20.02.2026';
    const key = `${date}-${competitionName}`;
    acc[key] = [...(acc[key] ?? []), entry];
    return acc;
  }, {});

  return Object.entries(grouped).map(([key, entries]) => {
    const first = entries[0];
    const competitionName = first.competitionName ?? 'Marmara Cup';
    const date = first.competitionDate ?? '20.02.2026';
    const athleteIds = new Set(entries.flatMap((entry) => entry.raceKind === 'relay' ? entry.relayAthletes?.map((athlete) => athlete.athleteId) ?? [] : [entry.athleteId]));
    return {
      key,
      title: `${date} ${competitionName} Yarış Listesi`,
      competitionName,
      date,
      location: first.location ?? 'İstanbul',
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

let athleteRaceHistoryState: AthleteRaceResult[] = [
  { id: 'result-1', athleteId: 'ra-1', athleteName: 'Deniz Arslan', competitionName: 'Kulüp Ligi', date: '12.05.2026', raceDay: '1. Gün', location: 'İstanbul', poolType: '25m', session: 'Sabah Seansı', eventName: '100 SF', distance: '100', stroke: 'SF', heat: '2', lane: '4', finalTime: '57.40', splits: ['27.80', '57.40'], coachNote: 'Çıkış güçlü, son 25m ritim korunmalı.', isPB: false, status: 'Geçerli', createdByCoachId: 'coach-1', createdAt: '2026-05-12T09:20:00.000Z' },
  { id: 'result-2', athleteId: 'ra-1', athleteName: 'Deniz Arslan', competitionName: 'Marmara Hazırlık', date: '18.05.2026', raceDay: '1. Gün', location: 'İstanbul', poolType: '50m', session: 'Akşam Seansı', eventName: '50 SF', distance: '50', stroke: 'SF', heat: '1', lane: '4', finalTime: '27.30', splits: ['27.30'], coachNote: 'Yeni PB, finish iyi.', isPB: true, status: 'Geçerli', createdByCoachId: 'coach-1', createdAt: '2026-05-18T18:20:00.000Z' },
];

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
      competitionName: entry.competitionName ?? 'Marmara Cup',
      date: entry.date ?? roster?.competitionDate ?? '10.05.2026',
      raceDay: roster?.raceDay ?? entry.raceDay ?? '1. Gün',
      location: entry.location ?? roster?.location ?? 'İstanbul',
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
    competitionName: entry.competitionName ?? 'Marmara Cup',
    date: entry.date ?? roster?.competitionDate ?? '10.05.2026',
    raceDay: roster?.raceDay ?? entry.raceDay ?? '1. Gün',
    location: entry.location ?? roster?.location ?? 'İstanbul',
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
    competitionName: entry.competitionName ?? 'Marmara Cup',
    date: entry.competitionDate ?? '10.05.2026',
    location: entry.location ?? 'İstanbul',
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
  coach: athlete.coach ?? 'Görkem Pınar',
  lastAttendance: athlete.attendance ?? '90%',
  attendanceStatus: athlete.attendanceStatus ?? 'Katıldı',
  lastPb: athlete.lastPb ?? '-',
  upcomingRace: athlete.upcomingRace ?? '-',
}));

export const attendanceRecords: AttendanceRecord[] = [
  { id: 'att-1', date: '22.05.2026', group: 'Yarış Grubu', athlete: 'Deniz Arslan', status: 'Katıldı', note: 'Tamamladı' },
  { id: 'att-2', date: '22.05.2026', group: 'Performans Grubu', athlete: 'Ece Yılmaz', status: 'Geç Kaldı', note: '10 dk geç' },
  { id: 'att-3', date: '22.05.2026', group: 'Masters', athlete: 'Mert Kaya', status: 'Raporlu', note: 'Sağlık raporu' },
];

export const raceDayItems = [
  { id: 'rd-1', time: '08:00', athlete: 'Takım', event: 'Isınma', lane: '-', heat: '-', status: 'hazır' },
  { id: 'rd-2', time: '09:10', athlete: 'Deniz', event: '100 SF', lane: '4', heat: '2', status: 'PB' },
  { id: 'rd-3', time: '09:40', athlete: 'Ece', event: '50 Fly', lane: '5', heat: 'Final', status: 'madalya' },
];

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
