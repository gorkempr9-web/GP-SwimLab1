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

export const mockCalendarEvents: ClubCalendarEvent[] = [
  { id: 'cal-1', title: 'Sprint tempo', type: 'Antrenman', date: '20.05.2026', day: 'Pazartesi', startTime: '17:30', endTime: '19:00', location: 'Ana Havuz', group: 'Performans Grubu', description: 'Race pace ve start çalışması.', priority: 'Normal', coach: 'Görkem Pınar', seenByMe: false },
  { id: 'cal-2', title: 'Marmara Cup', type: 'Yarış', date: '23.05.2026', day: 'Perşembe', startTime: '09:00', endTime: '18:00', location: 'Olimpik Havuz', group: 'Tüm Kulüp', description: 'Yarış günü programı.', priority: 'Önemli', coach: 'Görkem Pınar', seenByMe: true },
  { id: 'cal-3', title: 'Laktat ölçüm günü', type: 'Ölçüm Günü', date: '25.05.2026', day: 'Cumartesi', startTime: '16:00', endTime: '18:00', location: 'Performans Lab', group: 'Performans Grubu', description: 'Sezon ortası ölçüm.', priority: 'Normal', coach: 'Ekip', seenByMe: false },
  { id: 'cal-4', title: 'Recovery', type: 'Dinlenme Günü', date: '26.05.2026', day: 'Pazar', startTime: 'Tüm gün', endTime: '-', location: 'Ev', group: 'Tüm Kulüp', description: 'Mobilite ve uyku takibi.', priority: 'Normal', coach: 'Görkem Pınar', seenByMe: false },
];

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
