import Constants from 'expo-constants';
import { joinClubByCode } from '@/services/invitations';
import { CurrentUser } from '@/services/session';

export type MockLoginResult = { success: true; user: CurrentUser } | { success: false; message: string };
export type DemoLoginRole = 'athlete' | 'parent' | 'coach' | 'club_admin';

export type RegisterUserData = {
  fullName: string;
  role: CurrentUser['role'];
  club?: string;
  email?: string;
  phone?: string;
  childName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  specialty?: string;
};

export const validInviteCodes = ['GP-MEV001', 'MEV-PERF', 'COACH-MEV', 'ATH-MEV', 'PAR-MEV', 'GP-BCSK001', 'BCSK-PERF', 'COACH-BCSK', 'ATH-BCSK', 'PAR-BCSK'];

const userStorageKey = 'gp-swimlab-current-user';
const roleStorageKey = 'gp-swimlab-current-role';
let asyncStorageModule: typeof import('@react-native-async-storage/async-storage').default | null = null;

const mockCredentials: Record<string, { password: string; user: CurrentUser }> = {
  admin: {
    password: 'admin',
    user: {
      id: 'pilot-admin-gorkem',
      firstName: 'Pilot',
      lastName: 'Admin',
      role: 'club_admin',
      club: 'SwimLab Pilot',
      specialty: 'Pilot yönetimi',
      email: 'admin@swimlab.pilot',
      hasSeenAppGuide: false,
      profileCreated: false,
    },
  },
  coach: {
    password: '1234',
    user: {
      id: 'pilot-coach',
      firstName: 'Pilot',
      lastName: 'Antrenör',
      role: 'coach',
      club: 'SwimLab Pilot',
      specialty: 'Yüzme antrenörü',
      email: 'coach@swimlab.pilot',
      hasSeenAppGuide: false,
      profileCreated: false,
    },
  },
  athlete: {
    password: '1234',
    user: {
      id: 'pilot-athlete',
      firstName: 'Pilot',
      lastName: 'Sporcu',
      role: 'athlete',
      club: 'SwimLab Pilot',
      specialty: 'Profil oluşturulacak',
      email: 'athlete@swimlab.pilot',
      hasSeenAppGuide: false,
      profileCreated: false,
    },
  },
  parent: {
    password: '1234',
    user: {
      id: 'pilot-parent',
      firstName: 'Pilot',
      lastName: 'Veli',
      role: 'parent',
      club: 'SwimLab Pilot',
      childAthleteId: 'pilot-athlete',
      childName: 'Profil oluşturulacak',
      email: 'parent@swimlab.pilot',
      hasSeenAppGuide: false,
      profileCreated: false,
    },
  },
};

async function getAsyncStorage() {
  if (asyncStorageModule) return asyncStorageModule;
  const module = await import('@react-native-async-storage/async-storage');
  asyncStorageModule = module.default;
  return asyncStorageModule;
}

export async function loginWithMockCredentials(username: string, password: string): Promise<MockLoginResult> {
  const key = username.trim().toLowerCase();
  const credential = mockCredentials[key];

  if (!credential || credential.password !== password.trim()) {
    return { success: false, message: 'Giriş bilgileri hatalı' };
  }

  return { success: true, user: credential.user };
}

export function isDemoLoginEnabled() {
  return Boolean(Constants.expoConfig?.extra?.enableDemoLogin === true);
}

export function createDemoUser(role: DemoLoginRole): CurrentUser {
  const demoUsers: Record<DemoLoginRole, CurrentUser> = {
    athlete: {
      id: 'demo-athlete',
      firstName: 'Demo',
      lastName: 'Sporcu',
      role: 'athlete',
      club: 'SwimLab Pilot',
      specialty: 'Demo profil',
      hasSeenAppGuide: true,
      profileCreated: true,
    },
    parent: {
      id: 'demo-parent',
      firstName: 'Demo',
      lastName: 'Veli',
      role: 'parent',
      club: 'SwimLab Pilot',
      childAthleteId: 'demo-athlete',
      childName: 'Demo Sporcu',
      hasSeenAppGuide: true,
      profileCreated: true,
    },
    coach: {
      id: 'demo-coach',
      firstName: 'Demo',
      lastName: 'Antrenör',
      role: 'coach',
      club: 'SwimLab Pilot',
      specialty: 'Demo antrenör hesabı',
      hasSeenAppGuide: true,
      profileCreated: true,
    },
    club_admin: {
      id: 'demo-club-admin',
      firstName: 'Demo',
      lastName: 'Kulüp Yöneticisi',
      role: 'club_admin',
      club: 'SwimLab Pilot',
      specialty: 'Demo yönetici hesabı',
      hasSeenAppGuide: true,
      profileCreated: true,
    },
  };

  return demoUsers[role];
}

export async function registerWithInviteCode(userData: RegisterUserData, inviteCode: string): Promise<MockLoginResult> {
  const invite = joinClubByCode(inviteCode);
  if (!invite.valid) {
    return { success: false, message: 'Geçersiz davet kodu' };
  }

  const [firstName, ...restName] = userData.fullName.trim().split(/\s+/);
  const user: CurrentUser = {
    id: `${invite.role}-${Date.now()}`,
    firstName: firstName || 'SwimLab',
    lastName: restName.join(' '),
    role: invite.role,
    club: invite.clubName,
    groupName: invite.groupName,
    inviteCode: invite.code,
    email: userData.email?.trim() || undefined,
    phone: userData.phone?.trim() || undefined,
    childName: userData.childName?.trim() || undefined,
    childAthleteId: invite.role === 'parent' ? 'registered-child' : undefined,
    guardianEmail: userData.guardianEmail?.trim() || undefined,
    guardianPhone: userData.guardianPhone?.trim() || undefined,
    specialty: userData.specialty?.trim() || undefined,
    hasSeenAppGuide: false,
    profileCreated: false,
    kvkkAccepted: true,
    explicitConsentAccepted: true,
    consentAcceptedAt: new Date().toISOString(),
  };

  return { success: true, user };
}

export async function getCurrentUser() {
  try {
    const AsyncStorage = await getAsyncStorage();
    const savedUser = await AsyncStorage.getItem(userStorageKey);
    return savedUser ? (JSON.parse(savedUser) as CurrentUser) : null;
  } catch {
    return null;
  }
}

export async function setCurrentUser(user: CurrentUser) {
  const AsyncStorage = await getAsyncStorage();
  await Promise.all([AsyncStorage.setItem(roleStorageKey, user.role), AsyncStorage.setItem(userStorageKey, JSON.stringify(user))]);
}

export async function logout() {
  const AsyncStorage = await getAsyncStorage();
  await Promise.all([AsyncStorage.removeItem(roleStorageKey), AsyncStorage.removeItem(userStorageKey)]);
}
