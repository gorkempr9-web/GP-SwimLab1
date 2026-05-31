export type ClubProfile = {
  id: string;
  name: string;
  logoLabel: string;
  logoUri?: string;
  clubCode?: string;
  totalAthletes?: number;
  totalCoaches?: number;
  totalParents?: number;
};

export type ClubAd = {
  id: string;
  club: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
  sponsor: string;
};

export type PrivateLessonAd = {
  id: string;
  coachName: string;
  club: string;
  branch: string;
  level: string;
  schedule: string;
  location: string;
  description: string;
  contactPreference: string;
  active: boolean;
  public: boolean;
};

let mockClubLogoUri: string | undefined;

export const defaultClubProfile: ClubProfile = {
  id: 'gp-aquatics',
  name: 'GP Aquatics',
  logoLabel: 'GP',
  clubCode: 'GP-MEV001',
  totalAthletes: 128,
  totalCoaches: 9,
  totalParents: 86,
};

export function getClubProfile(clubName = 'GP Aquatics'): ClubProfile {
  return {
    ...defaultClubProfile,
    name: clubName,
    logoUri: mockClubLogoUri,
  };
}

export function setMockClubLogo(uri?: string) {
  mockClubLogoUri = uri;
  return getClubProfile();
}

export const clubAds: ClubAd[] = [
  {
    id: 'ad-1',
    club: 'GP Aquatics',
    title: 'Yaz Kampı Bilgilendirmesi',
    description: 'Performans grubu için 14 günlük kamp ön başvuruları açıldı.',
    startDate: '01.06.2026',
    endDate: '15.06.2026',
    active: true,
    sponsor: 'SwimLab x GP Aquatics',
  },
  {
    id: 'ad-2',
    club: 'GP Aquatics',
    title: 'Sponsor Ekipman Avantajı',
    description: 'Kulüp sporcularına yarış gözlüğü ve bone setinde pilot dönem indirimi.',
    startDate: '24.05.2026',
    endDate: '30.06.2026',
    active: true,
    sponsor: 'Kulüp sponsor alanı',
  },
];

export const privateLessonAds: PrivateLessonAd[] = [
  {
    id: 'pl-1',
    coachName: 'Mert Kaya',
    club: 'GP Aquatics',
    branch: 'Serbest teknik ve start',
    level: '11-16 yaş performans',
    schedule: 'Salı / Perşembe 19:30',
    location: 'GP Aquatics 50m havuz',
    description: 'Sprint tekniği, çıkış ve dönüş odaklı küçük grup özel ders.',
    contactPreference: 'Uygulama içi talep',
    active: true,
    public: true,
  },
];
