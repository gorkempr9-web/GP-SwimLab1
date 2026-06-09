import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { writeRootDocument } from '@/services/firestoreData';
import { resolveClubIdFromCode, resolveClubIdFromName, setActiveClubContext } from '@/services/localStore';

export type UserRole = 'athlete' | 'parent' | 'coach' | 'club_admin' | 'super_admin';

export type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  email?: string;
  phone?: string;
  childAthleteId?: string;
  childName?: string;
  club?: string;
  clubId?: string;
  groupName?: string;
  specialty?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  hasSeenAppGuide?: boolean;
  profileCreated?: boolean;
  birthYear?: string;
  age?: string;
  gender?: string;
  coachName?: string;
  city?: string;
  category?: string;
  mainStroke?: string;
  targetEvent?: string;
  guardianName?: string;
  kvkkAccepted?: boolean;
  explicitConsentAccepted?: boolean;
  consentAcceptedAt?: string;
  inviteCode?: string;
};

type SessionContextValue = {
  currentUser: CurrentUser;
  setRole: (role: UserRole) => void;
  setCurrentUserProfile: (user: CurrentUser) => void;
  logout: () => void;
};

const roleStorageKey = 'gp-swimlab-current-role';
const userStorageKey = 'gp-swimlab-current-user';
let asyncStorageModule: typeof import('@react-native-async-storage/async-storage').default | null = null;

async function getAsyncStorage() {
  if (asyncStorageModule) return asyncStorageModule;
  const module = await import('@react-native-async-storage/async-storage');
  asyncStorageModule = module.default;
  return asyncStorageModule;
}

export const mockUsersByRole: Record<UserRole, CurrentUser> = {
  athlete: {
    id: 'athlete-fallback',
    firstName: 'SwimLab',
    lastName: 'Sporcu',
    role: 'athlete',
    club: 'GP Aquatics',
    specialty: 'Serbest / Karışık',
    hasSeenAppGuide: true,
    profileCreated: false,
  },
  parent: {
    id: 'parent-fallback',
    firstName: 'SwimLab',
    lastName: 'Veli',
    role: 'parent',
    childAthleteId: 'ra-1',
    childName: 'Profil oluşturulacak',
    club: 'GP Aquatics',
    hasSeenAppGuide: true,
    profileCreated: false,
  },
  coach: {
    id: 'coach-fallback',
    firstName: 'SwimLab',
    lastName: 'Antrenör',
    role: 'coach',
    club: 'GP Aquatics',
    specialty: 'Sprint serbest, start ve dönüş',
    hasSeenAppGuide: true,
    profileCreated: false,
  },
  club_admin: {
    id: 'admin-selin',
    firstName: 'Selin',
    lastName: 'Demir',
    role: 'club_admin',
    club: 'GP Aquatics',
    specialty: 'Kulüp operasyonları',
    hasSeenAppGuide: true,
    profileCreated: false,
  },
  super_admin: {
    id: 'super-admin',
    firstName: 'SwimLab',
    lastName: 'Admin',
    role: 'super_admin',
    club: 'Tüm kulüpler',
    specialty: 'Kurucu / yönetici',
    hasSeenAppGuide: true,
    profileCreated: true,
  },
};

const defaultUser = mockUsersByRole.athlete;

const SessionContext = createContext<SessionContextValue>({
  currentUser: defaultUser,
  setRole: () => {},
  setCurrentUserProfile: () => {},
  logout: () => {},
});

