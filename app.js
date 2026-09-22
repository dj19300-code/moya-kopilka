"use strict";

var STORAGE_KEY = "familyBalanceV44";
var THEME_KEY = "familyBalanceTheme";
var PARENT_PASSWORD = "1234";
var EXCHANGE_RATE = 5;
var HISTORY_LIMIT = 10;
var GRADES_LIMIT = 10;
var NOTIF_LIMIT = 100;
var PHOTO_MAX_SIZE = 640;
var PHOTO_QUALITY = 0.7;
var FRESH_APPROVAL_MS = 20000;
var MAX_GOALS = 3;
var DAY_CHECK_INTERVAL_MS = 30000;
var GUFFY_NIGHT_START = 22;
var GUFFY_NIGHT_END = 7;
var SCROLL_TOP_THRESHOLD = 400;

var FAMILY_ID = "moya-kopilka-7k3m9p2x8q10DenL";

var firebaseConfig = {
  apiKey: "AIzaSyBL8WTvJI4AN2C5E_PYkGy04sjEkD-7jjk",
  authDomain: "family-balance-2fc27.firebaseapp.com",
  databaseURL: "https://family-balance-2fc27-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "family-balance-2fc27",
  storageBucket: "family-balance-2fc27.firebasestorage.app",
  messagingSenderId: "591816268672",
  appId: "1:591816268672:web:0179c1289251f2cf893f65"
};

var LEVELS = [
  { min: 0,    name: "Яйцо",                key: "egg" },
  { min: 200,  name: "Дракончик",           key: "baby" },
  { min: 600,  name: "Юный дракон",         key: "young" },
  { min: 1200, name: "Дракон",              key: "adult" },
  { min: 2500, name: "Большой дракон",      key: "big" },
  { min: 5000, name: "Легендарный дракон",  key: "legend" }
];

var MOTIVATION_PHRASES = [
  "Так держать! 🚀", "Ты супер! 🌟", "Ещё один шаг к цели! 🎯",
  "Отличная работа! 💪", "Продолжай в том же духе! ✨",
  "Здорово получается! 👏", "Вот это результат! 🔥"
];

var AVATARS = ["👧","👦","🧒","🐱","🐶","🦊","🐼","🦄","🐸","🐯","🐰","🦁","🐨","🐵"];

var TREASURE_REWARDS = [
  { points: 1, text: "Маленькая удача! +1 балл" },
  { points: 2, text: "Монетка в копилке! +2 балла" },
  { points: 3, text: "Найдено сокровище! +3 балла" },
  { points: 5, text: "Джекпот! +5 баллов" }
];

var CHORE_TEMPLATES = [
  { title: "Прокормить Киру",           description: "Накормить кошку",         reward: 3, repeat: "daily",    maxPerDay: 2, days: [] },
  { title: "Покормить Жужу",            description: "Накормить собаку",        reward: 3, repeat: "daily",    maxPerDay: 2, days: [] },
  { title: "Убрать лоток",              description: "Убрать за кошкой",        reward: 5, repeat: "daily",    maxPerDay: 1, days: [] },
  { title: "Сделать уроки",             description: "Домашнее задание",        reward: 5, repeat: "weekdays", maxPerDay: 1, days: [] },
  { title: "Помыть посуду",             description: "Помыть и протереть стол", reward: 5, repeat: "daily",    maxPerDay: 1, days: [] },
  { title: "Протереть пыль",            description: "Пыль с полок и столов",   reward: 4, repeat: "weekend",  maxPerDay: 1, days: [] },
  { title: "Полить цветы",              description: "Все комнатные цветы",     reward: 2, repeat: "custom",   maxPerDay: 1, days: [1,3,5] },
  { title: "Убрать вещи",               description: "Разложить по местам",     reward: 3, repeat: "daily",    maxPerDay: 1, days: [] },
  { title: "Пропылесосить около лотка", description: "Пылесос вокруг лотка",    reward: 4, repeat: "daily",    maxPerDay: 1, days: [] },
  { title: "Выгулять Жужу",             description: "Прогулка с собакой",      reward: 5, repeat: "daily",    maxPerDay: 3, days: [] }
];

var MATH_SUBJECT = "Математика";
var KNOWN_SUBJECTS = ["Математика","Русский язык","Белорусский язык","Литературное чтение","Окружающий мир","Английский язык","Трудовое обучение","Изобразительное искусство","Физическая культура"];

var DATA_KEYS = [
  "balance","points","totalEarnedPoints","lastLevel","avatar","lastTreasureDate","guffyMode",
  "profile","chores","completions","grades","gradeRequests","withdrawRequests",
  "goals","transactions","notifications"
];

function $(s) { return document.querySelector(s); }
function $$(s) { return document.querySelectorAll(s); }

function formatDate(d) {
  var m = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}
function today() { return formatDate(new Date()); }
function formatTime(ts) {
  var d = new Date(ts);
  var hh = String(d.getHours()).padStart(2, "0");
  var mm = String(d.getMinutes()).padStart(2, "0");
  var dateStr = formatDate(d);
  var todayStr = formatDate(new Date());
  if (dateStr === todayStr) return "Сегодня, " + hh + ":" + mm;
  var yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (dateStr === formatDate(yest)) return "Вчера, " + hh + ":" + mm;
  var dd = String(d.getDate()).padStart(2, "0");
  var mo = String(d.getMonth() + 1).padStart(2, "0");
  return dd + "." + mo + ", " + hh + ":" + mm;
}
function daysBetween(a, b) {
  var d1 = new Date(a + "T00:00:00");
  var d2 = new Date(b + "T00:00:00");
  return Math.round((d2 - d1) / 86400000);
}
function escapeHtml(v) {
  return String(v == null ? "" : v).replace(/[&<>'"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c];
  });
}
function toInt(v) { var n = Number(v); return Number.isFinite(n) ? Math.trunc(n) : NaN; }
function isNonNegativeInt(v) { return Number.isInteger(v) && v >= 0; }
function uniqueId() { return Date.now() * 1000 + Math.floor(Math.random() * 1000); }
function pluralPoints(n) {
  var m10 = Math.abs(n) % 10, m100 = Math.abs(n) % 100;
  if (m10 === 1 && m100 !== 11) return "балл";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "балла";
  return "баллов";
}
function pluralDays(n) {
  var m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "день";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "дня";
  return "дней";
}
function pluralYears(n) {
  var m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "год";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "года";
  return "лет";
}
function pluralTimes(n) {
  var m10 = Math.abs(n) % 10, m100 = Math.abs(n) % 100;
  if (m10 === 1 && m100 !== 11) return "раз";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "раза";
  return "раз";
}
function randomPhrase() { return MOTIVATION_PHRASES[Math.floor(Math.random() * MOTIVATION_PHRASES.length)]; }

function isMath(s) { return String(s || "").trim().toLowerCase() === MATH_SUBJECT.toLowerCase(); }
function paymentForGrade(g, s) {
  if (g >= 1 && g <= 3) return -2;
  if (g === 4 || g === 5 || g === 6) return 0;
  if (isMath(s)) {
    if (g === 10 || g === 9) return 5;
    if (g === 8) return 4;
    if (g === 7) return 2;
  } else {
    if (g === 10) return 3;
    if (g === 9) return 2;
    if (g === 7 || g === 8) return 1;
  }
  return 0;
}
function penaltyPointsForGrade(g) {
  if (g === 4 || g === 5) return -5;
  return 0;
}
function gradeEmoji(g) {
  if (g === 10) return "🌟";
  if (g === 9) return "⭐";
  if (g === 7 || g === 8) return "👍";
  if (g >= 4 && g <= 6) return "😐";
  return "😟";
}
function repeatLabel(r, days) {
  if (r === "custom") {
    if (!Array.isArray(days) || !days.length) return "📆 Свои дни";
    var n = { 1: "Пн", 2: "Вт", 3: "Ср", 4: "Чт", 5: "Пт", 6: "Сб", 0: "Вс" };
    return "📆 " + days.map(function (d) { return n[d]; }).join(", ");
  }
  var map = { daily: "🔁 Каждый день", weekdays: "📅 Будни", weekend: "🎉 Выходные", once: "1️⃣ Один раз" };
  return map[r] || "🔁 Каждый день";
}

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") {
    var keys = Object.keys(v);
    if (keys.length === 0) return [];
    var allNumeric = keys.every(function (k) { return /^\d+$/.test(k); });
    if (allNumeric) {
      return keys.sort(function (a, b) { return Number(a) - Number(b); }).map(function (k) { return v[k]; });
    }
  }
  return [];
}

var localStore = {
  get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: function (k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { console.warn("localStorage full?"); return false; } },
  remove: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
};

function applyTheme(theme) {
  var isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  var icons = document.querySelectorAll(".theme-icon");
  for (var i = 0; i < icons.length; i++) {
    icons[i].textContent = isDark ? "☀️" : "🌙";
  }
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", isDark ? "#1E1B2E" : "#8B5CF6");
}
function toggleTheme() {
  var isDark = document.body.classList.contains("dark");
  var next = isDark ? "light" : "dark";
  localStore.set(THEME_KEY, next);
  applyTheme(next);
}
function initTheme() {
  var stored = localStore.get(THEME_KEY);
  if (stored === "dark" || stored === "light") { applyTheme(stored); return; }
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) applyTheme("dark");
  else applyTheme("light");
}

function initScrollTopButton() {
  var btn = document.getElementById("scrollTopBtn");
  if (!btn) return;
  var ticking = false;

  function update() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (y > SCROLL_TOP_THRESHOLD) btn.classList.add("is-visible");
    else btn.classList.remove("is-visible");
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();

  btn.addEventListener("click", function () {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  });
}

function svgBell() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="bellGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE66D"/><stop offset="1" stop-color="#E8A32E"/></linearGradient></defs>' +
    '<ellipse cx="56" cy="88" rx="18" ry="3" fill="#000" opacity="0.12"/>' +
    '<g transform="rotate(18 52 52)">' +
      '<path d="M52 18 Q36 18 36 40 L36 56 Q32 58 32 64 L72 64 Q72 58 68 56 L68 40 Q68 18 52 18 Z" fill="url(#bellGrad)" stroke="#B45309" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<rect x="48" y="12" width="8" height="8" rx="3" fill="#E8A32E" stroke="#B45309" stroke-width="1.2"/>' +
      '<path d="M44 70 Q52 80 60 70" fill="#E8A32E" stroke="#B45309" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<circle cx="44" cy="42" r="2.8" fill="#FFFFFF" opacity="0.65"/>' +
    '</g>' +
    '<g transform="rotate(-25 24 72)">' +
      '<rect x="20" y="60" width="3.5" height="18" rx="1.75" fill="#8B5CF6" stroke="#5B21B6" stroke-width="1"/>' +
      '<circle cx="21.75" cy="58" r="5" fill="#A78BFA" stroke="#5B21B6" stroke-width="1.2"/>' +
    '</g>' +
    '<path d="M76 30 Q82 34 82 42" stroke="#8B5CF6" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.85"/>' +
    '<path d="M82 26 Q90 32 90 42" stroke="#A78BFA" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.6"/>' +
    '<path d="M88 22 Q96 30 96 42" stroke="#C4B5FD" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.4"/>' +
    '</svg>';
}
function svgChecklist() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="checklistGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A78BFA"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="88" rx="24" ry="3" fill="#000" opacity="0.1"/>' +
    '<rect x="22" y="20" width="56" height="62" rx="6" fill="#FFFFFF" stroke="#DDD0F5" stroke-width="1.4"/>' +
    '<rect x="28" y="14" width="44" height="12" rx="4" fill="url(#checklistGrad)"/>' +
    '<circle cx="38" cy="38" r="5" fill="#DDF7F4" stroke="#0D9488" stroke-width="1.2"/>' +
    '<path d="M35.5 38 L37.5 40 L41 36" stroke="#0D9488" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<line x1="48" y1="38" x2="68" y2="38" stroke="#DDD0F5" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="38" cy="52" r="5" fill="#DDF7F4" stroke="#0D9488" stroke-width="1.2"/>' +
    '<path d="M35.5 52 L37.5 54 L41 50" stroke="#0D9488" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<line x1="48" y1="52" x2="68" y2="52" stroke="#DDD0F5" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="38" cy="66" r="5" fill="#F0E9FF" stroke="#A78BFA" stroke-width="1.2"/>' +
    '<line x1="48" y1="66" x2="62" y2="66" stroke="#DDD0F5" stroke-width="2" stroke-linecap="round"/>' +
    '</svg>';
}
function svgDiary() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="diaryGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A78BFA"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="88" rx="30" ry="4" fill="#000" opacity="0.12"/>' +
    '<rect x="20" y="18" width="52" height="70" rx="4" fill="url(#diaryGrad)" stroke="#5B21B6" stroke-width="1.5"/>' +
    '<rect x="20" y="18" width="8" height="70" rx="3" fill="#6D28D9"/>' +
    '<path d="M60 18 L60 42 L64 38 L68 42 L68 18 Z" fill="#F472B6" stroke="#DB2777" stroke-width="1"/>' +
    '<text x="46" y="68" font-family="Fredoka, sans-serif" font-size="34" font-weight="800" text-anchor="middle" fill="#FFE66D" stroke="#B45309" stroke-width="0.8">5</text>' +
    '</svg>';
}
function svgTarget() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="50" cy="50" r="32" fill="#FFFFFF" stroke="#E5C5F5" stroke-width="1.5"/>' +
    '<circle cx="50" cy="50" r="25" fill="#F9A8D4"/>' +
    '<circle cx="50" cy="50" r="18" fill="#FFFFFF"/>' +
    '<circle cx="50" cy="50" r="11" fill="#F472B6"/>' +
    '<circle cx="50" cy="50" r="5" fill="#DB2777"/>' +
    '<circle cx="50" cy="50" r="2" fill="#FFE66D"/>' +
    '<line x1="22" y1="22" x2="47" y2="47" stroke="#8B5CF6" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M20 20 L24 14 L28 22 Z" fill="#8B5CF6"/>' +
    '</svg>';
}
function svgExchange() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="exchGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5EEAD4"/><stop offset="1" stop-color="#0D9488"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="88" rx="24" ry="3" fill="#000" opacity="0.1"/>' +
    '<path d="M28 34 L60 34 M60 34 L52 26 M60 34 L52 42" stroke="url(#exchGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
    '<path d="M72 66 L40 66 M40 66 L48 58 M40 66 L48 74" stroke="url(#exchGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
    '<circle cx="50" cy="50" r="3" fill="#FBBF24"/>' +
    '</svg>';
}
function svgBook() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="bookGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5EEAD4"/><stop offset="1" stop-color="#0D9488"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="86" rx="30" ry="4" fill="#000" opacity="0.12"/>' +
    '<rect x="14" y="24" width="72" height="58" rx="5" fill="url(#bookGrad)" stroke="#0F766E" stroke-width="1.5"/>' +
    '<rect x="14" y="24" width="10" height="58" rx="3" fill="#0F766E"/>' +
    '<path d="M78 26 L78 52 L82 48 L86 52 L86 26 Z" fill="#F472B6" stroke="#DB2777" stroke-width="1"/>' +
    '<line x1="30" y1="48" x2="70" y2="48" stroke="#5EEAD4" stroke-width="1.2" opacity="0.6"/>' +
    '<line x1="30" y1="56" x2="70" y2="56" stroke="#5EEAD4" stroke-width="1.2" opacity="0.6"/>' +
    '</svg>';
}
function svgMoney() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="moneyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE66D"/><stop offset="1" stop-color="#F59E0B"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="88" rx="26" ry="3" fill="#000" opacity="0.12"/>' +
    '<ellipse cx="50" cy="74" rx="26" ry="9" fill="url(#moneyGrad)" stroke="#B45309" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="66" rx="26" ry="9" fill="url(#moneyGrad)" stroke="#B45309" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="58" rx="26" ry="9" fill="url(#moneyGrad)" stroke="#B45309" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="50" rx="26" ry="9" fill="url(#moneyGrad)" stroke="#B45309" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="50" rx="14" ry="5" fill="#FFFFFF" opacity="0.35"/>' +
    '</svg>';
}

function dragonEgg() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><radialGradient id="eggGrad" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#F9A8D4"/><stop offset="0.55" stop-color="#C4B5FD"/><stop offset="1" stop-color="#7C3AED"/></radialGradient></defs>' +
    '<ellipse cx="50" cy="90" rx="22" ry="3" fill="#000" opacity="0.12"/>' +
    '<path d="M50 15 C 32 15 22 40 22 58 C 22 76 34 86 50 86 C 66 86 78 76 78 58 C 78 40 68 15 50 15 Z" fill="url(#eggGrad)" stroke="#5B21B6" stroke-width="1.6"/>' +
    '<ellipse cx="42" cy="42" rx="4" ry="5.5" fill="#F9A8D4" opacity="0.65"/>' +
    '<ellipse cx="60" cy="58" rx="3.5" ry="4.5" fill="#F9A8D4" opacity="0.6"/>' +
    '<ellipse cx="38" cy="32" rx="5" ry="8" fill="#FFFFFF" opacity="0.55"/>' +
    '<path d="M46 78 L50 72 L47 68 L52 64" stroke="#5B21B6" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}
function dragonBaby() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="babyBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDD0F5"/><stop offset="1" stop-color="#A78BFA"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="90" rx="22" ry="3" fill="#000" opacity="0.12"/>' +
    '<ellipse cx="50" cy="72" rx="18" ry="13" fill="url(#babyBody)" stroke="#7C3AED" stroke-width="1.5"/>' +
    '<ellipse cx="40" cy="84" rx="4.5" ry="3" fill="#7C3AED"/>' +
    '<ellipse cx="60" cy="84" rx="4.5" ry="3" fill="#7C3AED"/>' +
    '<circle cx="50" cy="42" r="20" fill="url(#babyBody)" stroke="#7C3AED" stroke-width="1.5"/>' +
    '<path d="M42 24 L38 14 L46 22 Z" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<circle cx="44" cy="42" r="3.6" fill="#1E1B2E"/>' +
    '<circle cx="45" cy="40.8" r="1.2" fill="#FFFFFF"/>' +
    '<circle cx="56" cy="42" r="3.6" fill="#1E1B2E"/>' +
    '<circle cx="57" cy="40.8" r="1.2" fill="#FFFFFF"/>' +
    '<path d="M46 52 Q50 55 54 52" stroke="#1E1B2E" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}
