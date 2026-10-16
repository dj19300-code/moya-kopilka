"use strict";

/* ============================================================
   Хранение и синхронизация: localStorage, diff, saveData
   ============================================================ */

/* Ключи, которые синхронизируются в Firebase и localStorage.
   Включают streak/badges — без них они не сохранялись. */
var DATA_KEYS = [
  "balance","points","totalEarnedPoints","lastLevel","avatar","lastTreasureDate","guffyMode",
  "profile","chores","completions","grades","gradeRequests","withdrawRequests",
  "goals","transactions","notifications",
  "streak","streakBest","streakLastDate","badges","badgesResetAt"
];

function loadFromLocalStorage() {
  var raw = localStore.get(STORAGE_KEY);
  if (!raw) return createInitialData();
  try { return normalize(JSON.parse(raw)); }
  catch (e) { return createInitialData(); }
}

/* Заменяет base64-фото на маркер, чтобы не забивать localStorage.
   Фото восстанавливается только пока вкладка открыта — при F5 пропадают. */
function stripPhotos(obj) {
  var copy = JSON.parse(JSON.stringify(obj));
  if (copy.completions) {
    copy.completions.forEach(function (c) { if (c.photo) c.photo = "__removed__"; });
  }
  return copy;
}

/* Диф двух состояний. Используется, чтобы не перезаписывать всю БД целиком. */
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

/* Обрезка массивов, чтобы данные не росли бесконечно. */
function trimData() {
  var LIMIT_TX = 500;
  var LIMIT_COMPLETIONS = 400;
  var LIMIT_GRADES = 300;
  var LIMIT_WITHDRAW = 100;

  if (data.transactions.length > LIMIT_TX) {
    data.transactions = data.transactions.slice(0, LIMIT_TX);
  }
  if (data.completions.length > LIMIT_COMPLETIONS) {
    var pending = [], rest = [];
    data.completions.forEach(function (c) {
      if (c.status === "pending") pending.push(c);
      else rest.push(c);
    });
    rest.sort(function (a, b) { return (b.approvedAt || 0) - (a.approvedAt || 0); });
    data.completions = pending.concat(rest).slice(0, LIMIT_COMPLETIONS);
  }
  if (data.grades.length > LIMIT_GRADES) {
    data.grades = data.grades.slice(0, LIMIT_GRADES);
  }
  if (data.withdrawRequests.length > LIMIT_WITHDRAW) {
    data.withdrawRequests = data.withdrawRequests.slice(0, LIMIT_WITHDRAW);
  }
}

/* Центральная точка сохранения: localStorage + Firebase + перерисовка. */
function saveData() {
  trimData();
  try {
    var forLocal = stripPhotos(data);
    localStore.set(STORAGE_KEY, JSON.stringify(forLocal));
  } catch (e) {}

  if (firebaseReady && firebaseRef) {
    var diff = computeDiff(data, lastSyncedData);
    if (Object.keys(diff).length > 0) {
      updateSyncLine("saving");
      firebaseRef.update(diff)
        .then(function () {
          lastSyncedData = JSON.parse(JSON.stringify(data));
          setSyncStatus("online", "");
          updateSyncLine("online");
        })
        .catch(function () {
          setSyncStatus("offline", "Не удалось сохранить");
          updateSyncLine("offline");
        });
    }
  }
  paintStartScreen();
  render();
}

/* Информационный баннер: показывается только при проблеме. */
function setSyncStatus(state, text) {
  var banner = document.getElementById("syncBanner");
  var label  = document.getElementById("syncText");
  if (!banner || !label) return;
  banner.classList.remove("is-visible", "is-offline", "is-error");
  if (state === "online" || !state) return;
  banner.classList.add("is-visible");
  if (state === "offline") banner.classList.add("is-offline");
  if (state === "error")   banner.classList.add("is-error");
  label.textContent = text || "";
}

/* Верхняя полоска: сохранение / online / offline. */
function updateSyncLine(state) {
  var line = document.getElementById("syncLine");
  if (!line) return;
  line.classList.remove("is-saving", "is-online", "is-offline", "is-error");
  if (state === "saving") {
    line.classList.add("is-saving");
  } else if (state === "online") {
    line.classList.add("is-online");
    setTimeout(function () { line.classList.remove("is-online"); }, 1500);
  } else if (state === "offline") {
    line.classList.add("is-offline");
  } else if (state === "error") {
    line.classList.add("is-error");
  }
}