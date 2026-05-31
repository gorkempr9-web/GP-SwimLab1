export type TyfOfficialLink = {
  id: string;
  title: string;
  url: string;
  description: string;
};

export type FederationCalendarEvent = {
  id: string;
  title: string;
  federation: 'Türkiye Yüzme Federasyonu';
  startDate: string;
  endDate: string;
  city: string;
  poolType: '25m' | '50m';
  category: string;
  eventType: string;
  source: 'TYF';
  isOfficial: true;
};

export type UpcomingFederationRace = {
  event: FederationCalendarEvent;
  daysLeft: number;
};

export const tyfOfficialLinks: TyfOfficialLink[] = [
  { id: 'portal', title: "TYF Portal'a Git", url: 'https://portal.tyf.gov.tr', description: 'Lisans, kulüp ve resmi yarış işlemleri.' },
  { id: 'calendar', title: 'Faaliyet Takvimini Aç', url: 'https://tyf.gov.tr', description: 'Türkiye Yüzme Federasyonu resmi faaliyet takvimi.' },
  { id: 'regulations', title: 'Yarışmalar ve Reglamanlar', url: 'https://tyf.gov.tr', description: 'Resmi yarış duyuruları ve reglaman sayfaları.' },
  { id: 'live-results', title: 'Canlı Sonuçlar', url: 'https://tyf.gov.tr', description: 'Resmi canlı sonuç ve duyuru bağlantıları.' },
  { id: 'home', title: 'TYF Ana Sayfa', url: 'https://tyf.gov.tr', description: 'Türkiye Yüzme Federasyonu ana sayfası.' },
];

export function isOfficialTyfDomain(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return host === 'tyf.gov.tr' || host.endsWith('.tyf.gov.tr') || host === 'portal.tyf.gov.tr';
  } catch {
    return false;
  }
}

export function getFederationCalendarEvents(): FederationCalendarEvent[] {
  return [];
}

export function getUpcomingFederationRace(): UpcomingFederationRace | null {
  return null;
}
