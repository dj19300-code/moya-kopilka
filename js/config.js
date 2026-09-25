"use strict";

/* ============================================================
   Моя копилка — конфигурация и константы
   ============================================================ */

// Локальное хранилище
var STORAGE_KEY = "familyBalanceV44";
var THEME_KEY = "familyBalanceTheme";

// Игровая механика
var PARENT_PASSWORD = "1234";
var EXCHANGE_RATE = 5;
var HISTORY_LIMIT = 5;
var GRADES_LIMIT = 10;
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
  // ⚠️ ВСТАВЬ СЮДА СВОЙ НОВЫЙ КЛЮЧ (тот, что создал в Cloud Console)
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

var DATA_KEYS = [
  "balance","points","totalEarnedPoints","lastLevel","avatar","lastTreasureDate","guffyMode",
  "profile","chores","completions","grades","gradeRequests","withdrawRequests",
  "goals","transactions","notifications"
];