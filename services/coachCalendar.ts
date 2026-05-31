export type CoachCalendarType = 'Kulüp Antrenmanı' | 'Özel Ders' | 'Yarış' | 'Kamp' | 'Toplantı' | 'Uygun Değilim' | 'Boş Saat';
export type CoachCalendarVisibility = 'Sadece ben' | 'Kulüp üyeleri' | 'Herkes';
export type CoachEventStatus = 'active' | 'blocked' | 'completed';
export type LessonRequestStatus = 'pending' | 'approved' | 'declined';

export type CoachAvailability = {
  coachId: string;
  dayOfWeek: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  location: string;
};

export type CoachCalendarEvent = {
  id: string;
  coachId: string;
  coachName: string;
  type: CoachCalendarType;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  visibility: CoachCalendarVisibility;
  relatedAthleteId?: string;
  groupName?: string;
  note?: string;
  status: CoachEventStatus;
};

export type LessonRequest = {
  id: string;
  coachId: string;
  requesterId: string;
  athleteId?: string;
  requestedDate: string;
  requestedTime: string;
  status: LessonRequestStatus;
  createdAt: string;
};

const availability: CoachAvailability[] = [
  { coachId: 'coach-mert', dayOfWeek: 'Pazartesi', isAvailable: true, startTime: '16:00', endTime: '19:00', location: 'Ana Havuz' },
  { coachId: 'coach-mert', dayOfWeek: 'Salı', isAvailable: true, startTime: '17:00', endTime: '20:00', location: '50m Havuz' },
  { coachId: 'coach-mert', dayOfWeek: 'Çarşamba', isAvailable: false, startTime: '-', endTime: '-', location: 'Kapalı' },
  { coachId: 'coach-mert', dayOfWeek: 'Perşembe', isAvailable: true, startTime: '18:00', endTime: '20:00', location: 'Ana Havuz' },
  { coachId: 'coach-mert', dayOfWeek: 'Cuma', isAvailable: false, startTime: '-', endTime: '-', location: 'Kapalı' },
  { coachId: 'coach-mert', dayOfWeek: 'Cumartesi', isAvailable: true, startTime: '10:00', endTime: '13:00', location: 'Özel Ders' },
  { coachId: 'coach-mert', dayOfWeek: 'Pazar', isAvailable: false, startTime: '-', endTime: '-', location: 'Kapalı' },
];

const events: CoachCalendarEvent[] = [
  {
    id: 'coach-event-1',
    coachId: 'coach-mert',
    coachName: 'Mert Kaya',
    type: 'Kulüp Antrenmanı',
    title: 'Performans Grup Ana Set',
    date: '26.05.2026',
    startTime: '18:00',
    endTime: '20:00',
    location: 'GP Aquatics 50m havuz',
    visibility: 'Kulüp üyeleri',
    groupName: 'Performans Grubu',
    note: 'Ana set + start çalışması',
    status: 'active',
  },
  {
    id: 'coach-event-2',
    coachId: 'coach-mert',
    coachName: 'Mert Kaya',
    type: 'Uygun Değilim',
    title: 'Yarış günü kapalı',
    date: '15.06.2026',
    startTime: '17:00',
    endTime: '18:00',
    location: 'Marmara Cup',
    visibility: 'Herkes',
    note: 'Uygun değil',
    status: 'blocked',
  },
];

const lessonRequests: LessonRequest[] = [];

export function getCoachCalendar(coachId = 'coach-mert') {
  return [...events].filter((event) => event.coachId === coachId).sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
}

export function getCoachAvailability(coachId = 'coach-mert') {
  return availability.filter((item) => item.coachId === coachId);
}

export function createCoachCalendarEvent(event: Omit<CoachCalendarEvent, 'id' | 'status'> & { status?: CoachEventStatus }) {
  const next: CoachCalendarEvent = {
    ...event,
    id: `coach-event-${Date.now()}`,
    status: event.status ?? (event.type === 'Uygun Değilim' ? 'blocked' : 'active'),
  };
  events.unshift(next);
  return next;
}

export function updateCoachAvailability(nextAvailability: CoachAvailability) {
  const index = availability.findIndex((item) => item.coachId === nextAvailability.coachId && item.dayOfWeek === nextAvailability.dayOfWeek);
  if (index >= 0) {
    availability[index] = nextAvailability;
  } else {
    availability.push(nextAvailability);
  }
  return nextAvailability;
}

export function blockCoachTime(event: Omit<CoachCalendarEvent, 'id' | 'type' | 'status'>) {
  return createCoachCalendarEvent({ ...event, type: 'Uygun Değilim', status: 'blocked' });
}

export function requestPrivateLesson(request: Omit<LessonRequest, 'id' | 'status' | 'createdAt'>) {
  const next: LessonRequest = {
    ...request,
    id: `lesson-request-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  lessonRequests.unshift(next);
  return next;
}

export function getLessonRequests(coachId = 'coach-mert') {
  return lessonRequests.filter((request) => request.coachId === coachId);
}
