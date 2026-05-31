import { CurrentUser } from '@/services/session';

export type UserProfileInput = {
  firstName: string;
  lastName: string;
  birthYear: string;
  gender: string;
  club: string;
  coachName: string;
  city: string;
  category: string;
  groupName?: string;
  mainStroke: string;
  targetEvent: string;
  phone: string;
  email: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  role: CurrentUser['role'];
};

const profileStorageKey = 'gp-swimlab-user-profile';
let asyncStorageModule: typeof import('@react-native-async-storage/async-storage').default | null = null;

export const mockCurrentUser: CurrentUser = {
  id: 'profile-fallback',
  firstName: 'SwimLab',
  lastName: 'Kullanıcı',
  role: 'athlete',
  club: 'SwimLab Pilot',
  profileCreated: false,
  hasSeenAppGuide: true,
};

async function getAsyncStorage() {
  if (asyncStorageModule) return asyncStorageModule;
  const module = await import('@react-native-async-storage/async-storage');
  asyncStorageModule = module.default;
  return asyncStorageModule;
}

export async function createProfile(baseUser: CurrentUser, input: UserProfileInput) {
  const profile = buildProfile(baseUser, input);
  await saveProfile(profile);
  return profile;
}

export async function updateProfile(baseUser: CurrentUser, input: UserProfileInput) {
  const profile = buildProfile(baseUser, input);
  await saveProfile(profile);
  return profile;
}

export async function getProfile() {
  try {
    const AsyncStorage = await getAsyncStorage();
    const saved = await AsyncStorage.getItem(profileStorageKey);
    return saved ? (JSON.parse(saved) as CurrentUser) : null;
  } catch {
    return null;
  }
}

async function saveProfile(profile: CurrentUser) {
  const AsyncStorage = await getAsyncStorage();
  await AsyncStorage.setItem(profileStorageKey, JSON.stringify(profile));
}

function buildProfile(baseUser: CurrentUser, input: UserProfileInput): CurrentUser {
  const age = calculateAge(input.birthYear);
  return {
    ...baseUser,
    firstName: input.firstName.trim() || 'SwimLab',
    lastName: input.lastName.trim() || 'Kullanıcı',
    role: input.role,
    birthYear: input.birthYear.trim(),
    age: age ? String(age) : undefined,
    gender: input.gender,
    club: input.club.trim() || 'SwimLab Pilot',
    coachName: input.coachName.trim() || undefined,
    city: input.city.trim() || undefined,
    category: input.category.trim() || undefined,
    groupName: input.groupName?.trim() || input.category.trim() || baseUser.groupName,
    mainStroke: input.mainStroke.trim() || undefined,
    targetEvent: input.targetEvent.trim() || undefined,
    phone: input.phone.trim() || undefined,
    email: input.email.trim() || undefined,
    guardianName: input.guardianName.trim() || undefined,
    guardianPhone: input.guardianPhone.trim() || undefined,
    guardianEmail: input.guardianEmail.trim() || undefined,
    specialty: input.role === 'coach' ? input.mainStroke.trim() || baseUser.specialty : baseUser.specialty,
    profileCreated: true,
  };
}

export function calculateAge(birthYear: string, currentYear = new Date().getFullYear()) {
  const year = Number(birthYear);
  if (!year || Number.isNaN(year)) return null;
  return currentYear - year;
}

// Firestore-ready structure:
// users/{userId}/profile
// The document will hold role, clubId, parent/athlete links, consent flags,
// profile basics, and only the minimal fields required by SwimLab workflows.
