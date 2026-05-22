export type AnnouncementType = 'Genel Duyuru' | 'Antrenman Saati' | 'Yarış Duyurusu' | 'Kamp Duyurusu' | 'Ölçüm Günü' | 'Veli Bilgilendirme' | 'Beslenme Notu' | 'Acil Bilgilendirme';
export type ClubPriority = 'Normal' | 'Önemli' | 'Acil';
export type ClubGroup = 'Tüm Kulüp' | 'Performans Grubu' | 'Küçük Yaş Grubu' | 'Masters' | 'Belirli Sporcular' | 'Veliler' | 'Antrenörler';
export type ClubVisibility = 'Sporcular' | 'Veliler' | 'Sporcular + Veliler' | 'Sadece Antrenörler';

export type ClubAnnouncement = {
  id: string;
  type: AnnouncementType;
  title: string;
  description: string;
  date: string;
  time: string;
  group: ClubGroup;
  priority: ClubPriority;
  visibility: ClubVisibility;
  publisher: string;
  seenCount: number;
  seenByMe: boolean;
};

export const firestoreClubBoardPaths = {
  announcements: 'clubs/{clubId}/announcements',
  trainingSchedule: 'clubs/{clubId}/trainingSchedule',
  calendarEvents: 'clubs/{clubId}/calendarEvents',
  readReceipts: 'clubs/{clubId}/readReceipts',
};

export const mockAnnouncements: ClubAnnouncement[] = [
  {
    id: 'ann-1',
    type: 'Genel Duyuru',
    title: 'Performans grubu yarış haftası planı',
    description: 'Bu hafta ana setlerde hacim azalacak, çıkış ve dönüş kalitesi korunacak.',
    date: '20.05.2026',
    time: '17:30',
    group: 'Performans Grubu',
    priority: 'Normal',
    visibility: 'Sporcular + Veliler',
    publisher: 'Görkem Pınar',
    seenCount: 42,
    seenByMe: false,
  },
  {
    id: 'ann-2',
    type: 'Yarış Duyurusu',
    title: 'Marmara Cup kafile bilgilendirmesi',
    description: 'Sporcular yarış günü 08:15te havuz girişinde hazır olmalı.',
    date: '23.05.2026',
    time: '08:15',
    group: 'Tüm Kulüp',
    priority: 'Önemli',
    visibility: 'Sporcular + Veliler',
    publisher: 'Görkem Pınar',
    seenCount: 68,
    seenByMe: true,
  },
  {
    id: 'ann-3',
    type: 'Acil Bilgilendirme',
    title: 'Yarış günü giriş kapısı değişti',
    description: 'Ulaşım için kuzey kapısı kullanılacak. Sporcu özel bilgisi paylaşılmamalıdır.',
    date: '23.05.2026',
    time: '07:30',
    group: 'Veliler',
    priority: 'Acil',
    visibility: 'Veliler',
    publisher: 'Kulüp Yönetimi',
    seenCount: 31,
    seenByMe: false,
  },
];

export async function createAnnouncement(announcement: Omit<ClubAnnouncement, 'id' | 'seenCount' | 'seenByMe'>) {
  return {
    ...announcement,
    id: `ann-${Date.now()}`,
    seenCount: 0,
    seenByMe: false,
  };
}

export async function markAnnouncementSeen(announcement: ClubAnnouncement) {
  return {
    ...announcement,
    seenByMe: true,
    seenCount: announcement.seenByMe ? announcement.seenCount : announcement.seenCount + 1,
  };
}
