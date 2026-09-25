"use strict";

/* ============================================================
   Действия: проверка, оценки, цели, обмен, баланс
   ============================================================ */

function approveGrade(id) {
  var r = data.gradeRequests.find(function (x) { return x.id === id; });
  if (!r) return;
  var p = paymentForGrade(r.value, r.subject);
  var penalty = penaltyPointsForGrade(r.value);
  data.gradeRequests = data.gradeRequests.filter(function (x) { return x.id !== id; });
  data.grades.unshift({ id: r.id, subject: r.subject, value: r.value, date: r.date, payment: p });
  if (p) addTransaction("Оценка " + r.value + ": " + r.subject, { byn: p });
  if (penalty) addTransaction("Штраф за оценку " + r.value + ": " + r.subject, { points: penalty, affectLevel: true });
  var s = "";
  if (p > 0) s = " · +" + p + " BYN";
  else if (p < 0) s = " · " + p + " BYN";
  if (penalty) s += " · " + (penalty > 0 ? "+" : "−") + Math.abs(penalty) + " " + pluralPoints(Math.abs(penalty));
  addNotification("child", "Оценка «" + r.subject + " — " + r.value + "» подтверждена" + s, "🎓");
  saveData();
  if (p > 0) showToast("Начислено " + p + " BYN", "success");
  else if (p < 0) showToast("Штраф " + Math.abs(p) + " BYN");
  else if (penalty) showToast("Штраф " + Math.abs(penalty) + " " + pluralPoints(Math.abs(penalty)));
  else showToast("Оценка подтверждена");
  if (penalty) { checkLevelUp(); checkGoalsReady(); }
}

function rejectGrade(id) {
  var r = data.gradeRequests.find(function (x) { return x.id === id; });
  if (r) addNotification("child", "Оценка «" + r.subject + " — " + r.value + "» отклонена", "🎓");
  data.gradeRequests = data.gradeRequests.filter(function (x) { return x.id !== id; });
  saveData();
  showToast("Оценка отклонена");
}

function deleteGrade(id) {
  var idx = data.grades.findIndex(function (g) { return g.id === id; });
  if (idx === -1) return;
  var g = data.grades[idx];
  if (!confirm('Удалить оценку «' + g.subject + " — " + g.value + '»?')) return;
  if (g.payment) addTransaction("Отмена оценки: " + g.subject, { byn: -g.payment });
  var penalty = penaltyPointsForGrade(g.value);
  if (penalty) addTransaction("Отмена штрафа за оценку: " + g.subject, { points: -penalty, affectLevel: true });
  data.grades.splice(idx, 1);
  saveData();
  if (penalty) { checkLevelUp(); checkGoalsReady(); }
  showToast("Оценка удалена");
}

function approveChoreWithComment(id, comment) {
  var c = data.completions.find(function (x) { return x.id === id; });
  if (!c) return;
  var ch = data.chores.find(function (x) { return x.id === c.choreId; });
  if (!ch) {
    data.completions = data.completions.filter(function (x) { return x.id !== id; });
    saveData();
    showToast("Задание удалено");
    return;
  }

  var max = ch.maxPerDay || 1;
  if (max < 999) {
    var approvedToday = data.completions.filter(function (x) {
      return x.choreId === ch.id && x.date === today() && x.status === "approved";
    }).length;
    if (approvedToday >= max) {
      c.status = "rejected";
      c.comment = comment || "";
      c.photo = "";
      c.approvedAt = Date.now();
      addNotification("child", "Задание «" + ch.title + "» отклонено: лимит " + max + " " + pluralTimes(max) + " в день", "❌");
      saveData();
      showToast("Лимит на сегодня: " + max + " " + pluralTimes(max));
      return;
    }
  }

  c.status = "approved";
  c.comment = comment || "";
  c.approvedAt = Date.now();
  var had = !!c.photo;
  c.photo = "";
  addTransaction("Задание: " + ch.title, { points: ch.reward });
  addNotification("child", "Задание «" + ch.title + "» одобрено · +" + ch.reward + " " + pluralPoints(ch.reward), "✅");
  checkLevelUp();
  checkGoalsReady();
  saveData();
  showToast(randomPhrase() + (had ? " · 📷 фото" : ""), "success");
}

