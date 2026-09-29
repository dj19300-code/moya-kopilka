"use strict";

/* ============================================================
   Локальные push-уведомления родителю о новых заявках
   Firebase on("value") + Service Worker
   ============================================================ */

var NOTIFIED_IDS_KEY = "moya-kopilka-notified-ids";
var PUSH_ENABLED_KEY = "moya-kopilka-push-enabled";

function pushSupported() {
  return "Notification" in window && "serviceWorker" in navigator;
}

function pushPermissionGranted() {
  return pushSupported() && Notification.permission === "granted";
}

/* Пользовательский «включатель»: разрешение браузера + наш флаг */
function pushEnabled() {
  if (!pushPermissionGranted()) return false;
  try {
    return localStorage.getItem(PUSH_ENABLED_KEY) !== "0";
  } catch (e) { return true; }
}

function setPushEnabledFlag(v) {
  try {
    localStorage.setItem(PUSH_ENABLED_KEY, v ? "1" : "0");
  } catch (e) {}
}

/* ---------- Переключатель в настройках ---------- */

function togglePushSwitch(checked) {
  if (!pushSupported()) {
    showToast("Уведомления не поддерживаются");
    refreshPushBlock();
    return;
  }

  if (checked) {
    if (Notification.permission === "granted") {
      setPushEnabledFlag(true);
      showToast("Уведомления включены 🔔", "success");
      refreshPushBlock();
      if (typeof data !== "undefined" && data) {
        checkNewPendingForPush(data);
      }
      return;
    }
    if (Notification.permission === "denied") {
      showToast("Разрешите уведомления в настройках браузера");
      refreshPushBlock();
      return;
    }
    // default → спрашиваем
    var result;
    try {
      result = Notification.requestPermission();
    } catch (e) {
      showToast("Ошибка запроса");
      refreshPushBlock();
      return;
    }
    if (result && typeof result.then === "function") {
      result.then(function (perm) {
        if (perm === "granted") {
          setPushEnabledFlag(true);
          showToast("Уведомления включены 🔔", "success");
          showLocalNotification(
            "Моя копилка",
            "Уведомления включены. Сюда будут приходить заявки от ребёнка.",
            "push-test-" + Date.now(),
            null
          );
          if (typeof data !== "undefined" && data) {
            checkNewPendingForPush(data);
          }
        } else {
          showToast("Уведомления не разрешены");
        }
        refreshPushBlock();
      }).catch(function () {
        showToast("Не удалось запросить разрешение");
        refreshPushBlock();
      });
    } else {
      showToast("Браузер не поддерживает Web Push");
      refreshPushBlock();
    }
  } else {
    setPushEnabledFlag(false);
    showToast("Уведомления выключены");
    refreshPushBlock();
  }
}

/* Обновляет вид переключателя и подпись. Вызывать при открытии настроек,
   при входе в кабинет родителя и после изменения разрешения. */
function refreshPushBlock() {
  var sw = document.getElementById("pushEnabledSwitch");
  var hint = document.getElementById("pushSwitchHint");
  if (!sw) return;

  var supported = pushSupported();
  var perm = supported ? Notification.permission : "unsupported";
  var on = pushEnabled();

  sw.disabled = !supported;
  sw.checked = on;

  if (hint) {
    if (!supported) {
      hint.textContent = "Не поддерживается этим браузером";
    } else if (perm === "denied") {
      hint.textContent = "Заблокировано в настройках браузера";
    } else if (on) {
      hint.textContent = "Включены · заявки приходят на телефон";
    } else {
      hint.textContent = "Выключены · нажмите, чтобы включить";
    }
  }
}

function showLocalNotification(title, body, tag, url) {
  if (!pushEnabled()) return;
  navigator.serviceWorker.ready.then(function (reg) {
    var options = {
      body: body,
      tag: tag || "moya-kopilka",
      icon: "./web-app-manifest-192x192.png",
      badge: "./web-app-manifest-192x192.png",
      data: { url: url || "./" }
    };
    try {
      reg.showNotification(title, options);
    } catch (e) {
      try { new Notification(title, options); } catch (e2) {}
    }
  }).catch(function () {
    try { new Notification(title, { body: body }); } catch (e) {}
  });
}

/* ---------- Notified IDs (что уже показывали) ---------- */

function getNotifiedIds() {
  try {
    var raw = localStorage.getItem(NOTIFIED_IDS_KEY);
    if (!raw) return { completions: [], grades: [], withdrawals: [] };
    var obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return { completions: [], grades: [], withdrawals: [] };
    return {
      completions: Array.isArray(obj.completions) ? obj.completions : [],
      grades: Array.isArray(obj.grades) ? obj.grades : [],
      withdrawals: Array.isArray(obj.withdrawals) ? obj.withdrawals : []
    };
  } catch (e) { return { completions: [], grades: [], withdrawals: [] }; }
}

function saveNotifiedIds(ids) {
  try {
    ids.completions = ids.completions.slice(-500);
    ids.grades = ids.grades.slice(-500);
    ids.withdrawals = ids.withdrawals.slice(-500);
    localStorage.setItem(NOTIFIED_IDS_KEY, JSON.stringify(ids));
  } catch (e) {}
}

/* ---------- Основная проверка ---------- */

