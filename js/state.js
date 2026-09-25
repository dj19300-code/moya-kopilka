"use strict";

/* ============================================================
   Данные, состояние, Firebase
   ============================================================ */

function createInitialData() {
  return {
    balance: 0, points: 0, totalEarnedPoints: 0,
    lastLevel: "Яйцо", avatar: "👧", lastTreasureDate: "", guffyMode: "active",
    profile: { name: "", age: "", className: "", birthday: "" },
    chores: [
      { id: 1, title: "Заправить кровать", description: "Аккуратно заправить кровать", reward: 2, repeat: "daily", days: [], maxPerDay: 1 },
      { id: 2, title: "Помочь с посудой", description: "Помыть посуду и протереть стол", reward: 5, repeat: "daily", days: [], maxPerDay: 1 },
      { id: 3, title: "Убрать рабочее место", description: "Положить вещи на место", reward: 4, repeat: "weekdays", days: [], maxPerDay: 1 }
    ],
    completions: [], grades: [], gradeRequests: [], withdrawRequests: [],
    goals: [], transactions: [], notifications: []
  };
}

function normalize(raw) {
  var base = createInitialData();
  if (!raw || typeof raw !== "object") return base;
  function num(v) { return Number.isFinite(Number(v)) ? Number(v) : 0; }
  var points = num(raw.points);
  var totalEarned = Math.max(num(raw.totalEarnedPoints), points);
  var profile = raw.profile && typeof raw.profile === "object" ? raw.profile : {};

  return {
    balance: num(raw.balance),
    points: points,
    totalEarnedPoints: totalEarned,
    lastLevel: String(raw.lastLevel || LEVELS[0].name),
    avatar: AVATARS.indexOf(raw.avatar) >= 0 ? raw.avatar : "👧",
    lastTreasureDate: String(raw.lastTreasureDate || ""),
    guffyMode: ["active", "quiet", "off"].indexOf(raw.guffyMode) >= 0 ? raw.guffyMode : "active",
    profile: {
      name: String(profile.name || "").trim().slice(0, 20),
      age: profile.age !== "" && Number.isFinite(Number(profile.age)) ? String(toInt(profile.age)) : "",
      className: String(profile.className || "").trim().slice(0, 6),
      birthday: profile.birthday ? String(profile.birthday) : ""
    },
    chores: toArray(raw.chores).filter(function (c) { return c && typeof c === "object"; }).map(function (c, i) {
      var mpd = toInt(c.maxPerDay);
      if (!Number.isInteger(mpd) || mpd < 1) mpd = 1;
      if (mpd > 999) mpd = 999;
      return {
        id: Number.isFinite(Number(c.id)) ? Number(c.id) : uniqueId() + i,
        title: String(c.title || "").trim() || "Задание",
        description: String(c.description || "").trim(),
        reward: Math.max(0, toInt(c.reward) || 0),
        repeat: ["daily", "weekdays", "weekend", "custom", "once"].indexOf(c.repeat) >= 0 ? c.repeat : "daily",
        days: Array.isArray(c.days) ? c.days.map(Number).filter(function (d) { return d >= 0 && d <= 6; }) : [],
        maxPerDay: mpd
      };
    }),
    completions: toArray(raw.completions).filter(function (c) { return c && typeof c === "object"; }).map(function (c) {
      return {
        id: Number.isFinite(Number(c.id)) ? Number(c.id) : uniqueId(),
        choreId: Number(c.choreId),
        date: String(c.date || today()),
        status: ["pending", "approved", "rejected"].indexOf(c.status) >= 0 ? c.status : "pending",
        comment: String(c.comment || ""),
        photo: typeof c.photo === "string" && c.photo !== "__removed__" ? c.photo : "",
        approvedAt: num(c.approvedAt)
      };
    }),
    grades: toArray(raw.grades).filter(function (g) { return g && typeof g === "object"; }).map(function (g) {
      return {
        id: Number.isFinite(Number(g.id)) ? Number(g.id) : uniqueId(),
        subject: String(g.subject || "").trim() || "Предмет",
        value: Math.min(10, Math.max(2, toInt(g.value) || 0)),
        payment: num(g.payment),
        date: String(g.date || today())
      };
    }),
    gradeRequests: toArray(raw.gradeRequests).filter(function (r) { return r && typeof r === "object"; }).map(function (r) {
      return {
        id: Number.isFinite(Number(r.id)) ? Number(r.id) : uniqueId(),
        subject: String(r.subject || "").trim() || "Предмет",
        value: Math.min(10, Math.max(2, toInt(r.value) || 0)),
        date: String(r.date || today())
      };
    }),
    withdrawRequests: toArray(raw.withdrawRequests).filter(function (r) { return r && typeof r === "object"; }).map(function (r) {
      var amt = Math.max(1, toInt(r.amount) || 1);
      return {
        id: Number.isFinite(Number(r.id)) ? Number(r.id) : uniqueId(),
        amount: amt,
        requestedAmount: Number.isFinite(Number(r.requestedAmount)) ? Math.max(1, toInt(r.requestedAmount)) : amt,
        reason: String(r.reason || "").trim().slice(0, 60),
        date: String(r.date || today()),
        status: ["pending", "approved", "rejected"].indexOf(r.status) >= 0 ? r.status : "pending"
      };
    }),
    goals: toArray(raw.goals).filter(function (g) { return g && typeof g === "object"; }).map(function (g) {
      return {
        title: String(g.title || "").trim() || "Цель",
        price: Math.max(1, toInt(g.price) || 1),
        deadline: g.deadline ? String(g.deadline) : "",
        notifiedReady: !!g.notifiedReady,
        important: !!g.important
      };
    }).slice(0, MAX_GOALS),
    transactions: toArray(raw.transactions).filter(function (t) { return t && typeof t === "object"; }).map(function (t) {
      return {
        description: String(t.description || "Операция"),
        byn: num(t.byn != null ? t.byn : t.amount),
        points: num(t.points),
        date: String(t.date || today())
      };
    }),
    notifications: toArray(raw.notifications).filter(function (n) { return n && typeof n === "object"; }).map(function (n) {
      return {
        id: Number.isFinite(Number(n.id)) ? Number(n.id) : uniqueId(),
        forRole: n.forRole === "parent" ? "parent" : "child",
        text: String(n.text || "").trim(),
        icon: String(n.icon || "🔔").slice(0, 4),
        ts: Number.isFinite(Number(n.ts)) ? Number(n.ts) : Date.now(),
        date: String(n.date || today()),
        read: !!n.read
      };
    })
  };
}