function dragonYoung() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="youngBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C4B5FD"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="91" rx="24" ry="3" fill="#000" opacity="0.12"/>' +
    '<path d="M28 60 Q10 54 18 78 Q24 68 34 66 Z" fill="#F9A8D4" stroke="#DB2777" stroke-width="1.4"/>' +
    '<path d="M72 60 Q90 54 82 78 Q76 68 66 66 Z" fill="#F9A8D4" stroke="#DB2777" stroke-width="1.4"/>' +
    '<ellipse cx="50" cy="70" rx="21" ry="16" fill="url(#youngBody)" stroke="#5B21B6" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="74" rx="12" ry="9" fill="#F5F0FF" opacity="0.75"/>' +
    '<ellipse cx="50" cy="40" rx="19" ry="17" fill="url(#youngBody)" stroke="#5B21B6" stroke-width="1.5"/>' +
    '<path d="M40 26 L36 14 L44 24 Z" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<path d="M60 26 L64 14 L56 24 Z" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<circle cx="43" cy="40" r="3.4" fill="#1E1B2E"/>' +
    '<circle cx="44" cy="38.9" r="1.1" fill="#FFFFFF"/>' +
    '<circle cx="57" cy="40" r="3.4" fill="#1E1B2E"/>' +
    '<circle cx="58" cy="38.9" r="1.1" fill="#FFFFFF"/>' +
    '<path d="M45 48 Q50 51 55 48" stroke="#1E1B2E" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}
function dragonAdult() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<linearGradient id="adultBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A78BFA"/><stop offset="1" stop-color="#6D28D9"/></linearGradient>' +
      '<linearGradient id="adultWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5EEAD4"/><stop offset="1" stop-color="#0D9488"/></linearGradient>' +
    '</defs>' +
    '<ellipse cx="50" cy="92" rx="26" ry="3" fill="#000" opacity="0.14"/>' +
    '<path d="M30 55 Q6 42 12 82 Q20 68 34 62 Z" fill="url(#adultWing)" stroke="#0F766E" stroke-width="1.5"/>' +
    '<path d="M70 55 Q94 42 88 82 Q80 68 66 62 Z" fill="url(#adultWing)" stroke="#0F766E" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="70" rx="20" ry="17" fill="url(#adultBody)" stroke="#4C1D95" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="74" rx="11" ry="9" fill="#DDD0F5" opacity="0.75"/>' +
    '<ellipse cx="50" cy="38" rx="20" ry="18" fill="url(#adultBody)" stroke="#4C1D95" stroke-width="1.5"/>' +
    '<path d="M40 24 L36 12 L42 20 L44 10 L46 20 L44 24" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<path d="M60 24 L64 12 L58 20 L56 10 L54 20 L56 24" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<circle cx="43" cy="38" r="3.6" fill="#1E1B2E"/>' +
    '<circle cx="44" cy="36.8" r="1.2" fill="#FFFFFF"/>' +
    '<circle cx="57" cy="38" r="3.6" fill="#1E1B2E"/>' +
    '<circle cx="58" cy="36.8" r="1.2" fill="#FFFFFF"/>' +
    '<path d="M44 46 Q50 50 56 46" stroke="#1E1B2E" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}
function dragonBig() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<linearGradient id="bigBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B5CF6"/><stop offset="1" stop-color="#4C1D95"/></linearGradient>' +
      '<linearGradient id="bigWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5EEAD4"/><stop offset="1" stop-color="#0D9488"/></linearGradient>' +
      '<radialGradient id="bigGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0.4" stop-color="#FBBF24" stop-opacity="0.15"/><stop offset="1" stop-color="#FBBF24" stop-opacity="0"/></radialGradient>' +
    '</defs>' +
    '<circle cx="50" cy="50" r="46" fill="url(#bigGlow)"/>' +
    '<ellipse cx="50" cy="93" rx="28" ry="3" fill="#000" opacity="0.15"/>' +
    '<path d="M28 52 Q2 36 8 84 Q18 68 32 60 Z" fill="url(#bigWing)" stroke="#0F766E" stroke-width="1.6"/>' +
    '<path d="M72 52 Q98 36 92 84 Q82 68 68 60 Z" fill="url(#bigWing)" stroke="#0F766E" stroke-width="1.6"/>' +
    '<ellipse cx="50" cy="70" rx="20" ry="18" fill="url(#bigBody)" stroke="#3B1F5C" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="75" rx="11" ry="9" fill="#C4B5FD" opacity="0.75"/>' +
    '<ellipse cx="50" cy="36" rx="21" ry="19" fill="url(#bigBody)" stroke="#3B1F5C" stroke-width="1.5"/>' +
    '<path d="M38 22 L34 8 L40 18 L42 6 L44 18 L42 22" fill="#FFE66D" stroke="#B45309" stroke-width="1.3"/>' +
    '<path d="M62 22 L66 8 L60 18 L58 6 L56 18 L58 22" fill="#FFE66D" stroke="#B45309" stroke-width="1.3"/>' +
    '<circle cx="42" cy="36" r="3.8" fill="#1E1B2E"/>' +
    '<circle cx="43" cy="34.6" r="1.3" fill="#FFFFFF"/>' +
    '<circle cx="58" cy="36" r="3.8" fill="#1E1B2E"/>' +
    '<circle cx="59" cy="34.6" r="1.3" fill="#FFFFFF"/>' +
    '<path d="M46 46 Q50 49 54 46" stroke="#1E1B2E" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}
function dragonLegend() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<linearGradient id="legBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C3AED"/><stop offset="1" stop-color="#4C1D95"/></linearGradient>' +
      '<linearGradient id="legWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5EEAD4"/><stop offset="1" stop-color="#0D9488"/></linearGradient>' +
      '<radialGradient id="legGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0.2" stop-color="#FBBF24" stop-opacity="0.28"/><stop offset="1" stop-color="#FBBF24" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="legCrown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE66D"/><stop offset="1" stop-color="#F59E0B"/></linearGradient>' +
    '</defs>' +
    '<circle cx="50" cy="50" r="48" fill="url(#legGlow)"/>' +
    '<ellipse cx="50" cy="94" rx="30" ry="3" fill="#000" opacity="0.16"/>' +
    '<path d="M26 50 Q0 32 4 84 Q16 66 30 58 Z" fill="url(#legWing)" stroke="#0F766E" stroke-width="1.8"/>' +
    '<path d="M74 50 Q100 32 96 84 Q84 66 70 58 Z" fill="url(#legWing)" stroke="#0F766E" stroke-width="1.8"/>' +
    '<ellipse cx="50" cy="70" rx="21" ry="19" fill="url(#legBody)" stroke="#2D1B5E" stroke-width="1.6"/>' +
    '<ellipse cx="50" cy="75" rx="12" ry="10" fill="#C4B5FD" opacity="0.8"/>' +
    '<ellipse cx="50" cy="35" rx="22" ry="20" fill="url(#legBody)" stroke="#2D1B5E" stroke-width="1.6"/>' +
    '<path d="M32 22 L36 10 L42 18 L50 6 L58 18 L64 10 L68 22 L66 24 L34 24 Z" fill="url(#legCrown)" stroke="#B45309" stroke-width="1.4"/>' +
    '<path d="M36 34 L26 32 L30 38 Z" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<path d="M64 34 L74 32 L70 38 Z" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<circle cx="42" cy="36" r="4" fill="#FBBF24"/>' +
    '<circle cx="42" cy="36" r="2.4" fill="#1E1B2E"/>' +
    '<circle cx="42.8" cy="35" r="0.9" fill="#FFFFFF"/>' +
    '<circle cx="58" cy="36" r="4" fill="#FBBF24"/>' +
    '<circle cx="58" cy="36" r="2.4" fill="#1E1B2E"/>' +
    '<circle cx="58.8" cy="35" r="0.9" fill="#FFFFFF"/>' +
    '<path d="M45 47 Q50 50 55 47" stroke="#1E1B2E" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}
function dragonSvg(key) {
  var map = { egg: dragonEgg, baby: dragonBaby, young: dragonYoung, adult: dragonAdult, big: dragonBig, legend: dragonLegend };
  var fn = map[key];
  return fn ? fn() : "";
}

function guffyTentacles(cx, cy) {
  var legs = [
    [cx - 17, cy + 28, cx - 32, cy + 42, cx - 26, cy + 55],
    [cx - 9,  cy + 33, cx - 15, cy + 46, cx - 11, cy + 57],
    [cx + 0,  cy + 35, cx - 2,  cy + 48, cx + 2,  cy + 59],
    [cx + 9,  cy + 33, cx + 15, cy + 46, cx + 11, cy + 57],
    [cx + 17, cy + 28, cx + 32, cy + 42, cx + 26, cy + 55]
  ];
  var outlines = "", fills = "";
  legs.forEach(function (l) {
    var d = "M" + l[0] + " " + l[1] + " Q" + l[2] + " " + l[3] + " " + l[4] + " " + l[5];
    outlines += '<path d="' + d + '" fill="none" stroke="#7C3AED" stroke-width="5" stroke-linecap="round"/>';
    fills += '<path d="' + d + '" fill="none" stroke="#A78BFA" stroke-width="2.6" stroke-linecap="round"/>';
  });
  return outlines + fills;
}

function guffyEyes(cx, cy, emotion) {
  var ex1 = cx - 10, ex2 = cx + 10, ey = cy + 18;
  if (emotion === "happy") {
    return '<path d="M' + (ex1 - 4) + ' ' + (ey + 2) + ' Q' + ex1 + ' ' + (ey - 3) + ' ' + (ex1 + 4) + ' ' + (ey + 2) + '" stroke="#1E1B2E" stroke-width="1.9" fill="none" stroke-linecap="round"/>' +
           '<path d="M' + (ex2 - 4) + ' ' + (ey + 2) + ' Q' + ex2 + ' ' + (ey - 3) + ' ' + (ex2 + 4) + ' ' + (ey + 2) + '" stroke="#1E1B2E" stroke-width="1.9" fill="none" stroke-linecap="round"/>';
  }
  if (emotion === "sleeping") {
    return '<path d="M' + (ex1 - 4) + ' ' + ey + ' Q' + ex1 + ' ' + (ey + 2.5) + ' ' + (ex1 + 4) + ' ' + ey + '" stroke="#1E1B2E" stroke-width="1.7" fill="none" stroke-linecap="round"/>' +
           '<path d="M' + (ex2 - 4) + ' ' + ey + ' Q' + ex2 + ' ' + (ey + 2.5) + ' ' + (ex2 + 4) + ' ' + ey + '" stroke="#1E1B2E" stroke-width="1.7" fill="none" stroke-linecap="round"/>';
  }
  if (emotion === "thinking") {
    return '<ellipse cx="' + ex1 + '" cy="' + ey + '" rx="4.5" ry="5.5" fill="#FFFFFF"/>' +
           '<circle cx="' + (ex1 + 1) + '" cy="' + (ey + 1) + '" r="2.8" fill="#1E1B2E"/>' +
           '<circle cx="' + (ex1 + 1.8) + '" cy="' + (ey - 0.5) + '" r="1" fill="#FFFFFF"/>' +
           '<path d="M' + (ex2 - 4) + ' ' + ey + ' Q' + ex2 + ' ' + (ey + 2.5) + ' ' + (ex2 + 4) + ' ' + ey + '" stroke="#1E1B2E" stroke-width="1.9" fill="none" stroke-linecap="round"/>';
  }
  return '<ellipse cx="' + ex1 + '" cy="' + ey + '" rx="4.5" ry="5.5" fill="#FFFFFF"/>' +
         '<ellipse cx="' + ex2 + '" cy="' + ey + '" rx="4.5" ry="5.5" fill="#FFFFFF"/>' +
         '<circle cx="' + (ex1 + 1) + '" cy="' + (ey + 1) + '" r="2.8" fill="#1E1B2E"/>' +
         '<circle cx="' + (ex2 + 1) + '" cy="' + (ey + 1) + '" r="2.8" fill="#1E1B2E"/>' +
         '<circle cx="' + (ex1 + 1.8) + '" cy="' + (ey - 0.5) + '" r="1" fill="#FFFFFF"/>' +
         '<circle cx="' + (ex2 + 1.8) + '" cy="' + (ey - 0.5) + '" r="1" fill="#FFFFFF"/>';
}

function guffyMouth(cx, cy, emotion) {
  var my = cy + 26;
  if (emotion === "happy") {
    return '<path d="M' + (cx - 6) + ' ' + my + ' Q' + cx + ' ' + (my + 5) + ' ' + (cx + 6) + ' ' + my + '" stroke="#1E1B2E" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
  }
  if (emotion === "sleeping") {
    return '<ellipse cx="' + cx + '" cy="' + my + '" rx="1.8" ry="2.2" fill="#1E1B2E" opacity="0.55"/>';
  }
  if (emotion === "thinking") {
    return '<path d="M' + (cx - 4) + ' ' + (my + 1) + ' Q' + cx + ' ' + (my - 1) + ' ' + (cx + 4) + ' ' + (my + 1) + '" stroke="#1E1B2E" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
  }
  return '<path d="M' + (cx - 4) + ' ' + my + ' Q' + cx + ' ' + (my + 3) + ' ' + (cx + 4) + ' ' + my + '" stroke="#1E1B2E" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
}

function guffySleepZ(cx, cy) {
  return '<text x="' + (cx + 20) + '" y="' + (cy + 4) + '" font-family="Fredoka, sans-serif" font-size="10" font-weight="800" fill="#A78BFA" opacity="0.75">z</text>' +
         '<text x="' + (cx + 26) + '" y="' + (cy - 4) + '" font-family="Fredoka, sans-serif" font-size="12" font-weight="800" fill="#A78BFA" opacity="0.55">z</text>' +
         '<text x="' + (cx + 34) + '" y="' + (cy - 12) + '" font-family="Fredoka, sans-serif" font-size="14" font-weight="800" fill="#A78BFA" opacity="0.4">Z</text>';
}

function guffyBody(cx, cy, emotion) {
  emotion = emotion || "normal";
  return guffyTentacles(cx, cy) +
    '<ellipse cx="' + cx + '" cy="' + (cy + 18) + '" rx="24" ry="22" fill="#A78BFA" stroke="#7C3AED" stroke-width="1.4"/>' +
    '<ellipse cx="' + (cx - 6) + '" cy="' + (cy + 12) + '" rx="10" ry="7" fill="#C4B5FD" opacity="0.5"/>' +
    '<path d="M' + (cx - 18) + ' ' + cy + ' Q' + (cx - 22) + ' ' + (cy - 6) + ' ' + (cx - 14) + ' ' + (cy - 2) + ' Q' + (cx - 16) + ' ' + (cy + 2) + ' ' + (cx - 12) + ' ' + (cy + 4) + ' Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="0.9"/>' +
    '<path d="M' + (cx + 18) + ' ' + cy + ' Q' + (cx + 22) + ' ' + (cy - 6) + ' ' + (cx + 14) + ' ' + (cy - 2) + ' Q' + (cx + 16) + ' ' + (cy + 2) + ' ' + (cx + 12) + ' ' + (cy + 4) + ' Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="0.9"/>' +
    guffyEyes(cx, cy, emotion) +
    '<ellipse cx="' + (cx - 18) + '" cy="' + (cy + 24) + '" rx="3" ry="1.8" fill="#F472B6" opacity="0.55"/>' +
    '<ellipse cx="' + (cx + 18) + '" cy="' + (cy + 24) + '" rx="3" ry="1.8" fill="#F472B6" opacity="0.55"/>' +
    guffyMouth(cx, cy, emotion) +
    (emotion === "sleeping" ? guffySleepZ(cx, cy) : "");
}

function guffyWithPiggy(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="50" cy="93" rx="26" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(50, 20, emotion) +
    '<ellipse cx="50" cy="80" rx="17" ry="11" fill="#FFD6E8" stroke="#DB2777" stroke-width="1.1"/>' +
    '<ellipse cx="50" cy="84" rx="12" ry="5.5" fill="#FFE4F0" opacity="0.75"/>' +
    '<path d="M36 74 L32 67 L40 71 Z" fill="#F9A8D4" stroke="#DB2777" stroke-width="0.9"/>' +
    '<path d="M64 74 L68 67 L60 71 Z" fill="#F9A8D4" stroke="#DB2777" stroke-width="0.9"/>' +
    '<rect x="45" y="70" width="10" height="2.2" rx="1.1" fill="#A8577D"/>' +
    '<ellipse cx="50" cy="86" rx="3" ry="2.2" fill="#F472B6"/>' +
    '<circle cx="43" cy="78" r="1.2" fill="#1E1B2E"/>' +
    '<circle cx="57" cy="78" r="1.2" fill="#1E1B2E"/>' +
    '<path d="M46 80 Q50 83 54 80" stroke="#DB2777" stroke-width="0.9" fill="none" stroke-linecap="round"/>' +
    '<circle cx="20" cy="28" r="1" fill="#FFE66D"/>' +
    '<circle cx="82" cy="36" r="1.1" fill="#FFE66D"/>' +
    '</svg>';
}

function guffyWithCoin(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<radialGradient id="coinFace" cx="0.38" cy="0.32" r="0.75">' +
        '<stop offset="0" stop-color="#FFF8C4"/>' +
        '<stop offset="0.55" stop-color="#FCD34D"/>' +
        '<stop offset="1" stop-color="#D97706"/>' +
      '</radialGradient>' +
      '<linearGradient id="coinEdge" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#F59E0B"/>' +
        '<stop offset="1" stop-color="#92400E"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<ellipse cx="50" cy="93" rx="26" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(50, 20, emotion) +
    '<ellipse cx="42" cy="87" rx="11" ry="5.5" fill="url(#coinEdge)" stroke="#78350F" stroke-width="0.9"/>' +
    '<ellipse cx="42" cy="86" rx="11" ry="5.5" fill="#F59E0B" stroke="#92400E" stroke-width="0.9"/>' +
    '<ellipse cx="42" cy="85.5" rx="8" ry="3.8" fill="#FBBF24" opacity="0.85"/>' +
    '<ellipse cx="56" cy="82" rx="12" ry="6" fill="url(#coinEdge)" stroke="#78350F" stroke-width="1"/>' +
    '<ellipse cx="56" cy="81" rx="12" ry="6" fill="#F59E0B" stroke="#92400E" stroke-width="1"/>' +
    '<ellipse cx="56" cy="80.5" rx="10.5" ry="5.2" fill="url(#coinFace)" stroke="#B45309" stroke-width="1"/>' +
    '<ellipse cx="56" cy="80.5" rx="7.5" ry="3.6" fill="none" stroke="#B45309" stroke-width="0.8" opacity="0.85"/>' +
    '<ellipse cx="52.5" cy="78.5" rx="3.5" ry="1.4" fill="#FFFFFF" opacity="0.55"/>' +
    '<text x="56" y="83" font-family="Fredoka, sans-serif" font-size="7.5" font-weight="800" text-anchor="middle" fill="#92400E">$</text>' +
    '<circle cx="18" cy="60" r="1.2" fill="#FFE66D"/>' +
    '<circle cx="82" cy="40" r="1" fill="#FFE66D"/>' +
    '</svg>';
}

