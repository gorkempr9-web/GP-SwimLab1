export type UserType = 'Sporcu' | 'Veli' | 'Antrenör' | 'Kulüp Yöneticisi';

export type AthleteProfile = {
  firstName: string;
  lastName: string;
  age: string;
  club: string;
  coach: string;
  city: string;
  category: string;
  email: string;
  emailVerified: boolean;
  userType: UserType;
  phone: {
    countryCode: string;
    number: string;
    verified: boolean;
    verifiedAt?: string;
  };
  guardianPhone: {
    countryCode: string;
    number: string;
    required: boolean;
    verified: boolean;
  };
  guardianEmail: {
    email: string;
    required: boolean;
    verified: boolean;
  };
  achievements: Array<{ id: string; title: string; detail: string }>;
  badges: Array<{ id: string; title: string; detail: string }>;
};

export const mockAthlete: AthleteProfile = {
  firstName: 'SwimLab',
  lastName: 'Kullanıcı',
  age: '-',
  club: 'Kulüp bilgisi yok',
  coach: 'Antrenör bilgisi yok',
  city: '-',
  category: '-',
  email: '',
  emailVerified: false,
  userType: 'Sporcu',
  phone: {
    countryCode: '+90',
    number: '',
    verified: false,
  },
  guardianPhone: {
    countryCode: '+90',
    number: '',
    required: false,
    verified: false,
  },
  guardianEmail: {
    email: '',
    required: false,
    verified: false,
  },
  achievements: [],
  badges: [],
};