// --- Состояние приложения ---
var currentRole = "";
var firebaseRef = null;
var firebaseReady = false;
var treasureCheckedThisSession = false;
var editingChoreDays = [];
var pendingPhotoDataUrl = "";
var shownApprovalIds = [];
var pendingProfileAvatar = "👧";
var currentDay = today();
var lastSyncedData = null;
var searchState = { items: [], activeIndex: -1 };
var pendingSelectionIds = [];
var gradeFilter = { subject: "all", value: "all", period: "all" };

var data = loadFromLocalStorage();

// --- Firebase ---
try {
  if (typeof firebase !== "undefined" && firebase.initializeApp) {
    firebase.initializeApp(firebaseConfig);
    var db = firebase.database();

    firebase.auth().signInAnonymously()
      .then(function () {
        console.log("Анонимный вход выполнен");
        firebaseRef = db.ref("families/" + FAMILY_ID);
        firebaseReady = true;

        firebaseRef.on("value", function (snap) {
          var raw = snap.val();
          if (raw) data = normalize(raw);
          else { data = createInitialData(); firebaseRef.set(data); }
          lastSyncedData = JSON.parse(JSON.stringify(data));
          try {
            localStore.set(STORAGE_KEY, JSON.stringify(stripPhotos(data)));
          } catch (e) {}
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
        console.error("Ошибка анонимного входа:", error);
        setSyncStatus("error", "Не удалось авторизоваться");
        updateSyncLine("error");
        paintStartScreen();
        render();
      });
  } else {
    console.warn("Firebase не загружен — офлайн");
    paintStartScreen();
  }
} catch (err) {
  console.error("Firebase error:", err);
  paintStartScreen();
}

function loadFromLocalStorage() {
  var raw = localStore.get(STORAGE_KEY);
  if (!raw) return createInitialData();
  try { return normalize(JSON.parse(raw)); }
  catch (e) { return createInitialData(); }
}

function stripPhotos(obj) {
  var copy = JSON.parse(JSON.stringify(obj));
  if (copy.completions) {
    copy.completions.forEach(function (c) { if (c.photo) c.photo = "__removed__"; });
  }
  return copy;
}

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

function saveData() {
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

function setSyncStatus(state, text) {
  var banner = document.getElementById("syncBanner");
  var label = document.getElementById("syncText");
  if (!banner || !label) return;
  banner.classList.remove("is-visible", "is-offline", "is-error");
  if (state === "online" || !state) return;
  banner.classList.add("is-visible");
  if (state === "offline") banner.classList.add("is-offline");
  if (state === "error") banner.classList.add("is-error");
  label.textContent = text || "";
}

function updateSyncLine(state) {
  var line = document.getElementById("syncLine");
  if (!line) return;
  line.classList.remove("is-saving", "is-online", "is-offline", "is-error");
  if (state === "saving") {
    line.classList.add("is-saving");
  } else if (state === "online") {
    line.classList.add("is-online");
    setTimeout(function () {
      line.classList.remove("is-online");
    }, 1500);
  } else if (state === "offline") {
    line.classList.add("is-offline");
  } else if (state === "error") {
    line.classList.add("is-error");
  }
}

function paintStaticIcons() {
  var ids = {
    iconBell: svgBell(),
    iconChecklist: svgChecklist(),
    iconDiary: svgDiary(),
    iconTarget: svgTarget(),
    iconExchange: svgExchange(),
    iconBook: svgBook(),
    iconMoney: svgMoney()
  };
  Object.keys(ids).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = ids[id];
  });
}

function paintSummaryDeco() {
  var em = getGuffyEmotion();
  var b = document.getElementById("balanceDeco");
  if (b) b.innerHTML = guffyWithPiggy(em);
  var p = document.getElementById("pointsDeco");
  if (p) p.innerHTML = guffyWithCoin(em);
  var g = document.getElementById("goalDeco");
  if (g) g.innerHTML = guffyWithFlag(em);
}

function getGuffyEmotion() {
  if (!data || (data.guffyMode !== "active")) return "normal";
  var h = new Date().getHours();
  if (h >= GUFFY_NIGHT_START || h < GUFFY_NIGHT_END) return "sleeping";
  var ts = today();
  if (data.completions.some(function (c) { return c.status === "approved" && c.date === ts; })) return "happy";
  if (data.completions.some(function (c) { return c.status === "pending" && c.date === ts; })) return "thinking";
  return "normal";
}

function guffyReplicasOn() {
  return data && data.guffyMode === "active";
}

function getDisplayName() {
  return (data.profile && data.profile.name || "").trim();
}

function addNotification(forRole, text, icon) {
  if (!text) return;
  if (forRole !== "parent" && forRole !== "child") return;
  data.notifications.unshift({
    id: uniqueId(),
    forRole: forRole, text: text, icon: icon || "🔔",
    ts: Date.now(), date: today(), read: false
  });
  if (data.notifications.length > NOTIF_LIMIT) {
    data.notifications = data.notifications.slice(0, NOTIF_LIMIT);
  }
}

function getLevel(v) {
  var lvl = LEVELS[0];
  for (var i = 0; i < LEVELS.length; i++) {
    if (v >= LEVELS[i].min) lvl = LEVELS[i];
    else break;
  }
  return lvl;
}
function getNextLevel(v) {
  for (var i = 0; i < LEVELS.length; i++) {
    if (v < LEVELS[i].min) return LEVELS[i];
  }
  return null;
}
function checkLevelUp() {
  var lvl = getLevel(data.totalEarnedPoints);
  if (data.lastLevel !== lvl.name) {
    var prevIdx = -1, currIdx = -1;
    for (var i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i].name === data.lastLevel) prevIdx = i;
      if (LEVELS[i].name === lvl.name) currIdx = i;
    }
    if (currIdx > prevIdx) {
      addNotification("child", "Новый уровень: " + lvl.name + "!", "🐉");
      setTimeout(function () {
        showToast("🐉 Новый уровень: " + lvl.name + "!", "levelup");
        spawnConfetti(24);
      }, 400);
    }
    data.lastLevel = lvl.name;
  }
}
function checkGoalsReady() {
  data.goals.forEach(function (g) {
    if (!g.notifiedReady && data.points >= g.price) {
      g.notifiedReady = true;
      addNotification("child", "Цель «" + g.title + "» достигнута!", "🎯");
    }
  });
}