function guffyWithFlag(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="hillA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A78BFA"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs>' +
    '<path d="M4 94 L34 60 L50 76 L66 46 L96 94 Z" fill="url(#hillA)" stroke="#5B21B6" stroke-width="0.9"/>' +
    '<line x1="66" y1="26" x2="66" y2="48" stroke="#5B21B6" stroke-width="1.3"/>' +
    '<path d="M66 26 L84 32 L66 38 Z" fill="#F472B6" stroke="#DB2777" stroke-width="0.7"/>' +
    '<ellipse cx="24" cy="93" rx="20" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(24, 24, emotion) +
    '<circle cx="86" cy="16" r="5" fill="#FFE66D" opacity="0.7"/>' +
    '<circle cx="86" cy="16" r="2.6" fill="#F59E0B"/>' +
    '</svg>';
}
function guffyWithNotebook(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="50" cy="93" rx="24" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(50, 20, emotion) +
    '<rect x="36" y="70" width="28" height="20" rx="2" fill="#FFFFFF" stroke="#8B5CF6" stroke-width="1"/>' +
    '<line x1="50" y1="70" x2="50" y2="90" stroke="#C4B5FD" stroke-width="0.7"/>' +
    '<line x1="40" y1="76" x2="47" y2="76" stroke="#DDD0F5" stroke-width="0.7"/>' +
    '<line x1="53" y1="76" x2="60" y2="76" stroke="#DDD0F5" stroke-width="0.7"/>' +
    '<text x="76" y="34" font-family="Nunito, sans-serif" font-size="12" font-weight="800" fill="#A78BFA">?</text>' +
    '</svg>';
}
function guffyWithDiary(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="50" cy="93" rx="24" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(50, 20, emotion) +
    '<rect x="34" y="68" width="32" height="22" rx="2.5" fill="#7C3AED" stroke="#5B21B6" stroke-width="0.9"/>' +
    '<rect x="34" y="68" width="5" height="22" rx="2" fill="#5B21B6"/>' +
    '<rect x="39" y="66" width="27" height="24" rx="2" fill="#FFFFFF" stroke="#C4B5FD" stroke-width="0.6"/>' +
    '<path d="M58 66 L58 82 L61 79 L64 82 L64 66 Z" fill="#F472B6"/>' +
    '<text x="52" y="83" font-family="Fredoka, sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="#FFE66D" stroke="#B45309" stroke-width="0.4">5</text>' +
    '</svg>';
}
function guffyLookingAtMountain(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="hillB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDD0F5"/><stop offset="1" stop-color="#A78BFA"/></linearGradient></defs>' +
    '<path d="M48 92 L70 56 L100 92 Z" fill="url(#hillB)" opacity="0.55" stroke="#A78BFA" stroke-width="0.8"/>' +
    '<line x1="70" y1="40" x2="70" y2="56" stroke="#8B5CF6" stroke-width="1" opacity="0.6"/>' +
    '<path d="M70 40 L84 45 L70 50 Z" fill="#F9A8D4" opacity="0.7" stroke="#DB2777" stroke-width="0.6"/>' +
    '<ellipse cx="28" cy="93" rx="22" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(28, 24, emotion) +
    '<path d="M42 58 Q50 56 56 60" stroke="#7C3AED" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<text x="80" y="32" font-family="Nunito, sans-serif" font-size="11" font-weight="800" fill="#A78BFA" opacity="0.7">★</text>' +
    '</svg>';
}
function guffyWithScroll(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="50" cy="93" rx="24" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(50, 20, emotion) +
    '<rect x="30" y="72" width="40" height="18" rx="2" fill="#FFE9C0" stroke="#B45309" stroke-width="0.8"/>' +
    '<rect x="28" y="70" width="44" height="4" rx="2" fill="#F59E0B" stroke="#B45309" stroke-width="0.7"/>' +
    '<rect x="28" y="88" width="44" height="4" rx="2" fill="#F59E0B" stroke="#B45309" stroke-width="0.7"/>' +
    '<line x1="36" y1="79" x2="64" y2="79" stroke="#B45309" stroke-width="0.5" opacity="0.5"/>' +
    '</svg>';
}