function rejectChoreWithComment(id, comment) {
  var c = data.completions.find(function (x) { return x.id === id; });
  if (!c) return;
  var ch = data.chores.find(function (x) { return x.id === c.choreId; });
  c.status = "rejected";
  c.comment = comment || "";
  c.photo = "";
  c.approvedAt = Date.now();
  var title = ch ? ch.title : "Задание";
  var msg = "Задание «" + title + "» отклонено";
  if (comment) msg += ": " + comment;
  addNotification("child", msg, "❌");
  saveData();
  showToast(comment ? "Отклонено с причиной" : "Задание отклонено");
}

function deleteChore(id) {
  if (!confirm("Удалить задание? Уже начисленные баллы останутся у ребёнка.")) return;
  data.chores = data.chores.filter(function (x) { return x.id !== id; });
  data.completions = data.completions.filter(function (c) { return c.choreId !== id; });
  saveData();
  showToast("Задание удалено");
}

function duplicateChore(id) {
  var ch = data.chores.find(function (x) { return x.id === id; });
  if (!ch) return;
  data.chores.push({
    id: uniqueId(),
    title: ch.title + " (копия)",
    description: ch.description,
    reward: ch.reward,
    repeat: ch.repeat,
    days: Array.isArray(ch.days) ? ch.days.slice() : [],
    maxPerDay: ch.maxPerDay
  });
  saveData();
  showToast("📋 Задание скопировано", "success");
}

function claimGoal(i) {
  var g = data.goals[i];
  if (!g) return;
  if (data.points < g.price) return showToast("Не хватает баллов");
  addTransaction("🎁 Награда: " + g.title, { points: -g.price });
  data.goals.splice(i, 1);
  saveData();
  if (navigator.vibrate) navigator.vibrate([60, 40, 100]);
  spawnConfetti(40);
  showToast("🎉 Награда: " + g.title, "reward");
}

function deleteGoal(i) {
  var g = data.goals[i];
  if (!g) return;
  if (!confirm("Удалить цель?")) return;
  data.goals.splice(i, 1);
  saveData();
  showToast("Цель удалена");
}

function exchangePoints() {
  var p = toInt(document.getElementById("exchangeInput").value);
  if (!Number.isInteger(p) || p < EXCHANGE_RATE || p % EXCHANGE_RATE !== 0) return showToast("Кратное 5");
  if (p > data.points) return showToast("Недостаточно баллов");
  var mg = sortedGoals()[0];
  var loss = 0;
  if (mg) {
    var before = Math.min(data.points, mg.price);
    var after = Math.min(data.points - p, mg.price);
    loss = before - after;
  }
  var msg = "Обменять " + p + " " + pluralPoints(p) + " на " + (p / EXCHANGE_RATE) + " BYN?";
  if (loss > 0 && mg) msg = "Обмен уменьшит прогресс цели «" + mg.title + "» на " + loss + " " + pluralPoints(loss) + ".\n\nПродолжить?";
  if (!confirm(msg)) return;
  var byn = p / EXCHANGE_RATE;
  addTransaction("Обмен " + p + " " + pluralPoints(p), { byn: byn, points: -p });
  saveData();
  showToast("+" + byn + " BYN · −" + p + " " + pluralPoints(p), "success");
}

function togglePendingSelection(id) {
  var i = pendingSelectionIds.indexOf(id);
  if (i >= 0) pendingSelectionIds.splice(i, 1);
  else pendingSelectionIds.push(id);
  renderPendingChores();
}