function isChoreActiveToday(c) {
  var r = c.repeat || "daily";
  if (r === "daily") return true;
  var day = new Date().getDay();
  if (r === "weekdays") return day >= 1 && day <= 5;
  if (r === "weekend") return day === 0 || day === 6;
  if (r === "custom") {
    if (!Array.isArray(c.days) || !c.days.length) return true;
    return c.days.indexOf(day) >= 0;
  }
  if (r === "once") {
    return !data.completions.some(function (x) { return x.choreId === c.id && x.status === "approved"; });
  }
  return true;
}
function countToday(id) {
  return data.completions.filter(function (c) { return c.choreId === id && c.date === today() && c.status !== "rejected"; }).length;
}
function countTodayByStatus(id, s) {
  return data.completions.filter(function (c) { return c.choreId === id && c.date === today() && c.status === s; }).length;
}

function checkDailyTreasure() {
  if (treasureCheckedThisSession) return;
  treasureCheckedThisSession = true;
  var ts = today();
  if (data.lastTreasureDate === ts) return;
  if (Math.random() < 0.35) {
    var r = TREASURE_REWARDS[Math.floor(Math.random() * TREASURE_REWARDS.length)];
    data.lastTreasureDate = ts;
    addTransaction("💰 " + r.text.replace(/\+/g, "").trim(), { points: r.points });
    checkLevelUp();
    checkGoalsReady();
    saveData();
    setTimeout(function () {
      showToast("💰 " + r.text, "reward");
      spawnConfetti(22);
    }, 600);
  } else {
    data.lastTreasureDate = ts;
    saveData();
  }
}

function addTransaction(d, opts) {
  opts = opts || {};
  var byn = opts.byn || 0;
  var points = opts.points || 0;
  if (!byn && !points) return;
  data.transactions.unshift({ description: d, byn: byn, points: points, date: today() });
  data.balance += byn;
  data.points += points;
  if (points > 0) data.totalEarnedPoints += points;
  if (points < 0 && opts.affectLevel) data.totalEarnedPoints += points;
}

function cleanupOrphanCompletions() {
  var choreIds = {};
  data.chores.forEach(function (c) { choreIds[c.id] = true; });
  var before = data.completions.length;
  data.completions = data.completions.filter(function (c) { return choreIds[c.choreId]; });
  return data.completions.length !== before;
}