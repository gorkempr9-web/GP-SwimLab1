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

export const mockAnnouncements: ClubAnnouncement[] = [];

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