function handleBulkAction(action) {
  var pending = data.completions.filter(function (c) {
    return c.status === "pending" && data.chores.some(function (ch) { return ch.id === c.choreId; });
  });
  var allIds = pending.map(function (c) { return c.id; });

  if (action === "select-all") {
    var allSelected = allIds.length > 0 && allIds.every(function (id) { return pendingSelectionIds.indexOf(id) >= 0; });
    pendingSelectionIds = allSelected ? [] : allIds.slice();
    renderPendingChores();
    return;
  }
  if (action === "clear") {
    pendingSelectionIds = [];
    renderPendingChores();
    return;
  }
  if (action === "approve-selected") {
    if (!pendingSelectionIds.length) return;
    if (!confirm("Одобрить выбранные задания (" + pendingSelectionIds.length + ")?")) return;
    bulkApprove(pendingSelectionIds.slice());
    return;
  }
  if (action === "reject-selected") {
    if (!pendingSelectionIds.length) return;
    var r1 = prompt("Причина отклонения (" + pendingSelectionIds.length + ") — можно оставить пустым:");
    if (r1 === null) return;
    bulkReject(pendingSelectionIds.slice(), r1);
    return;
  }
  if (action === "approve-all") {
    if (!allIds.length) return;
    if (!confirm("Одобрить ВСЕ задания на проверке (" + allIds.length + ")?")) return;
    bulkApprove(allIds);
    return;
  }
  if (action === "reject-all") {
    if (!allIds.length) return;
    var r2 = prompt("Причина отклонения ВСЕХ (" + allIds.length + ") — можно оставить пустым:");
    if (r2 === null) return;
    bulkReject(allIds, r2);
    return;
  }
}

function bulkApprove(ids) {
  var pending = data.completions.filter(function (c) {
    return c.status === "pending" && ids.indexOf(c.id) >= 0;
  });
  if (!pending.length) return;

  var approvedCount = 0;
  var rejectedByLimit = 0;
  var totalPoints = 0;

  pending.forEach(function (c) {
    var ch = data.chores.find(function (x) { return x.id === c.choreId; });
    if (!ch) {
      c.status = "rejected";
      c.approvedAt = Date.now();
      c.photo = "";
      return;
    }
    var max = ch.maxPerDay || 1;
    if (max < 999) {
      var approvedToday = data.completions.filter(function (x) {
        return x.choreId === ch.id && x.date === today() && x.status === "approved";
      }).length;
      if (approvedToday >= max) {
        c.status = "rejected";
        c.comment = c.comment || "";
        c.approvedAt = Date.now();
        c.photo = "";
        rejectedByLimit++;
        return;
      }
    }
    c.status = "approved";
    c.approvedAt = Date.now();
    c.photo = "";
    addTransaction("Задание: " + ch.title, { points: ch.reward });
    totalPoints += ch.reward;
    approvedCount++;
  });

  if (approvedCount) {
    addNotification("child", "✅ Одобрено: " + approvedCount + " · +" + totalPoints + " " + pluralPoints(totalPoints), "✅");
  }
  if (rejectedByLimit) {
    addNotification("child", "❌ Отклонено по лимиту: " + rejectedByLimit, "❌");
  }

  checkLevelUp();
  checkGoalsReady();
  pendingSelectionIds = [];
  saveData();

  if (approvedCount) {
    showToast("✓ Одобрено: " + approvedCount + " · +" + totalPoints + " " + pluralPoints(totalPoints), "success");
    spawnConfetti(30);
  }
  if (rejectedByLimit) {
    setTimeout(function () { showToast("Отклонено по лимиту: " + rejectedByLimit); }, 1500);
  }
}

function bulkReject(ids, reason) {
  var toReject = data.completions.filter(function (c) {
    return c.status === "pending" && ids.indexOf(c.id) >= 0;
  });
  if (!toReject.length) return;

  toReject.forEach(function (c) {
    c.status = "rejected";
    c.comment = reason || "";
    c.approvedAt = Date.now();
    c.photo = "";
  });

  addNotification("child", "❌ Отклонено заданий: " + toReject.length + (reason ? " · " + reason : ""), "❌");
  pendingSelectionIds = [];
  saveData();
  showToast("Отклонено: " + toReject.length);
}

function submitWithdrawRequest() {
  var amount = toInt(document.getElementById("withdrawAmount").value);
  var reason = document.getElementById("withdrawReason").value.trim().slice(0, 60);
  if (!Number.isInteger(amount) || amount < 1) return showToast("Сумма — целое ≥ 1");
  if (amount > data.balance) return showToast("На балансе только " + data.balance + " BYN");
  var hasPending = data.withdrawRequests.some(function (r) { return r.status === "pending"; });
  if (hasPending) { closeModal(); return showToast("Уже есть активный запрос"); }
  data.withdrawRequests.unshift({
    id: uniqueId(),
    amount: amount,
    requestedAmount: amount,
    reason: reason,
    date: today(),
    status: "pending"
  });
  addNotification("parent", "💵 Запрос на " + amount + " BYN" + (reason ? ": " + reason : ""), "💰");
  closeModal();
  saveData();
  showToast("Запрос отправлен родителю", "success");
}

