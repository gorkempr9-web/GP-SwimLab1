import { ClubGroup, ClubPriority } from './clubBoard';

export type CalendarEventType = 'Antrenman' | 'Yarış' | 'Kamp' | 'Ölçüm Günü' | 'Veli Toplantısı' | 'Dinlenme Günü';

export type ClubCalendarEvent = {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  group: ClubGroup;
  description: string;
  priority: ClubPriority;
  coach: string;
  seenByMe: boolean;
};

export const eventAccentColors: Record<CalendarEventType | 'Acil', string> = {
  Antrenman: '#21E6F3',
  Yarış: '#FBBF24',
  Kamp: '#A78BFA',
  'Ölçüm Günü': '#60A5FA',
  'Veli Toplantısı': '#34D399',
  'Dinlenme Günü': '#94A3B8',
  Acil: '#FB7185',
};

export const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export const mockCalendarEvents: ClubCalendarEvent[] = [];

export async function createCalendarEvent(event: Omit<ClubCalendarEvent, 'id' | 'seenByMe'>) {
  return {
    ...event,
    id: `cal-${Date.now()}`,
    seenByMe: false,
  };
}

export async function planEventReminder() {
  return 'Bu etkinlik için hatırlatma planlandı.';
}



