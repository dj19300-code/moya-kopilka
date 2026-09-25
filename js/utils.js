"use strict";

/* ============================================================
   Утилиты: DOM, даты, строки, падежи, темы
   ============================================================ */

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