export type AcademySection = 'glossary' | 'competition' | 'performance' | 'parent';

export type AcademyItem = {
  id: string;
  section: AcademySection;
  title: string;
  description: string;
  example: string;
  aiPrompt?: string;
  warning?: string;
};

export const glossaryTerms: AcademyItem[] = [
  { id: 'pb', section: 'glossary', title: 'PB', description: 'Personal Best / Kişisel En İyi Derece. Sporcunun ilgili mesafe, stil ve havuz tipindeki en iyi derecesidir.', example: '50m Serbest PB: 32.23' },
  { id: 'sb', section: 'glossary', title: 'SB', description: 'Season Best / Sezonun En İyi Derecesi. Sporcunun sezon içindeki en iyi yarış sonucudur.', example: 'Bu sezon 100m Serbest SB: 1:10.44' },
  { id: 'split', section: 'glossary', title: 'Split', description: 'Yarış içindeki ara geçiş derecesidir. Tempo ve düşüş analizi için kullanılır.', example: '100m yarışta 50m split: 34.20' },
  { id: 'dq', section: 'glossary', title: 'DQ', description: 'Diskalifiye. Kurala aykırı çıkış, dönüş veya stil hatası sonrası sonuç geçersiz olur.', example: 'Kurbağalama dönüş ihlali nedeniyle DQ.' },
  { id: 'dns', section: 'glossary', title: 'DNS', description: 'Did Not Start / Yarışa çıkmadı. Sporcu start listesinde olup yarışa başlamamıştır.', example: 'Seri 2, Kulvar 4: DNS' },
  { id: 'nt', section: 'glossary', title: 'NT', description: 'No Time / Derecesiz. Sporcunun o branş için kayıtlı resmi derecesi bulunmaz.', example: 'İlk 200m Karışık yarışı NT ile girildi.' },
  { id: 'im', section: 'glossary', title: 'IM', description: 'Individual Medley / Karışık yüzme. Kelebek, sırtüstü, kurbağalama ve serbest stilleri birlikte yüzülür.', example: '200 IM = 200m Karışık' },
  { id: 'scm', section: 'glossary', title: 'SCM', description: 'Short Course Meters. 25m kısa kulvar havuz yarışlarını ifade eder.', example: '100m SCM derecesi kısa kulvar derecesidir.' },
  { id: 'lcm', section: 'glossary', title: 'LCM', description: 'Long Course Meters. 50m uzun kulvar havuz yarışlarını ifade eder.', example: 'Türkiye Şampiyonası LCM yapılabilir.' },
  { id: 'tyf', section: 'glossary', title: 'TYF', description: 'Türkiye Yüzme Federasyonu. Resmi yarış, lisans ve reglaman süreçleri TYF üzerinden yürür.', example: 'Faaliyet takvimi TYF sayfasından kontrol edilir.' },
  { id: 'sem', section: 'glossary', title: 'SEM', description: 'Sporcu Eğitim Merkezi. Belirli kriterleri sağlayan sporcular için gelişim yapısıdır.', example: 'SEM barajı yaş grubuna göre takip edilir.' },
  { id: 'thom', section: 'glossary', title: 'THOM', description: 'Türkiye Olimpiyat Hazırlık Merkezi. Üst performans hedefli sporcular için hazırlık sistemidir.', example: 'THOM hedefleri uzun dönem gelişim planına girer.' },
  { id: 'baraj', section: 'glossary', title: 'Baraj', description: 'Yarışa katılım veya seçme için gereken minimum derece standardıdır.', example: '50m Serbest il barajı: 31.50' },
  { id: 'heat', section: 'glossary', title: 'Seri', description: 'Yarışta aynı anda yüzen sporcu grubudur. İngilizcede heat olarak geçer.', example: 'Seri 3, Kulvar 5' },
  { id: 'lane', section: 'glossary', title: 'Kulvar', description: 'Sporcunun yarış sırasında yüzdüğü havuz yoludur.', example: 'Kulvar 4 merkez kulvarlardan biridir.' },
  { id: 'start', section: 'glossary', title: 'Start', description: 'Yarışın çıkış bölümüdür. Reaksiyon ve suya giriş kalitesi süreyi etkiler.', example: 'Start reaksiyonu 0.69' },
  { id: 'turn', section: 'glossary', title: 'Turn', description: 'Dönüş. Duvar yaklaşımı, itiş ve su altı bölümü toplam süreyi etkiler.', example: '50m dönüş sonrası tempo korunmalı.' },
  { id: 'finish', section: 'glossary', title: 'Finish', description: 'Yarışın bitiriş bölümüdür. Son kulaç ve duvara uzanma önemlidir.', example: 'Finish erken kesilmemeli.' },
  { id: 'stroke-count', section: 'glossary', title: 'Stroke Count', description: 'Kulaç sayısı. Mesafe boyunca atılan kulaç sayısını gösterir.', example: '25m için 18 kulaç.' },
  { id: 'swolf', section: 'glossary', title: 'SWOLF', description: 'Süre ve kulaç sayısını birlikte yorumlayan verimlilik puanıdır.', example: 'Daha düşük SWOLF daha verimli yüzüş anlamına gelebilir.' },
];