function approveWithdraw(id) {
  var r = data.withdrawRequests.find(function (x) { return x.id === id; });
  if (!r || r.status !== "pending") return;
  if (data.balance < r.amount) return showToast("Недостаточно средств");
  document.getElementById("approveWithdrawId").value = r.id;
  document.getElementById("approveWithdrawAmount").value = r.amount;
  document.getElementById("approveWithdrawAmount").max = Math.max(1, data.balance);
  document.getElementById("approveWithdrawSubtitle").textContent =
    "Запрос: " + r.amount + " BYN" + (r.reason ? " · " + r.reason : "");
  var h = document.getElementById("approveWithdrawHint");
  h.innerHTML = "На балансе: <strong>" + data.balance + " BYN</strong>. Можно выдать другую сумму.";
  openModal("approveWithdrawModal");
}

function confirmApproveWithdraw() {
  var id = Number(document.getElementById("approveWithdrawId").value);
  var amount = toInt(document.getElementById("approveWithdrawAmount").value);
  var r = data.withdrawRequests.find(function (x) { return x.id === id; });
  if (!r || r.status !== "pending") { closeModal(); return; }
  if (!Number.isInteger(amount) || amount < 1) return showToast("Сумма — целое ≥ 1");
  if (amount > data.balance) return showToast("На балансе только " + data.balance + " BYN");

  var baseReason = r.reason ? r.reason : "без причины";
  r.status = "approved";
  r.amount = amount;

  addTransaction("💸 Выдача: " + baseReason, { byn: -amount });
  addNotification("child", "💸 Родитель выдал " + amount + " BYN: " + baseReason, "✅");
  saveData();
  closeModal();
  showToast("Выдано " + amount + " BYN", "success");
  spawnConfetti(18);
}

function rejectWithdraw(id) {
  var r = data.withdrawRequests.find(function (x) { return x.id === id; });
  if (!r || r.status !== "pending") return;
  r.status = "rejected";
  addNotification("child", "💵 Запрос на " + r.amount + " BYN отклонён", "❌");
  saveData();
  showToast("Запрос отклонён");
}

function updateBalanceManageHint() {
  var type = document.getElementById("balanceManageType").value;
  var sign = Number(document.getElementById("balanceManageSign").value);
  var h = document.getElementById("balanceManageHint");
  if (!h) return;
  if (type === "byn") {
    h.innerHTML = sign > 0
      ? "Ребёнок получит уведомление о начислении."
      : "Сумма спишется с баланса. Если денег не хватает — баланс уйдёт в минус.";
  } else {
    h.innerHTML = sign > 0
      ? "Баллы пойдут в общий счёт и повлияют на уровень."
      : "Баллы спишутся с текущего счёта (уровень не понизится).";
  }
}

function submitBalanceManage() {
  var type = document.getElementById("balanceManageType").value;
  var sign = Number(document.getElementById("balanceManageSign").value);
  var amount = toInt(document.getElementById("balanceManageAmount").value);
  var reason = document.getElementById("balanceManageReason").value.trim().slice(0, 60);
  if (!Number.isInteger(amount) || amount < 1) return showToast("Сумма — целое ≥ 1");
  if (!reason) reason = sign > 0 ? "Бонус" : "Списание";
  var delta = amount * sign;

  if (type === "byn") {
    if (sign < 0 && data.balance + delta < 0) {
      if (!confirm("Баланс уйдёт в минус (" + (data.balance + delta) + " BYN). Продолжить?")) return;
    }
    addTransaction((sign > 0 ? "🎁 " : "💸 ") + reason, { byn: delta });
    addNotification("child",
      (sign > 0 ? "🎁 Начислено " + amount + " BYN: " + reason : "💸 Списано " + amount + " BYN: " + reason),
      sign > 0 ? "🎁" : "💸");
  } else {
    addTransaction((sign > 0 ? "🎁 " : "⚠️ ") + reason, { points: delta });
    if (sign > 0) checkLevelUp();
    checkGoalsReady();
    addNotification("child",
      sign > 0
        ? "🎁 +" + amount + " " + pluralPoints(amount) + ": " + reason
        : "⚠️ −" + amount + " " + pluralPoints(amount) + ": " + reason,
      sign > 0 ? "🎁" : "⚠️");
  }
  saveData();
  closeModal();
  if (sign > 0) { showToast("Начислено", "success"); spawnConfetti(14); }
  else showToast("Списано");
}