function checkNewPendingForPush(newData) {
  if (!newData) return;

  var hasKey = false;
  try { hasKey = localStorage.getItem(NOTIFIED_IDS_KEY) !== null; } catch (e) {}

  var notified = getNotifiedIds();

  var currentPending = {
    completions: (newData.completions || [])
      .filter(function (c) { return c.status === "pending"; })
      .map(function (c) { return c.id; }),
    grades: (newData.gradeRequests || []).map(function (r) { return r.id; }),
    withdrawals: (newData.withdrawRequests || [])
      .filter(function (r) { return r.status === "pending"; })
      .map(function (r) { return r.id; })
  };

  if (!hasKey) {
    saveNotifiedIds(currentPending);
    return;
  }

  // Не в кабинете родителя или уведомления выключены — не показываем сейчас.
  if (!pushEnabled() || currentRole !== "parent") return;

  var childName = (newData.profile && newData.profile.name || "").trim();
  var prefix = childName ? childName + ": " : "";

  (newData.completions || []).forEach(function (c) {
    if (c.status !== "pending") return;
    if (notified.completions.indexOf(c.id) >= 0) return;
    var ch = (newData.chores || []).find(function (x) { return x.id === c.choreId; });
    var title = ch ? ch.title : "задание";
    var photo = c.photo ? " · 📷 с фото" : "";
    showLocalNotification(
      "📋 Новое задание на проверку",
      prefix + title + photo,
      "chore-" + c.id,
      "./?goto=chores&id=" + c.id
    );
    notified.completions.push(c.id);
  });

  (newData.gradeRequests || []).forEach(function (r) {
    if (notified.grades.indexOf(r.id) >= 0) return;
    showLocalNotification(
      "🎓 Оценка на подтверждение",
      prefix + r.subject + " — " + r.value,
      "grade-" + r.id,
      "./?goto=grades&id=" + r.id
    );
    notified.grades.push(r.id);
  });

  (newData.withdrawRequests || []).forEach(function (r) {
    if (r.status !== "pending") return;
    if (notified.withdrawals.indexOf(r.id) >= 0) return;
    var reason = r.reason ? " · " + r.reason : "";
    showLocalNotification(
      "💰 Запрос на деньги",
      prefix + r.amount + " BYN" + reason,
      "withdraw-" + r.id,
      "./?goto=withdraw&id=" + r.id
    );
    notified.withdrawals.push(r.id);
  });

  saveNotifiedIds(notified);
}

/* ---------- Deep link (?goto=...) ---------- */

function handlePushDeepLink() {
  var params;
  try { params = new URLSearchParams(window.location.search); }
  catch (e) { return; }
  var goto = params.get("goto");
  var id = params.get("id");
  if (!goto) return;

  try {
    window.history.replaceState({}, "", window.location.pathname + window.location.hash);
  } catch (e) {}

  var proceed = function () {
    currentRole = "parent";
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    render();
    setTimeout(function () { scrollAndHighlight(goto, id); }, 400);
  };

  if (currentRole === "parent") {
    setTimeout(function () { scrollAndHighlight(goto, id); }, 300);
    return;
  }

  openModal("passwordModal");
  var passForm = document.getElementById("passwordForm");
  if (!passForm) return;
  var handler = function (e) {
    e.preventDefault();
    var inp = document.getElementById("passwordInput");
    if (inp.value === PARENT_PASSWORD) {
      passForm.removeEventListener("submit", handler);
      closeModal();
      proceed();
    } else {
      showToast("Неверный пароль");
      inp.value = "";
      inp.focus();
    }
  };
  passForm.addEventListener("submit", handler);
}

function scrollAndHighlight(goto, id) {
  var target = null;
  if (goto === "chores") target = document.getElementById("choresSection");
  else if (goto === "grades") target = document.getElementById("gradesSection");
  else if (goto === "goals") target = document.getElementById("goalsSection");
  else if (goto === "withdraw") {
    var wrList = document.getElementById("withdrawRequestsList");
    if (wrList) target = wrList.closest(".card") || wrList;
  } else if (goto === "top") {
    target = document.querySelector(".container");
  }

  if (target) {
    var offset = 70;
    var y = target.getBoundingClientRect().top + window.pageYOffset - offset;
    try { window.scrollTo({ top: y, behavior: "smooth" }); }
    catch (e) { window.scrollTo(0, y); }
  }

  if (!id) return;
  setTimeout(function () {
    var el = null;
    var byDataId = document.querySelectorAll('[data-id="' + id + '"]');
    if (byDataId.length) el = byDataId[0].closest(".list-item");
    if (!el) {
      var cb = document.querySelector('[data-pending-id="' + id + '"]');
      if (cb) el = cb.closest(".list-item");
    }
    if (!el) return;
    el.classList.add("highlight-flash");
    try { el.scrollIntoView({ block: "center", behavior: "smooth" }); }
    catch (e) { el.scrollIntoView(); }
    setTimeout(function () { el.classList.remove("highlight-flash"); }, 3400);
  }, 800);
}

/* ---------- Инициализация ---------- */

function initPush() {
  if (pushSupported()) {
    console.log("Push permission:", Notification.permission, "enabled:", pushEnabled());
  } else {
    console.log("Push-уведомления не поддерживаются этим браузером");
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", function (event) {
      if (!event.data || event.data.type !== "navigate") return;
      var url = event.data.url || "";
      try {
        window.history.replaceState({}, "", url);
        handlePushDeepLink();
      } catch (e) {}
    });
  }

  handlePushDeepLink();

  // Периодическая проверка: страховка на случай пропущенного on("value")
  setInterval(function () {
    if (currentRole === "parent" && pushEnabled() && typeof data !== "undefined" && data) {
      checkNewPendingForPush(data);
    }
  }, 20000);
}