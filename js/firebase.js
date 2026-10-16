"use strict";

/* ============================================================
   Firebase: анонимная авторизация и подписка на изменения
   ============================================================ */

var firebaseRef = null;
var firebaseReady = false;
var lastSyncedData = null;

/* Инициализация Firebase. Вызывается из app.js после загрузки
   всех скриптов — тогда доступны normalize, saveData, render и т.д. */
function initFirebase() {
  try {
    if (typeof firebase === "undefined" || !firebase.initializeApp) {
      logWarn("Firebase не загружен — офлайн");
      paintStartScreen();
      return;
    }

    firebase.initializeApp(firebaseConfig);
    var db = firebase.database();

    if (!firebase.auth || typeof firebase.auth !== "function") {
      logWarn("Firebase Auth недоступен — офлайн-режим");
      firebaseReady = false;
      setSyncStatus("offline", "Офлайн · авторизация недоступна");
      updateSyncLine("offline");
      paintStartScreen();
      return;
    }

    firebase.auth().signInAnonymously()
      .then(function () {
        log("Анонимный вход выполнен");
        firebaseRef = db.ref("families/" + FAMILY_ID);
        firebaseReady = true;

        firebaseRef.on("value", function (snap) {
          var raw = snap.val();
          if (raw) {
            // Защита от гонки: если локальные данные не синхронизированы,
            // не затираем их серверными.
            if (lastSyncedData) {
              var localStr, syncStr;
              try { localStr = JSON.stringify(data); } catch (e) { localStr = ""; }
              try { syncStr  = JSON.stringify(lastSyncedData); } catch (e) { syncStr = ""; }
              if (localStr !== syncStr) {
                logWarn("Пропускаю серверное обновление — есть несинхронизированные локальные изменения");
                setSyncStatus("online", "");
                if (typeof checkNewPendingForPush === "function") {
                  checkNewPendingForPush(normalize(raw));
                }
                return;
              }
            }
            data = normalize(raw);
            if (typeof checkNewPendingForPush === "function") {
              checkNewPendingForPush(data);
            }
          } else {
            data = createInitialData();
            firebaseRef.set(data);
          }

          lastSyncedData = JSON.parse(JSON.stringify(data));
          try { localStore.set(STORAGE_KEY, JSON.stringify(stripPhotos(data))); } catch (e) {}

          if (cleanupOrphanCompletions()) {
            lastSyncedData = null;
            saveData();
            return;
          }
          setSyncStatus("online", "");
          updateSyncLine("online");
          paintStartScreen();
          render();
        }, function () {
          setSyncStatus("offline", "Офлайн · изменения сохранятся позже");
          updateSyncLine("offline");
          paintStartScreen();
          render();
        });
      })
      .catch(function (error) {
        logWarn("Ошибка анонимного входа:", error);
        setSyncStatus("error", "Не удалось авторизоваться");
        updateSyncLine("error");
        paintStartScreen();
        render();
      });
  } catch (err) {
    logWarn("Firebase error:", err);
    paintStartScreen();
  }
}