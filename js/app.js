"use strict";

/* ============================================================
   Точка входа — порядок инициализации
   ============================================================ */

log("Моя копилка v60 загружена (модульная структура + разбитый state)");

/* data нужно инициализировать до первого render,
   loadFromLocalStorage объявлен в storage.js — он уже загружен. */
data = loadFromLocalStorage();

initTheme();
paintStaticIcons();
renderChoreTemplateSelect();
bindEvents();
paintStartScreen();
initScrollTopButton();
initBottomNav();
initFab();
initPullToRefresh();
initHotkeys();
initSearch();
initPush();
initFirebase();

/* Однократная проверка бейджей при старте */
setTimeout(function () {
  if (typeof checkBadges === "function") {
    try { checkBadges(); } catch (e) { logWarn("checkBadges error:", e); }
  }
}, 1200);

setInterval(checkDayChange, DAY_CHECK_INTERVAL_MS);

document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    checkDayChange();
    paintStartScreen();
  }
});