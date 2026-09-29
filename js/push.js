"use strict";

/* ============================================================
   Локальные push-уведомления родителю о новых заявках
   Работает через Firebase on("value") + Service Worker
   ============================================================ */

var PENDING_SNAPSHOT_KEY = "moya-kopilka-pending-snapshot";

function pushSupported() {
  return "Notification" in window && "serviceWorker" in navigator;
}

function pushPermissionGranted() {
  return pushSupported() && Notification.permission === "granted";
}

function requestPushPermission() {
  if (!pushSupported()) {
    showToast("Уведомления не поддерживаются браузером");
    return;
  }
  if (Notification.permission === "granted") {
    showToast("Уведомления уже включены ✓", "success");
    return;
  }
  if (Notification.permission === "denied") {
    showToast("Уведомления запрещены в настройках браузера");
    return;
  }
  Notification.requestPermission().then(function (perm) {
    if (perm === "granted") {
      showToast("Уведомления включены 🔔", "success");
      showLocalNotification(
        "Моя копилка",
        "Уведомления включены. Сюда будут приходить заявки от ребёнка.",
        "push-test-" + Date.now(),
        null
      );
      refreshPushBlock();
    } else {
      showToast("Уведомления не разрешены");
      refreshPushBlock();
    }
  }).catch(function () {
    showToast("Не удалось запросить разрешение");
  });
}

function refreshPushBlock() {
  var block = document.getElementById("pushPermissionBlock");
  if (!block) return;
  if (currentRole === "parent" && pushSupported() && Notification.permission !== "granted") {
    block.classList.remove("hidden");
  } else {
    block.classList.add("hidden");
  }
}

function showLocalNotification(title, body, tag, url) {
  if (!pushPermissionGranted()) return;
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

/* ---------- Снапшот pending-заявок ---------- */

function getPendingSnapshot() {
  try {
    var raw = localStorage.getItem(PENDING_SNAPSHOT_KEY);
    if (!raw) return null;
    var obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return null;
    return {
      completions: Array.isArray(obj.completions) ? obj.completions : [],
      grades: Array.isArray(obj.grades) ? obj.grades : [],
      withdrawals: Array.isArray(obj.withdrawals) ? obj.withdrawals : []
    };
  } catch (e) { return null; }
}

function savePendingSnapshot(newData) {
  try {
    var snapshot = {
      completions: (newData.completions || []).filter(function (c) { return c.status === "pending"; }).map(function (c) { return c.id; }),
      grades: (newData.gradeRequests || []).map(function (r) { return r.id; }),
      withdrawals: (newData.withdrawRequests || []).filter(function (r) { return r.status === "pending"; }).map(function (r) { return r.id; })
    };
    localStorage.setItem(PENDING_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch (e) {}
}

/* ---------- Сравнение и уведомления ---------- */

function checkNewPendingForPush(newData) {
  if (!newData) return;

  if (!pushPermissionGranted() || currentRole !== "parent") {
    savePendingSnapshot(newData);
    return;
  }

  var prev = getPendingSnapshot();

  var newCompletions = (newData.completions || []).filter(function (c) { return c.status === "pending"; });
  var newGrades = newData.gradeRequests || [];
  var newWithdrawals = (newData.withdrawRequests || []).filter(function (r) { return r.status === "pending"; });

  // Первый раз в жизни — просто запоминаем, не уведомляем
  if (!prev) {
    savePendingSnapshot(newData);
    return;
  }

  var childName = (newData.profile && newData.profile.name || "").trim();
  var prefix = childName ? childName + ": " : "";

  newCompletions.forEach(function (c) {
    if (prev.completions.indexOf(c.id) >= 0) return;
    var ch = (newData.chores || []).find(function (x) { return x.id === c.choreId; });
    var title = ch ? ch.title : "задание";
    var photo = c.photo ? " · 📷 с фото" : "";
    showLocalNotification(
      "📋 Новое задание на проверку",
      prefix + title + photo,
      "chore-" + c.id,
      "./?goto=chores&id=" + c.id
    );
  });

  newGrades.forEach(function (r) {
    if (prev.grades.indexOf(r.id) >= 0) return;
    showLocalNotification(
      "🎓 Оценка на подтверждение",
      prefix + r.subject + " — " + r.value,
      "grade-" + r.id,
      "./?goto=grades&id=" + r.id
    );
  });

  newWithdrawals.forEach(function (r) {
    if (prev.withdrawals.indexOf(r.id) >= 0) return;
    var amountLabel = r.amount + " BYN";
    var reason = r.reason ? " · " + r.reason : "";
    showLocalNotification(
      "💰 Запрос на деньги",
      prefix + amountLabel + reason,
      "withdraw-" + r.id,
      "./?goto=withdraw&id=" + r.id
    );
  });

  savePendingSnapshot(newData);
}

/* ---------- Deep link (?goto=...) ---------- */

function handlePushDeepLink() {
  var params;
  try { params = new URLSearchParams(window.location.search); }
  catch (e) { return; }
  var goto = params.get("goto");
  var id = params.get("id");
  if (!goto) return;

  // Чистим URL, чтобы при обновлении страницы не срабатывало снова
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

  // Просим пароль, после ввода — переходим к элементу
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
    if (byDataId.length) {
      el = byDataId[0].closest(".list-item");
    }
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
    console.log("Push permission:", Notification.permission);
  } else {
    console.log("Push-уведомления не поддерживаются этим браузером");
  }

  // Слушаем сообщения от service worker (навигация после клика по пушу)
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

  // Обработка первого запуска с параметром ?goto=...
  handlePushDeepLink();
}