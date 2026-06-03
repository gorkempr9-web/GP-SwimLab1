export type LessonAdVisibility = 'Tüm kullanıcılar' | 'Sadece kulüp üyeleri' | 'Sadece veliler';
export type LessonAdStatus = 'active' | 'passive';

export type LessonAd = {
  id: string;
  title: string;
  coachId: string;
  coachName: string;
  clubId: string;
  clubName: string;
  clubLogo?: string;
  branch: string;
  level: string;
  ageGroup: string;
  schedule: string;
  location: string;
  description: string;
  capacity: string;
  priceInfo?: string;
  visibility: LessonAdVisibility;
  status: LessonAdStatus;
  createdAt: string;
};

export type CreateLessonAdInput = Omit<LessonAd, 'id' | 'status' | 'createdAt'> & {
  status?: LessonAdStatus;
};

const lessonAds: LessonAd[] = [
  {
    id: 'lesson-1',
    title: 'Sprint Teknik ve Start Grubu',
    coachId: 'coach-mert',
    coachName: 'SwimLab Antrenör',
    clubId: 'gp-aquatics',
    clubName: 'GP Aquatics',
    branch: 'Start/Dönüş',
    level: 'Performans',
    ageGroup: '13-14',
    schedule: 'Salı / Perşembe 19:30',
    location: 'GP Aquatics 50m havuz',
    description: 'Çıkış, ilk 15m ve dönüş hızını geliştirmeye odaklı küçük grup özel ders.',
    capacity: '6 sporcu',
    priceInfo: 'Kulüp içi bilgilendirme',
    visibility: 'Tüm kullanıcılar',
    status: 'active',
    createdAt: '2026-05-24T18:00:00.000Z',
  },
];

const contactRequests: Array<{ id: string; adId: string; requesterId: string; createdAt: string }> = [];

export function getLessonAds() {
  return [...lessonAds].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getClubBoardLessonAds(clubName = 'GP Aquatics') {
  return getLessonAds().filter((ad) => ad.clubName === clubName && ad.visibility === 'Sadece kulüp üyeleri');
}

export function createLessonAd(ad: CreateLessonAdInput) {
  const nextAd: LessonAd = {
    ...ad,
    id: `lesson-${Date.now()}`,
    status: ad.status ?? 'active',
    createdAt: new Date().toISOString(),
  };
  lessonAds.unshift(nextAd);
  return nextAd;
}

export function toggleLessonAdStatus(id: string) {
  const ad = lessonAds.find((item) => item.id === id);
  if (!ad) return null;
  ad.status = ad.status === 'active' ? 'passive' : 'active';
  return ad;
}

export function deleteLessonAd(id: string) {
  const index = lessonAds.findIndex((item) => item.id === id);
  if (index < 0) return false;
  lessonAds.splice(index, 1);
  return true;
}

export function requestLessonContact(id: string, requesterId: string) {
  const ad = lessonAds.find((item) => item.id === id);
  if (!ad) return null;
  const request = {
    id: `lesson-request-${Date.now()}`,
    adId: id,
    requesterId,
    createdAt: new Date().toISOString(),
  };
  contactRequests.push(request);
  return request;
}

