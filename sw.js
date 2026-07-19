const CACHE_NAME = "purple-clicker-v1";
// Önbelleğe alınacak dosyaların listesi
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./firebaseConfig.js",
    "./manifest.json"
];

// Service Worker Yüklendiğinde Dosyaları Önbelleğe Al
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Eski Önbellekleri Temizle
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Dosya İsteklerini Önbellekten Yakala (Çevrimdışı Çalışma Desteği)
self.addEventListener("fetch", (event) => {
    // Firebase isteklerini veya dışarıdan gelen CDN linklerini cache'lememek için filtreleme
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