function guffyFullSvg(emotion) {
  emotion = emotion || "normal";
  var cx = 55, cy = 70;
  return '<svg viewBox="0 0 110 170" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="55" cy="164" rx="34" ry="3" fill="#000" opacity="0.15"/>' +
    (function () {
      var legs = [
        [38, 118, 22, 138, 30, 156],
        [47, 125, 35, 148, 44, 162],
        [55, 128, 53, 150, 57, 165],
        [63, 125, 75, 148, 66, 162],
        [72, 118, 88, 138, 80, 156]
      ];
      var outlines = "", fills = "";
      legs.forEach(function (l) {
        var d = "M" + l[0] + " " + l[1] + " Q" + l[2] + " " + l[3] + " " + l[4] + " " + l[5];
        outlines += '<path d="' + d + '" fill="none" stroke="#7C3AED" stroke-width="6.5" stroke-linecap="round"/>';
        fills += '<path d="' + d + '" fill="none" stroke="#A78BFA" stroke-width="3.6" stroke-linecap="round"/>';
      });
      return outlines + fills;
    })() +
    '<ellipse cx="' + cx + '" cy="' + cy + '" rx="34" ry="40" fill="#A78BFA" stroke="#7C3AED" stroke-width="2"/>' +
    '<path d="M21 62 Q8 54 18 58 Q24 62 22 72 Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="1"/>' +
    '<path d="M89 62 Q102 54 92 58 Q86 62 88 72 Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="1"/>' +
    '<ellipse cx="44" cy="54" rx="12" ry="8" fill="#C4B5FD" opacity="0.55"/>' +
    (function () {
      var ex1 = cx - 13, ex2 = cx + 13, ey = 62;
      if (emotion === "happy") {
        return '<path d="M' + (ex1 - 5) + ' ' + (ey + 2) + ' Q' + ex1 + ' ' + (ey - 4) + ' ' + (ex1 + 5) + ' ' + (ey + 2) + '" stroke="#1E1B2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
               '<path d="M' + (ex2 - 5) + ' ' + (ey + 2) + ' Q' + ex2 + ' ' + (ey - 4) + ' ' + (ex2 + 5) + ' ' + (ey + 2) + '" stroke="#1E1B2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      }
      if (emotion === "sleeping") {
        return '<path d="M' + (ex1 - 5) + ' ' + ey + ' Q' + ex1 + ' ' + (ey + 3) + ' ' + (ex1 + 5) + ' ' + ey + '" stroke="#1E1B2E" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
               '<path d="M' + (ex2 - 5) + ' ' + ey + ' Q' + ex2 + ' ' + (ey + 3) + ' ' + (ex2 + 5) + ' ' + ey + '" stroke="#1E1B2E" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      }
      if (emotion === "thinking") {
        return '<ellipse cx="' + ex1 + '" cy="' + ey + '" rx="5.5" ry="7" fill="#FFFFFF"/>' +
               '<circle cx="' + (ex1 + 1) + '" cy="' + (ey + 1) + '" r="3.4" fill="#1E1B2E"/>' +
               '<circle cx="' + (ex1 + 2) + '" cy="' + (ey - 1) + '" r="1.2" fill="#FFFFFF"/>' +
               '<path d="M' + (ex2 - 5) + ' ' + ey + ' Q' + ex2 + ' ' + (ey + 3) + ' ' + (ex2 + 5) + ' ' + ey + '" stroke="#1E1B2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      }
      return '<ellipse cx="' + ex1 + '" cy="' + ey + '" rx="5.5" ry="7" fill="#FFFFFF"/>' +
             '<ellipse cx="' + ex2 + '" cy="' + ey + '" rx="5.5" ry="7" fill="#FFFFFF"/>' +
             '<circle cx="' + (ex1 + 1) + '" cy="' + (ey + 1) + '" r="3.4" fill="#1E1B2E"/>' +
             '<circle cx="' + (ex2 + 1) + '" cy="' + (ey + 1) + '" r="3.4" fill="#1E1B2E"/>' +
             '<circle cx="' + (ex1 + 2) + '" cy="' + (ey - 1) + '" r="1.2" fill="#FFFFFF"/>' +
             '<circle cx="' + (ex2 + 2) + '" cy="' + (ey - 1) + '" r="1.2" fill="#FFFFFF"/>';
    })() +
    (function () {
      var my = 84;
      if (emotion === "happy") {
        return '<path d="M' + (cx - 8) + ' ' + my + ' Q' + cx + ' ' + (my + 7) + ' ' + (cx + 8) + ' ' + my + '" stroke="#1E1B2E" stroke-width="2" fill="none" stroke-linecap="round"/>';
      }
      if (emotion === "sleeping") {
        return '<ellipse cx="' + cx + '" cy="' + my + '" rx="2.2" ry="2.8" fill="#1E1B2E" opacity="0.55"/>';
      }
      if (emotion === "thinking") {
        return '<path d="M' + (cx - 5) + ' ' + (my + 1) + ' Q' + cx + ' ' + (my - 2) + ' ' + (cx + 5) + ' ' + (my + 1) + '" stroke="#1E1B2E" stroke-width="1.7" fill="none" stroke-linecap="round"/>';
      }
      return '<path d="M' + (cx - 5) + ' ' + my + ' Q' + cx + ' ' + (my + 4) + ' ' + (cx + 5) + ' ' + my + '" stroke="#1E1B2E" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    })() +
    '<ellipse cx="34" cy="82" rx="4" ry="2.5" fill="#F472B6" opacity="0.6"/>' +
    '<ellipse cx="76" cy="82" rx="4" ry="2.5" fill="#F472B6" opacity="0.6"/>' +
    (emotion === "sleeping"
      ? '<text x="78" y="44" font-family="Fredoka, sans-serif" font-size="13" font-weight="800" fill="#A78BFA" opacity="0.75">z</text>' +
        '<text x="86" y="32" font-family="Fredoka, sans-serif" font-size="15" font-weight="800" fill="#A78BFA" opacity="0.55">z</text>' +
        '<text x="96" y="18" font-family="Fredoka, sans-serif" font-size="18" font-weight="800" fill="#A78BFA" opacity="0.4">Z</text>'
      : "") +
    '</svg>';
}

function guffyStandingSvg(emotion) {
  emotion = emotion || "normal";
  var cx = 45, cy = 55;
  return '<svg viewBox="0 0 90 120" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="45" cy="116" rx="26" ry="2.5" fill="#000" opacity="0.12"/>' +
    (function () {
      var legs = [
        [31, 86, 20, 100, 26, 112],
        [38, 90, 30, 106, 37, 114],
        [45, 92, 43, 108, 46, 116],
        [52, 90, 60, 106, 53, 114],
        [59, 86, 70, 100, 64, 112]
      ];
      var o = "", f = "";
      legs.forEach(function (l) {
        var d = "M" + l[0] + " " + l[1] + " Q" + l[2] + " " + l[3] + " " + l[4] + " " + l[5];
        o += '<path d="' + d + '" fill="none" stroke="#7C3AED" stroke-width="5" stroke-linecap="round"/>';
        f += '<path d="' + d + '" fill="none" stroke="#A78BFA" stroke-width="2.6" stroke-linecap="round"/>';
      });
      return o + f;
    })() +
    '<ellipse cx="' + cx + '" cy="' + cy + '" rx="26" ry="30" fill="#A78BFA" stroke="#7C3AED" stroke-width="1.6"/>' +
    '<path d="M19 46 Q10 40 17 44 Q22 48 20 56 Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="0.9"/>' +
    '<path d="M71 46 Q80 40 73 44 Q68 48 70 56 Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="0.9"/>' +
    '<ellipse cx="36" cy="42" rx="8" ry="5.5" fill="#C4B5FD" opacity="0.55"/>' +
    (function () {
      var ex1 = cx - 10, ex2 = cx + 10, ey = 50;
      if (emotion === "happy") {
        return '<path d="M' + (ex1 - 4) + ' ' + (ey + 2) + ' Q' + ex1 + ' ' + (ey - 3) + ' ' + (ex1 + 4) + ' ' + (ey + 2) + '" stroke="#1E1B2E" stroke-width="1.9" fill="none" stroke-linecap="round"/>' +
               '<path d="M' + (ex2 - 4) + ' ' + (ey + 2) + ' Q' + ex2 + ' ' + (ey - 3) + ' ' + (ex2 + 4) + ' ' + (ey + 2) + '" stroke="#1E1B2E" stroke-width="1.9" fill="none" stroke-linecap="round"/>';
      }
      return '<ellipse cx="' + ex1 + '" cy="' + ey + '" rx="4.5" ry="5.5" fill="#FFFFFF"/>' +
             '<ellipse cx="' + ex2 + '" cy="' + ey + '" rx="4.5" ry="5.5" fill="#FFFFFF"/>' +
             '<circle cx="' + (ex1 + 1) + '" cy="' + (ey + 1) + '" r="2.8" fill="#1E1B2E"/>' +
             '<circle cx="' + (ex2 + 1) + '" cy="' + (ey + 1) + '" r="2.8" fill="#1E1B2E"/>' +
             '<circle cx="' + (ex1 + 1.8) + '" cy="' + (ey - 0.5) + '" r="1" fill="#FFFFFF"/>' +
             '<circle cx="' + (ex2 + 1.8) + '" cy="' + (ey - 0.5) + '" r="1" fill="#FFFFFF"/>';
    })() +
    '<path d="M' + (cx - 4) + ' ' + (cy + 16) + ' Q' + cx + ' ' + (cy + 20) + ' ' + (cx + 4) + ' ' + (cy + 16) + '" stroke="#1E1B2E" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="28" cy="' + (cy + 14) + '" rx="3" ry="1.8" fill="#F472B6" opacity="0.6"/>' +
    '<ellipse cx="62" cy="' + (cy + 14) + '" rx="3" ry="1.8" fill="#F472B6" opacity="0.6"/>' +
    '</svg>';
}

function piggySvg() {
  return '<svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<linearGradient id="pigBody" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#FFC9DE"/>' +
        '<stop offset="0.6" stop-color="#F9A8D4"/>' +
        '<stop offset="1" stop-color="#EC4899"/>' +
      '</linearGradient>' +
      '<linearGradient id="pigSnout" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#FBA6C5"/>' +
        '<stop offset="1" stop-color="#DB2777"/>' +
      '</linearGradient>' +
      '<linearGradient id="pigEar" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#FBA6C5"/>' +
        '<stop offset="1" stop-color="#EC4899"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<ellipse cx="120" cy="188" rx="92" ry="6" fill="#000" opacity="0.15"/>' +
    '<ellipse cx="72" cy="172" rx="14" ry="10" fill="#BE185D"/>' +
    '<ellipse cx="168" cy="172" rx="14" ry="10" fill="#BE185D"/>' +
    '<ellipse cx="120" cy="118" rx="92" ry="66" fill="url(#pigBody)" stroke="#BE185D" stroke-width="2"/>' +
    '<path d="M 58 84 Q 42 44 82 56 Q 86 72 78 86 Z" fill="url(#pigEar)" stroke="#BE185D" stroke-width="1.8"/>' +
    '<path d="M 182 84 Q 198 44 158 56 Q 154 72 162 86 Z" fill="url(#pigEar)" stroke="#BE185D" stroke-width="1.8"/>' +
    '<path d="M 66 80 Q 54 58 74 62 Q 76 72 72 82 Z" fill="#FBA6C5"/>' +
    '<path d="M 174 80 Q 186 58 166 62 Q 164 72 168 82 Z" fill="#FBA6C5"/>' +
    '<ellipse cx="82" cy="92" rx="30" ry="18" fill="#FFFFFF" opacity="0.4"/>' +
    '<rect x="100" y="64" width="40" height="8" rx="4" fill="#4C1D95"/>' +
    '<rect x="102" y="65.5" width="36" height="3" rx="1.5" fill="#831843" opacity="0.6"/>' +
    '<ellipse cx="66" cy="128" rx="16" ry="10" fill="#F472B6" opacity="0.5"/>' +
    '<ellipse cx="174" cy="128" rx="16" ry="10" fill="#F472B6" opacity="0.5"/>' +
    '<circle cx="88" cy="112" r="10" fill="#FFFFFF" stroke="#BE185D" stroke-width="0.6"/>' +
    '<circle cx="152" cy="112" r="10" fill="#FFFFFF" stroke="#BE185D" stroke-width="0.6"/>' +
    '<circle cx="89" cy="114" r="5.5" fill="#1E1B2E"/>' +
    '<circle cx="153" cy="114" r="5.5" fill="#1E1B2E"/>' +
    '<circle cx="91" cy="112" r="2" fill="#FFFFFF"/>' +
    '<circle cx="155" cy="112" r="2" fill="#FFFFFF"/>' +
    '<ellipse cx="120" cy="140" rx="32" ry="22" fill="url(#pigSnout)" stroke="#BE185D" stroke-width="1.8"/>' +
    '<ellipse cx="120" cy="140" rx="24" ry="15" fill="#FBA6C5" opacity="0.7"/>' +
    '<ellipse cx="110" cy="140" rx="3.5" ry="5" fill="#831843"/>' +
    '<ellipse cx="130" cy="140" rx="3.5" ry="5" fill="#831843"/>' +
    '<path d="M 106 158 Q 120 166 134 158" stroke="#831843" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<path d="M 208 100 Q 226 92 220 74 Q 214 60 202 68 Q 194 76 202 82" stroke="#F472B6" stroke-width="5" fill="none" stroke-linecap="round"/>' +
  '</svg>';
}

function piggyCoinSvg() {
  return '<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><radialGradient id="coinGrad" cx="0.4" cy="0.35" r="0.7">' +
      '<stop offset="0" stop-color="#FFF3A0"/>' +
      '<stop offset="0.7" stop-color="#FBBF24"/>' +
      '<stop offset="1" stop-color="#B45309"/>' +
    '</radialGradient></defs>' +
    '<circle cx="15" cy="15" r="14" fill="url(#coinGrad)" stroke="#92400E" stroke-width="1.4"/>' +
    '<circle cx="15" cy="15" r="10" fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity="0.7"/>' +
    '<text x="15" y="20.5" font-family="Fredoka, sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="#FFFFFF">$</text>' +
    '</svg>';
}

function paintStartScreen() {
  var piggySvgEl = document.getElementById("piggySvg");
  if (piggySvgEl) piggySvgEl.innerHTML = piggySvg();

  var c1 = document.getElementById("piggyCoin1");
  if (c1) c1.innerHTML = piggyCoinSvg();
  var c2 = document.getElementById("piggyCoin2");
  if (c2) c2.innerHTML = piggyCoinSvg();

  var gf = document.getElementById("guffyFull");
  if (gf) gf.innerHTML = guffyFullSvg(getGuffyEmotion());

  renderStartGreeting();
  renderStartSummary();
  renderStartChildBadge();
}

function renderStartGreeting() {
  var el = document.getElementById("welcomeGreeting");
  if (!el) return;
  var h = new Date().getHours();
  var name = (data.profile && data.profile.name || "").trim();
  var greeting;
  if (h >= 5 && h < 12) greeting = "Доброе утро, " + (name || "друг") + " ☀️";
  else if (h >= 12 && h < 18) greeting = "Добрый день, " + (name || "друг") + " 🌤";
  else if (h >= 18 && h < 23) greeting = "Добрый вечер, " + (name || "друг") + " 🌙";
  else greeting = "Доброй ночи, " + (name || "друг") + " ✨";
  el.textContent = greeting;
}

function renderStartSummary() {
  var el = document.getElementById("welcomeSummary");
  if (!el) return;
  var parts = [];
  if (data.points > 0) parts.push("⭐ " + data.points + " " + pluralPoints(data.points));
  if (data.balance !== 0) parts.push("💰 " + data.balance + " BYN");
  if (!parts.length) {
    el.classList.add("hidden");
    el.innerHTML = "";
    return;
  }
  el.innerHTML = parts.join('<span class="summary-sep">·</span>');
  el.classList.remove("hidden");
}

function renderStartChildBadge() {
  var el = document.getElementById("childBadge");
  if (!el) return;
  var lvl = getLevel(data.totalEarnedPoints);
  if (lvl && lvl.key && lvl.key !== "egg") {
    el.textContent = "🐉 " + lvl.name;
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

function bindStartScreenTap() {
  var scene = document.getElementById("piggyScene");
  if (!scene) return;
  scene.addEventListener("click", function () {
    scene.classList.remove("is-tapped");
    void scene.offsetWidth;
    scene.classList.add("is-tapped");
    var gf = document.getElementById("guffyFull");
    if (gf) gf.innerHTML = guffyFullSvg("happy");
    setTimeout(function () {
      if (gf) gf.innerHTML = guffyFullSvg(getGuffyEmotion());
    }, 1400);
  });
}

function renderChildHero() {
  if (currentRole !== "child") return;
  var el = document.getElementById("childHero");
  if (!el) return;

  var h = new Date().getHours();
  var greet;
  if (h >= 5 && h < 12) greet = "Доброе утро ☀️";
  else if (h >= 12 && h < 18) greet = "Добрый день 🌤";
  else if (h >= 18 && h < 23) greet = "Добрый вечер 🌙";
  else greet = "Доброй ночи ✨";

  var av = document.getElementById("childHeroAvatar");
  if (av) av.textContent = data.avatar || "👧";
  var g = document.getElementById("childHeroGreeting");
  if (g) g.textContent = greet;
  var t = document.getElementById("childHeroTitle");
  if (t) t.textContent = getDisplayName() ? "Привет, " + getDisplayName() + "!" : "Моя копилка";

  var sub = document.getElementById("childHeroSub");
  if (sub) {
    var lvl = getLevel(data.totalEarnedPoints);
    var next = getNextLevel(data.totalEarnedPoints);
    var parts = [];
    parts.push("Уровень: <strong>" + lvl.name + "</strong>");
    if (next) {
      var done = data.totalEarnedPoints - lvl.min;
      var total = next.min - lvl.min;
      parts.push("до «" + next.name + "» — <strong>" + (total - done) + " " + pluralPoints(total - done) + "</strong>");
    }
    sub.innerHTML = parts.join(" · ");
  }
}

function renderParentHero() {
  if (currentRole !== "parent") return;
  var el = document.getElementById("parentHero");
  if (!el) return;

  var gf = document.getElementById("parentHeroGuffy");
  if (gf && !gf.innerHTML) gf.innerHTML = guffyStandingSvg("normal");

  var pendingCount = data.completions.filter(function (c) { return c.status === "pending"; }).length;
  var withdrawCount = data.withdrawRequests.filter(function (r) { return r.status === "pending"; }).length;
  var gradeReqCount = data.gradeRequests.length;

  var greet = document.getElementById("parentHeroGreeting");
  var title = document.getElementById("parentHeroTitle");
  var sub = document.getElementById("parentHeroSub");

  var items = [];
  if (pendingCount) items.push("<strong>" + pendingCount + "</strong> " + (pendingCount === 1 ? "задание" : "заданий") + " на проверке");
  if (withdrawCount) items.push("<strong>" + withdrawCount + "</strong> " + (withdrawCount === 1 ? "запрос" : "запроса") + " на деньги");
  if (gradeReqCount) items.push("<strong>" + gradeReqCount + "</strong> " + (gradeReqCount === 1 ? "оценка" : "оценки") + " на проверке");

  if (greet) {
    if (items.length) greet.textContent = "Требует внимания";
    else greet.textContent = "Всё под контролем ✓";
  }
  if (title) {
    title.textContent = items.length ? "Есть новые заявки" : "Хорошего дня!";
  }

  if (sub) {
    if (items.length) sub.innerHTML = items.join(" · ");
    else sub.textContent = "Нет новых заявок. Проверьте цели и настройки.";
  }
}

function createInitialData() {
  return {
    balance: 0, points: 0, totalEarnedPoints: 0,
    lastLevel: "Яйцо", avatar: "👧", lastTreasureDate: "", guffyMode: "active",
    profile: { name: "", age: "", className: "", birthday: "" },
    chores: [
      { id: 1, title: "Заправить кровать", description: "Аккуратно заправить кровать", reward: 2, repeat: "daily", days: [], maxPerDay: 1 },
      { id: 2, title: "Помочь с посудой", description: "Помыть посуду и протереть стол", reward: 5, repeat: "daily", days: [], maxPerDay: 1 },
      { id: 3, title: "Убрать рабочее место", description: "Положить вещи на место", reward: 4, repeat: "weekdays", days: [], maxPerDay: 1 }
    ],
    completions: [], grades: [], gradeRequests: [], withdrawRequests: [],
    goals: [], transactions: [], notifications: []
  };
}

function normalize(raw) {
  var base = createInitialData();
  if (!raw || typeof raw !== "object") return base;
  function num(v) { return Number.isFinite(Number(v)) ? Number(v) : 0; }
  var points = num(raw.points);
  var totalEarned = Math.max(num(raw.totalEarnedPoints), points);
  var profile = raw.profile && typeof raw.profile === "object" ? raw.profile : {};

  return {
    balance: num(raw.balance),
    points: points,
    totalEarnedPoints: totalEarned,
    lastLevel: String(raw.lastLevel || LEVELS[0].name),
    avatar: AVATARS.indexOf(raw.avatar) >= 0 ? raw.avatar : "👧",
    lastTreasureDate: String(raw.lastTreasureDate || ""),
    guffyMode: ["active", "quiet", "off"].indexOf(raw.guffyMode) >= 0 ? raw.guffyMode : "active",
    profile: {
      name: String(profile.name || "").trim().slice(0, 20),
      age: profile.age !== "" && Number.isFinite(Number(profile.age)) ? String(toInt(profile.age)) : "",
      className: String(profile.className || "").trim().slice(0, 6),
      birthday: profile.birthday ? String(profile.birthday) : ""
    },
    chores: toArray(raw.chores).filter(function (c) { return c && typeof c === "object"; }).map(function (c, i) {
      var mpd = toInt(c.maxPerDay);
      if (!Number.isInteger(mpd) || mpd < 1) mpd = 1;
      if (mpd > 999) mpd = 999;
      return {
        id: Number.isFinite(Number(c.id)) ? Number(c.id) : uniqueId() + i,
        title: String(c.title || "").trim() || "Задание",
        description: String(c.description || "").trim(),
        reward: Math.max(0, toInt(c.reward) || 0),
        repeat: ["daily", "weekdays", "weekend", "custom", "once"].indexOf(c.repeat) >= 0 ? c.repeat : "daily",
        days: Array.isArray(c.days) ? c.days.map(Number).filter(function (d) { return d >= 0 && d <= 6; }) : [],
        maxPerDay: mpd
      };
    }),
    completions: toArray(raw.completions).filter(function (c) { return c && typeof c === "object"; }).map(function (c) {
      return {
        id: Number.isFinite(Number(c.id)) ? Number(c.id) : uniqueId(),
        choreId: Number(c.choreId),
        date: String(c.date || today()),
        status: ["pending", "approved", "rejected"].indexOf(c.status) >= 0 ? c.status : "pending",
        comment: String(c.comment || ""),
        photo: typeof c.photo === "string" && c.photo !== "__removed__" ? c.photo : "",
        approvedAt: num(c.approvedAt)
      };
    }),
    grades: toArray(raw.grades).filter(function (g) { return g && typeof g === "object"; }).map(function (g) {
      return {
        id: Number.isFinite(Number(g.id)) ? Number(g.id) : uniqueId(),
        subject: String(g.subject || "").trim() || "Предмет",
        value: Math.min(10, Math.max(2, toInt(g.value) || 0)),
        payment: num(g.payment),
        date: String(g.date || today())
      };
    }),
    gradeRequests: toArray(raw.gradeRequests).filter(function (r) { return r && typeof r === "object"; }).map(function (r) {
      return {
        id: Number.isFinite(Number(r.id)) ? Number(r.id) : uniqueId(),
        subject: String(r.subject || "").trim() || "Предмет",
        value: Math.min(10, Math.max(2, toInt(r.value) || 0)),
        date: String(r.date || today())
      };
    }),
    withdrawRequests: toArray(raw.withdrawRequests).filter(function (r) { return r && typeof r === "object"; }).map(function (r) {
      var amt = Math.max(1, toInt(r.amount) || 1);
      return {
        id: Number.isFinite(Number(r.id)) ? Number(r.id) : uniqueId(),
        amount: amt,
        requestedAmount: Number.isFinite(Number(r.requestedAmount)) ? Math.max(1, toInt(r.requestedAmount)) : amt,
        reason: String(r.reason || "").trim().slice(0, 60),
        date: String(r.date || today()),
        status: ["pending", "approved", "rejected"].indexOf(r.status) >= 0 ? r.status : "pending"
      };
    }),
    goals: toArray(raw.goals).filter(function (g) { return g && typeof g === "object"; }).map(function (g) {
      return {
        title: String(g.title || "").trim() || "Цель",
        price: Math.max(1, toInt(g.price) || 1),
        deadline: g.deadline ? String(g.deadline) : "",
        notifiedReady: !!g.notifiedReady,
        important: !!g.important
      };
    }).slice(0, MAX_GOALS),
    transactions: toArray(raw.transactions).filter(function (t) { return t && typeof t === "object"; }).map(function (t) {
      return {
        description: String(t.description || "Операция"),
        byn: num(t.byn != null ? t.byn : t.amount),
        points: num(t.points),
        date: String(t.date || today())
      };
    }),
    notifications: toArray(raw.notifications).filter(function (n) { return n && typeof n === "object"; }).map(function (n) {
      return {
        id: Number.isFinite(Number(n.id)) ? Number(n.id) : uniqueId(),
        forRole: n.forRole === "parent" ? "parent" : "child",
        text: String(n.text || "").trim(),
        icon: String(n.icon || "🔔").slice(0, 4),
        ts: Number.isFinite(Number(n.ts)) ? Number(n.ts) : Date.now(),
        date: String(n.date || today()),
        read: !!n.read
      };
    })
  };
}

var currentRole = "";
var firebaseRef = null;
var firebaseReady = false;
var treasureCheckedThisSession = false;
var editingChoreDays = [];
var pendingPhotoDataUrl = "";
var shownApprovalIds = [];
var pendingProfileAvatar = "👧";
var currentDay = today();
var lastSyncedData = null;

var data = loadFromLocalStorage();

try {
  if (typeof firebase !== "undefined" && firebase.initializeApp) {
    firebase.initializeApp(firebaseConfig);
    var db = firebase.database();

    firebase.auth().signInAnonymously()
      .then(function () {
        console.log("Анонимный вход выполнен");
        firebaseRef = db.ref("families/" + FAMILY_ID);
        firebaseReady = true;

        firebaseRef.on("value", function (snap) {
          var raw = snap.val();
          if (raw) data = normalize(raw);
          else { data = createInitialData(); firebaseRef.set(data); }
          lastSyncedData = JSON.parse(JSON.stringify(data));
          try {
            localStore.set(STORAGE_KEY, JSON.stringify(stripPhotos(data)));
          } catch (e) {}
          if (cleanupOrphanCompletions()) {
            lastSyncedData = null;
            saveData();
            return;
          }
          setSyncStatus("online", "");
          paintStartScreen();
          render();
        }, function () {
          setSyncStatus("offline", "Офлайн · изменения сохранятся позже");
          paintStartScreen();
          render();
        });
      })
      .catch(function (error) {
        console.error("Ошибка анонимного входа:", error);
        setSyncStatus("error", "Не удалось авторизоваться");
        paintStartScreen();
        render();
      });
  } else {
    console.warn("Firebase не загружен — офлайн");
    paintStartScreen();
  }
} catch (err) {
  console.error("Firebase error:", err);
  paintStartScreen();
}

function loadFromLocalStorage() {
  var raw = localStore.get(STORAGE_KEY);
  if (!raw) return createInitialData();
  try { return normalize(JSON.parse(raw)); }
  catch (e) { return createInitialData(); }
}

function stripPhotos(obj) {
  var copy = JSON.parse(JSON.stringify(obj));
  if (copy.completions) {
    copy.completions.forEach(function (c) { if (c.photo) c.photo = "__removed__"; });
  }
  return copy;
}

function computeDiff(newData, oldData) {
  var diff = {};
  DATA_KEYS.forEach(function (k) {
    var nv, ov;
    try { nv = JSON.stringify(newData[k]); } catch (e) { nv = ""; }
    try { ov = oldData ? JSON.stringify(oldData[k]) : ""; } catch (e) { ov = ""; }
    if (!oldData || nv !== ov) diff[k] = newData[k];
  });
  return diff;
}

function saveData() {
  try {
    var forLocal = stripPhotos(data);
    localStore.set(STORAGE_KEY, JSON.stringify(forLocal));
  } catch (e) {}

  if (firebaseReady && firebaseRef) {
    var diff = computeDiff(data, lastSyncedData);
    if (Object.keys(diff).length > 0) {
      firebaseRef.update(diff)
        .then(function () {
          lastSyncedData = JSON.parse(JSON.stringify(data));
          setSyncStatus("online", "");
        })
        .catch(function () { setSyncStatus("offline", "Не удалось сохранить"); });
    }
  }
  paintStartScreen();
  render();
}

function setSyncStatus(state, text) {
  var banner = document.getElementById("syncBanner");
  var label = document.getElementById("syncText");
  if (!banner || !label) return;
  banner.classList.remove("is-visible", "is-offline", "is-error");
  if (state === "online" || !state) {
    return;
  }
  banner.classList.add("is-visible");
  if (state === "offline") banner.classList.add("is-offline");
  if (state === "error") banner.classList.add("is-error");
  label.textContent = text || "";
}

function paintStaticIcons() {
  var ids = {
    iconBell: svgBell(),
    iconChecklist: svgChecklist(),
    iconDiary: svgDiary(),
    iconTarget: svgTarget(),
    iconExchange: svgExchange(),
    iconBook: svgBook(),
    iconMoney: svgMoney()
  };
  Object.keys(ids).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = ids[id];
  });
}

function paintSummaryDeco() {
  var em = getGuffyEmotion();
  var b = document.getElementById("balanceDeco");
  if (b) b.innerHTML = guffyWithPiggy(em);
  var p = document.getElementById("pointsDeco");
  if (p) p.innerHTML = guffyWithCoin(em);
  var g = document.getElementById("goalDeco");
  if (g) g.innerHTML = guffyWithFlag(em);
}

function getGuffyEmotion() {
  if (!data || (data.guffyMode !== "active")) return "normal";
  var h = new Date().getHours();
  if (h >= GUFFY_NIGHT_START || h < GUFFY_NIGHT_END) return "sleeping";
  var ts = today();
  if (data.completions.some(function (c) { return c.status === "approved" && c.date === ts; })) return "happy";
  if (data.completions.some(function (c) { return c.status === "pending" && c.date === ts; })) return "thinking";
  return "normal";
}

function guffyReplicasOn() {
  return data && data.guffyMode === "active";
}

function getDisplayName() {
  return (data.profile && data.profile.name || "").trim();
}

function renderProfilePreview() {
  var av = $("#profilePreviewAvatar");
  if (av) av.textContent = pendingProfileAvatar;
  var nameEl = $("#profilePreviewName");
  var metaEl = $("#profilePreviewMeta");
  var nameInput = $("#profileName");
  var ageInput = $("#profileAge");
  var clsInput = $("#profileClass");
  var bdInput = $("#profileBirthday");
  var name = (nameInput && nameInput.value || "").trim();
  var age = (ageInput && ageInput.value || "").trim();
  var cls = (clsInput && clsInput.value || "").trim();
  var bd = (bdInput && bdInput.value || "").trim();
  if (nameEl) nameEl.textContent = name || "Имя не указано";
  var parts = [];
  if (cls) parts.push(cls + " класс");
  if (age) parts.push(age + " " + pluralYears(Number(age)));
  else if (bd) {
    var yrs = Math.floor((Date.now() - new Date(bd + "T00:00:00").getTime()) / (365.25 * 86400000));
    if (yrs > 0 && yrs < 120) parts.push(yrs + " " + pluralYears(yrs));
  }
  if (metaEl) metaEl.textContent = parts.length ? parts.join(" · ") : "Заполни профиль ниже";
}

function openProfileModal() {
  pendingProfileAvatar = data.avatar || "👧";
  var grid = $("#avatarGrid");
  if (grid) {
    grid.innerHTML = AVATARS.map(function (e) {
      return '<button class="avatar-option ' + (e === pendingProfileAvatar ? "is-active" : "") + '" type="button" data-avatar="' + e + '">' + e + "</button>";
    }).join("");
  }
  var nameInput = $("#profileName");
  if (nameInput) nameInput.value = data.profile.name || "";
  var ageInput = $("#profileAge");
  if (ageInput) ageInput.value = data.profile.age || "";
  var clsInput = $("#profileClass");
  if (clsInput) clsInput.value = data.profile.className || "";
  var bdInput = $("#profileBirthday");
  if (bdInput) bdInput.value = data.profile.birthday || "";
  renderProfilePreview();
  openModal("profileModal");
}

function pickProfileAvatar(e) {
  if (AVATARS.indexOf(e) < 0) return;
  pendingProfileAvatar = e;
  $$("#avatarGrid .avatar-option").forEach(function (b) {
    b.classList.toggle("is-active", b.dataset.avatar === e);
  });
  renderProfilePreview();
}

function addNotification(forRole, text, icon) {
  if (!text) return;
  if (forRole !== "parent" && forRole !== "child") return;
  data.notifications.unshift({
    id: uniqueId(),
    forRole: forRole, text: text, icon: icon || "🔔",
    ts: Date.now(), date: today(), read: false
  });
  if (data.notifications.length > NOTIF_LIMIT) {
    data.notifications = data.notifications.slice(0, NOTIF_LIMIT);
  }
}

function renderNotificationsBadge() {
  if (!currentRole) return;
  var badgeId = currentRole === "parent" ? "notifBadgeParent" : "notifBadgeChild";
  var b = document.getElementById(badgeId);
  if (!b) return;
  var u = data.notifications.filter(function (n) { return n.forRole === currentRole && !n.read; }).length;
  if (u > 0) { b.textContent = u > 99 ? "99+" : String(u); b.classList.remove("hidden"); }
  else b.classList.add("hidden");
}

function renderNotificationsList() {
  var list = data.notifications.filter(function (n) { return n.forRole === currentRole; }).sort(function (a, b) { return b.ts - a.ts; });
  var el = $("#notificationsList");
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + svgBell() + '</div><div class="empty-state__text">Пока нет уведомлений</div></div>';
    return;
  }
  el.innerHTML = list.map(function (n) {
    return '<div class="list-item notification-item ' + (n.read ? "" : "notification-item--unread") + '"><div><div class="list-item__title">' + n.icon + " " + escapeHtml(n.text) + '</div><div class="list-item__meta">' + formatTime(n.ts) + '</div></div></div>';
  }).join("");
}

function openNotificationsModal() {
  var changed = false;
  data.notifications.forEach(function (n) {
    if (n.forRole === currentRole && !n.read) { n.read = true; changed = true; }
  });
  renderNotificationsList();
  renderNotificationsBadge();
  openModal("notificationsModal");
  if (changed) saveData();
}

function clearNotifications() {
  if (!confirm("Очистить уведомления?")) return;
  data.notifications = data.notifications.filter(function (n) { return n.forRole !== currentRole; });
  saveData();
  closeModal();
  showToast("Уведомления очищены");
}

function checkFreshApprovals() {
  if (currentRole !== "child") return;
  var now = Date.now();
  var fresh = data.completions.filter(function (c) {
    return c.status === "approved" && c.approvedAt && (now - c.approvedAt) < FRESH_APPROVAL_MS && shownApprovalIds.indexOf(c.id) < 0;
  });
  fresh.forEach(function (c) {
    shownApprovalIds.push(c.id);
    var ch = data.chores.find(function (x) { return x.id === c.choreId; });
    if (!ch) return;
    showApproveAnimation(ch.reward);
    setTimeout(function () { showToast(randomPhrase() + " · +" + ch.reward + " " + pluralPoints(ch.reward), "success"); }, 200);
  });
  if (shownApprovalIds.length > 60) shownApprovalIds = shownApprovalIds.slice(-30);
}

function getLevel(v) {
  var lvl = LEVELS[0];
  for (var i = 0; i < LEVELS.length; i++) {
    if (v >= LEVELS[i].min) lvl = LEVELS[i];
    else break;
  }
  return lvl;
}
function getNextLevel(v) {
  for (var i = 0; i < LEVELS.length; i++) {
    if (v < LEVELS[i].min) return LEVELS[i];
  }
  return null;
}
function checkLevelUp() {
  var lvl = getLevel(data.totalEarnedPoints);
  if (data.lastLevel !== lvl.name) {
    var prevIdx = -1, currIdx = -1;
    for (var i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i].name === data.lastLevel) prevIdx = i;
      if (LEVELS[i].name === lvl.name) currIdx = i;
    }
    if (currIdx > prevIdx) {
      addNotification("child", "Новый уровень: " + lvl.name + "!", "🐉");
      setTimeout(function () {
        showToast("🐉 Новый уровень: " + lvl.name + "!", "levelup");
        spawnConfetti(24);
      }, 400);
    }
    data.lastLevel = lvl.name;
  }
}
function checkGoalsReady() {
  data.goals.forEach(function (g) {
    if (!g.notifiedReady && data.points >= g.price) {
      g.notifiedReady = true;
      addNotification("child", "Цель «" + g.title + "» достигнута!", "🎯");
    }
  });
}

function isChoreActiveToday(c) {
  var r = c.repeat || "daily";
  if (r === "daily") return true;
  var day = new Date().getDay();
  if (r === "weekdays") return day >= 1 && day <= 5;
  if (r === "weekend") return day === 0 || day === 6;
  if (r === "custom") {
    if (!Array.isArray(c.days) || !c.days.length) return true;
    return c.days.indexOf(day) >= 0;
  }
  if (r === "once") {
    return !data.completions.some(function (x) { return x.choreId === c.id && x.status === "approved"; });
  }
  return true;
}
function countToday(id) {
  return data.completions.filter(function (c) { return c.choreId === id && c.date === today() && c.status !== "rejected"; }).length;
}
function countTodayByStatus(id, s) {
  return data.completions.filter(function (c) { return c.choreId === id && c.date === today() && c.status === s; }).length;
}

function checkDailyTreasure() {
  if (treasureCheckedThisSession) return;
  treasureCheckedThisSession = true;
  var ts = today();
  if (data.lastTreasureDate === ts) return;
  if (Math.random() < 0.35) {
    var r = TREASURE_REWARDS[Math.floor(Math.random() * TREASURE_REWARDS.length)];
    data.lastTreasureDate = ts;
    addTransaction("💰 " + r.text.replace(/\+/g, "").trim(), { points: r.points });
    checkLevelUp();
    checkGoalsReady();
    saveData();
    setTimeout(function () {
      showToast("💰 " + r.text, "reward");
      spawnConfetti(22);
    }, 600);
  } else {
    data.lastTreasureDate = ts;
    saveData();
  }
}

function addTransaction(d, opts) {
  opts = opts || {};
  var byn = opts.byn || 0;
  var points = opts.points || 0;
  if (!byn && !points) return;
  data.transactions.unshift({ description: d, byn: byn, points: points, date: today() });
  data.balance += byn;
  data.points += points;
  if (points > 0) data.totalEarnedPoints += points;
  if (points < 0 && opts.affectLevel) data.totalEarnedPoints += points;
}

function openModal(id) {
  $("#modalBackdrop").classList.remove("hidden");
  $$(".modal").forEach(function (m) { m.classList.add("hidden"); });
  var modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("hidden");
  var first = modal.querySelector("input[type=text]:not([type=hidden]), input[type=number]:not([type=hidden]), input[type=password]:not([type=hidden])");
  if (first) setTimeout(function () { first.focus(); }, 100);
}
function closeModal() {
  $("#modalBackdrop").classList.add("hidden");
  $$(".modal").forEach(function (m) { m.classList.add("hidden"); });
}

function enterCabinet(role) {
  currentRole = role;
  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  render();
  if (role === "child") setTimeout(checkDailyTreasure, 800);
}
function returnToStart() {
  currentRole = "";
  closeModal();
  document.getElementById("app").classList.add("hidden");
  document.getElementById("startScreen").classList.remove("hidden");
  window.scrollTo(0, 0);
  paintStartScreen();
}
function updateRoleVisibility() {
  var isParent = currentRole === "parent";
  $$(".parent-only").forEach(function (el) { el.classList.toggle("role-hidden", !isParent); });
  $$(".child-only").forEach(function (el) { el.classList.toggle("role-hidden", isParent); });

  var childHero = document.getElementById("childHero");
  var parentHero = document.getElementById("parentHero");
  if (childHero) childHero.style.display = (currentRole === "child") ? "flex" : "none";
  if (parentHero) parentHero.style.display = (currentRole === "parent") ? "flex" : "none";
}

function cleanupOrphanCompletions() {
  var choreIds = {};
  data.chores.forEach(function (c) { choreIds[c.id] = true; });
  var before = data.completions.length;
  data.completions = data.completions.filter(function (c) { return choreIds[c.choreId]; });
  return data.completions.length !== before;
}

function render() {
  if (!currentRole) return;
  var isParent = currentRole === "parent";
  updateRoleVisibility();
  renderNotificationsBadge();

  document.getElementById("balance").textContent = data.balance + " BYN";
  document.getElementById("points").textContent = data.points;
  document.getElementById("exchangeInfo").textContent = "Доступно: " + data.points + " " + pluralPoints(data.points);

  paintSummaryDeco();
  renderStatus();
  renderMainGoal();
  renderPendingChores();
  renderWithdrawRequests();
  renderMyWithdrawStatus();
  renderChores(isParent);
  renderGrades(isParent);
  renderGoals(isParent);
  renderHistory();
  checkFreshApprovals();
  renderChildHero();
  renderParentHero();
}

function renderStatus() {
  var lvl = getLevel(data.totalEarnedPoints);
  var next = getNextLevel(data.totalEarnedPoints);
  var el = document.getElementById("levelDragon");
  if (el) el.innerHTML = dragonSvg(lvl.key);
  document.getElementById("levelName").textContent = lvl.name;
  if (next) {
    var done = data.totalEarnedPoints - lvl.min;
    var total = next.min - lvl.min;
    var p = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById("levelProgressBar").style.width = p + "%";
    document.getElementById("levelProgressText").textContent = done + " / " + total + " " + pluralPoints(total) + " до «" + next.name + "»";
  } else {
    document.getElementById("levelProgressBar").style.width = "100%";
    document.getElementById("levelProgressText").textContent = "Максимум достигнут 🎉";
  }
}

function renderMainGoal() {
  var nameEl = document.getElementById("goalName");
  if (!nameEl) return;
  var g = sortedGoals()[0];
  if (!g) {
    nameEl.textContent = "Нет цели";
    var bar = document.getElementById("goalProgressBar");
    if (bar) bar.style.width = "0%";
    var txt = document.getElementById("goalProgressText");
    if (txt) txt.textContent = "Создайте цель";
    return;
  }
  var pr = Math.min(data.points, g.price);
  var p = Math.round((pr / g.price) * 100);
  nameEl.textContent = g.title;
  var bar2 = document.getElementById("goalProgressBar");
  if (bar2) bar2.style.width = p + "%";
  var txt2 = document.getElementById("goalProgressText");
  if (txt2) txt2.textContent = pr + " из " + g.price + " " + pluralPoints(g.price) + " (" + p + "%)";
}

function sortedGoals() {
  return data.goals.map(function (g, i) {
    var copy = {};
    for (var k in g) if (Object.prototype.hasOwnProperty.call(g, k)) copy[k] = g[k];
    copy._origIndex = i;
    return copy;
  }).sort(function (a, b) {
    if (a.important && !b.important) return -1;
    if (!a.important && b.important) return 1;
    return b.price - a.price;
  });
}

function renderChores(isParent) {
  var vis = isParent ? data.chores : data.chores.filter(isChoreActiveToday);
  var el = document.getElementById("choresList");
  if (!vis.length) {
    var txt = guffyReplicasOn()
      ? (isParent ? "Гуфи скучает без заданий. Создайте первое!" : "Гуфи говорит: на сегодня заданий нет. Отдыхай 🌿")
      : (isParent ? "Создайте первое задание" : "На сегодня заданий нет");
    el.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + guffyWithNotebook(getGuffyEmotion()) + '</div><div class="empty-state__text">' + txt + '</div></div>';
    return;
  }
  var html = vis.map(function (c) {
    var max = c.maxPerDay || 1;
    var unlimited = max >= 999;
    var done = countToday(c.id);
    var pending = countTodayByStatus(c.id, "pending");
    var approved = countTodayByStatus(c.id, "approved");

    var action = "";
    if (!isParent) {
      if (unlimited) {
        action = '<button class="button button--primary button--small" type="button" data-action="complete-chore" data-id="' + c.id + '">Выполнено' + (done > 0 ? " (" + done + ")" : "") + '</button>';
      } else if (done >= max) {
        if (approved >= max) action = '<span class="amount-positive">✓ Все ' + max + ' ' + pluralTimes(max) + '</span>';
        else if (pending > 0 && approved === 0) action = '<span class="list-item__meta">На проверке (' + pending + "/" + max + ')</span>';
        else if (pending > 0) action = '<span class="list-item__meta">✓ ' + approved + " · ⏳ " + pending + '</span>';
        else action = '<span class="amount-positive">✓ Выполнено</span>';
      } else {
        var label = max > 1 ? "Выполнено (" + done + "/" + max + ")" : "Выполнено";
        action = '<button class="button button--primary button--small" type="button" data-action="complete-chore" data-id="' + c.id + '">' + label + '</button>';
      }
    }

    var pb = isParent
      ? '<button class="button button--light button--small" type="button" data-action="edit-chore" data-id="' + c.id + '">Изменить</button> <button class="button button--danger button--small" type="button" data-action="delete-chore" data-id="' + c.id + '">Удалить</button>'
      : "";

    var showR = isParent || (c.repeat && c.repeat !== "daily");
    var bc = c.repeat === "custom" ? "custom" : (c.repeat || "daily");
    var rH = showR ? '<span class="badge badge--' + bc + '">' + repeatLabel(c.repeat || "daily", c.days) + '</span>' : "";
    var mH = max > 1 ? (unlimited
      ? '<span class="badge badge--multi">×∞</span>'
      : '<span class="badge badge--multi">×' + max + " " + pluralTimes(max) + '</span>') : "";
    var cH = (max > 1 && !unlimited && done > 0) ? '<span class="chore-daily-count">' + done + " из " + max + ' сегодня</span>' : "";
    var parts = [c.description, c.reward + " " + pluralPoints(c.reward)].filter(Boolean);
    var meta = mH + rH + escapeHtml(parts.join(" · "));

    var cm = null;
    data.completions.forEach(function (x) {
      if (x.choreId === c.id && x.date === today() && (x.status === "approved" || x.status === "rejected")) {
        if (!cm || (x.approvedAt || 0) > (cm.approvedAt || 0)) cm = x;
      }
    });
    var cmH = "";
    if (cm && cm.comment && !isParent) {
      var cmIcon = cm.status === "approved" ? "💬" : "❌";
      var cmCls = cm.status === "approved" ? "chore-comment" : "chore-comment chore-comment--reject";
      cmH = '<div class="' + cmCls + '">' + cmIcon + ' ' + escapeHtml(cm.comment) + '</div>';
    }

    var wp = data.completions.filter(function (x) { return x.choreId === c.id && x.date === today() && x.photo; }).slice(-1)[0];
    var pH = wp ? '<img class="chore-photo-thumb" src="' + wp.photo + '" alt="Фото">' : "";

    return '<div class="list-item"><div><div class="list-item__title">' + escapeHtml(c.title) + '</div><div class="list-item__meta">' + cH + meta + '</div>' + cmH + pH + '</div><div class="list-item__actions">' + action + pb + '</div></div>';
  }).join("");
  el.innerHTML = html;
}

function renderGrades(isParent) {
  var has = data.grades.length > 0 || data.gradeRequests.length > 0;
  var el = document.getElementById("gradesList");
  if (!has) {
    var txt = guffyReplicasOn()
      ? "Гуфи говорит: оценок пока нет"
      : (isParent ? "Добавьте первую оценку" : "Оценок пока нет");
    el.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + guffyWithDiary(getGuffyEmotion()) + '</div><div class="empty-state__text">' + txt + '</div></div>';
    return;
  }
  var sortedGrades = data.grades.slice().sort(function (a, b) {
    return String(b.date || "").localeCompare(String(a.date || ""));
  });
  var html = sortedGrades.slice(0, GRADES_LIMIT).map(function (g) {
    var em = gradeEmoji(g.value);
    var parts = [];
    if (g.payment > 0) parts.push('<span class="amount-positive">+' + g.payment + ' BYN</span>');
    else if (g.payment < 0) parts.push('<span class="amount-negative">' + g.payment + ' BYN</span>');
    var penalty = penaltyPointsForGrade(g.value);
    if (penalty) parts.push('<span class="amount-negative">' + penalty + ' ' + pluralPoints(Math.abs(penalty)) + '</span>');
    if (!parts.length) parts.push('<span class="amount-zero">0 BYN</span>');
    var a = parts.join(" ");
    var pb = isParent
      ? '<button class="button button--light button--small" type="button" data-action="edit-grade" data-id="' + g.id + '">Изменить</button> <button class="button button--danger button--small" type="button" data-action="delete-grade" data-id="' + g.id + '">Удалить</button>'
      : "";
    return '<div class="list-item"><div><div class="list-item__title">' + em + " " + escapeHtml(g.subject) + " — " + g.value + '</div><div class="list-item__meta">' + g.date + '</div></div><div class="list-item__actions">' + a + pb + '</div></div>';
  }).join("");

  if (isParent) {
    html += data.gradeRequests.map(function (r) {
      var em = gradeEmoji(r.value);
      var pay = paymentForGrade(r.value, r.subject);
      var penalty = penaltyPointsForGrade(r.value);
      var parts = [];
      if (pay > 0) parts.push('<span class="amount-positive">+' + pay + ' BYN</span>');
      else if (pay < 0) parts.push('<span class="amount-negative">' + pay + ' BYN</span>');
      if (penalty) parts.push('<span class="amount-negative">' + penalty + ' ' + pluralPoints(Math.abs(penalty)) + '</span>');
      if (!parts.length) parts.push('<span class="amount-zero">без оплаты</span>');
      return '<div class="list-item list-item--pending"><div><div class="list-item__title">' + em + " " + escapeHtml(r.subject) + " — " + r.value + '</div><div class="list-item__meta">От ребёнка · ' + r.date + " · " + parts.join(" ") + '</div></div><div class="list-item__actions"><button class="button button--primary button--small" type="button" data-action="approve-grade" data-id="' + r.id + '">Одобрить</button> <button class="button button--light button--small" type="button" data-action="reject-grade" data-id="' + r.id + '">Отклонить</button></div></div>';
    }).join("");
  } else {
    html += data.gradeRequests.map(function (r) {
      var em = gradeEmoji(r.value);
      return '<div class="list-item list-item--pending"><div><div class="list-item__title">' + em + " " + escapeHtml(r.subject) + " — " + r.value + '</div><div class="list-item__meta">На проверке · ' + r.date + '</div></div></div>';
    }).join("");
  }
  el.innerHTML = html;
}

function renderGoals(isParent) {
  var c = document.getElementById("goalsLayout");
  if (!c) return;
  if (!data.goals.length) {
    var txt = guffyReplicasOn()
      ? (isParent ? "Гуфи предлагает помечтать. Добавьте первую цель" : "Гуфи говорит: целей пока нет. О чём мечтаешь?")
      : (isParent ? "Создайте первую цель" : "Целей пока нет");
    c.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + guffyLookingAtMountain(getGuffyEmotion()) + '</div><div class="empty-state__text">' + txt + '</div></div>';
    return;
  }
  var sorted = sortedGoals();
  var hero = sorted[0];
  var rest = sorted.slice(1, MAX_GOALS);
  var html = renderGoalHero(hero, isParent);
  if (rest.length) html += '<div class="goals-mini-grid">' + rest.map(function (g) { return renderGoalMini(g, isParent); }).join("") + '</div>';
  c.innerHTML = html;
}

function renderGoalHero(g, isParent) {
  var i = g._origIndex;
  var pr = Math.min(data.points, g.price);
  var p = Math.round((pr / g.price) * 100);
  var rem = Math.max(0, g.price - pr);
  var ready = pr >= g.price;
  var claim = (!isParent && ready) ? '<button class="button button--gold button--small" type="button" data-action="claim-goal" data-index="' + i + '">🎁 Забрать награду</button>' : "";
  var pb = isParent ? '<button class="button button--light button--small" type="button" data-action="edit-goal" data-index="' + i + '">Изменить</button> <button class="button button--danger button--small" type="button" data-action="delete-goal" data-index="' + i + '">Удалить</button>' : "";

  var dH = "";
  if (g.deadline) {
    var d = daysBetween(today(), g.deadline);
    var cls = "goal-deadline", t;
    if (d < 0) { cls += " goal-deadline--overdue"; t = "⏰ Просрочено (" + Math.abs(d) + " " + pluralDays(Math.abs(d)) + ")"; }
    else if (d === 0) { cls += " goal-deadline--soon"; t = "🔥 Сегодня!"; }
    else if (d <= 3) { cls += " goal-deadline--soon"; t = "⏳ " + d + " " + pluralDays(d); }
    else { t = "⏳ " + d + " " + pluralDays(d); }
    dH = '<span class="' + cls + '">' + t + '</span>';
  }

  var ms = [25, 50, 75].map(function (m) {
    return '<span class="goal-progress__milestone ' + (p >= m ? "is-reached" : "") + '" style="left:' + m + '%">' + m + '</span>';
  }).join("");
  var hT = ready ? "🎉 Цель достигнута!" : "Осталось " + rem + " " + pluralPoints(rem);

  return '<div class="goal-hero ' + (ready ? "is-ready" : "") + '">' +
    '<div class="goal-hero__label">' + (g.important ? "⭐ Главная цель" : "🎯 Главная цель") + '</div>' +
    '<div class="goal-hero__top"><div class="goal-hero__title">' + escapeHtml(g.title) + '</div><div class="goal-hero__percent ' + (p === 0 ? "goal-hero__percent--zero" : "") + '">' + p + '%</div></div>' +
    (dH ? '<div class="goal-hero__deadline">' + dH + '</div>' : "") +
    '<div class="goal-hero__progress"><div class="goal-progress"><div class="goal-progress__bar"><div class="goal-progress__fill" style="width:' + p + '%"></div></div><div class="goal-progress__milestones">' + ms + '</div></div></div>' +
    '<div class="goal-hero__foot"><div class="goal-left">' + pr + " из " + g.price + " " + pluralPoints(g.price) + '</div><div class="goal-hint">' + hT + '</div></div>' +
    ((claim || pb) ? '<div class="goal-hero__actions">' + claim + pb + '</div>' : "") +
    '</div>';
}

function renderGoalMini(g, isParent) {
  var i = g._origIndex;
  var pr = Math.min(data.points, g.price);
  var p = Math.round((pr / g.price) * 100);
  var ready = pr >= g.price;
  var claim = (!isParent && ready) ? '<button class="button button--gold button--small" type="button" data-action="claim-goal" data-index="' + i + '">🎁 Забрать</button>' : "";
  var pb = isParent ? '<button class="button button--light button--small" type="button" data-action="edit-goal" data-index="' + i + '">Изменить</button> <button class="button button--danger button--small" type="button" data-action="delete-goal" data-index="' + i + '">Удалить</button>' : "";
  var ms = [25, 50, 75].map(function (m) {
    return '<span class="goal-progress__milestone ' + (p >= m ? "is-reached" : "") + '" style="left:' + m + '%">' + m + '</span>';
  }).join("");
  var bI = g.important ? '<span class="badge badge--important" style="margin-bottom:4px;display:inline-block">⭐ Важная</span>' : "";

  return '<div class="goal-mini ' + (ready ? "is-ready" : "") + '">' +
    bI +
    '<div class="goal-mini__row"><div class="goal-mini__title">' + escapeHtml(g.title) + '</div><div class="goal-mini__percent ' + (p === 0 ? "goal-mini__percent--zero" : "") + '">' + p + '%</div></div>' +
    '<div class="goal-progress goal-progress--mini"><div class="goal-progress__bar"><div class="goal-progress__fill" style="width:' + p + '%"></div></div><div class="goal-progress__milestones">' + ms + '</div></div>' +
    '<div class="goal-mini__meta">' + pr + " из " + g.price + " " + pluralPoints(g.price) + '</div>' +
    ((claim || pb) ? '<div class="goal-mini__actions">' + claim + pb + '</div>' : "") +
    '</div>';
}

function renderHistory() {
  var el = document.getElementById("historyList");
  if (!data.transactions.length) {
    var txt = guffyReplicasOn() ? "Гуфи говорит: история пока пуста" : "История пока пуста";
    el.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + guffyWithScroll(getGuffyEmotion()) + '</div><div class="empty-state__text">' + txt + '</div></div>';
    return;
  }
  var html = data.transactions.slice(0, HISTORY_LIMIT).map(function (t) {
    var parts = [];
    if (t.points) {
      var cls = t.points > 0 ? "amount-positive" : "amount-negative";
      parts.push('<span class="' + cls + '">' + (t.points > 0 ? "+" : "") + t.points + " " + pluralPoints(t.points) + '</span>');
    }
    if (t.byn) {
      var cls2 = t.byn > 0 ? "amount-positive" : "amount-negative";
      parts.push('<span class="' + cls2 + '">' + (t.byn > 0 ? "+" : "") + t.byn + ' BYN</span>');
    }
    var r = parts.length ? parts.join(" · ") : '<span class="amount-zero">—</span>';
    return '<div class="list-item"><div><div class="list-item__title">' + escapeHtml(t.description) + '</div><div class="list-item__meta">' + t.date + '</div></div><div class="list-item__actions">' + r + '</div></div>';
  }).join("");
  el.innerHTML = html;
}

function renderPendingChores() {
  var el = document.getElementById("pendingList");
  if (!el) return;
  var list = data.completions.filter(function (c) { return c.status === "pending"; });
  if (!list.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + svgBell() + '</div><div class="empty-state__text">Нет заданий на проверке</div></div>';
    return;
  }
  var html = list.map(function (c) {
    var ch = data.chores.find(function (x) { return x.id === c.choreId; });
    if (!ch) return "";
    var pH = c.photo ? '<img class="chore-photo-thumb" src="' + c.photo + '" alt="Фото">' : "";
    return '<div class="list-item"><div><div class="list-item__title">' + escapeHtml(ch.title) + '</div><div class="list-item__meta">' + ch.reward + " " + pluralPoints(ch.reward) + " · " + c.date + '</div>' + pH + '</div><div class="list-item__actions"><button class="button button--primary button--small" type="button" data-action="approve-chore" data-id="' + c.id + '">💬 Одобрить</button> <button class="button button--light button--small" type="button" data-action="reject-chore" data-id="' + c.id + '">Отклонить</button></div></div>';
  }).join("");
  el.innerHTML = html;
}

function renderWithdrawRequests() {
  var el = document.getElementById("withdrawRequestsList");
  if (!el) return;
  var list = data.withdrawRequests.slice().sort(function (a, b) {
    var ap = a.status === "pending" ? 0 : 1;
    var bp = b.status === "pending" ? 0 : 1;
    if (ap !== bp) return ap - bp;
    return String(b.date || "").localeCompare(String(a.date || ""));
  });
  if (!list.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + svgMoney() + '</div><div class="empty-state__text">Пока нет запросов на деньги</div></div>';
    return;
  }
  el.innerHTML = list.slice(0, 10).map(function (r) {
    var reason = r.reason ? escapeHtml(r.reason) : "Без причины";
    var amountLabel = "💵 " + r.amount + " BYN";
    if (r.status === "approved" && r.requestedAmount && r.requestedAmount !== r.amount) {
      amountLabel += ' <span class="list-item__meta" style="display:inline">(запрошено ' + r.requestedAmount + ')</span>';
    }
    if (r.status === "pending") {
      var enough = data.balance >= r.amount;
      var actions = enough
        ? '<button class="button button--primary button--small" type="button" data-action="approve-withdraw" data-id="' + r.id + '">💸 Выдать</button> <button class="button button--light button--small" type="button" data-action="reject-withdraw" data-id="' + r.id + '">Отклонить</button>'
        : '<span class="amount-negative" style="align-self:center;margin-right:8px">Мало средств</span> <button class="button button--light button--small" type="button" data-action="reject-withdraw" data-id="' + r.id + '">Отклонить</button>';
      return '<div class="list-item list-item--pending"><div><div class="list-item__title">' + amountLabel + '</div><div class="list-item__meta">' + reason + " · " + r.date + '</div></div><div class="list-item__actions">' + actions + '</div></div>';
    }
    var statusText = r.status === "approved"
      ? '<span class="amount-positive">✓ Выдано</span>'
      : '<span class="amount-negative">✗ Отклонено</span>';
    return '<div class="list-item"><div><div class="list-item__title">' + amountLabel + '</div><div class="list-item__meta">' + reason + " · " + r.date + '</div></div><div class="list-item__actions">' + statusText + '</div></div>';
  }).join("");
}

function renderMyWithdrawStatus() {
  var el = document.getElementById("myWithdrawStatus");
  if (!el) return;
  var mine = data.withdrawRequests.filter(function (r) { return r.status === "pending"; });
  if (!mine.length) { el.innerHTML = ""; return; }
  var r = mine[0];
  el.innerHTML = '<div class="chore-comment">⏳ Запрос на ' + r.amount + ' BYN на проверке' + (r.reason ? ": " + escapeHtml(r.reason) : "") + '</div>';
}

function compressImage(file, max, q) {
  return new Promise(function (res, rej) {
    var r = new FileReader();
    r.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var w = img.width, h = img.height;
        if (w > h && w > max) { h = Math.round(h * max / w); w = max; }
        else if (h >= w && h > max) { w = Math.round(w * max / h); h = max; }
        var cv = document.createElement("canvas");
        cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        try { res(cv.toDataURL("image/jpeg", q)); }
        catch (err) { rej(err); }
      };
      img.onerror = rej;
      img.src = e.target.result;
    };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function openPhotoViewer(src) {
  if (!src) return;
  var v = document.createElement("div");
  v.className = "photo-viewer";
  v.innerHTML = '<img src="' + src + '" alt="">';
  v.addEventListener("click", function () { v.remove(); });
  document.body.appendChild(v);
}

function showApproveAnimation(reward) {
  var o = document.createElement("div");
  o.className = "approve-overlay";
  o.innerHTML = '<div class="approve-check">✓</div><div class="approve-points">+' + reward + " " + pluralPoints(reward) + '</div>';
  document.body.appendChild(o);
  setTimeout(function () { o.remove(); }, 1300);
}

function openPhotoModal(id) {
  var ch = data.chores.find(function (x) { return x.id === id; });
  if (!ch) return;
  var max = ch.maxPerDay || 1;
  if (max < 999 && countToday(id) >= max) { showToast("Лимит уже достигнут"); return; }
  document.getElementById("photoChoreId").value = id;
  document.getElementById("photoChoreName").textContent = ch.title;
  document.getElementById("photoFileInput").value = "";
  document.getElementById("photoPreviewWrap").classList.add("hidden");
  document.getElementById("photoPreview").removeAttribute("src");
  pendingPhotoDataUrl = "";
  openModal("photoModal");
}

function handlePhotoFileChange(e) {
  var f = e.target.files && e.target.files[0];
  if (!f) return;
  if (f.type.indexOf("image/") !== 0) { showToast("Не изображение"); e.target.value = ""; return; }
  showToast("Обрабатываю…");
  compressImage(f, PHOTO_MAX_SIZE, PHOTO_QUALITY).then(function (url) {
    pendingPhotoDataUrl = url;
    document.getElementById("photoPreview").src = url;
    document.getElementById("photoPreviewWrap").classList.remove("hidden");
  }).catch(function () {
    showToast("Ошибка фото");
    e.target.value = "";
  });
}

function removePendingPhoto() {
  pendingPhotoDataUrl = "";
  document.getElementById("photoFileInput").value = "";
  document.getElementById("photoPreviewWrap").classList.add("hidden");
  document.getElementById("photoPreview").removeAttribute("src");
}

function submitPhotoForm() {
  var id = Number(document.getElementById("photoChoreId").value);
  var ch = data.chores.find(function (x) { return x.id === id; });
  if (!ch) { closeModal(); return; }
  var max = ch.maxPerDay || 1;
  if (max < 999 && countToday(id) >= max) { closeModal(); showToast("Лимит"); return; }
  data.completions.push({
    id: uniqueId(), choreId: id, date: today(), status: "pending",
    comment: "", photo: pendingPhotoDataUrl || "", approvedAt: 0
  });
  addNotification("parent", "Новое задание: «" + ch.title + "»", "📋");
  pendingPhotoDataUrl = "";
  closeModal();
  saveData();
  showToast("Отправлено родителю");
}

function openCommentModal(id, mode) {
  var c = data.completions.find(function (x) { return x.id === id; });
  if (!c) return;
  var ch = data.chores.find(function (x) { return x.id === c.choreId; });
  mode = mode === "reject" ? "reject" : "approve";
  document.getElementById("commentCompletionId").value = id;
  document.getElementById("commentMode").value = mode;
  document.getElementById("commentChoreTitle").textContent = ch ? ch.title : "Задание";
  document.getElementById("commentText").value = "";
  var titleEl = document.getElementById("commentModalTitle");
  var btnEl = document.getElementById("commentSubmitBtn");
  var lblEl = document.getElementById("commentLabel");
  var hintEl = document.getElementById("commentHint");
  var txtEl = document.getElementById("commentText");
  if (mode === "reject") {
    if (titleEl) titleEl.textContent = "Отклонить задание";
    if (btnEl) btnEl.textContent = "✗ Отклонить";
    if (lblEl) lblEl.childNodes[0].nodeValue = "Причина (необязательно)\n        ";
    if (txtEl) txtEl.placeholder = "Например: фото нечёткое, переделай";
    if (hintEl) hintEl.textContent = "Ребёнок увидит причину под заданием.";
  } else {
    if (titleEl) titleEl.textContent = "Одобрить задание";
    if (btnEl) btnEl.textContent = "✓ Одобрить";
    if (lblEl) lblEl.childNodes[0].nodeValue = "Комментарий (необязательно)\n        ";
    if (txtEl) txtEl.placeholder = "Например: Отлично получилось!";
    if (hintEl) hintEl.textContent = "Ребёнок увидит комментарий под заданием.";
  }
  openModal("commentModal");
}

function approveChoreWithComment(id, comment) {
  var c = data.completions.find(function (x) { return x.id === id; });
  if (!c) return;
  var ch = data.chores.find(function (x) { return x.id === c.choreId; });
  if (!ch) {
    data.completions = data.completions.filter(function (x) { return x.id !== id; });
    saveData();
    showToast("Задание удалено");
    return;
  }

  var max = ch.maxPerDay || 1;
  if (max < 999) {
    var approvedToday = data.completions.filter(function (x) {
      return x.choreId === ch.id && x.date === today() && x.status === "approved";
    }).length;
    if (approvedToday >= max) {
      c.status = "rejected";
      c.comment = comment || "";
      c.photo = "";
      c.approvedAt = Date.now();
      addNotification("child", "Задание «" + ch.title + "» отклонено: лимит " + max + " " + pluralTimes(max) + " в день", "❌");
      saveData();
      showToast("Лимит на сегодня: " + max + " " + pluralTimes(max));
      return;
    }
  }

  c.status = "approved";
  c.comment = comment || "";
  c.approvedAt = Date.now();
  var had = !!c.photo;
  c.photo = "";
  addTransaction("Задание: " + ch.title, { points: ch.reward });
  addNotification("child", "Задание «" + ch.title + "» одобрено · +" + ch.reward + " " + pluralPoints(ch.reward), "✅");
  checkLevelUp();
  checkGoalsReady();
  saveData();
  showToast(randomPhrase() + (had ? " · 📷 фото" : ""), "success");
}

function rejectChoreWithComment(id, comment) {
  var c = data.completions.find(function (x) { return x.id === id; });
  if (!c) return;
  var ch = data.chores.find(function (x) { return x.id === c.choreId; });
  c.status = "rejected";
  c.comment = comment || "";
  c.photo = "";
  c.approvedAt = Date.now();
  var title = ch ? ch.title : "Задание";
  var msg = "Задание «" + title + "» отклонено";
  if (comment) msg += ": " + comment;
  addNotification("child", msg, "❌");
  saveData();
  showToast(comment ? "Отклонено с причиной" : "Задание отклонено");
}

function deleteChore(id) {
  if (!confirm("Удалить задание? Уже начисленные баллы останутся у ребёнка.")) return;
  data.chores = data.chores.filter(function (x) { return x.id !== id; });
  data.completions = data.completions.filter(function (c) { return c.choreId !== id; });
  saveData();
  showToast("Задание удалено");
}

function approveGrade(id) {
  var r = data.gradeRequests.find(function (x) { return x.id === id; });
  if (!r) return;
  var p = paymentForGrade(r.value, r.subject);
  var penalty = penaltyPointsForGrade(r.value);
  data.gradeRequests = data.gradeRequests.filter(function (x) { return x.id !== id; });
  data.grades.unshift({ id: r.id, subject: r.subject, value: r.value, date: r.date, payment: p });
  if (p) addTransaction("Оценка " + r.value + ": " + r.subject, { byn: p });
  if (penalty) addTransaction("Штраф за оценку " + r.value + ": " + r.subject, { points: penalty, affectLevel: true });
  var s = "";
  if (p > 0) s = " · +" + p + " BYN";
  else if (p < 0) s = " · " + p + " BYN";
  if (penalty) s += " · " + penalty + " " + pluralPoints(Math.abs(penalty));
  addNotification("child", "Оценка «" + r.subject + " — " + r.value + "» подтверждена" + s, "🎓");
  saveData();
  if (p > 0) showToast("Начислено " + p + " BYN", "success");
  else if (p < 0) showToast("Штраф " + Math.abs(p) + " BYN");
  else if (penalty) showToast("Штраф " + Math.abs(penalty) + " " + pluralPoints(Math.abs(penalty)));
  else showToast("Оценка подтверждена");
  if (penalty) { checkLevelUp(); checkGoalsReady(); }
}

function rejectGrade(id) {
  var r = data.gradeRequests.find(function (x) { return x.id === id; });
  if (r) addNotification("child", "Оценка «" + r.subject + " — " + r.value + "» отклонена", "🎓");
  data.gradeRequests = data.gradeRequests.filter(function (x) { return x.id !== id; });
  saveData();
  showToast("Оценка отклонена");
}

function deleteGrade(id) {
  var idx = data.grades.findIndex(function (g) { return g.id === id; });
  if (idx === -1) return;
  var g = data.grades[idx];
  if (!confirm('Удалить оценку «' + g.subject + " — " + g.value + '»?')) return;
  if (g.payment) addTransaction("Отмена оценки: " + g.subject, { byn: -g.payment });
  var penalty = penaltyPointsForGrade(g.value);
  if (penalty) addTransaction("Отмена штрафа за оценку: " + g.subject, { points: -penalty, affectLevel: true });
  data.grades.splice(idx, 1);
  saveData();
  if (penalty) { checkLevelUp(); checkGoalsReady(); }
  showToast("Оценка удалена");
}

function openEditGrade(id) {
  var g = data.grades.find(function (x) { return x.id === id; });
  if (!g) return;
  document.getElementById("gradeEditId").value = g.id;
  setSubjectSelect("#gradeSubjectSelect", "#gradeSubjectCustom", "#gradeCustomSubjectWrapper", g.subject);
  document.getElementById("gradeValue").value = g.value;
  document.getElementById("gradeModalTitle").textContent = "Редактировать оценку";
  updateGradeHint(g.subject);
  openModal("gradeModal");
}

function claimGoal(i) {
  var g = data.goals[i];
  if (!g) return;
  if (data.points < g.price) return showToast("Не хватает баллов");
  addTransaction("🎁 Награда: " + g.title, { points: -g.price });
  data.goals.splice(i, 1);
  saveData();
  if (navigator.vibrate) navigator.vibrate([60, 40, 100]);
  spawnConfetti(40);
  showToast("🎉 Награда: " + g.title, "reward");
}

function deleteGoal(i) {
  var g = data.goals[i];
  if (!g) return;
  if (!confirm("Удалить цель?")) return;
  data.goals.splice(i, 1);
  saveData();
  showToast("Цель удалена");
}

function exchangePoints() {
  var p = toInt(document.getElementById("exchangeInput").value);
  if (!Number.isInteger(p) || p < EXCHANGE_RATE || p % EXCHANGE_RATE !== 0) return showToast("Кратное 5");
  if (p > data.points) return showToast("Недостаточно баллов");
  var mg = sortedGoals()[0];
  var loss = 0;
  if (mg) {
    var before = Math.min(data.points, mg.price);
    var after = Math.min(data.points - p, mg.price);
    loss = before - after;
  }
  var msg = "Обменять " + p + " " + pluralPoints(p) + " на " + (p / EXCHANGE_RATE) + " BYN?";
  if (loss > 0 && mg) msg = "Обмен уменьшит прогресс цели «" + mg.title + "» на " + loss + " " + pluralPoints(loss) + ".\n\nПродолжить?";
  if (!confirm(msg)) return;
  var byn = p / EXCHANGE_RATE;
  addTransaction("Обмен " + p + " " + pluralPoints(p), { byn: byn, points: -p });
  saveData();
  showToast("+" + byn + " BYN · −" + p + " " + pluralPoints(p), "success");
}

function setSubjectSelect(sel, cus, wrap, sub) {
  var s = document.querySelector(sel), c = document.querySelector(cus), w = document.querySelector(wrap);
  if (!s) return;
  if (KNOWN_SUBJECTS.indexOf(sub) >= 0) { s.value = sub; w.classList.add("hidden"); c.value = ""; }
  else { s.value = "__custom__"; w.classList.remove("hidden"); c.value = sub || ""; }
}
function getSubjectValue(sel, cus) {
  var s = document.querySelector(sel), c = document.querySelector(cus);
  if (!s) return "";
  if (s.value === "__custom__") return (c.value || "").trim();
  return s.value;
}
function updateGradeHint(sub) {
  var h = document.getElementById("gradeHint");
  if (!h) return;
  if (isMath(sub)) h.innerHTML = '<strong>Математика:</strong><br>10, 9 → <strong>+5 BYN</strong> · 8 → <strong>+4 BYN</strong> · 7 → <strong>+2 BYN</strong><br>6 → 0 BYN · <strong>4, 5 → −5 BYN</strong> · <strong>1, 2, 3 → −2 BYN</strong>';
  else h.innerHTML = '10 → <strong>+3 BYN</strong> · 9 → <strong>+2 BYN</strong> · 7, 8 → <strong>+1 BYN</strong><br>6 → 0 BYN · <strong>4, 5 → −5 BYN</strong> · <strong>1, 2, 3 → −2 BYN</strong>';
}

function openWithdrawRequestModal() {
  document.getElementById("withdrawRequestForm").reset();
  document.getElementById("withdrawBalanceLabel").textContent = data.balance + " BYN";
  var amtEl = document.getElementById("withdrawAmount");
  amtEl.max = Math.max(1, data.balance);
  openModal("withdrawRequestModal");
}

function submitWithdrawRequest() {
  var amount = toInt(document.getElementById("withdrawAmount").value);
  var reason = document.getElementById("withdrawReason").value.trim().slice(0, 60);
  if (!Number.isInteger(amount) || amount < 1) return showToast("Сумма — целое ≥ 1");
  if (amount > data.balance) return showToast("На балансе только " + data.balance + " BYN");
  var hasPending = data.withdrawRequests.some(function (r) { return r.status === "pending"; });
  if (hasPending) { closeModal(); return showToast("Уже есть активный запрос"); }
  data.withdrawRequests.unshift({
    id: uniqueId(),
    amount: amount,
    requestedAmount: amount,
    reason: reason,
    date: today(),
    status: "pending"
  });
  addNotification("parent", "💵 Запрос на " + amount + " BYN" + (reason ? ": " + reason : ""), "💰");
  closeModal();
  saveData();
  showToast("Запрос отправлен родителю", "success");
}

function approveWithdraw(id) {
  var r = data.withdrawRequests.find(function (x) { return x.id === id; });
  if (!r || r.status !== "pending") return;
  if (data.balance < r.amount) return showToast("Недостаточно средств");
  document.getElementById("approveWithdrawId").value = r.id;
  document.getElementById("approveWithdrawAmount").value = r.amount;
  document.getElementById("approveWithdrawAmount").max = Math.max(1, data.balance);
  document.getElementById("approveWithdrawSubtitle").textContent =
    "Запрос: " + r.amount + " BYN" + (r.reason ? " · " + r.reason : "");
  var h = document.getElementById("approveWithdrawHint");
  h.innerHTML = "На балансе: <strong>" + data.balance + " BYN</strong>. Можно выдать другую сумму.";
  openModal("approveWithdrawModal");
}

function confirmApproveWithdraw() {
  var id = Number(document.getElementById("approveWithdrawId").value);
  var amount = toInt(document.getElementById("approveWithdrawAmount").value);
  var r = data.withdrawRequests.find(function (x) { return x.id === id; });
  if (!r || r.status !== "pending") { closeModal(); return; }
  if (!Number.isInteger(amount) || amount < 1) return showToast("Сумма — целое ≥ 1");
  if (amount > data.balance) return showToast("На балансе только " + data.balance + " BYN");

  var baseReason = r.reason ? r.reason : "без причины";
  r.status = "approved";
  r.amount = amount;

  addTransaction("💸 Выдача: " + baseReason, { byn: -amount });
  addNotification("child", "💸 Родитель выдал " + amount + " BYN: " + baseReason, "✅");
  saveData();
  closeModal();
  showToast("Выдано " + amount + " BYN", "success");
  spawnConfetti(18);
}

function rejectWithdraw(id) {
  var r = data.withdrawRequests.find(function (x) { return x.id === id; });
  if (!r || r.status !== "pending") return;
  r.status = "rejected";
  addNotification("child", "💵 Запрос на " + r.amount + " BYN отклонён", "❌");
  saveData();
  showToast("Запрос отклонён");
}

function openBalanceManageModal(prefill) {
  document.getElementById("balanceManageForm").reset();
  document.getElementById("balanceManageLabel").textContent =
    data.balance + " BYN · " + data.points + " " + pluralPoints(data.points);
  var type = (prefill && prefill.type) || "byn";
  var sign = (prefill && prefill.sign != null) ? prefill.sign : 1;
  document.getElementById("balanceManageType").value = type;
  document.getElementById("balanceManageSign").value = String(sign);
  var amtEl = document.getElementById("balanceManageAmount");
  if (prefill && prefill.amount) amtEl.value = prefill.amount;
  setTimeout(function () { amtEl.focus(); }, 100);
  updateBalanceManageHint();
  openModal("balanceManageModal");
}

function openQuickManage(type, sign) {
  if (sign === 0) {
    openBalanceManageModal({ type: type, sign: 1 });
    return;
  }
  openBalanceManageModal({ type: type, sign: sign });
}

function updateBalanceManageHint() {
  var type = document.getElementById("balanceManageType").value;
  var sign = Number(document.getElementById("balanceManageSign").value);
  var h = document.getElementById("balanceManageHint");
  if (!h) return;
  if (type === "byn") {
    h.innerHTML = sign > 0
      ? "Ребёнок получит уведомление о начислении."
      : "Сумма спишется с баланса. Если денег не хватает — баланс уйдёт в минус.";
  } else {
    h.innerHTML = sign > 0
      ? "Баллы пойдут в общий счёт и повлияют на уровень."
      : "Баллы спишутся с текущего счёта (уровень не понизится).";
  }
}

function submitBalanceManage() {
  var type = document.getElementById("balanceManageType").value;
  var sign = Number(document.getElementById("balanceManageSign").value);
  var amount = toInt(document.getElementById("balanceManageAmount").value);
  var reason = document.getElementById("balanceManageReason").value.trim().slice(0, 60);
  if (!Number.isInteger(amount) || amount < 1) return showToast("Сумма — целое ≥ 1");
  if (!reason) reason = sign > 0 ? "Бонус" : "Списание";
  var delta = amount * sign;

  if (type === "byn") {
    if (sign < 0 && data.balance + delta < 0) {
      if (!confirm("Баланс уйдёт в минус (" + (data.balance + delta) + " BYN). Продолжить?")) return;
    }
    addTransaction((sign > 0 ? "🎁 " : "💸 ") + reason, { byn: delta });
    addNotification("child",
      (sign > 0 ? "🎁 Начислено " + amount + " BYN: " + reason : "💸 Списано " + amount + " BYN: " + reason),
      sign > 0 ? "🎁" : "💸");
  } else {
    addTransaction((sign > 0 ? "🎁 " : "⚠️ ") + reason, { points: delta });
    if (sign > 0) checkLevelUp();
    checkGoalsReady();
    addNotification("child",
      sign > 0
        ? "🎁 +" + amount + " " + pluralPoints(amount) + ": " + reason
        : "⚠️ −" + amount + " " + pluralPoints(amount) + ": " + reason,
      sign > 0 ? "🎁" : "⚠️");
  }
  saveData();
  closeModal();
  if (sign > 0) { showToast("Начислено", "success"); spawnConfetti(14); }
  else showToast("Списано");
}

function importDataFromJson(file) {
  var reader = new FileReader();
  reader.onload = function (e) {
    var parsed;
    try {
      parsed = JSON.parse(e.target.result);
    } catch (err) {
      showToast("Не удалось прочитать файл");
      return;
    }
    if (!parsed || typeof parsed !== "object") {
      showToast("Неверный формат");
      return;
    }
    if (!confirm("Импортировать данные?\n\nТекущие данные будут полностью заменены.")) return;
    var imported = normalize(parsed);
    if (firebaseReady && firebaseRef) {
      firebaseRef.set(stripPhotos(imported))
        .then(function () {
          data = imported;
          lastSyncedData = JSON.parse(JSON.stringify(data));
          try { localStore.set(STORAGE_KEY, JSON.stringify(stripPhotos(data))); } catch (e) {}
          setSyncStatus("online", "");
          closeModal();
          paintStartScreen();
          render();
          showToast("Данные импортированы", "success");
        })
        .catch(function () {
          showToast("Ошибка синхронизации");
        });
    } else {
      data = imported;
      lastSyncedData = JSON.parse(JSON.stringify(data));
      try { localStore.set(STORAGE_KEY, JSON.stringify(stripPhotos(data))); } catch (e) {}
      closeModal();
      paintStartScreen();
      render();
      showToast("Данные импортированы", "success");
    }
  };
  reader.onerror = function () { showToast("Ошибка чтения файла"); };
  reader.readAsText(file);
}

function resetPointsOnly() { if (!confirm("Обнулить баллы?")) return; data.points = 0; saveData(); closeModal(); showToast("Баллы обнулены"); }
function resetBalanceOnly() { if (!confirm("Обнулить баланс?")) return; data.balance = 0; saveData(); closeModal(); showToast("Баланс обнулён"); }
function clearHistoryOnly() { if (!confirm("Очистить историю?")) return; data.transactions = []; saveData(); closeModal(); showToast("История очищена"); }
function resetLevelOnly() { if (!confirm("Сбросить уровень?")) return; data.totalEarnedPoints = 0; data.lastLevel = LEVELS[0].name; saveData(); closeModal(); showToast("Уровень сброшен"); }
function resetEverything() {
  if (!confirm("Полный сброс?")) return;
  if (!confirm("Уверены? Это последнее подтверждение.")) return;
  localStore.remove(STORAGE_KEY);
  if (firebaseReady && firebaseRef) firebaseRef.remove();
  location.reload();
}

function buildWeeklyReport() {
  var now = new Date();
  var w = new Date(now);
  w.setDate(w.getDate() - 6);
  var from = formatDate(w);
  var to = formatDate(now);
  var txs = data.transactions.filter(function (t) { return t.date >= from && t.date <= to; });
  var pe = 0, be = 0;
  txs.forEach(function (t) {
    if (t.points > 0) pe += t.points;
    if (t.byn > 0) be += t.byn;
  });
  var co = data.completions.filter(function (c) { return c.status === "approved" && c.date >= from && c.date <= to; });
  var gr = data.grades.filter(function (g) { return g.date >= from && g.date <= to; });
  var avg = gr.length ? (gr.reduce(function (s, g) { return s + g.value; }, 0) / gr.length).toFixed(1) : "—";
  return { from: from, to: to, pe: pe, be: be, choresDone: co.length, gradesCount: gr.length, avg: avg };
}

function openWeeklyReport() {
  var r = buildWeeklyReport();
  var el = document.getElementById("reportContent");
  var f = function (s) { var p = s.split("-"); return p[2] + "." + p[1]; };
  var has = r.pe > 0 || r.be > 0 || r.choresDone > 0 || r.gradesCount > 0;
  var name = getDisplayName();
  var pre = name ? name + ", " : "";
  if (!has) el.innerHTML = '<div class="report-empty">' + pre + 'нет активности за неделю 💪</div>';
  else el.innerHTML =
    '<div class="report-period">' + pre + "период: " + f(r.from) + " — " + f(r.to) + '</div>' +
    '<div class="report-row"><span class="report-row__label">🏆 Заработано баллов</span><span class="report-row__value" style="color:#0D9488">+' + r.pe + '</span></div>' +
    '<div class="report-row"><span class="report-row__label">💰 Начислено денег</span><span class="report-row__value" style="color:#0D9488">+' + r.be + ' BYN</span></div>' +
    '<div class="report-row"><span class="report-row__label">✅ Заданий выполнено</span><span class="report-row__value">' + r.choresDone + '</span></div>' +
    '<div class="report-row"><span class="report-row__label">🎓 Оценок получено</span><span class="report-row__value">' + r.gradesCount + (r.gradesCount ? " (ср. " + r.avg + ")" : "") + '</span></div>';
  openModal("reportModal");
}

var toastTimer = null;
function showToast(msg, kind) {
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast";
  if (kind === "success") t.classList.add("toast--success");
  if (kind === "reward") t.classList.add("toast--reward");
  if (kind === "levelup") t.classList.add("toast--levelup");
  t.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.style.display = "none"; }, 2800);
}

function spawnConfetti(n) {
  var colors = ["#F472B6", "#8B5CF6", "#A78BFA", "#2DD4BF", "#5EEAD4", "#FBBF24"];
  var w = window.innerWidth;
  for (var i = 0; i < n; i++) {
    var el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = Math.random() * w + "px";
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = (Math.random() * 0.4) + "s";
    el.style.animationDuration = (2 + Math.random() * 1.2) + "s";
    if (Math.random() > 0.5) el.style.borderRadius = "50%";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 4000);
  }
}

