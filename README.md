# 🟣 Purple Clicker Pro

**Purple Clicker Pro**, modern web teknolojileri (HTML5, CSS3, JavaScript) ve Tailwind CSS kullanılarak geliştirilmiş, PWA (Progressive Web App) destekli ve tam donanımlı bir klik oyunudur. Firebase entegrasyonu sayesinde tüm oyuncuların verileri bulutta anlık olarak senkronize edilir.

## 🚀 Özellikler

*   **🏴‍☠️ Gelişmiş Kara Borsa Mağazası:** Her biri maksimum 10 seviyeye kadar yükseltilebilir tam 21 benzersiz eşya. Üstel fiyat artış formülüyle dengelenmiş ekonomi.
*   **🏆 Küresel Sıralama (Global Scoreboard):** Firebase Realtime Database tabanlı, tek tıkla yenilenebilir (`🔄 Yenile`) dinamik en yüksek puan tablosu.
*   **🔐 Güvenli Kimlik Doğrulama:** Firebase Auth destekli E-posta/Şifre ile kayıt olma/giriş yapma ve hızlı Google ile Giriş seçenekleri.
*   **💡 Dinamik Işık Modu:** Tek tuşla arka planı ve kartları yumuşak bir geçiş efektiyle hafif açık renge çeviren göz dostu ışıklandırma sistemi.
*   **🛡️ Gelişmiş Anti-Cheat (AC):** Auto-Clicker yazılımlarını engellemek için her 10 saniyede bir çalışan 5 saniyelik dinamik kontrol mekanizması. İnsan limitini (5s / 75 Tıklama) aşan makroları otomatik tespit eder ve Firebase üzerinden hesabı kalıcı olarak yasaklar.
*   **📱 PWA Desteği:** `manifest.json` ve `sw.js` (Service Worker) altyapısı sayesinde oyunu mobil cihazlara uygulama olarak indirme ve çevrimdışı önbellekleme desteği.

## 📁 Proje Yapısı

```text
purple-clicker-pro/
├── index.html          # Oyunun arayüzü ve PWA/Service Worker bağlantıları
├── style.css           # Işık modu teması ve özel animasyonlar
├── app.js              # Oyun beyni, Anti-Cheat döngüleri ve dükkan mantığı
├── firebaseConfig.js   # Firebase SDK bağlantısı ve veritabanı anahtarları
├── manifest.json       # PWA kurulum, renk ve ikon yapılandırması
├── sw.js               # Arka plan veri önbellekleme (Cache) motoru
├── icon-192.png        # 192x192 Kurulum ikonu
└── icon-512.png        # 512x512 Açılış ekranı ikonu