function importDataFromJson(file) {
  var reader = new FileReader();
  reader.onload = function (e) {
    var parsed;
    try {
      parsed = JSON.parse(e.target.result);
    } catch (err) {
      showToast("Не удалось прочитать файл");
      return;
    }
    if (!parsed || typeof parsed !== "object") {
      showToast("Неверный формат");
      return;
    }
    if (!confirm("Импортировать данные?\n\nТекущие данные будут полностью заменены.")) return;
    var imported = normalize(parsed);
    if (firebaseReady && firebaseRef) {
      firebaseRef.set(stripPhotos(imported))
        .then(function () {
          data = imported;
          lastSyncedData = JSON.parse(JSON.stringify(data));
          try { localStore.set(STORAGE_KEY, JSON.stringify(stripPhotos(data))); } catch (e) {}
          setSyncStatus("online", "");
          updateSyncLine("online");
          closeModal();
          paintStartScreen();
          render();
          showToast("Данные импортированы", "success");
        })
        .catch(function () {
          showToast("Ошибка синхронизации");
        });
    } else {
      data = imported;
      lastSyncedData = JSON.parse(JSON.stringify(data));
      try { localStore.set(STORAGE_KEY, JSON.stringify(stripPhotos(data))); } catch (e) {}
      closeModal();
      paintStartScreen();
      render();
      showToast("Данные импортированы", "success");
    }
  };
  reader.onerror = function () { showToast("Ошибка чтения файла"); };
  reader.readAsText(file);
}

function resetPointsOnly() { if (!confirm("Обнулить баллы?")) return; data.points = 0; saveData(); closeModal(); showToast("Баллы обнулены"); }
function resetBalanceOnly() { if (!confirm("Обнулить баланс?")) return; data.balance = 0; saveData(); closeModal(); showToast("Баланс обнулён"); }
function clearHistoryOnly() { if (!confirm("Очистить историю?")) return; data.transactions = []; saveData(); closeModal(); showToast("История очищена"); }
function resetLevelOnly() { if (!confirm("Сбросить уровень?")) return; data.totalEarnedPoints = 0; data.lastLevel = LEVELS[0].name; saveData(); closeModal(); showToast("Уровень сброшен"); }
function resetEverything() {
  if (!confirm("Полный сброс?")) return;
  if (!confirm("Уверены? Это последнее подтверждение.")) return;
  localStore.remove(STORAGE_KEY);
  if (firebaseReady && firebaseRef) firebaseRef.remove();
  location.reload();
}

function buildWeeklyReport() {
  var now = new Date();
  var w = new Date(now);
  w.setDate(w.getDate() - 6);
  var from = formatDate(w);
  var to = formatDate(now);
  var txs = data.transactions.filter(function (t) { return t.date >= from && t.date <= to; });
  var pe = 0, be = 0;
  txs.forEach(function (t) {
    if (t.points > 0) pe += t.points;
    if (t.byn > 0) be += t.byn;
  });
  var co = data.completions.filter(function (c) { return c.status === "approved" && c.date >= from && c.date <= to; });
  var gr = data.grades.filter(function (g) { return g.date >= from && g.date <= to; });
  var avg = gr.length ? (gr.reduce(function (s, g) { return s + g.value; }, 0) / gr.length).toFixed(1) : "—";
  return { from: from, to: to, pe: pe, be: be, choresDone: co.length, gradesCount: gr.length, avg: avg };
}