export const competitionGuides: AcademyItem[] = [
  { id: 'city-standard', section: 'competition', title: 'İl barajı nedir?', description: 'İl düzeyindeki yarışlara katılım veya sınıflandırma için kullanılan derece standardıdır.', example: 'Sporcu il barajını geçerse ilgili yarışa katılım hakkı kazanabilir.' },
  { id: 'sem-guide', section: 'competition', title: 'SEM nedir?', description: 'Sporcu Eğitim Merkezi, yaş grubu sporcularının gelişimini destekleyen performans yapılarından biridir.', example: 'SEM hedefi için yaş, branş ve derece birlikte değerlendirilir.' },
  { id: 'thom-guide', section: 'competition', title: 'THOM nedir?', description: 'Türkiye Olimpiyat Hazırlık Merkezi, yüksek performans hedefli sporculara yönelik hazırlık sistemidir.', example: 'THOM hedefleri antrenör ve kulüp planlamasında takip edilebilir.' },
  { id: 'national-trials', section: 'competition', title: 'Milli takım seçmeleri nedir?', description: 'Milli takım adaylarının belirli yarış ve kriterlerle değerlendirildiği seçme süreçleridir.', example: 'Seçme kriterleri resmi duyurulardan kontrol edilir.' },
  { id: 'turkey-championship', section: 'competition', title: 'Türkiye Şampiyonası’na nasıl katılım sağlanır?', description: 'Katılım koşulları yaş grubu, lisans, baraj ve reglamana göre belirlenir.', example: 'Kulüp, resmi başvuru sürecini TYF Portal üzerinden takip eder.' },
  { id: 'tyf-portal-guide', section: 'competition', title: 'TYF Portal ne için kullanılır?', description: 'Resmi yarış başvuruları, lisans ve kulüp işlemleri için kullanılan federasyon portalıdır.', example: 'SwimLab sadece resmi TYF sayfalarına yönlendirme sağlar.' },
  { id: 'regulation', section: 'competition', title: 'Reglaman nedir?', description: 'Yarışın katılım, yaş grubu, program, ödül ve teknik kurallarını açıklayan resmi dokümandır.', example: 'Yarıştan önce reglaman mutlaka okunmalıdır.' },
  { id: 'live-results', section: 'competition', title: 'Canlı sonuçlar nedir?', description: 'Yarış sırasında veya sonrasında derecelerin yayınlandığı resmi sonuç akışıdır.', example: 'Seri, kulvar, derece ve sıralama canlı sonuçlarda görülebilir.' },
];

export const performanceGuides: AcademyItem[] = [
  { id: 'fina-guide', section: 'performance', title: 'FINA puanı nedir?', description: 'FINA puanı, yüzücünün derecesini dünya seviyesindeki referans derecelerle karşılaştırarak performans puanı verir. Yaşa göre değil, mutlak performansa göre yorumlanır.', example: '500-700 arası güçlü performans olarak okunabilir.', aiPrompt: 'FINA puanımı yorumla' },
  { id: 'rudolph-guide', section: 'performance', title: 'Rudolph puanı nedir?', description: 'Rudolph puanı, özellikle yaş grubu yüzücülerinde yaş faktörünü dikkate alarak performansı değerlendirmeye yardımcı olur.', example: '10-15 arası çok iyi yaş grubu performansı olarak yorumlanabilir.', aiPrompt: 'Rudolph puanımı yorumla' },
  { id: 'pb-progress', section: 'performance', title: 'PB gelişimi nasıl yorumlanır?', description: 'PB gelişimi, sporcunun aynı mesafe, stil ve havuz tipindeki önceki en iyi derecesine göre ilerlemesini gösterir.', example: '32.90 -> 32.23 gelişim: 0.67 sn' },
  { id: 'split-analysis', section: 'performance', title: 'Split analizi nedir?', description: 'Splitler yarışın hangi bölümünde hızlanma veya düşüş yaşandığını gösterir.', example: 'İlk 50m 32.0, ikinci 50m 36.5 ise tempo düşüşü incelenir.' },
  { id: 'race-drop', section: 'performance', title: 'Yarış düşüşü nedir?', description: 'Yarışın son bölümünde temponun belirgin düşmesi veya hedef ritmin kaybedilmesidir.', example: 'Son 25m’de kulaç frekansı düşerse finish planı çalışılır.' },
  { id: 'last-15', section: 'performance', title: 'Son 15m performansı neden önemlidir?', description: 'Son 15m, yorgunluk altında tekniğin ve mental dayanıklılığın en çok göründüğü bölümdür.', example: 'Son 15m tempo korunursa derece ciddi şekilde iyileşebilir.' },
  { id: 'attendance-performance', section: 'performance', title: 'Antrenman katılımı performansı nasıl etkiler?', description: 'Düzenli katılım teknik tekrar, dayanıklılık ve yarış ritmini güçlendirir.', example: 'Haftalık katılım yüzde 90 üzerindeyse gelişim takibi daha sağlıklı olur.' },
];

