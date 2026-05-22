export type TrainingStatus = 'planned' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
export type TrainingType = 'Teknik' | 'Sprint' | 'Dayanıklılık' | 'Yarış Pace' | 'Recovery' | 'Kara Antrenmanı' | 'Mobilite';
export type TrainingGroup = 'Tüm kulüp' | 'Performans grubu' | 'Küçük yaş grubu' | 'Yarış takımı' | 'Belirli sporcular';
export type TrainingSection = 'Isınma' | 'Drill' | 'Ana Set' | 'Sprint Seti' | 'Teknik Odak' | 'Kara Antrenmanı' | 'Soğuma';

export type TrainingSet = {
  id: string;
  section: TrainingSection;
  repeat: number;
  distance: number;
  stroke: string;
  interval: string;
  intensity: string;
  equipment: string;
  note: string;
  calculatedMeters: number;
};

export type TrainingPlan = {
  planId: string;
  title: string;
  date: string;
  day: string;
  time: string;
  group: TrainingGroup;
  type: TrainingType;
  pool: '25m' | '50m';
  totalMeters: string;
  duration: string;
  difficulty: number;
  sections: {
    warmup: string;
    mainSet: string;
    drills: string;
    sprint: string;
    techniqueFocus: string;
    dryland: string;
    cooldown: string;
    coachNote: string;
  };
  sets: TrainingSet[];
  totalSetCount: number;
  sprintMeters: number;
  techniqueMeters: number;
  enduranceMeters: number;
  assignedAthletes: Array<{ athleteId: string; name: string; group: string }>;
  statusByAthlete: Record<string, { status: TrainingStatus; completedAt?: string }>;
  feedbackByAthlete: Record<string, { difficulty: number; feeling: string; note: string }>;
  coachNotesByAthlete: Record<string, string>;
};

export const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const defaultAthletes = [
  { athleteId: 'a1', name: 'Deniz Arslan', group: 'Yarış takımı' },
  { athleteId: 'a2', name: 'Ece Yılmaz', group: 'Performans grubu' },
  { athleteId: 'a3', name: 'Mert Kaya', group: 'Performans grubu' },
  { athleteId: 'a4', name: 'Zeynep Demir', group: 'Küçük yaş grubu' },
];