function openWeeklyReport() {
  var r = buildWeeklyReport();
  var el = document.getElementById("reportContent");
  var f = function (s) { var p = s.split("-"); return p[2] + "." + p[1]; };
  var has = r.pe > 0 || r.be > 0 || r.choresDone > 0 || r.gradesCount > 0;
  var name = getDisplayName();
  var pre = name ? name + ", " : "";
  if (!has) el.innerHTML = '<div class="report-empty">' + pre + 'нет активности за неделю 💪</div>';
  else el.innerHTML =
    '<div class="report-period">' + pre + "период: " + f(r.from) + " — " + f(r.to) + '</div>' +
    '<div class="report-row"><span class="report-row__label">🏆 Заработано баллов</span><span class="report-row__value" style="color:#0D9488">+' + r.pe + '</span></div>' +
    '<div class="report-row"><span class="report-row__label">💰 Начислено денег</span><span class="report-row__value" style="color:#0D9488">+' + r.be + ' BYN</span></div>' +
    '<div class="report-row"><span class="report-row__label">✅ Заданий выполнено</span><span class="report-row__value">' + r.choresDone + '</span></div>' +
    '<div class="report-row"><span class="report-row__label">🎓 Оценок получено</span><span class="report-row__value">' + r.gradesCount + (r.gradesCount ? " (ср. " + r.avg + ")" : "") + '</span></div>';
  openModal("reportModal");
}

var toastTimer = null;
function showToast(msg, kind) {
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast";
  if (kind === "success") t.classList.add("toast--success");
  if (kind === "reward") t.classList.add("toast--reward");
  if (kind === "levelup") t.classList.add("toast--levelup");
  t.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.style.display = "none"; }, 2800);
}

function spawnConfetti(n) {
  var colors = ["#F472B6", "#8B5CF6", "#A78BFA", "#2DD4BF", "#5EEAD4", "#FBBF24"];
  var w = window.innerWidth;
  for (var i = 0; i < n; i++) {
    var el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = Math.random() * w + "px";
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = (Math.random() * 0.4) + "s";
    el.style.animationDuration = (2 + Math.random() * 1.2) + "s";
    if (Math.random() > 0.5) el.style.borderRadius = "50%";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 4000);
  }
}

function showApproveAnimation(reward) {
  var o = document.createElement("div");
  o.className = "approve-overlay";
  o.innerHTML = '<div class="approve-check">✓</div><div class="approve-points">+' + reward + " " + pluralPoints(reward) + '</div>';
  document.body.appendChild(o);
  setTimeout(function () { o.remove(); }, 1300);
}

function checkFreshApprovals() {
  if (currentRole !== "child") return;
  var now = Date.now();
  var fresh = data.completions.filter(function (c) {
    return c.status === "approved" && c.approvedAt && (now - c.approvedAt) < FRESH_APPROVAL_MS && shownApprovalIds.indexOf(c.id) < 0;
  });
  fresh.forEach(function (c) {
    shownApprovalIds.push(c.id);
    var ch = data.chores.find(function (x) { return x.id === c.choreId; });
    if (!ch) return;
    showApproveAnimation(ch.reward);
    setTimeout(function () { showToast(randomPhrase() + " · +" + ch.reward + " " + pluralPoints(ch.reward), "success"); }, 200);
  });
  if (shownApprovalIds.length > 60) shownApprovalIds = shownApprovalIds.slice(-30);
}