export function SessionProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState(defaultUser);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout>;

    async function loadSession() {
      try {
        const AsyncStorage = await getAsyncStorage();
        const savedUser = await AsyncStorage.getItem(userStorageKey);
        if (savedUser) {
          const parsedUser = parseStoredUser(savedUser);
          if (mounted && parsedUser) {
            setActiveClubContext(parsedUser.clubId ?? resolveClubIdFromCode(parsedUser.inviteCode) ?? resolveClubIdFromName(parsedUser.club));
            setCurrentUser(parsedUser);
            return;
          }
        }

        const savedRole = await AsyncStorage.getItem(roleStorageKey);
        if (mounted && isUserRole(savedRole)) {
          setActiveClubContext(mockUsersByRole[savedRole].clubId ?? resolveClubIdFromName(mockUsersByRole[savedRole].club));
          setCurrentUser(mockUsersByRole[savedRole]);
        }
      } catch {
        if (mounted) setCurrentUser(defaultUser);
      }
    }

    timer = setTimeout(() => {
      loadSession();
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const value = useMemo(() => {
    const setRole = (role: UserRole) => {
      const user = mockUsersByRole[role];
      setActiveClubContext(user.clubId ?? resolveClubIdFromName(user.club));
      setCurrentUser(user);
      getAsyncStorage()
        .then((AsyncStorage) => Promise.all([AsyncStorage.setItem(roleStorageKey, role), AsyncStorage.removeItem(userStorageKey)]))
        .catch(() => {});
    };

    const setCurrentUserProfile = (user: CurrentUser) => {
      const normalizedUser = normalizeCurrentUser(user);
      setActiveClubContext(normalizedUser.clubId ?? resolveClubIdFromCode(normalizedUser.inviteCode) ?? resolveClubIdFromName(normalizedUser.club));
      setCurrentUser(normalizedUser);
      getAsyncStorage()
        .then((AsyncStorage) =>
          Promise.all([
            AsyncStorage.setItem(roleStorageKey, normalizedUser.role),
            AsyncStorage.setItem(userStorageKey, JSON.stringify(normalizedUser)),
          ]),
        )
        .catch(() => {});
      void writeRootDocument('users', normalizedUser.id, normalizedUser as unknown as Record<string, unknown>);
    };

    const logout = () => {
      setCurrentUser(defaultUser);
      getAsyncStorage()
        .then((AsyncStorage) => Promise.all([AsyncStorage.removeItem(roleStorageKey), AsyncStorage.removeItem(userStorageKey)]))
        .catch(() => {});
    };

    return { currentUser, setRole, setCurrentUserProfile, logout };
  }, [currentUser]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}

export function roleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    athlete: 'Sporcu',
    parent: 'Veli',
    coach: 'Antrenör',
    club_admin: 'Kulüp Yöneticisi',
    super_admin: 'Admin',
  };
  return labels[role];
}

export function panelLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    athlete: 'Sporcu Paneli',
    parent: 'Veli Paneli',
    coach: 'Antrenör Paneli',
    club_admin: 'Kulüp Paneli',
    super_admin: 'Admin Paneli',
  };
  return labels[role];
}

export function roleFromUserType(userType: string): UserRole {
  if (userType === 'Veli') return 'parent';
  if (userType === 'Antrenör' || userType === 'Antrenör') return 'coach';
  if (userType === 'Kulüp Yöneticisi' || userType === 'Kulüp Yöneticisi') return 'club_admin';
  return 'athlete';
}

export function canManageClub(role: UserRole) {
  return role === 'coach' || role === 'club_admin' || role === 'super_admin';
}

function parseStoredUser(value: string) {
  try {
    const parsed = JSON.parse(value) as Partial<CurrentUser>;
    if (isStoredCurrentUser(parsed)) return normalizeCurrentUser(parsed);
  } catch {
    return null;
  }
  return null;
}

function isStoredCurrentUser(value: Partial<CurrentUser>): value is CurrentUser {
  return Boolean(value.id && value.firstName && value.role && isUserRole(value.role));
}

function normalizeCurrentUser(user: CurrentUser) {
  const clubId = user.clubId ?? resolveClubIdFromCode(user.inviteCode) ?? resolveClubIdFromName(user.club);
  return {
    ...mockUsersByRole[user.role],
    ...user,
    clubId,
    firstName: user.firstName.trim() || mockUsersByRole[user.role].firstName,
    lastName: user.lastName.trim(),
    club: user.club?.trim() || mockUsersByRole[user.role].club,
  };
}

function isUserRole(value: string | null | undefined): value is UserRole {
  return value === 'athlete' || value === 'parent' || value === 'coach' || value === 'club_admin' || value === 'super_admin';
}
