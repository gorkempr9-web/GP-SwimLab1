# Beta 1.4 Pilot Test Kontrol Listesi

Bu liste APK/Expo Go pilot kontrol turunda temel akışların hızlıca doğrulanması için hazırlanmıştır.

## Giriş / Demo Kodları

- [ ] Login ekranı boş alanlarla açılıyor.
- [ ] Demo giriş rol kodu doğruysa ilgili rol dashboard açılıyor.
- [ ] Yanlış demo rol kodu girişe izin vermiyor.
- [ ] Admin kodu yalnızca admin panel erişimi veriyor.
- [ ] Normal kayıt akışı davet kodu olmadan tamamlanmıyor.

## Kulüp Kodu

- [ ] MEV26 kodu MEV Koleji kulübüne bağlıyor.
- [ ] BASKENT26 kodu Başkent Çankaya Spor Kulübü kulübüne bağlıyor.
- [ ] PILOT26 kodu SwimLab Pilot Kulüp kulübüne bağlıyor.
- [ ] Yanlış kulüp kodu kullanıcıyı içeri almıyor.
- [ ] Profil, dashboard ve kulüp ekranında seçilen kulüp görünüyor.

## Sporcu Ekle

- [ ] Kulüp yöneticisi Sporcu Ekle formunu açabiliyor.
- [ ] Zorunlu alanlar boşken kayıt engelleniyor.
- [ ] Kaydedilen sporcu Kulüp Sporcuları listesinde görünüyor.
- [ ] Kaydedilen sporcu Sporcu Ara sonucunda görünüyor.
- [ ] Sporcu yaş grubuna otomatik yerleşiyor.

## Antrenman Planı

- [ ] Tarih alanı manuel yazı yerine takvim seçici ile çalışıyor.
- [ ] Plan adı, grup/sporcu, süre, hedef ve havuz tipi kaydediliyor.
- [ ] Set ekleme, düzenleme ve silme çalışıyor.
- [ ] Kara Antrenmanı bölümünde hareket, set, tekrar, süre, dinlenme ve not kaydediliyor.
- [ ] Toplam metre yüzme setlerinden doğru hesaplanıyor.

## Antrenman Günlüğüm

- [ ] Sporcu kendisine/grubuna atanmış planı görüyor.
- [ ] Tamamlandı işaretleme çalışıyor.
- [ ] Gönderildi/Tamamlandı durumları doğru Türkçe karakterlerle görünüyor.
- [ ] Veri yoksa boş durum ekranı görünüyor.

## Swim Academy

- [ ] Swim Academy ekranı açılıyor.
- [ ] Serbest, Sırtüstü, Kurbağalama ve Kelebek içerikleri görünüyor.
- [ ] Her stilde 5 eğitim kartı listeleniyor.
- [ ] Kart detayında drill açıklamaları okunabiliyor.
- [ ] Antrenman planına ekle mock mesajı çalışıyor.

## Bildirimler

- [ ] Dashboard zilinde okunmamış bildirim sayısı görünüyor.
- [ ] Bildirim kartına basınca doğru ekrana yönleniyor.
- [ ] Okundu olarak işaretle tek bildirimi güncelliyor.
- [ ] Tümünü okundu yap sayacı sıfırlıyor.
- [ ] Uygulama yeniden açılınca okundu durumu geri bozulmuyor.

## Admin Panel

- [ ] Admin Paneli yalnızca super_admin rolünde görünüyor.
- [ ] Normal kullanıcı manuel rota ile admin panele giremiyor.
- [ ] Genel Özet, Kulüpler, Kullanıcılar ve Demo Verileri sekmeleri açılıyor.
- [ ] Kulüp bazlı demo veri temizleme çalışıyor.
- [ ] Tüm demo verileri temizleme sonrası özet kartları güncelleniyor.

## Firebase Firestore Kayıtları

- [ ] Firebase config yoksa uygulama local fallback ile çalışıyor.
- [ ] Firebase config varsa sporcu kayıtları ilgili clubId altında yazılıyor.
- [ ] Antrenman planları ilgili clubId altında yazılıyor.
- [ ] Bildirimler ilgili clubId altında okunuyor.
- [ ] Admin Panel tüm kulüp verilerini okuyabiliyor.

## Rol Bazlı Yetki Kontrolü

- [ ] Sporcu canlı sonuç ve yarış listesi hazırlama ekranlarına erişemiyor.
- [ ] Veli yalnızca görüntüleme akışlarını kullanabiliyor.
- [ ] Antrenör yarış listesi, canlı giriş ve antrenman planı oluşturabiliyor.
- [ ] Kulüp yöneticisi kulüp sporcuları, antrenörler ve rapor merkezine erişebiliyor.
- [ ] Admin günlük kullanıcı modülleri yerine sadece yönetim ekranlarını görüyor.
