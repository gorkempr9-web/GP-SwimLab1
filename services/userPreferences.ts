import { BellRing, BrainCircuit, CalendarClock, ClipboardList, Dumbbell, FileText, Gauge, LucideIcon, ShieldCheck, Trophy, Users } from 'lucide-react-native';
import { UserRole } from '@/services/session';

export type QuickActionId =
  | 'add-result'
  | 'my-pbs'
  | 'training-plan'
  | 'training-log'
  | 'ai-coach'
  | 'pdf-report'
  | 'notifications'
  | 'live-entry'
  | 'competition-roster'
  | 'athlete-compare'
  | 'private-lesson-calendar'
  | 'athlete-reports'
  | 'club-board'
  | 'club-calendar'
  | 'invite-codes'
  | 'club-reports'
  | 'tyf-calendar'
  | 'athlete-report'
  | 'private-lesson-request'
  | 'athlete-search'
  | 'swim-academy'
  | 'admin-panel'
  | 'admin-clubs'
  | 'admin-users'
  | 'admin-demo-data'
  | 'admin-system';

export type QuickAction = {
  id: QuickActionId;
  title: string;
  route: string;
  icon: LucideIcon;
};

const allActions: Record<QuickActionId, QuickAction> = {
  'add-result': { id: 'add-result', title: 'Derece Ekle', route: '/(tabs)/races', icon: Trophy },
  'my-pbs': { id: 'my-pbs', title: "PB'lerim", route: '/(tabs)/races', icon: Gauge },
  'training-plan': { id: 'training-plan', title: 'Antrenman Planı', route: '/(tabs)/plans', icon: Dumbbell },
  'training-log': { id: 'training-log', title: 'Antrenman Günlüğüm', route: '/features/training-log', icon: CalendarClock },
  'ai-coach': { id: 'ai-coach', title: 'AI Koç', route: '/features/ai-coach', icon: BrainCircuit },
  'pdf-report': { id: 'pdf-report', title: 'PDF Rapor', route: '/features/reports', icon: FileText },
  notifications: { id: 'notifications', title: 'Bildirimler', route: '/features/notifications', icon: BellRing },
  'live-entry': { id: 'live-entry', title: 'Canlı Yarış Girişi', route: '/features/live-race', icon: Gauge },
  'competition-roster': { id: 'competition-roster', title: 'Yarış Takım Listesi', route: '/features/competition-roster', icon: ClipboardList },
  'athlete-compare': { id: 'athlete-compare', title: 'Sporcu Karşılaştır', route: '/features/athlete-compare', icon: Users },
  'private-lesson-calendar': { id: 'private-lesson-calendar', title: 'Özel Ders Takvimi', route: '/features/private-lessons', icon: CalendarClock },
  'athlete-reports': { id: 'athlete-reports', title: 'Sporcu Raporları', route: '/features/reports', icon: FileText },
  'club-board': { id: 'club-board', title: 'Kulüp Panosu', route: '/(tabs)/club', icon: ClipboardList },
  'club-calendar': { id: 'club-calendar', title: 'Kulüp Takvimi', route: '/features/club-calendar', icon: CalendarClock },
  'invite-codes': { id: 'invite-codes', title: 'Davet Kodları', route: '/features/club-profile', icon: Users },
  'club-reports': { id: 'club-reports', title: 'Kulüp Raporları', route: '/features/reports', icon: FileText },
  'tyf-calendar': { id: 'tyf-calendar', title: 'TYF Panelleri', route: '/features/tyf-portal', icon: CalendarClock },
  'athlete-report': { id: 'athlete-report', title: 'Sporcu Raporu', route: '/features/reports', icon: FileText },
  'private-lesson-request': { id: 'private-lesson-request', title: 'Özel Ders Talebi', route: '/features/private-lessons', icon: CalendarClock },
  'athlete-search': { id: 'athlete-search', title: 'Sporcu Ara', route: '/features/search', icon: Users },
  'swim-academy': { id: 'swim-academy', title: 'Swim Academy', route: '/features/swim-academy', icon: FileText },
  'admin-panel': { id: 'admin-panel', title: 'Admin Paneli', route: '/features/admin-panel', icon: ShieldCheck },
  'admin-clubs': { id: 'admin-clubs', title: 'Kulüpler', route: '/features/admin-panel', icon: ClipboardList },
  'admin-users': { id: 'admin-users', title: 'Kullanıcılar', route: '/features/admin-panel', icon: Users },
  'admin-demo-data': { id: 'admin-demo-data', title: 'Demo Verileri', route: '/features/admin-panel', icon: ShieldCheck },
  'admin-system': { id: 'admin-system', title: 'Sistem Durumu', route: '/features/admin-panel', icon: Gauge },
};

let quickActionPrefs: Partial<Record<UserRole, QuickActionId[]>> = {};

export function getDefaultQuickActionsByRole(role: UserRole): QuickAction[] {
  const ids: Record<UserRole, QuickActionId[]> = {
    athlete: ['add-result', 'my-pbs', 'swim-academy', 'ai-coach', 'pdf-report', 'notifications'],
    coach: ['training-plan', 'training-log', 'live-entry', 'competition-roster', 'swim-academy', 'notifications'],
    club_admin: ['training-plan', 'training-log', 'club-board', 'club-calendar', 'swim-academy', 'notifications'],
    super_admin: ['admin-panel', 'admin-clubs', 'admin-users', 'admin-demo-data', 'admin-system'],
    parent: ['notifications', 'swim-academy', 'club-calendar', 'athlete-report', 'private-lesson-request', 'pdf-report'],
  };
  return ids[role].map((id) => allActions[id]);
}

export function getQuickActions(role: UserRole): QuickAction[] {
  const saved = quickActionPrefs[role];
  if (!saved?.length) return getDefaultQuickActionsByRole(role);
  return saved.slice(0, 6).map((id) => allActions[id]).filter(Boolean);
}

export function saveQuickActions(role: UserRole, actionIds: QuickActionId[]) {
  quickActionPrefs = { ...quickActionPrefs, [role]: actionIds.slice(0, 6) };
  return getQuickActions(role);
}

export function resetQuickActions(role: UserRole) {
  const next = { ...quickActionPrefs };
  delete next[role];
  quickActionPrefs = next;
  return getDefaultQuickActionsByRole(role);
}

export function getAvailableQuickActions(role: UserRole) {
  const defaults = getDefaultQuickActionsByRole(role);
  const extra = role === 'super_admin'
    ? [allActions['admin-panel'], allActions['admin-clubs'], allActions['admin-users'], allActions['admin-demo-data'], allActions['admin-system']]
    : role === 'athlete' || role === 'parent'
    ? [allActions['swim-academy'], allActions['athlete-search'], allActions['tyf-calendar'], allActions['private-lesson-request']]
    : [allActions['training-plan'], allActions['training-log'], allActions['swim-academy'], allActions['athlete-search'], allActions['tyf-calendar'], allActions['club-calendar'], allActions['private-lesson-calendar']];
  return [...defaults, ...extra].filter((action, index, list) => list.findIndex((item) => item.id === action.id) === index);
}
