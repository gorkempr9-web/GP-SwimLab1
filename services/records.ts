export type RecordScope = 'Dünya Rekorları' | 'Avrupa Rekorları' | 'Türkiye Rekorları' | 'Yaş Grup Rekorları';
export type RecordGender = 'Kadın' | 'Erkek';

export type SwimRecord = {
  id: string;
  scope: RecordScope;
  distance: string;
  stroke: string;
  gender: RecordGender;
  time: string;
  athleteName: string;
  countryOrClub: string;
  date: string;
  poolType: '25m' | '50m';
};

export const recordScopes: RecordScope[] = ['Dünya Rekorları', 'Avrupa Rekorları', 'Türkiye Rekorları', 'Yaş Grup Rekorları'];
export const recordStrokes = ['Serbest', 'Sırtüstü', 'Kurbağalama', 'Kelebek', 'Karışık'];
export const recordDistances = ['50m', '100m', '200m', '400m', '800m', '1500m'];
export const recordGenders: RecordGender[] = ['Kadın', 'Erkek'];

const records: SwimRecord[] = [
  { id: 'wr-50-free-m', scope: 'Dünya Rekorları', distance: '50m', stroke: 'Serbest', gender: 'Erkek', time: '20.91', athleteName: 'Örnek Sporcu', countryOrClub: 'Resmi kaynak kontrolü', date: 'Bilgilendirme', poolType: '50m' },
  { id: 'er-100-back-w', scope: 'Avrupa Rekorları', distance: '100m', stroke: 'Sırtüstü', gender: 'Kadın', time: '57.10', athleteName: 'Örnek Sporcu', countryOrClub: 'Resmi kaynak kontrolü', date: 'Bilgilendirme', poolType: '50m' },
  { id: 'tr-200-fly-m', scope: 'Türkiye Rekorları', distance: '200m', stroke: 'Kelebek', gender: 'Erkek', time: '1:56.00', athleteName: 'Örnek Sporcu', countryOrClub: 'Resmi kaynak kontrolü', date: 'Bilgilendirme', poolType: '50m' },
  { id: 'age-100-breast-w', scope: 'Yaş Grup Rekorları', distance: '100m', stroke: 'Kurbağalama', gender: 'Kadın', time: '1:10.20', athleteName: 'Örnek Sporcu', countryOrClub: 'Yaş grubu', date: 'Bilgilendirme', poolType: '25m' },
  { id: 'tr-400-im-w', scope: 'Türkiye Rekorları', distance: '400m', stroke: 'Karışık', gender: 'Kadın', time: '4:45.00', athleteName: 'Örnek Sporcu', countryOrClub: 'Resmi kaynak kontrolü', date: 'Bilgilendirme', poolType: '50m' },
];

export function getRecords(filters?: { scope?: RecordScope; stroke?: string; distance?: string; gender?: RecordGender }) {
  return records.filter((record) => {
    if (filters?.scope && record.scope !== filters.scope) return false;
    if (filters?.stroke && record.stroke !== filters.stroke) return false;
    if (filters?.distance && record.distance !== filters.distance) return false;
    if (filters?.gender && record.gender !== filters.gender) return false;
    return true;
  });
}

// Future data source:
// federationRecords/{scope}/{eventId}
// Keep official/current claims out of the mock layer until verified from federations.
