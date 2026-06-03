export const swimmerStats = {
  readiness: 0,
  personalBest: '-',
  weeklyLoad: '-',
  progress: '-',
  attendance: '-',
};

export const nextRace = {
  name: '',
  event: '',
  dateLabel: '',
  readiness: 0,
};

export const workoutPlans: Array<{ id: string; title: string; distance: string; focus: string; time: string; done: boolean }> = [];

export const raceTypes = ['İl Şampiyonası', 'Kulüp Ligi', 'Milli Takım Seçmesi', 'Hazırlık Yarışı'];
export const poolTypes = ['25m', '50m'];
export const raceDistances = ['50', '100', '200', '400', '800', '1500'];
export const swimStyles = ['Serbest', 'Sırt', 'Kurbağa', 'Kelebek', 'Karışık'];

export const races: Array<{
  id: string;
  event: string;
  meet: string;
  type: string;
  date: string;
  pool: string;
  distance: string;
  style: string;
  time: string;
  splits: string[];
  notes: string;
  isPb: boolean;
  improvement: string;
  delta: string;
}> = [];

export const performanceBars: Array<{ week: string; value: number }> = [];

export const nutritionCards: Array<{ id: string; title: string; note: string; status: string; sensitive: boolean }> = [];

export const reminders: Array<{ id: string; title: string; time: string; detail: string }> = [];

export const reportSections = ['Yarış dereceleri', 'Gelişim grafiği', 'AI yorum', 'Antrenör notu', 'Beslenme önerisi'];

export const forumCategories = [
  'Serbest',
  'Sırt',
  'Kurbağa',
  'Kelebek',
  'Karışık',
  'Yarış Hazırlığı',
  'Kara Antrenmanı',
  'Beslenme',
  'Mental Hazırlık',
  'Teknik Video Analizi',
];

export const forumPosts: Array<{ id: string; category: string; title: string; author: string; badge: string; likes: number; comments: number; pb?: string }> = [];

export const videos: Array<{ id: string; title: string; duration: string; tag: string }> = [];

export const coachNotes: Array<{ id: string; title: string; body: string }> = [];

export const clubAds: Array<{ id: string; title: string; body: string }> = [];