function compressImage(file, max, q) {
  return new Promise(function (res, rej) {
    var r = new FileReader();
    r.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var w = img.width, h = img.height;
        if (w > h && w > max) { h = Math.round(h * max / w); w = max; }
        else if (h >= w && h > max) { w = Math.round(w * max / h); h = max; }
        var cv = document.createElement("canvas");
        cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        try { res(cv.toDataURL("image/jpeg", q)); }
        catch (err) { rej(err); }
      };
      img.onerror = rej;
      img.src = e.target.result;
    };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function openPhotoViewer(src) {
  if (!src) return;
  var v = document.createElement("div");
  v.className = "photo-viewer";
  v.innerHTML = '<img src="' + src + '" alt="">';
  v.addEventListener("click", function () { v.remove(); });
  document.body.appendChild(v);
}

function submitPhotoForm() {
  var id = Number(document.getElementById("photoChoreId").value);
  var ch = data.chores.find(function (x) { return x.id === id; });
  if (!ch) { closeModal(); return; }
  var max = ch.maxPerDay || 1;
  if (max < 999 && countToday(id) >= max) { closeModal(); showToast("Лимит"); return; }
  data.completions.push({
    id: uniqueId(), choreId: id, date: today(), status: "pending",
    comment: "", photo: pendingPhotoDataUrl || "", approvedAt: 0
  });
  addNotification("parent", "Новое задание: «" + ch.title + "»", "📋");
  pendingPhotoDataUrl = "";
  closeModal();
  saveData();
  showToast("Отправлено родителю");
}

function toggleChoreDay(d) {
  if (editingChoreDays.indexOf(d) >= 0) {
    editingChoreDays = editingChoreDays.filter(function (x) { return x !== d; });
  } else {
    editingChoreDays.push(d);
  }
  renderChoreDaysGrid();
}

function syncChoreDaysVisibility() {
  var r = document.getElementById("choreRepeat").value;
  var w = document.getElementById("choreDaysWrapper");
  if (!w) return;
  if (r === "custom") w.classList.remove("hidden");
  else w.classList.add("hidden");
}

function setMaxPerDaySelect(val) {
  var sel = document.getElementById("choreMaxPerDay");
  if (!sel) return;
  var v = String(val);
  var found = false;
  for (var i = 0; i < sel.options.length; i++) {
    if (sel.options[i].value === v) { found = true; break; }
  }
  if (!found) {
    var opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v + " " + pluralTimes(Number(v));
    sel.appendChild(opt);
  }
  sel.value = v;
}

function applyChoreTemplate(index) {
  var t = CHORE_TEMPLATES[index];
  if (!t) return;
  document.getElementById("choreTitle").value = t.title;
  document.getElementById("choreDescription").value = t.description || "";
  document.getElementById("choreReward").value = t.reward || 5;
  setMaxPerDaySelect(t.maxPerDay || 1);
  document.getElementById("choreRepeat").value = t.repeat || "daily";
  editingChoreDays = Array.isArray(t.days) ? t.days.slice() : [];
  renderChoreDaysGrid();
  syncChoreDaysVisibility();
  showToast("Заполнено: " + t.title);
}

function setChoreTemplatesVisible(visible) {
  var block = document.getElementById("choreTemplatesBlock");
  if (block) block.classList.toggle("hidden", !visible);
  var sel = document.getElementById("choreTemplateSelect");
  if (sel) sel.value = "";
}

function setSubjectSelect(sel, cus, wrap, sub) {
  var s = document.querySelector(sel), c = document.querySelector(cus), w = document.querySelector(wrap);
  if (!s) return;
  if (KNOWN_SUBJECTS.indexOf(sub) >= 0) { s.value = sub; w.classList.add("hidden"); c.value = ""; }
  else { s.value = "__custom__"; w.classList.remove("hidden"); c.value = sub || ""; }
}
function getSubjectValue(sel, cus) {
  var s = document.querySelector(sel), c = document.querySelector(cus);
  if (!s) return "";
  if (s.value === "__custom__") return (c.value || "").trim();
  return s.value;
}
function updateGradeHint(sub) {
  var h = document.getElementById("gradeHint");
  if (!h) return;
  if (isMath(sub)) h.innerHTML = '<strong>Математика:</strong><br>10, 9 → <strong>+5 BYN</strong> · 8 → <strong>+4 BYN</strong> · 7 → <strong>+2 BYN</strong><br>6 → 0 · <strong>4, 5 → −5 баллов</strong> · <strong>1, 2, 3 → −2 BYN</strong>';
  else h.innerHTML = '10 → <strong>+3 BYN</strong> · 9 → <strong>+2 BYN</strong> · 7, 8 → <strong>+1 BYN</strong><br>6 → 0 · <strong>4, 5 → −5 баллов</strong> · <strong>1, 2, 3 → −2 BYN</strong>';
}

function pickProfileAvatar(e) {
  if (AVATARS.indexOf(e) < 0) return;
  pendingProfileAvatar = e;
  $$("#avatarGrid .avatar-option").forEach(function (b) {
    b.classList.toggle("is-active", b.dataset.avatar === e);
  });
  renderProfilePreview();
}