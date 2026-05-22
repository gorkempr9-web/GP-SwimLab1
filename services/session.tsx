import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'athlete' | 'parent' | 'coach' | 'club_admin';

export type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

const roleStorageKey = 'gp-swimlab-current-role';

const defaultUser: CurrentUser = {
  id: 'mock-user',
  firstName: 'Deniz',
  lastName: 'Arslan',
  role: 'athlete',
};

const SessionContext = createContext({
  currentUser: defaultUser,
  setRole: (_role: UserRole) => {},
  logout: () => {},
});

export function SessionProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState(defaultUser);

  useEffect(() => {
    AsyncStorage.getItem(roleStorageKey).then((savedRole) => {
      if (isUserRole(savedRole)) {
        setCurrentUser((user) => ({ ...user, role: savedRole }));
      }
    });
  }, []);

  const value = useMemo(() => {
    const setRole = (role: UserRole) => {
      setCurrentUser((user) => ({ ...user, role }));
      AsyncStorage.setItem(roleStorageKey, role);
    };

    const logout = () => {
      setCurrentUser(defaultUser);
      AsyncStorage.removeItem(roleStorageKey);
    };

    return { currentUser, setRole, logout };
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
  };
  return labels[role];
}

export function panelLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    athlete: 'Sporcu Paneli',
    parent: 'Veli Paneli',
    coach: 'Antrenör Paneli',
    club_admin: 'Kulüp Paneli',
  };
  return labels[role];
}

export function roleFromUserType(userType: string): UserRole {
  if (userType === 'Veli') return 'parent';
  if (userType === 'Antrenör') return 'coach';
  if (userType === 'Kulüp Yöneticisi') return 'club_admin';
  return 'athlete';
}

export function canManageClub(role: UserRole) {
  return role === 'coach' || role === 'club_admin';
}

function isUserRole(value: string | null): value is UserRole {
  return value === 'athlete' || value === 'parent' || value === 'coach' || value === 'club_admin';
}
