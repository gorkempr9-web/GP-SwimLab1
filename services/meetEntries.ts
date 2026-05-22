export type MeetEntry = {
  id: string;
  meetId: string;
  competitionName: string;
  date: string;
  poolType: string;
  athleteId: string;
  athleteName: string;
  eventType: 'individual' | 'team';
  distance: string;
  stroke: string;
  relayEvent: string;
  seedTime: string;
  pb: string;
  heat: string;
  lane: string;
  coachNote: string;
  status: 'planned' | 'completed' | 'dq' | 'dns';
  resultTime?: string;
  splits?: string[];
  isNewPb?: boolean;
};

let savedMeetEntries: MeetEntry[] = [
  {
    id: 'seed-a1-100-free',
    meetId: 'meet-marmara-cup',
    competitionName: 'Marmara Cup',
    date: '02.06.2026',
    poolType: '50m Uzun Kulvar',
    athleteId: 'a1',
    athleteName: 'Deniz Arslan',
    eventType: 'individual',
    distance: '100m',
    stroke: 'Serbest',
    relayEvent: '',
    seedTime: '56.84',
    pb: '56.84',
    heat: '3',
    lane: '5',
    coachNote: 'Son 25m temposuna dikkat.',
    status: 'planned',
    resultTime: '',
    splits: [],
    isNewPb: false,
  },
];

export function getMeetEntries() {
  return savedMeetEntries;
}

export function saveMeetEntries(entries: MeetEntry[]) {
  savedMeetEntries = entries;
  return savedMeetEntries;
}

export function updateMeetEntry(id: string, patch: Partial<MeetEntry>) {
  savedMeetEntries = savedMeetEntries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
  return savedMeetEntries.find((entry) => entry.id === id);
}

export function clearMeetEntries() {
  savedMeetEntries = [];
}

export function getEntriesForAthlete(athleteId: string) {
  return savedMeetEntries.filter((entry) => entry.athleteId === athleteId);
}

export function getUpcomingMeetEntryForRole(role: string) {
  if (role === 'parent') {
    return savedMeetEntries[0];
  }

  if (role === 'athlete') {
    return savedMeetEntries.find((entry) => entry.athleteId === 'a1') ?? savedMeetEntries[0];
  }

  return undefined;
}
