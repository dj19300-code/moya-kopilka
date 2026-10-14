"use strict";

/* ============================================================
   Локальные уведомления родителю о новых заявках.
   ВАЖНО: это НЕ настоящий Web Push. Уведомления показываются,
   пока приложение запущено (вкладка/ярлык PWA). Когда приложение
   полностью закрыто — уведомления не приходят.
   ============================================================ */

var NOTIFIED_IDS_KEY       = "moya-kopilka-notified-ids";
var PUSH_ENABLED_KEY       = "moya-kopilka-push-enabled";

/* ---------- Определение платформы ---------- */

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalonePWA() {
  try {
    return window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
  } catch (e) {
    return false;
  }
}

function pushSupported() {
  return "Notification" in window && "serviceWorker" in navigator;
}

function pushPermissionGranted() {
  return pushSupported() && Notification.permission === "granted";
}

function pushEnabled() {
  if (!pushPermissionGranted()) return false;
  try {
    return localStorage.getItem(PUSH_ENABLED_KEY) !== "0";
  } catch (e) {
    return true;
  }
}

function setPushEnabledFlag(v) {
  try {
    localStorage.setItem(PUSH_ENABLED_KEY, v ? "1" : "0");
  } catch (e) {}
}

/* ---------- Переключатель в настройках ---------- */

function togglePushSwitch(checked) {
  if (isIOS() && !isStandalonePWA()) {
    showToast("Добавьте приложение на главный экран");
    refreshPushBlock();
    return;
  }

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
      refreshPushBlock();
    }
  } else {
    setPushEnabledFlag(false);
    showToast("Уведомления выключены");
    refreshPushBlock();
  }
}

function refreshPushBlock() {
  var sw   = document.getElementById("pushEnabledSwitch");
  var hint = document.getElementById("pushSwitchHint");
  if (!sw) return;

  var supported = pushSupported();
  var perm      = supported ? Notification.permission : "unsupported";
  var on        = pushEnabled();

  sw.disabled = !supported;
  sw.checked  = on;

  if (!hint) return;

  if (isIOS() && !isStandalonePWA()) {
    hint.textContent = "На iPhone добавьте приложение на главный экран (Safari → Поделиться → На экран «Домой»)";
    sw.disabled = true;
    sw.checked  = false;
    return;
  }

  if (!supported) {
    hint.textContent = "Не поддерживается этим браузером";
  } else if (perm === "denied") {
    hint.textContent = "Заблокировано в настройках браузера";
  } else if (on) {
    hint.textContent = "Включены · работают, пока приложение открыто";
  } else {
    hint.textContent = "Выключены · нажмите, чтобы включить";
  }
}

/* ---------- Показ локального уведомления ---------- */

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

/* ---------- Notified IDs ---------- */

function getNotifiedIds() {
  try {
    var raw = localStorage.getItem(NOTIFIED_IDS_KEY);
    if (!raw) return { completions: [], grades: [], withdrawals: [] };
    var obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return { completions: [], grades: [], withdrawals: [] };
    return {
      completions: Array.isArray(obj.completions) ? obj.completions : [],
      grades:      Array.isArray(obj.grades)      ? obj.grades      : [],
      withdrawals: Array.isArray(obj.withdrawals) ? obj.withdrawals : []
    };
  } catch (e) {
    return { completions: [], grades: [], withdrawals: [] };
  }
}

function saveNotifiedIds(ids) {
  try {
    ids.completions = ids.completions.slice(-500);
    ids.grades      = ids.grades.slice(-500);
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

  if (!pushEnabled() || window.currentRole !== "parent") {
    return;
  }

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

/* ============================================================
   Deep link (?goto=...) — работает с модалкой пароля
   ============================================================ */

function handlePushDeepLink() {
  var params;
  try { params = new URLSearchParams(window.location.search); }
  catch (e) { return; }

  var goto = params.get("goto");
  var id   = params.get("id");
  if (!goto) return;

  try {
    window.history.replaceState({}, "", window.location.pathname + window.location.hash);
  } catch (e) {}

  window.__pendingDeepLink = { goto: goto, id: id };

  if (window.currentRole === "parent") {
    setTimeout(function () { scrollAndHighlight(goto, id); }, 300);
    window.__pendingDeepLink = null;
    return;
  }

  if (typeof window.openParentAuthModal === "function") {
    window.openParentAuthModal();
  } else {
    var modal = document.getElementById("passwordModal");
    if (modal) {
      modal.parentNode.classList.remove("hidden");
      modal.classList.remove("hidden");
    }
  }
}

window.flushPendingDeepLink = function () {
  var p = window.__pendingDeepLink;
  if (!p) return;
  window.__pendingDeepLink = null;
  setTimeout(function () { scrollAndHighlight(p.goto, p.id); }, 400);
};

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
    log("Push permission:", Notification.permission, "enabled:", pushEnabled());
  } else {
    log("Push-уведомления не поддерживаются этим браузером");
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

  setInterval(function () {
    if (window.currentRole === "parent" &&
        pushEnabled() &&
        typeof data !== "undefined" && data) {
      checkNewPendingForPush(data);
    }
  }, 20000);
}