let trainingPlans: TrainingPlan[] = [
  {
    planId: 'tp-1',
    title: 'Race Pace Sprint',
    date: '21.05.2026',
    day: 'Perşembe',
    time: '18:00',
    group: 'Yarış takımı',
    type: 'Yarış Pace',
    pool: '50m',
    totalMeters: '5200m',
    duration: '85 dk',
    difficulty: 8,
    sections: {
      warmup: '400 serbest + 200 ayak + 4x50 drill',
      mainSet: '8x100 serbest @1:40',
      drills: '6x50 catch drill',
      sprint: '6x50 sprint @1:20',
      techniqueFocus: 'Son 15m tempo ve nefes kontrolü',
      dryland: 'Core aktivasyon 12 dk',
      cooldown: '200 kolay',
      coachNote: 'Ana sette kalite korunacak, split takibi yapılacak.',
    },
    sets: [
      { id: 's1', section: 'Isınma', repeat: 4, distance: 100, stroke: 'Serbest', interval: '@1:40', intensity: 'Orta', equipment: 'Yok', note: '', calculatedMeters: 400 },
      { id: 's2', section: 'Drill', repeat: 8, distance: 50, stroke: 'Catch-up Drill', interval: '@1:10', intensity: 'Kolay', equipment: 'Yok', note: 'Uzun kulaç', calculatedMeters: 400 },
      { id: 's3', section: 'Ana Set', repeat: 8, distance: 100, stroke: 'Serbest', interval: '@1:30', intensity: 'Race Pace', equipment: 'Yok', note: '', calculatedMeters: 800 },
      { id: 's4', section: 'Sprint Seti', repeat: 6, distance: 25, stroke: 'Sprint', interval: '@0:45', intensity: 'Sprint', equipment: 'Palet', note: 'Çıkış hızlı', calculatedMeters: 150 },
      { id: 's5', section: 'Soğuma', repeat: 1, distance: 200, stroke: 'Kolay', interval: '', intensity: 'Kolay', equipment: 'Yok', note: '', calculatedMeters: 200 },
    ],
    totalSetCount: 5,
    sprintMeters: 150,
    techniqueMeters: 400,
    enduranceMeters: 1400,
    assignedAthletes: defaultAthletes.slice(0, 3),
    statusByAthlete: {
      a1: { status: 'planned' },
      a2: { status: 'planned' },
      a3: { status: 'missed' },
    },
    feedbackByAthlete: {},
    coachNotesByAthlete: {},
  },
  {
    planId: 'tp-2',
    title: 'Teknik Drill',
    date: '23.05.2026',
    day: 'Cumartesi',
    time: '09:30',
    group: 'Performans grubu',
    type: 'Teknik',
    pool: '25m',
    totalMeters: '3600m',
    duration: '70 dk',
    difficulty: 6,
    sections: {
      warmup: '300 kolay + 8x25 scull',
      mainSet: '12x75 teknik tempo',
      drills: 'Catch, fingertip drag, tek kol serbest',
      sprint: '4x25 hızlı çıkış',
      techniqueFocus: 'Dirsek yüksekliği ve su yakalama',
      dryland: 'Omuz mobilite 10 dk',
      cooldown: '150 kolay',
      coachNote: 'Video analizi için 2 seri kayıt alınacak.',
    },
    sets: [
      { id: 's6', section: 'Isınma', repeat: 3, distance: 100, stroke: 'Kolay', interval: '@1:50', intensity: 'Kolay', equipment: 'Yok', note: '', calculatedMeters: 300 },
      { id: 's7', section: 'Drill', repeat: 10, distance: 50, stroke: 'Fingertip drag', interval: '@1:05', intensity: 'Kolay', equipment: 'Şnorkel', note: 'Baş sabit', calculatedMeters: 500 },
      { id: 's8', section: 'Ana Set', repeat: 12, distance: 75, stroke: 'Serbest', interval: '@1:20', intensity: 'Orta', equipment: 'Yok', note: '', calculatedMeters: 900 },
      { id: 's9', section: 'Soğuma', repeat: 1, distance: 150, stroke: 'Kolay', interval: '', intensity: 'Kolay', equipment: 'Yok', note: '', calculatedMeters: 150 },
    ],
    totalSetCount: 4,
    sprintMeters: 0,
    techniqueMeters: 500,
    enduranceMeters: 1350,
    assignedAthletes: defaultAthletes,
    statusByAthlete: {
      a1: { status: 'planned' },
      a2: { status: 'planned' },
      a3: { status: 'planned' },
      a4: { status: 'planned' },
    },
    feedbackByAthlete: {},
    coachNotesByAthlete: {},
  },
];

export function getTrainingPlans() {
  return trainingPlans;
}

export function createTrainingPlan(input: Omit<TrainingPlan, 'planId' | 'assignedAthletes' | 'statusByAthlete' | 'feedbackByAthlete' | 'coachNotesByAthlete'>) {
  const assignedAthletes = input.group === 'Küçük yaş grubu' ? defaultAthletes.filter((athlete) => athlete.group === 'Küçük yaş grubu') : input.group === 'Belirli sporcular' ? defaultAthletes.slice(0, 1) : defaultAthletes;
  const statusByAthlete = assignedAthletes.reduce<TrainingPlan['statusByAthlete']>((acc, athlete) => {
    acc[athlete.athleteId] = { status: 'planned' };
    return acc;
  }, {});
  const plan: TrainingPlan = {
    ...input,
    planId: `tp-${Date.now()}`,
    assignedAthletes,
    statusByAthlete,
    feedbackByAthlete: {},
    coachNotesByAthlete: {},
  };
  trainingPlans = [plan, ...trainingPlans];
  return plan;
}

