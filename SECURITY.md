# 🛡️ Security Policy & Implementation

Bu doküman, **Purple Clicker Pro** projesinin istemci güvenliğini, otomatik tıklama (auto-clicker) ve makro yazılımlarına karşı koruma mekanizmalarını ve Firebase Realtime Database üzerindeki veri güvenliği kurallarını (Security Rules) detaylandırmaktadır.

## 1. Makro ve Auto-Clicker Koruma Algoritması

İstemci tarafında çalışan Anti-Cheat (AC) motoru, insan biyolojisinin ve fiziksel sınırların üzerindeki tıklama hızlarını tespit etmek üzere matematiksel bir eşik modeli kullanır. Sistem, her 10 saniyelik periyotta oyuncunun gerçekleştirdiği toplam tıklama sayısını analiz eder.

### Matematiksel Tehdit Sınırı
Bir oyuncunun 5 saniye içerisinde üretebileceği maksimum teorik Tıklama Hızı (CPS - Clicks Per Second) şu formülle denetlenir:

$$T_{max} = CPS_{limit} \times \Delta t$$

Burada $CPS_{limit} = 15$ ve izleme aralığı $\Delta t = 5$ saniye olarak set edilmiştir. Buna bağlı olarak güvenli üst sınır:

$$T_{max} = 15 \times 5 = 75 \text{ Tıklama}$$

Eğer bir hesap 5 saniyelik dinamik kontrol penceresinde $T > 75$ koşulunu sağlarsa, istemci hile modülünü tetikler ve Firebase Auth üzerinden oturum açmış kullanıcının benzersiz kimliğine (`uid`) kalıcı bir yasaklama bayrağı (`banned: true`) işler.

## 2. Firebase Güvenlik Kuralları (Security Rules)

İstemci tarafındaki engellemeler kötü niyetli kullanıcılar tarafından JS manipülasyonu (Console injeksiyonu) ile devre dışı bırakılabilir. Bu nedenle nihai güvenlik katmanı Firebase Realtime Database kuralları ile sunucu tarafında (server-side) çözülmüştür.

Aşağıdaki JSON kuralları, yalnızca giriş yapmış kullanıcıların sadece kendi verilerini okumasına ve yazmasına izin verir. Ayrıca, veritabanında `banned: true` olarak işaretlenmiş kullanıcıların sisteme veri yazması sunucu düzeyinde engellenir:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid && !data.child('banned').val() == true",
        "score": {
          ".validate": "newData.isNumber() && newData.val() >= 0"
        },
        "banned": {
          ".validate": "newData.isBoolean()"
        }
      }
    },
    "leaderboard": {
      ".read": "auth != null",
      ".write": "auth != null && !root.child('users').child(auth.uid).child('banned').val() == true",
      "$uid": {
        ".validate": "auth.uid == $uid && newData.child('score').isNumber()"
      }
    }
  }
}

