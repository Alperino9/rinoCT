// --- RINO CT V4 STABIL MOTOR ---
// Bağlantı kopmaları ve iframe engelleri nedeniyle en güvenli ve hızlı olan 
// "Doğrudan Yönlendirme (Start Page)" mantığına dönülmüştür.

const state = {
    searchEngine: localStorage.getItem('rino_engine') || 'google'
};

const ENGINES = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    yandex: 'https://yandex.com/search/?text=',
    yahoo: 'https://search.yahoo.com/search?p='
};

// --- DOM ELEMENTS ---
const homeTime = document.getElementById('home-time');
const homeDate = document.getElementById('home-date');
const homeSearchForm = document.getElementById('home-search-form');
const homeSearchInput = document.getElementById('home-search-input');
const shortcuts = document.querySelectorAll('.shortcut[data-url]');
const questionEl = document.getElementById('daily-question');

// Settings
const settingsModal = document.getElementById('settings-modal');
const engineSelect = document.getElementById('search-engine-select');

// --- INIT & CLOCK ---
function init() {
    updateClock();
    setInterval(updateClock, 1000);
    setDailyQuestion();
    engineSelect.value = state.searchEngine;
    setTimeout(() => { homeSearchInput.focus(); }, 300);

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
}

function updateClock() {
    const now = new Date();
    homeTime.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    homeDate.textContent = now.toLocaleDateString('tr-TR', { weekday: 'long', month: 'long', day: 'numeric' });
}

function setDailyQuestion() {
    const q = [
        "Eğer bugün hayatının son günü olsaydı, şu an ne yapıyor olurdun?",
        "Zaman yolculuğu mümkün olsaydı nereye giderdin?",
        "Sence gerçek özgürlük nedir?",
        "Eğer dünyadaki herhangi bir problemi çözebilseydin, bu ne olurdu?"
    ];
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    questionEl.textContent = q[dayOfYear % q.length];
}

// --- NAVIGATION LOGIC ---
function parseInputToUrl(query) {
    query = query.trim();
    if (!query) return null;
    if (/^https?:\/\//i.test(query)) return query;
    if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(.*)$/.test(query) && !query.includes(' ')) return 'https://' + query;
    return ENGINES[state.searchEngine] + encodeURIComponent(query);
}

function navigateTo(url) {
    if (!url) return;
    
    // Stabil Yönlendirme (Mevcut sekmeyi web sitesine çevir)
    // Böylece X-Frame-Options ve ERR_CONNECTION_RESET hatası oluşmaz.
    window.location.href = url;
}

// --- EVENT LISTENERS ---
homeSearchForm.addEventListener('submit', (e) => { 
    e.preventDefault(); 
    navigateTo(parseInputToUrl(homeSearchInput.value)); 
});

shortcuts.forEach(shortcut => {
    shortcut.addEventListener('click', () => {
        navigateTo(shortcut.getAttribute('data-url'));
    });
});

function openSettings() { settingsModal.classList.add('show'); }
function closeSettings() { settingsModal.classList.remove('show'); }
document.getElementById('open-settings-home').addEventListener('click', openSettings);
document.getElementById('close-settings-btn').addEventListener('click', closeSettings);
settingsModal.addEventListener('click', (e) => { if(e.target === settingsModal) closeSettings(); });

engineSelect.addEventListener('change', (e) => {
    state.searchEngine = e.target.value;
    localStorage.setItem('rino_engine', state.searchEngine);
});

init();
