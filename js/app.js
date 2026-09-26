"use strict";

/* ============================================================
   Точка входа — только порядок инициализации
   ============================================================ */

console.log("Моя копилка v54 загружена (модульная структура)");

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
initVoiceInput();

setInterval(checkDayChange, DAY_CHECK_INTERVAL_MS);
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    checkDayChange();
    paintStartScreen();
  }
});