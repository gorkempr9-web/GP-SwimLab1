export const swimmerStats = {
  readiness: 87,
  personalBest: '56.84',
  weeklyLoad: '42 km',
  progress: '+4.7%',
  attendance: '92%',
};

export const nextRace = {
  name: 'Marmara Cup',
  event: '100m Serbest',
  dateLabel: '18 gün kaldı',
  readiness: 87,
};

export const workoutPlans = [
  { id: 'w1', title: 'Sprint Tempo', distance: '5.2 km', focus: 'Race pace', time: '06:30', done: true },
  { id: 'w2', title: 'Teknik Drill', distance: '3.8 km', focus: 'Catch phase', time: '18:00', done: false },
  { id: 'w3', title: 'Aerobik Dayanıklılık', distance: '7.4 km', focus: 'Negative split', time: '07:00', done: false },
];

export const raceTypes = ['İl Şampiyonası', 'Kulüp Ligi', 'Milli Takım Seçmesi', 'Hazırlık Yarışı'];
export const poolTypes = ['25m', '50m'];
export const raceDistances = ['50', '100', '200', '400', '800', '1500'];
export const swimStyles = ['Serbest', 'Sırt', 'Kurbağa', 'Kelebek', 'Karışık'];

export const races = [
  {
    id: 'r1',
    event: '100m Serbest',
    meet: 'İstanbul İl Şampiyonası',
    type: 'İl Şampiyonası',
    date: '12 Mayıs 2026',
    pool: '50m',
    distance: '100',
    style: 'Serbest',
    time: '56.84',
    splits: ['27.42', '29.42'],
    notes: 'İkinci 50m güçlü, dönüş çıkışı daha iyi.',
    isPb: true,
    improvement: '+4.7%',
    delta: '',
  },
  {
    id: 'r2',
    event: '50m Kelebek',
    meet: 'Marmara Cup',
    type: 'Hazırlık Yarışı',
    date: '26 Nisan 2026',
    pool: '25m',
    distance: '50',
    style: 'Kelebek',
    time: '27.41',
    splits: ['13.20', '14.21'],
    notes: 'Son 15m stroke ritmi korunmalı.',
    isPb: false,
    improvement: '+1.8%',
    delta: '+0.22',
  },
  {
    id: 'r3',
    event: '200m Karışık',
    meet: 'Kulüp Ligi',
    type: 'Kulüp Ligi',
    date: '9 Nisan 2026',
    pool: '50m',
    distance: '200',
    style: 'Karışık',
    time: '2:16.02',
    splits: ['31.10', '35.80', '38.20', '30.92'],
    notes: 'Kurbağa bölümünde tempo sabit kaldı.',
    isPb: true,
    improvement: '+3.2%',
    delta: '',
  },
];

export const performanceBars = [
  { week: 'W1', value: 142 },
  { week: 'W2', value: 132 },
  { week: 'W3', value: 126 },
  { week: 'W4', value: 118 },
  { week: 'W5', value: 110 },
  { week: 'W6', value: 102 },
];

export const nutritionCards = [
  { id: 'n1', title: 'Günlük öğün planı', note: 'Antrenman günleri kahvaltıda kompleks karbonhidrat ve 20g protein hedefle.', status: 'Aktif', sensitive: true },
  { id: 'n2', title: 'Recovery öğünü', note: 'Ana setten sonraki 45 dakikada yoğurt, muz ve elektrolit kombinasyonu.', status: 'Bugün', sensitive: true },
  { id: 'n3', title: 'Su takibi', note: 'Sabah, antrenman öncesi ve yatmadan önce hidrasyon kontrolü.', status: '2.4 L', sensitive: true },
  { id: 'n4', title: 'Yarış dönemi beslenmesi', note: 'Yarıştan 36 saat önce porsiyonları artır, lif yükünü azalt.', status: 'Planlı', sensitive: true },
];

export const reminders = [
  { id: 'm1', title: 'Antrenman', time: 'Bugün 18:00', detail: 'Sprint tempo + start çalışması' },
  { id: 'm2', title: 'Su', time: 'Her 2 saatte', detail: 'Hidrasyon kontrolü' },
  { id: 'm3', title: 'Uyku', time: '22:30', detail: '8 saat hedef' },
  { id: 'm4', title: 'Stretching', time: 'Antrenman sonrası', detail: 'Omuz ve kalça mobilitesi' },
  { id: 'm5', title: 'Yarış', time: '18 gün', detail: 'Marmara Cup countdown' },
];

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

export const forumPosts = [
  { id: 'f1', category: 'Serbest', title: '100m Serbest PB paylaşımı', author: 'Deniz Arslan', badge: 'Haftanın sporcusu', likes: 24, comments: 8, pb: '56.84' },
  { id: 'f2', category: 'Yarış Hazırlığı', title: 'Yarış sabahı ısınma rutini', author: 'Koç Mert', badge: 'Antrenör', likes: 31, comments: 12 },
  { id: 'f3', category: 'Beslenme', title: 'Recovery öğünü fikirleri', author: 'GP Aquatics', badge: 'Kulüp', likes: 18, comments: 5 },
];

export const videos = [
  { id: 'v1', title: 'Start çıkış analizi', duration: '03:18', tag: 'Start' },
  { id: 'v2', title: 'Serbest stil catch fazı', duration: '05:42', tag: 'Teknik' },
  { id: 'v3', title: 'Dönüş ve su altı tempo', duration: '04:10', tag: 'Turn' },
];

export const coachNotes = [
  { id: 'c1', title: 'Yarış haftası odağı', body: 'Ana setlerde kalite korunacak, toplam hacim %18 azaltılacak.' },
  { id: 'c2', title: 'Teknik not', body: 'Sol nefeste baş pozisyonu yükseliyor; video drill ile takip.' },
];

export const clubAds = [
  { id: 'a1', title: 'GP Aquatics Yaz Kampı', body: 'Elite grup için 14 günlük yüksek performans kampı.' },
  { id: 'a2', title: 'Sponsor ekipman indirimi', body: 'Kulüp sporcularına özel yarış mayo avantajı.' },
];
