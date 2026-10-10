"use strict";

/* ============================================================
   Точка входа — только порядок инициализации
   ============================================================ */

log("Моя копилка v58 загружена (модульная структура)");

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

// Однократная проверка бейджей при старте — если данные уже накоплены
// (например, после обновления приложения у существующего пользователя)
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