export function summarizeTrainingSets(sets: TrainingSet[]) {
  const totalMeters = sets.reduce((sum, set) => sum + set.calculatedMeters, 0);
  const sprintMeters = sets.filter((set) => set.intensity === 'Sprint' || set.intensity === 'Race Pace' || set.section === 'Sprint Seti').reduce((sum, set) => sum + set.calculatedMeters, 0);
  const techniqueMeters = sets.filter((set) => set.section === 'Drill' || set.section === 'Teknik Odak' || set.stroke.includes('Drill')).reduce((sum, set) => sum + set.calculatedMeters, 0);
  const enduranceMeters = Math.max(totalMeters - sprintMeters - techniqueMeters, 0);
  const estimatedDuration = `${Math.max(35, Math.round(totalMeters / 55))} dk`;
  return { totalMeters, totalSetCount: sets.length, sprintMeters, techniqueMeters, enduranceMeters, estimatedDuration };
}

export function formatTrainingSet(set: TrainingSet) {
  const interval = set.interval ? ` ${set.interval}` : '';
  const equipment = set.equipment && set.equipment !== 'Yok' ? ` - ${set.equipment}` : '';
  const note = set.note ? `\nNot: ${set.note}` : '';
  return `${set.repeat} x ${set.distance}m ${set.stroke}${interval} - ${set.intensity}${equipment}${note}`;
}

export function updateAthleteTrainingStatus(planId: string, athleteId: string, status: TrainingStatus, feedback?: { difficulty: number; feeling: string; note: string }) {
  const completedAt = status === 'completed' ? new Date().toISOString() : undefined;
  trainingPlans = trainingPlans.map((plan) => {
    if (plan.planId !== planId) return plan;
    return {
      ...plan,
      statusByAthlete: { ...plan.statusByAthlete, [athleteId]: { status, completedAt } },
      feedbackByAthlete: feedback ? { ...plan.feedbackByAthlete, [athleteId]: feedback } : plan.feedbackByAthlete,
    };
  });
}

export function updateCoachNote(planId: string, athleteId: string, note: string) {
  trainingPlans = trainingPlans.map((plan) => (plan.planId === planId ? { ...plan, coachNotesByAthlete: { ...plan.coachNotesByAthlete, [athleteId]: note } } : plan));
}

export function cancelTrainingPlan(planId: string) {
  trainingPlans = trainingPlans.map((plan) => ({
    ...plan,
    statusByAthlete: plan.planId === planId
      ? Object.fromEntries(Object.entries(plan.statusByAthlete).map(([athleteId, value]) => [athleteId, { ...value, status: 'cancelled' as TrainingStatus }]))
      : plan.statusByAthlete,
  }));
}

export function getPlanSummary(plan: TrainingPlan) {
  const statuses = Object.values(plan.statusByAthlete);
  const completed = statuses.filter((item) => item.status === 'completed').length;
  const missed = statuses.filter((item) => item.status === 'missed').length;
  const feedbacks = Object.values(plan.feedbackByAthlete);
  const averageDifficulty = feedbacks.length ? Math.round((feedbacks.reduce((sum, item) => sum + item.difficulty, 0) / feedbacks.length) * 10) / 10 : 0;
  return {
    total: plan.assignedAthletes.length,
    completed,
    notCompleted: plan.assignedAthletes.length - completed,
    missed,
    averageDifficulty,
  };
}

export function getTrainingDashboardSummary(role: string) {
  const today = trainingPlans[0];
  const summary = getPlanSummary(today);
  if (role === 'coach') return `${summary.completed}/${summary.total} tamamladı`;
  if (role === 'club_admin') return `${trainingPlans.length} plan`;
  if (role === 'parent') return statusLabel(today.statusByAthlete.a1?.status ?? 'planned');
  return statusLabel(today.statusByAthlete.a1?.status ?? 'planned');
}

export function statusLabel(status: TrainingStatus) {
  const labels: Record<TrainingStatus, string> = {
    planned: 'Planlandı',
    in_progress: 'Devam Ediyor',
    completed: 'Tamamlandı',
    missed: 'Yapılmadı',
    cancelled: 'İptal',
  };
  return labels[status];
}

export async function generateTrainingPlanPdf() {
  return {
    success: true,
    message: 'Antrenman planı PDF olarak hazırlandı',
    rows: trainingPlans,
  };
}
