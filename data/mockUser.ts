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
  achievements: Array<{
    id: string;
    title: string;
    detail: string;
  }>;
  badges: Array<{
    id: string;
    title: string;
    detail: string;
  }>;
};

export const mockAthlete: AthleteProfile = {
  firstName: 'Deniz',
  lastName: 'Arslan',
  age: '16',
  club: 'GP Aquatics',
  coach: 'Mert Kaya',
  city: 'İstanbul',
  category: '15-16 Yaş Milli Takım Aday',
  email: 'deniz@gpswimlab.demo',
  emailVerified: true,
  userType: 'Sporcu',
  phone: {
    countryCode: '+90',
    number: '555 010 2030',
    verified: true,
    verifiedAt: '2026-05-20T09:00:00.000Z',
  },
  guardianPhone: {
    countryCode: '+90',
    number: '532 000 1122',
    required: true,
    verified: true,
  },
  guardianEmail: {
    email: 'veli@gpswimlab.demo',
    required: true,
    verified: true,
  },
  achievements: [
    { id: 'a1', title: '100m Serbest PB', detail: '56.84 • Marmara Cup' },
    { id: 'a2', title: 'Altın madalya', detail: 'İstanbul İl Şampiyonası' },
  ],
  badges: [
    { id: 'b1', title: 'PB Breaker', detail: 'Yeni kişisel rekor' },
    { id: 'b2', title: 'Podium Finisher', detail: 'Kürsü başarısı' },
  ],
};