export const parentGuides: AcademyItem[] = [
  { id: 'race-bag', section: 'parent', title: 'Yarış günü çantasında ne olmalı?', description: 'Yedek mayo, havlu, bone, gözlük, su, hafif atıştırmalık ve kulüp kıyafeti hazır olmalıdır.', example: 'Yarıştan bir gece önce çanta kontrol listesi yapılabilir.' },
  { id: 'pre-race-nutrition', section: 'parent', title: 'Yarıştan önce beslenme', description: 'Ağır ve alışılmadık yiyeceklerden kaçınmak, yeterli sıvı almak ve düzenli öğün planı önemlidir.', example: 'Yeni bir besini yarış günü ilk kez denememek gerekir.', warning: 'Bu içerikler bilgilendirme amaçlıdır. Sağlık, sakatlık ve beslenme konularında uzman görüşü alınmalıdır.' },
  { id: 'post-race-recovery', section: 'parent', title: 'Yarıştan sonra toparlanma', description: 'Sıvı alımı, hafif beslenme, aktif dinlenme ve uyku toparlanmanın temel parçalarıdır.', example: 'Yarış sonrası ilk saat toparlanma için değerlidir.', warning: 'Bu içerikler bilgilendirme amaçlıdır. Sağlık, sakatlık ve beslenme konularında uzman görüşü alınmalıdır.' },
  { id: 'pressure', section: 'parent', title: 'Sporcuyu yarış baskısından koruma', description: 'Sonuca değil çabaya, plana ve öğrenmeye odaklanan iletişim sporcuyu destekler.', example: '“Elinden geleni yap” yaklaşımı “Mutlaka kazan” baskısından daha sağlıklıdır.' },
  { id: 'sleep-performance', section: 'parent', title: 'Uyku ve performans', description: 'Yeterli uyku reaksiyon, koordinasyon, toparlanma ve odaklanmayı destekler.', example: 'Yarış haftasında düzenli uyku saati korunmalıdır.' },
  { id: 'injury-signs', section: 'parent', title: 'Sakatlık belirtisi varsa ne yapılmalı?', description: 'Ağrı, şişlik veya hareket kısıtlılığı varsa antrenöre bilgi verilmeli ve uzman görüşü alınmalıdır.', example: 'Omuz ağrısı görmezden gelinmemelidir.', warning: 'Bu içerikler bilgilendirme amaçlıdır. Sağlık, sakatlık ve beslenme konularında uzman görüşü alınmalıdır.' },
  { id: 'coach-parent', section: 'parent', title: 'Antrenör-veli iletişimi nasıl olmalı?', description: 'Kısa, saygılı, zamanında ve sporcunun gelişimine odaklı iletişim en sağlıklı modeldir.', example: 'Teknik kararlar antrenörle uygun zamanda konuşulmalıdır.' },
  { id: 'race-day-support', section: 'parent', title: 'Yarış günü çocuğa nasıl destek olunur?', description: 'Sakin kalmak, planı hatırlatmak ve sonuçtan bağımsız destek vermek sporcunun güvenini artırır.', example: 'Yarış sonrası önce çabasını takdir etmek önemlidir.' },
];

export const academySections = [
  { id: 'glossary' as const, title: 'Yüzme Sözlüğü', color: '#19E7FF' },
  { id: 'competition' as const, title: 'Yarışma Sistemi', color: '#FBBF24' },
  { id: 'performance' as const, title: 'Performans Analizi', color: '#22C55E' },
  { id: 'parent' as const, title: 'Veli Rehberi', color: '#FB7185' },
];

export const academyItems = [
  ...glossaryTerms,
  ...competitionGuides,
  ...performanceGuides,
  ...parentGuides,
];
