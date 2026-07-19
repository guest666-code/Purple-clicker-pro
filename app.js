// Kendi oluşturduğun config dosyasından auth ve db'yi çekiyoruz
import { auth, db } from "./firebaseConfig.js";

// Firebase fonksiyonlarını CDN üzerinden yüklüyoruz
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { 
    ref, 
    set, 
    get, 
    update, 
    onValue, 
    query, 
    orderByChild, 
    limitToLast 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const googleProvider = new GoogleAuthProvider();

// OYUN DURUM DEĞİŞKENLERİ
let gameState = {
    score: 0,
    cps: 0,
    upgrades: {}
};
let currentUser = null;

// TAM 21 ADET BENZERSİZ KARA BORSA EŞYASI
const marketItems = [
    { id: 1, name: "Paslı Tıklayıcı", baseCost: 15, cps: 0.2 },
    { id: 2, name: "Çalıntı Batarya", baseCost: 100, cps: 1 },
    { id: 3, name: "Modlu Fare Modülü", baseCost: 500, cps: 5 },
    { id: 4, name: "Makro Enjektörü", baseCost: 1200, cps: 12 },
    { id: 5, name: "DeepWeb Kodu", baseCost: 3000, cps: 30 },
    { id: 6, name: "Kuantum Çipi", baseCost: 7500, cps: 85 },
    { id: 7, name: "Overclock Trafosu", baseCost: 16000, cps: 200 },
    { id: 8, name: "Kripto Madenci Rig", baseCost: 45000, cps: 600 },
    { id: 9, name: "Yapay Zeka Botu v1", baseCost: 110000, cps: 1500 },
    { id: 10, name: "Siber Çekirdek", baseCost: 280000, cps: 4000 },
    { id: 11, name: "Karbon Fiber Tetikleyici", baseCost: 650000, cps: 9500 },
    { id: 12, name: "Plazma Kondansatörü", baseCost: 1500000, cps: 22000 },
    { id: 13, name: "Nöral Ağ Köprüsü", baseCost: 4000000, cps: 55000 },
    { id: 14, name: "Madde-Anti Madde Motoru", baseCost: 12000000, cps: 140000 },
    { id: 15, name: "Zaman Bükücü Saat", baseCost: 35000000, cps: 380000 },
    { id: 16, name: "Galaktik Sinyal Kulesi", baseCost: 90000000, cps: 1000000 },
    { id: 17, name: "Boyutlararası Geçit", baseCost: 250000000, cps: 2800000 },
    { id: 18, name: "Kara Delik Jeneratörü", baseCost: 750000000, cps: 8000000 },
    { id: 19, name: "Evrensel Simülatör", baseCost: 2000000000, cps: 25000000 },
    { id: 20, name: "Matrix Kaynak Kodu", baseCost: 6000000000, cps: 80000000 },
    { id: 21, name: "Purpleguy Nihai Gücü", baseCost: 20000000000, cps: 300000000 }
];

// ANTI-CHEAT (AC) DEĞİŞKENLERİ
let totalClicksInWindow = 0;
let acActive = false;

// KÜRESEL ERİŞİM FONKSİYONLARI (HTML tetiklemeleri için window nesnesine bağlıyoruz)
window.login = () => {
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    if(!e || !p) return alert("Lütfen alanları doldurun!");
    signInWithEmailAndPassword(auth, e, p).catch(err => alert(err.message));
};

window.register = () => {
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    if(!e || !p) return alert("Lütfen alanları doldurun!");
    createUserWithEmailAndPassword(auth, e, p).then(cred => {
        set(ref(db, 'users/' + cred.user.uid), { 
            username: e.split('@')[0], 
            score: 0, 
            banned: false,
            upgrades: {}
        });
    }).catch(err => alert(err.message));
};

window.loginWithGoogle = () => {
    signInWithPopup(auth, googleProvider).then(cred => {
        const userRef = ref(db, 'users/' + cred.user.uid);
        get(userRef).then(snapshot => {
            if (!snapshot.exists()) {
                set(userRef, { 
                    username: cred.user.displayName, 
                    score: 0, 
                    banned: false,
                    upgrades: {}
                });
            }
        });
    }).catch(err => alert(err.message));
};

window.logout = () => signOut(auth);

// AUTH DURUM TAKİPÇİSİ
onAuthStateChanged(auth, user => {
    if (user) {
        currentUser = user;
        
        // Veritabanından Ban durumunu ve İlerlemeyi Anlık Dinle
        onValue(ref(db, 'users/' + user.uid), snapshot => {
            const data = snapshot.val();
            
            // Anti-Cheat Ban Kontrolü
            if (data && data.banned) {
                alert("Hile kullanımı (Auto-Clicker) tespit edildiğinden hesabınız KALICI OLARAK BANLANMIŞTIR!");
                document.body.innerHTML = "<div class='flex items-center justify-center h-screen text-3xl font-black text-red-500 bg-neutral-950'>HESABINIZ BANLANDI (ANTI-CHEAT)</div>";
                signOut(auth);
                return;
            }
            
            if (data) {
                gameState.score = data.score || 0;
                gameState.upgrades = data.upgrades || {};
                recalculateCps();
                updateUI();
            }
        });

        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        document.getElementById('user-display').innerText = user.displayName || user.email.split('@')[0];
        
        // Döngüleri Başlat
        startGameLoops();
        buildShop();
        fetchLeaderboard();
    } else {
        currentUser = null;
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('auth-screen').classList.remove('hidden');
    }
});

// OYUN ZAMANLAYICI DÖNGÜLERİ (CPS VE AC KONTROLÜ)
function startGameLoops() {
    // 1. CPS Pasif Gelir Döngüsü (Her saniye çalışır)
    if (!window.cpsIntervalId) {
        window.cpsIntervalId = setInterval(() => {
            if (!currentUser) return;
            gameState.score += gameState.cps;
            updateUI();
            saveData();
        }, 1000);
    }

    // 2. Anti-Cheat Sistemi: Her 10 saniyede bir 5 saniyelik bir kontrol penceresi açar
    if (!window.acIntervalId) {
        window.acIntervalId = setInterval(() => {
            totalClicksInWindow = 0;
            acActive = true;

            // 5 Saniye sonra pencereyi kapat ve hızı test et
            setTimeout(() => {
                acActive = false;
                // Bir insan 5 saniye boyunca kesintisiz saniyede 15 tıklama (Toplam 75) yapamaz.
                // Bu limit aşılırsa direkt veritabanında banlanır.
                if (totalClicksInWindow > 75) {
                    executeBan();
                }
            }, 5000);
        }, 10000);
    }
}

function executeBan() {
    if (!currentUser) return;
    update(ref(db, 'users/' + currentUser.uid), { banned: true });
}

// TIKLAMA KAYIT ALGORİTMASI
window.registerClick = (event) => {
    gameState.score += 1;
    
    // AC Takip penceresi aktifse tıklamaları say
    if (acActive) {
        totalClicksInWindow++;
    }

    createFloatingText(event);
    updateUI();
};

// Ekranda Tıklanan Yerde +1 Efekti Çıkarma
function createFloatingText(e) {
    const p = document.createElement('div');
    p.innerText = "+1";
    p.className = "absolute font-black text-purple-400 text-xl pointer-events-none animate-ping z-50";
    p.style.left = `${e.clientX}px`;
    p.style.top = `${e.clientY}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 600);
}

// CPS HESAPLAMA VE MAĞAZA SATIN ALMA İŞLEMLERİ
function recalculateCps() {
    let totalCps = 0;
    marketItems.forEach(item => {
        const count = gameState.upgrades[item.id] || 0;
        totalCps += count * item.cps;
    });
    gameState.cps = parseFloat(totalCps.toFixed(1));
}

window.buyUpgrade = (id) => {
    const item = marketItems.find(i => i.id === id);
    const currentLevel = gameState.upgrades[id] || 0;
    
    // Her eşya en fazla 10 kere satın alınabilir kontrolü
    if (currentLevel >= 10) return;
    
    // Üstel fiyat artış formülü (Her seviyede %50 pahalanır)
    const cost = Math.floor(item.baseCost * Math.pow(1.5, currentLevel));
    
    if (gameState.score >= cost) {
        gameState.score -= cost;
        gameState.upgrades[id] = currentLevel + 1;
        recalculateCps();
        updateUI();
        saveData();
        buildShop();
    }
};

// ARAYÜZÜ GÜNCELLEME VE LİSTELEME
function updateUI() {
    const scoreEl = document.getElementById('score');
    const cpsEl = document.getElementById('cps-display');
    if(scoreEl) scoreEl.innerText = Math.floor(gameState.score).toLocaleString();
    if(cpsEl) cpsEl.querySelector('span').innerText = gameState.cps.toLocaleString();
}

// Kara Borsayı Oluşturma Metodu
function buildShop() {
    const container = document.getElementById('shop-container');
    if (!container) return;
    container.innerHTML = "";

    marketItems.forEach(item => {
        const level = gameState.upgrades[item.id] || 0;
        const cost = Math.floor(item.baseCost * Math.pow(1.5, level));
        const isMax = level >= 10;

        const btnClass = isMax ? 'bg-neutral-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 active:scale-95';

        container.innerHTML += `
            <div class="flex items-center justify-between p-3 bg-neutral-700/50 rounded-xl border border-neutral-600 transition card">
                <div>
                    <div class="font-bold text-sm text-white">${item.name}</div>
                    <div class="text-xs text-neutral-400">+${item.cps} CPS / Adet</div>
                    <div class="text-xs text-purple-400 font-bold">Seviye: ${level}/10</div>
                </div>
                <button onclick="buyUpgrade(${item.id})" ${isMax ? 'disabled' : ''} class="${btnClass} px-3 py-2 rounded-lg text-xs font-black transition">
                    ${isMax ? 'MAX' : cost.toLocaleString() + ' 🟣'}
                </button>
            </div>
        `;
    });
}

function saveData() {
    if (!currentUser) return;
    update(ref(db, 'users/' + currentUser.uid), {
        score: gameState.score,
        upgrades: gameState.upgrades
    });
}

// GLOBAL SCOREBOARD VERİ ÇEKİMİ (YENİLE BUTONU)
window.fetchLeaderboard = () => {
    const leaderboardRef = query(ref(db, 'users'), orderByChild('score'), limitToLast(10));
    get(leaderboardRef).then(snapshot => {
        const listContainer = document.getElementById('leaderboard-list');
        if (!listContainer) return;
        listContainer.innerHTML = "";
        
        let users = [];
        snapshot.forEach(child => {
            const val = child.val();
            if (val && !val.banned) {
                users.push(val);
            }
        });
        
        // Firebase artan sıraladığı için en yüksek puan en sonda gelir, tersine çeviriyoruz
        users.reverse().forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            listContainer.innerHTML += `
                <div class="flex justify-between items-center p-2.5 bg-neutral-700/30 rounded-lg border border-neutral-700 card">
                    <span class="font-bold text-sm text-neutral-300">${medal} ${user.username}</span>
                    <span class="font-black text-purple-400 text-sm">${Math.floor(user.score).toLocaleString()}</span>
                </div>
            `;
        });
    });
};

// DİNAMİK IŞIK MODU AÇ-KAPA SİSTEMİ
window.toggleLightMode = () => {
    const body = document.body;
    const btn = document.getElementById('light-btn');
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        btn.innerText = "🕶️ Işığı Kapat";
        btn.className = "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition";
    } else {
        btn.innerText = "💡 Işığı Aç";
        btn.className = "bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-lg font-semibold text-sm transition";
    }
};