function renderChoreDaysGrid() {
  $$("#choreDaysGrid .weekday-btn").forEach(function (b) {
    var d = Number(b.dataset.day);
    b.classList.toggle("is-active", editingChoreDays.indexOf(d) >= 0);
  });
}
function toggleChoreDay(d) {
  if (editingChoreDays.indexOf(d) >= 0) {
    editingChoreDays = editingChoreDays.filter(function (x) { return x !== d; });
  } else {
    editingChoreDays.push(d);
  }
  renderChoreDaysGrid();
}
function syncChoreDaysVisibility() {
  var r = document.getElementById("choreRepeat").value;
  var w = document.getElementById("choreDaysWrapper");
  if (!w) return;
  if (r === "custom") w.classList.remove("hidden");
  else w.classList.add("hidden");
}

function setMaxPerDaySelect(val) {
  var sel = document.getElementById("choreMaxPerDay");
  if (!sel) return;
  var v = String(val);
  var found = false;
  for (var i = 0; i < sel.options.length; i++) {
    if (sel.options[i].value === v) { found = true; break; }
  }
  if (!found) {
    var opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v + " " + pluralTimes(Number(v));
    sel.appendChild(opt);
  }
  sel.value = v;
}

function renderChoreTemplateSelect() {
  var sel = document.getElementById("choreTemplateSelect");
  if (!sel) return;
  var html = '<option value="">— Выбрать шаблон —</option>';
  CHORE_TEMPLATES.forEach(function (t, i) {
    html += '<option value="' + i + '">' + escapeHtml(t.title) + '</option>';
  });
  sel.innerHTML = html;
}

