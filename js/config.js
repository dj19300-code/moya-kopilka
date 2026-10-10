"use strict";

/* ============================================================
   Моя копилка — конфигурация и константы
   ============================================================ */

// Отладка: true — показывать логи в консоли браузера, false — тишина
var DEBUG = false;

// Локальное хранилище
var STORAGE_KEY = "familyBalanceV44";
var THEME_KEY = "familyBalanceTheme";

// Hanko — API URL (из панели cloud.hanko.io → Dashboard → API URL)
var HANKO_API_URL = "https://91600457-e67b-4236-8bcd-e1232ba6b85d.hanko.io";

// Игровая механика
var EXCHANGE_RATE = 5;
var HISTORY_LIMIT = 5;
var GRADES_LIMIT = 3;
var NOTIF_LIMIT = 100;
var MAX_GOALS = 3;

// Фото
var PHOTO_MAX_SIZE = 640;
var PHOTO_QUALITY = 0.7;

// Тайминги и пороги
var FRESH_APPROVAL_MS = 20000;
var DAY_CHECK_INTERVAL_MS = 30000;
var GUFFY_NIGHT_START = 22;
var GUFFY_NIGHT_END = 7;
var SCROLL_TOP_THRESHOLD = 400;

// Firebase
var FAMILY_ID = "moya-kopilka-7k3m9p2x8q10DenL";

var firebaseConfig = {
  apiKey: "AIzaSyBnIaSEK1fIiL8U709XOjwAPoTPdxQ_3Hc",
  authDomain: "family-balance-2fc27.firebaseapp.com",
  databaseURL: "https://family-balance-2fc27-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "family-balance-2fc27",
  storageBucket: "family-balance-2fc27.firebasestorage.app",
  messagingSenderId: "591816268672",
  appId: "1:591816268672:web:0179c1289251f2cf893f65"
};

// Уровни
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

/* ============================================================
   Достижения (бейджи).
   ============================================================ */

function _after(ts, since) {
  if (!since) return true;
  return (ts || 0) > since;
}

var BADGES = [
  {
    id: "first_ten", icon: "🥇", title: "Первая десятка",
    desc: "Получить оценку 10",
    check: function (d, since) {
      return d.grades.some(function (g) { return g.value === 10 && _after(g.ts, since); });
    }
  },
  {
    id: "excellent", icon: "📚", title: "Отличник",
    desc: "5 оценок 9 или 10",
    check: function (d, since) {
      return d.grades.filter(function (g) { return g.value >= 9 && _after(g.ts, since); }).length >= 5;
    }
  },
  {
    id: "first_goal", icon: "🎯", title: "Первая цель",
    desc: "Получить награду за цель",
    check: function (d, since) {
      return d.transactions.some(function (t) {
        return typeof t.description === "string" &&
               t.description.indexOf("🎁 Награда:") === 0 &&
               _after(t.ts, since);
      });
    }
  },
  {
    id: "chores_10", icon: "💪", title: "Трудяга",
    desc: "10 заданий за неделю",
    check: function (d, since) {
      var weekAgo = Date.now() - 7 * 86400000;
      var cut = Math.max(since || 0, weekAgo);
      return d.completions.filter(function (c) {
        return c.status === "approved" && (c.approvedAt || 0) > cut;
      }).length >= 10;
    }
  },
  {
    id: "streak_3", icon: "🔥", title: "Три дня подряд",
    desc: "Активность 3 дня подряд",
    check: function (d) { return (d.streakBest || 0) >= 3; }
  },
  {
    id: "streak_7", icon: "🔥🔥", title: "Неделя подряд",
    desc: "Активность 7 дней подряд",
    check: function (d) { return (d.streakBest || 0) >= 7; }
  },
  {
    id: "streak_30", icon: "🔥🔥🔥", title: "Месяц подряд",
    desc: "Активность 30 дней подряд",
    check: function (d) { return (d.streakBest || 0) >= 30; }
  },
  {
    id: "balance_10", icon: "💰", title: "Первая десятка BYN",
    desc: "Накопить 10 BYN",
    check: function (d, since) {
      var sum = 0;
      d.transactions.forEach(function (t) {
        if (t.byn > 0 && _after(t.ts, since)) sum += t.byn;
      });
      return sum >= 10;
    }
  },
  {
    id: "points_100", icon: "⭐", title: "Сотня",
    desc: "Заработать 100 баллов",
    check: function (d, since) {
      var sum = 0;
      d.transactions.forEach(function (t) {
        if (t.points > 0 && _after(t.ts, since)) sum += t.points;
      });
      return sum >= 100;
    }
  },
  {
    id: "points_1000", icon: "🌟", title: "Тысячник",
    desc: "Заработать 1000 баллов",
    check: function (d, since) {
      var sum = 0;
      d.transactions.forEach(function (t) {
        if (t.points > 0 && _after(t.ts, since)) sum += t.points;
      });
      return sum >= 1000;
    }
  },
  {
    id: "level_dragon", icon: "🐉", title: "Настоящий дракон",
    desc: "Достичь уровня «Дракон»",
    check: function (d, since) {
      var sum = 0;
      d.transactions.forEach(function (t) {
        if (t.points > 0 && _after(t.ts, since)) sum += t.points;
      });
      return sum >= 1200;
    }
  },
  {
    id: "level_legend", icon: "🦸", title: "Легенда",
    desc: "Достичь высшего уровня",
    check: function (d, since) {
      var sum = 0;
      d.transactions.forEach(function (t) {
        if (t.points > 0 && _after(t.ts, since)) sum += t.points;
      });
      return sum >= 5000;
    }
  }
];

var DATA_KEYS = [
  "balance","points","totalEarnedPoints","lastLevel","avatar","lastTreasureDate","guffyMode",
  "profile","chores","completions","grades","gradeRequests","withdrawRequests",
  "goals","transactions","notifications",
  "streak","streakBest","streakLastDate","badges","badgesResetAt"
];
/* ============================================================
   Родители (email из Hanko Console → Users)
   Подставь свои реальные email, которые ты вводил при регистрации.
   ============================================================ */
var PARENT_ACCOUNTS = [
  { label: "👨 Папа",  email: "dj19300@yandex.ru" },
  { label: "👩 Мама",  email: "leralera2701@yandex.ru" }
];