export type AppAnnouncement = {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'feature' | 'system' | 'club';
};

export const appAnnouncements: AppAnnouncement[] = [
  { id: 'app-1', title: 'Canlı Yarış Kronometresi eklendi', description: 'Antrenörler yarış sırasında split ve final derece kaydedebilir.', date: '01.06.2026 09:00', type: 'feature' },
  { id: 'app-2', title: 'Kulüp Takvimi güncellendi', description: 'Kulüp etkinlikleri ve TYF yönlendirmeleri daha düzenli görünüyor.', date: '01.06.2026 09:10', type: 'feature' },
  { id: 'app-3', title: 'TYF Portal yönlendirme ekranı eklendi', description: 'Resmi TYF sayfaları cihaz tarayıcısında açılır.', date: '01.06.2026 09:20', type: 'system' },
  { id: 'app-4', title: 'Güvenlik Merkezi yayında', description: 'Uygulama içi link, metin ve veri güvenliği kontrolleri hazırlandı.', date: '01.06.2026 09:30', type: 'system' },
];

export function getAppAnnouncements() {
  return [...appAnnouncements];
}

// Firestore-ready:
// appAnnouncements/{announcementId}
// Admin panel can later publish release notes, feature updates, and maintenance notices.