function applyChoreTemplate(index) {
  var t = CHORE_TEMPLATES[index];
  if (!t) return;
  document.getElementById("choreTitle").value = t.title;
  document.getElementById("choreDescription").value = t.description || "";
  document.getElementById("choreReward").value = t.reward || 5;
  setMaxPerDaySelect(t.maxPerDay || 1);
  document.getElementById("choreRepeat").value = t.repeat || "daily";
  editingChoreDays = Array.isArray(t.days) ? t.days.slice() : [];
  renderChoreDaysGrid();
  syncChoreDaysVisibility();
  showToast("Заполнено: " + t.title);
}

function setChoreTemplatesVisible(visible) {
  var block = document.getElementById("choreTemplatesBlock");
  if (block) block.classList.toggle("hidden", !visible);
  var sel = document.getElementById("choreTemplateSelect");
  if (sel) sel.value = "";
}

function checkDayChange() {
  var t = today();
  if (t !== currentDay) {
    currentDay = t;
    treasureCheckedThisSession = false;
    if (currentRole) {
      render();
      if (currentRole === "child") setTimeout(checkDailyTreasure, 500);
      showToast("🌅 Новый день! Задания обновлены", "success");
    } else {
      paintStartScreen();
    }
  } else if (currentRole) {
    paintSummaryDeco();
  }
}

