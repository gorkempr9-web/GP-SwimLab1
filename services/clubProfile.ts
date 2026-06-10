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

export const mockClubProfiles: ClubProfile[] = [
  { id: 'mev-koleji', name: 'MEV Koleji', logoLabel: 'MEV', clubCode: 'GP-MEV001', totalAthletes: 96, totalCoaches: 6, totalParents: 72 },
  { id: 'bcsk', name: 'Başkent Çankaya Spor Kulübü', logoLabel: 'BCSK', clubCode: 'GP-BCSK001', totalAthletes: 84, totalCoaches: 5, totalParents: 61 },
];

export const defaultClubProfile: ClubProfile = {
  id: 'swimlab-pilot',
  name: 'SwimLab Pilot',
  logoLabel: 'K',
  clubCode: 'GP-MEV001',
  totalAthletes: 0,
  totalCoaches: 0,
  totalParents: 0,
};

export function getClubProfile(clubName = 'SwimLab Pilot'): ClubProfile {
  const profile = mockClubProfiles.find((club) => club.name === clubName) ?? defaultClubProfile;
  return {
    ...profile,
    name: clubName || profile.name,
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
    coachName: 'SwimLab Antrenör',
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
