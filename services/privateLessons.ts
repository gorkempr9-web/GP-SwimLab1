export type PrivateLessonStatus = 'available' | 'closed' | 'booked' | 'private_lesson' | 'training' | 'race';
export type LessonRequestStatus = 'pending' | 'approved' | 'rejected';

export type PrivateLessonSlot = {
  id: string;
  date: string;
  dayLabel: string;
  startTime: string;
  endTime: string;
  status: PrivateLessonStatus;
  note?: string;
  athleteName?: string;
  lessonType?: string;
};

export type PrivateLessonRequest = {
  id: string;
  slotId: string;
  requesterName: string;
  athleteName: string;
  date: string;
  time: string;
  status: LessonRequestStatus;
};

const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const hours = Array.from({ length: 17 }, (_, index) => `${String(index + 6).padStart(2, '0')}:00`);

let slots = buildInitialSlots();

const requests: PrivateLessonRequest[] = [
  { id: 'plr-1', slotId: 'seed-1', requesterName: 'Pilot Veli', athleteName: 'Pilot Sporcu', date: '2026-06-03', time: '17:00 - 18:00', status: 'pending' },
  { id: 'plr-2', slotId: 'seed-2', requesterName: 'Pilot Sporcu', athleteName: 'Pilot Sporcu', date: '2026-06-05', time: '18:00 - 19:00', status: 'approved' },
];

export function getMonthlyCalendar(year: number, month: number) {
  return buildMonthDays(year, month).map((day) => ({
    ...day,
    slots: slots.filter((slot) => slot.date === day.date),
  }));
}

export function getWeeklySlots(startDate: string) {
  const start = parseDate(startDate);
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return formatDate(date);
  });
  ensureSlotsForDates(weekDates);
  return weekDates.map((date) => ({
    date,
    dayLabel: getDayLabel(date),
    slots: hours.map((hour) => getOrCreateSlot(date, hour)),
  }));
}

export function getDailySlots(date: string) {
  ensureSlotsForDates([date]);
  return hours.map((hour) => getOrCreateSlot(date, hour));
}

export function updateSlotStatus(slotId: string, status: PrivateLessonStatus, note?: string) {
  const slot = slots.find((item) => item.id === slotId);
  if (!slot) return null;
  slot.status = status;
  slot.note = note ?? slot.note;
  if (status === 'private_lesson') {
    slot.lessonType = 'Özel Ders';
    slot.athleteName = slot.athleteName ?? 'Mock Sporcu';
  }
  if (status === 'available') {
    slot.athleteName = undefined;
    slot.lessonType = undefined;
    slot.note = note;
  }
  return slot;
}

export function requestPrivateLesson(slotId: string, requesterName = 'Pilot Kullanıcı', athleteName = 'Pilot Sporcu') {
  const slot = slots.find((item) => item.id === slotId);
  if (!slot) return null;
  const next: PrivateLessonRequest = {
    id: `plr-${Date.now()}`,
    slotId,
    requesterName,
    athleteName,
    date: slot.date,
    time: `${slot.startTime} - ${slot.endTime}`,
    status: 'pending',
  };
  requests.unshift(next);
  slot.status = 'booked';
  slot.athleteName = athleteName;
  slot.lessonType = 'Talep alındı';
  return next;
}

export function approveLessonRequest(id: string) {
  const request = requests.find((item) => item.id === id);
  if (!request) return null;
  request.status = 'approved';
  updateSlotStatus(request.slotId, 'private_lesson', 'Talep onaylandı');
  return request;
}

export function rejectLessonRequest(id: string) {
  const request = requests.find((item) => item.id === id);
  if (!request) return null;
  request.status = 'rejected';
  updateSlotStatus(request.slotId, 'available', 'Talep reddedildi');
  return request;
}

export function getLessonRequests() {
  return [...requests];
}

export function getWeekStart(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return formatDate(next);
}

export function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function buildInitialSlots() {
  const baseDates = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07'];
  const initial: PrivateLessonSlot[] = [];
  baseDates.forEach((date) => {
    hours.forEach((hour) => {
      initial.push(makeSlot(date, hour, defaultStatus(date, hour)));
    });
  });
  const seeded = [
    { date: '2026-06-03', hour: '17:00', status: 'private_lesson' as const, athleteName: 'Pilot Sporcu', note: 'Teknik gelişim', lessonType: 'Özel Ders' },
    { date: '2026-06-05', hour: '18:00', status: 'training' as const, note: 'Kulüp antrenmanı', lessonType: 'Antrenman' },
    { date: '2026-06-06', hour: '10:00', status: 'race' as const, note: 'Yarış günü', lessonType: 'Yarış' },
  ];
  seeded.forEach((seed) => {
    const slot = initial.find((item) => item.date === seed.date && item.startTime === seed.hour);
    if (slot) Object.assign(slot, seed);
  });
  return initial;
}

function buildMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const firstDay = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - firstDay + 1;
    const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
    const date = new Date(year, month, inMonth ? dayNumber : 1);
    return {
      date: inMonth ? formatDate(date) : `empty-${index}`,
      dayNumber: inMonth ? dayNumber : 0,
      inMonth,
      dayLabel: inMonth ? getDayLabel(formatDate(date)) : '',
    };
  });
}

function ensureSlotsForDates(dates: string[]) {
  dates.forEach((date) => {
    hours.forEach((hour) => getOrCreateSlot(date, hour));
  });
}

function getOrCreateSlot(date: string, hour: string) {
  let slot = slots.find((item) => item.date === date && item.startTime === hour);
  if (!slot) {
    slot = makeSlot(date, hour, defaultStatus(date, hour));
    slots.push(slot);
  }
  return slot;
}

function makeSlot(date: string, startTime: string, status: PrivateLessonStatus): PrivateLessonSlot {
  const endHour = String(Number(startTime.slice(0, 2)) + 1).padStart(2, '0');
  return {
    id: `slot-${date}-${startTime}`,
    date,
    dayLabel: getDayLabel(date),
    startTime,
    endTime: `${endHour}:00`,
    status,
    note: status === 'closed' ? 'Uygun değil' : status === 'available' ? 'Müsait Özel ders saati' : undefined,
  };
}

function defaultStatus(date: string, hour: string): PrivateLessonStatus {
  const day = parseDate(date).getDay();
  const hourNumber = Number(hour.slice(0, 2));
  if (day === 0 || hourNumber < 9) return 'closed';
  if (hourNumber >= 16 && hourNumber <= 20) return 'available';
  if (hourNumber === 15) return 'booked';
  return 'closed';
}

function getDayLabel(date: string) {
  return dayNames[parseDate(date).getDay()];
}