function bindEvents() {
  var childBtn = document.getElementById("childLogin");
  if (childBtn) childBtn.addEventListener("click", function (e) { e.preventDefault(); enterCabinet("child"); });

  var parentBtn = document.getElementById("parentLogin");
  if (parentBtn) {
    parentBtn.addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("passwordForm").reset();
      openModal("passwordModal");
    });
  }

  var passForm = document.getElementById("passwordForm");
  if (passForm) {
    passForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var inp = document.getElementById("passwordInput");
      if (inp.value === PARENT_PASSWORD) { closeModal(); enterCabinet("parent"); }
      else { showToast("Неверный пароль"); inp.value = ""; inp.focus(); }
    });
  }

  var cha = document.getElementById("childHeroAvatar");
  if (cha) cha.addEventListener("click", openProfileModal);

  document.addEventListener("click", function (e) {
    var photoImg = e.target.closest(".chore-photo-thumb");
    if (photoImg) { openPhotoViewer(photoImg.src); return; }
    if (e.target.id === "modalBackdrop") { closeModal(); return; }

    var quickBtn = e.target.closest("[data-quick-amount]");
    if (quickBtn) {
      e.preventDefault();
      var inp = document.getElementById("withdrawAmount");
      if (inp) inp.value = quickBtn.dataset.quickAmount;
      return;
    }

    var quickManage = e.target.closest("[data-quick-manage]");
    if (quickManage) {
      e.preventDefault();
      openQuickManage(quickManage.dataset.quickManage, Number(quickManage.dataset.sign));
      return;
    }

    var avatarBtn = e.target.closest("#avatarGrid [data-avatar]");
    if (avatarBtn) { pickProfileAvatar(avatarBtn.dataset.avatar); return; }

    var dayBtn = e.target.closest("#choreDaysGrid .weekday-btn");
    if (dayBtn) { e.preventDefault(); toggleChoreDay(Number(dayBtn.dataset.day)); return; }

    var btn = e.target.closest("[data-action], #exchangeButton, #openChoreModal, #openGradeModal, #openGoalModal, #suggestGradeButton, #exportButton, #importButton, #weeklyReportButton, #resetPointsButton, #resetBalanceButton, #clearHistoryButton, #resetLevelButton, #editLevelButton, #resetAllButton, #clearNotificationsBtn, #openBalanceManage, #requestWithdrawButton, [data-close-modal]");
    if (!btn) return;

    var id = btn.id;
    var action = btn.dataset.action;
    var dataId = Number(btn.dataset.id);
    var dataIndex = Number(btn.dataset.index);

    if (action === "toggle-theme") return toggleTheme();
    if (action === "open-notifications") return openNotificationsModal();
    if (action === "change-cabinet") return returnToStart();
    if (action === "open-advanced") {
      var elGM = document.getElementById("guffyModeSelect");
      if (elGM) elGM.value = data.guffyMode || "active";
      return openModal("advancedModal");
    }

    if (id === "clearNotificationsBtn") return clearNotifications();
    if (id === "weeklyReportButton") return openWeeklyReport();
    if (id === "importButton") {
      var fi = document.getElementById("importFileInput");
      if (fi) fi.click();
      return;
    }
    if (id === "resetPointsButton") return resetPointsOnly();
    if (id === "resetBalanceButton") return resetBalanceOnly();
    if (id === "clearHistoryButton") return clearHistoryOnly();
    if (id === "resetLevelButton") return resetLevelOnly();
    if (id === "editLevelButton") {
      document.getElementById("levelEditValue").value = data.totalEarnedPoints;
      return openModal("levelEditModal");
    }
    if (id === "resetAllButton") return resetEverything();
    if (id === "exchangeButton") return exchangePoints();
    if (id === "requestWithdrawButton") return openWithdrawRequestModal();
    if (id === "openBalanceManage") return openBalanceManageModal();

    if (id === "openChoreModal") {
      document.getElementById("choreForm").reset();
      document.getElementById("choreEditId").value = "";
      document.getElementById("choreReward").value = 5;
      setMaxPerDaySelect("1");
      document.getElementById("choreRepeat").value = "daily";
      editingChoreDays = [];
      renderChoreDaysGrid();
      syncChoreDaysVisibility();
      setChoreTemplatesVisible(true);
      document.getElementById("choreModalTitle").textContent = "Новое задание";
      return openModal("choreModal");
    }
    if (id === "openGradeModal") {
      document.getElementById("gradeForm").reset();
      document.getElementById("gradeEditId").value = "";
      document.getElementById("gradeModalTitle").textContent = "Новая оценка";
      document.getElementById("gradeSubjectSelect").value = "Математика";
      document.getElementById("gradeCustomSubjectWrapper").classList.add("hidden");
      updateGradeHint("Математика");
      return openModal("gradeModal");
    }
    if (id === "openGoalModal") {
      if (data.goals.length >= MAX_GOALS) { showToast("Максимум " + MAX_GOALS + " целей"); return; }
      document.getElementById("goalForm").reset();
      document.getElementById("goalEditIndex").value = "";
      document.getElementById("goalDeadline").value = "";
      document.getElementById("goalImportant").checked = false;
      document.getElementById("goalModalTitle").textContent = "Новая цель";
      return openModal("goalModal");
    }
    if (id === "suggestGradeButton") {
      document.getElementById("suggestGradeForm").reset();
      document.getElementById("suggestSubjectSelect").value = "Математика";
      document.getElementById("suggestCustomSubjectWrapper").classList.add("hidden");
      return openModal("suggestGradeModal");
    }
    if (id === "exportButton") {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = "family-balance-backup.json"; a.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (btn.hasAttribute("data-close-modal")) return closeModal();

    if (action === "complete-chore") return openPhotoModal(dataId);
    if (action === "delete-chore") return deleteChore(dataId);
    if (action === "edit-chore") {
      var ch = data.chores.find(function (x) { return x.id === dataId; });
      if (!ch) return;
      document.getElementById("choreEditId").value = ch.id;
      document.getElementById("choreTitle").value = ch.title;
      document.getElementById("choreDescription").value = ch.description;
      document.getElementById("choreReward").value = ch.reward;
      setMaxPerDaySelect(ch.maxPerDay || 1);
      document.getElementById("choreRepeat").value = ch.repeat || "daily";
      editingChoreDays = Array.isArray(ch.days) ? ch.days.slice() : [];
      renderChoreDaysGrid();
      syncChoreDaysVisibility();
      setChoreTemplatesVisible(false);
      document.getElementById("choreModalTitle").textContent = "Редактировать задание";
      return openModal("choreModal");
    }
    if (action === "approve-chore") return openCommentModal(dataId, "approve");
    if (action === "reject-chore") return openCommentModal(dataId, "reject");
    if (action === "approve-grade") return approveGrade(dataId);
    if (action === "reject-grade") return rejectGrade(dataId);
    if (action === "edit-grade") return openEditGrade(dataId);
    if (action === "delete-grade") return deleteGrade(dataId);
    if (action === "approve-withdraw") return approveWithdraw(dataId);
    if (action === "reject-withdraw") return rejectWithdraw(dataId);
    if (action === "claim-goal") return claimGoal(dataIndex);
    if (action === "delete-goal") return deleteGoal(dataIndex);
    if (action === "edit-goal") {
      var g = data.goals[dataIndex];
      if (!g) return;
      document.getElementById("goalEditIndex").value = String(dataIndex);
      document.getElementById("goalTitle").value = g.title;
      document.getElementById("goalPrice").value = g.price;
      document.getElementById("goalDeadline").value = g.deadline || "";
      document.getElementById("goalImportant").checked = !!g.important;
      document.getElementById("goalModalTitle").textContent = "Редактировать цель";
      return openModal("goalModal");
    }
  });

  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

  var elRepeat = document.getElementById("choreRepeat");
  if (elRepeat) elRepeat.addEventListener("change", syncChoreDaysVisibility);

  var elTemplateSelect = document.getElementById("choreTemplateSelect");
  if (elTemplateSelect) {
    elTemplateSelect.addEventListener("change", function (e) {
      var val = e.target.value;
      if (val === "") return;
      var idx = Number(val);
      if (Number.isInteger(idx) && idx >= 0) applyChoreTemplate(idx);
    });
  }

  var elGradeSel = document.getElementById("gradeSubjectSelect");
  if (elGradeSel) {
    elGradeSel.addEventListener("change", function (e) {
      var w = document.getElementById("gradeCustomSubjectWrapper");
      if (e.target.value === "__custom__") w.classList.remove("hidden");
      else w.classList.add("hidden");
      updateGradeHint(e.target.value);
    });
  }
  var elSuggestSel = document.getElementById("suggestSubjectSelect");
  if (elSuggestSel) {
    elSuggestSel.addEventListener("change", function (e) {
      var w = document.getElementById("suggestCustomSubjectWrapper");
      if (e.target.value === "__custom__") w.classList.remove("hidden");
      else w.classList.add("hidden");
    });
  }
  var elPhoto = document.getElementById("photoFileInput");
  if (elPhoto) elPhoto.addEventListener("change", handlePhotoFileChange);

  var elImport = document.getElementById("importFileInput");
  if (elImport) {
    elImport.addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      importDataFromJson(f);
      e.target.value = "";
    });
  }

  var elGuffyMode = document.getElementById("guffyModeSelect");
  if (elGuffyMode) {
    elGuffyMode.addEventListener("change", function (e) {
      var v = e.target.value;
      if (["active", "quiet", "off"].indexOf(v) < 0) return;
      data.guffyMode = v;
      saveData();
      closeModal();
      var msg = v === "active" ? "Гуфи активен 🐙"
              : v === "quiet" ? "Гуфи теперь тихий"
              : "Гуфи выключен";
      showToast(msg);
    });
  }

  ["profileName", "profileAge", "profileClass", "profileBirthday"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", renderProfilePreview);
  });

  var profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("profileName").value.trim().slice(0, 20);
      var raw = document.getElementById("profileAge").value.trim();
      var cls = document.getElementById("profileClass").value.trim().slice(0, 6);
      var bd = document.getElementById("profileBirthday").value || "";
      var age = "";
      if (raw) {
        var a = toInt(raw);
        if (Number.isInteger(a) && a > 0 && a <= 120) age = String(a);
      }
      data.profile = { name: name, age: age, className: cls, birthday: bd };
      data.avatar = pendingProfileAvatar;
      closeModal();
      saveData();
      showToast(name ? "Привет, " + name + "!" : "Профиль сохранён", "success");
    });
  }

  var choreForm = document.getElementById("choreForm");
  if (choreForm) {
    choreForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var id = Number(document.getElementById("choreEditId").value);
      var title = document.getElementById("choreTitle").value.trim();
      var desc = document.getElementById("choreDescription").value.trim();
      var reward = toInt(document.getElementById("choreReward").value);
      var repeat = document.getElementById("choreRepeat").value;
      var days = repeat === "custom" ? editingChoreDays.slice() : [];
      var mpd = toInt(document.getElementById("choreMaxPerDay").value);
      if (!Number.isInteger(mpd) || mpd < 1) mpd = 1;

      if (!title) return showToast("Введите название");
      if (!isNonNegativeInt(reward)) return showToast("Баллы — целое ≥ 0");
      if (repeat === "custom" && days.length === 0) return showToast("Отметь день");

      if (id) {
        var ch = data.chores.find(function (x) { return x.id === id; });
        if (ch) {
          ch.title = title; ch.description = desc; ch.reward = reward;
          ch.repeat = repeat; ch.days = days; ch.maxPerDay = mpd;
        }
      } else {
        data.chores.push({
          id: uniqueId(), title: title, description: desc,
          reward: reward, repeat: repeat, days: days, maxPerDay: mpd
        });
      }
      closeModal();
      saveData();
      showToast("Задание сохранено");
    });
  }

    var gradeForm = document.getElementById("gradeForm");
  if (gradeForm) {
    gradeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var editId = Number(document.getElementById("gradeEditId").value) || 0;
      var sub = getSubjectValue("#gradeSubjectSelect", "#gradeSubjectCustom");
      var v = toInt(document.getElementById("gradeValue").value);
      if (!sub) return showToast("Выберите предмет");
      if (!Number.isInteger(v) || v < 2 || v > 10) return showToast("Оценка 2–10");
      var newPay = paymentForGrade(v, sub);
      var newPenalty = penaltyPointsForGrade(v);
      if (editId) {
        var g = data.grades.find(function (x) { return x.id === editId; });
        if (!g) { closeModal(); return showToast("Не найдена"); }
        var oldPenalty = penaltyPointsForGrade(g.value);
        var diff = newPay - g.payment;
        var penaltyDiff = newPenalty - oldPenalty;
        g.subject = sub; g.value = v; g.payment = newPay;
        if (diff) addTransaction("Изменение оценки: " + sub, { byn: diff });
        if (penaltyDiff) addTransaction("Изменение штрафа за оценку: " + sub, { points: penaltyDiff, affectLevel: true });
        closeModal();
        saveData();
        if (penaltyDiff) { checkLevelUp(); checkGoalsReady(); }
        if (diff > 0) showToast("+" + diff + " BYN", "success");
        else if (diff < 0) showToast("−" + Math.abs(diff) + " BYN");
        else if (penaltyDiff) showToast("Баллы обновлены: " + penaltyDiff);
        else showToast("Обновлено");
      } else {
        data.grades.unshift({ id: uniqueId(), subject: sub, value: v, payment: newPay, date: today() });
        if (newPay) addTransaction("Оценка " + v + ": " + sub, { byn: newPay });
        if (newPenalty) addTransaction("Штраф за оценку " + v + ": " + sub, { points: newPenalty, affectLevel: true });
        closeModal();
        saveData();
        if (newPenalty) { checkLevelUp(); checkGoalsReady(); }
        if (newPay > 0) showToast("Начислено " + newPay + " BYN", "success");
        else if (newPay < 0) showToast("Штраф " + Math.abs(newPay) + " BYN");
        else if (newPenalty) showToast("Штраф " + Math.abs(newPenalty) + " " + pluralPoints(Math.abs(newPenalty)));
        else showToast("Оценка добавлена");
      }
    });
  }

  var suggestForm = document.getElementById("suggestGradeForm");
  if (suggestForm) {
    suggestForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var sub = getSubjectValue("#suggestSubjectSelect", "#suggestSubjectCustom");
      var v = toInt(document.getElementById("suggestValue").value);
      if (!sub) return showToast("Выберите предмет");
      if (!Number.isInteger(v) || v < 2 || v > 10) return showToast("Оценка 2–10");
      data.gradeRequests.push({ id: uniqueId(), subject: sub, value: v, date: today() });
      addNotification("parent", "Предложение оценки: «" + sub + " — " + v + "»", "🎓");
      closeModal();
      saveData();
      showToast("Отправлено родителю");
    });
  }

  var goalForm = document.getElementById("goalForm");
  if (goalForm) {
    goalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var raw = document.getElementById("goalEditIndex").value;
      var t = document.getElementById("goalTitle").value.trim();
      var pr = toInt(document.getElementById("goalPrice").value);
      var dl = document.getElementById("goalDeadline").value || "";
      var imp = !!document.getElementById("goalImportant").checked;
      if (!t || !Number.isInteger(pr) || pr < 1) return showToast("Проверьте данные");
      if (raw !== "") {
        var g = data.goals[Number(raw)];
        if (g) {
          g.title = t; g.price = pr; g.deadline = dl;
          g.important = imp; g.notifiedReady = false;
        }
      } else {
        if (data.goals.length >= MAX_GOALS) { closeModal(); return showToast("Максимум " + MAX_GOALS + " целей"); }
        data.goals.push({ title: t, price: pr, deadline: dl, important: imp, notifiedReady: false });
      }
      closeModal();
      saveData();
      checkGoalsReady();
      saveData();
      showToast("Цель сохранена");
    });
  }

  var commentForm = document.getElementById("commentForm");
  if (commentForm) {
    commentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var id = Number(document.getElementById("commentCompletionId").value);
      var mode = document.getElementById("commentMode").value || "approve";
      var c = document.getElementById("commentText").value.trim();
      closeModal();
      if (mode === "reject") rejectChoreWithComment(id, c);
      else approveChoreWithComment(id, c);
    });
  }

  var levelForm = document.getElementById("levelEditForm");
  if (levelForm) {
    levelForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = toInt(document.getElementById("levelEditValue").value);
      if (!Number.isInteger(v) || v < 0) return showToast("Число ≥ 0");
      data.totalEarnedPoints = v;
      data.lastLevel = getLevel(v).name;
      saveData();
      closeModal();
      showToast("Обновлено");
    });
  }

  var photoForm = document.getElementById("photoForm");
  if (photoForm) {
    photoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitPhotoForm();
    });
  }

  var withdrawForm = document.getElementById("withdrawRequestForm");
  if (withdrawForm) {
    withdrawForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitWithdrawRequest();
    });
  }

  var balanceForm = document.getElementById("balanceManageForm");
  if (balanceForm) {
    balanceForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitBalanceManage();
    });
  }

  var approveWithdrawForm = document.getElementById("approveWithdrawForm");
  if (approveWithdrawForm) {
    approveWithdrawForm.addEventListener("submit", function (e) {
      e.preventDefault();
      confirmApproveWithdraw();
    });
  }

  var elBmType = document.getElementById("balanceManageType");
  if (elBmType) elBmType.addEventListener("change", updateBalanceManageHint);

  var elBmSign = document.getElementById("balanceManageSign");
  if (elBmSign) elBmSign.addEventListener("change", updateBalanceManageHint);

  bindStartScreenTap();
}

console.log("Моя копилка v49 загружена (падежи исправлены)");

initTheme();
paintStaticIcons();
renderChoreTemplateSelect();
bindEvents();
paintStartScreen();
initScrollTopButton();

setInterval(checkDayChange, DAY_CHECK_INTERVAL_MS);
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    checkDayChange();
    paintStartScreen();
  }
});