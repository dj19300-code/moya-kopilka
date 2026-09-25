"use strict";

/* ============================================================
   Рендер всего UI
   ============================================================ */

function paintStartScreen() {
  var piggySvgEl = document.getElementById("piggySvg");
  if (piggySvgEl) piggySvgEl.innerHTML = piggySvg();

  var c1 = document.getElementById("piggyCoin1");
  if (c1) c1.innerHTML = piggyCoinSvg();
  var c2 = document.getElementById("piggyCoin2");
  if (c2) c2.innerHTML = piggyCoinSvg();

  var gf = document.getElementById("guffyFull");
  if (gf) gf.innerHTML = guffyFullSvg(getGuffyEmotion());

  renderStartGreeting();
  renderStartSummary();
  renderStartChildBadge();
}

function renderStartGreeting() {
  var el = document.getElementById("welcomeGreeting");
  if (!el) return;
  var h = new Date().getHours();
  var name = (data.profile && data.profile.name || "").trim();
  var greeting;
  if (h >= 5 && h < 12) greeting = "Доброе утро, " + (name || "друг") + " ☀️";
  else if (h >= 12 && h < 18) greeting = "Добрый день, " + (name || "друг") + " 🌤";
  else if (h >= 18 && h < 23) greeting = "Добрый вечер, " + (name || "друг") + " 🌙";
  else greeting = "Доброй ночи, " + (name || "друг") + " ✨";
  el.textContent = greeting;
}

function renderStartSummary() {
  var el = document.getElementById("welcomeSummary");
  if (!el) return;
  var parts = [];
  if (data.points > 0) parts.push("⭐ " + data.points + " " + pluralPoints(data.points));
  if (data.balance !== 0) parts.push("💰 " + data.balance + " BYN");
  if (!parts.length) {
    el.classList.add("hidden");
    el.innerHTML = "";
    return;
  }
  el.innerHTML = parts.join('<span class="summary-sep">·</span>');
  el.classList.remove("hidden");
}

function renderStartChildBadge() {
  var el = document.getElementById("childBadge");
  if (!el) return;
  var lvl = getLevel(data.totalEarnedPoints);
  if (lvl && lvl.key && lvl.key !== "egg") {
    el.textContent = "🐉 " + lvl.name;
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

function renderChildHero() {
  if (currentRole !== "child") return;
  var el = document.getElementById("childHero");
  if (!el) return;

  var h = new Date().getHours();
  var greet;
  if (h >= 5 && h < 12) greet = "Доброе утро ☀️";
  else if (h >= 12 && h < 18) greet = "Добрый день 🌤";
  else if (h >= 18 && h < 23) greet = "Добрый вечер 🌙";
  else greet = "Доброй ночи ✨";

  var av = document.getElementById("childHeroAvatar");
  if (av) av.textContent = data.avatar || "👧";
  var g = document.getElementById("childHeroGreeting");
  if (g) g.textContent = greet;
  var t = document.getElementById("childHeroTitle");
  if (t) t.textContent = getDisplayName() ? "Привет, " + getDisplayName() + "!" : "Моя копилка";

  var sub = document.getElementById("childHeroSub");
  if (sub) {
    var lvl = getLevel(data.totalEarnedPoints);
    var next = getNextLevel(data.totalEarnedPoints);
    var parts = [];
    parts.push("Уровень: <strong>" + lvl.name + "</strong>");
    if (next) {
      var done = data.totalEarnedPoints - lvl.min;
      var total = next.min - lvl.min;
      parts.push("до «" + next.name + "» — <strong>" + (total - done) + " " + pluralPoints(total - done) + "</strong>");
    }
    sub.innerHTML = parts.join(" · ");
  }
}

function renderParentHero() {
  if (currentRole !== "parent") return;
  var el = document.getElementById("parentHero");
  if (!el) return;

  var gf = document.getElementById("parentHeroGuffy");
  if (gf && !gf.innerHTML) gf.innerHTML = guffyStandingSvg("normal");

  var pendingCount = data.completions.filter(function (c) { return c.status === "pending"; }).length;
  var withdrawCount = data.withdrawRequests.filter(function (r) { return r.status === "pending"; }).length;
  var gradeReqCount = data.gradeRequests.length;

  var greet = document.getElementById("parentHeroGreeting");
  var title = document.getElementById("parentHeroTitle");
  var sub = document.getElementById("parentHeroSub");

  var items = [];
  if (pendingCount) items.push("<strong>" + pendingCount + "</strong> " + (pendingCount === 1 ? "задание" : "заданий") + " на проверке");
  if (withdrawCount) items.push("<strong>" + withdrawCount + "</strong> " + (withdrawCount === 1 ? "запрос" : "запроса") + " на деньги");
  if (gradeReqCount) items.push("<strong>" + gradeReqCount + "</strong> " + (gradeReqCount === 1 ? "оценка" : "оценки") + " на проверке");

  if (greet) {
    if (items.length) greet.textContent = "Требует внимания";
    else greet.textContent = "Всё под контролем ✓";
  }
  if (title) {
    title.textContent = items.length ? "Есть новые заявки" : "Хорошего дня!";
  }

  if (sub) {
    if (items.length) sub.innerHTML = items.join(" · ");
    else sub.textContent = "Нет новых заявок. Проверьте цели и настройки.";
  }
}

function renderProfilePreview() {
  var av = $("#profilePreviewAvatar");
  if (av) av.textContent = pendingProfileAvatar;
  var nameEl = $("#profilePreviewName");
  var metaEl = $("#profilePreviewMeta");
  var nameInput = $("#profileName");
  var ageInput = $("#profileAge");
  var clsInput = $("#profileClass");
  var bdInput = $("#profileBirthday");
  var name = (nameInput && nameInput.value || "").trim();
  var age = (ageInput && ageInput.value || "").trim();
  var cls = (clsInput && clsInput.value || "").trim();
  var bd = (bdInput && bdInput.value || "").trim();
  if (nameEl) nameEl.textContent = name || "Имя не указано";
  var parts = [];
  if (cls) parts.push(cls + " класс");
  if (age) parts.push(age + " " + pluralYears(Number(age)));
  else if (bd) {
    var yrs = Math.floor((Date.now() - new Date(bd + "T00:00:00").getTime()) / (365.25 * 86400000));
    if (yrs > 0 && yrs < 120) parts.push(yrs + " " + pluralYears(yrs));
  }
  if (metaEl) metaEl.textContent = parts.length ? parts.join(" · ") : "Заполни профиль ниже";
}

function renderNotificationsBadge() {
  if (!currentRole) return;
  var badgeId = currentRole === "parent" ? "notifBadgeParent" : "notifBadgeChild";
  var b = document.getElementById(badgeId);
  if (!b) return;
  var u = data.notifications.filter(function (n) { return n.forRole === currentRole && !n.read; }).length;
  if (u > 0) { b.textContent = u > 99 ? "99+" : String(u); b.classList.remove("hidden"); }
  else b.classList.add("hidden");
}

function renderNotificationsList() {
  var list = data.notifications.filter(function (n) { return n.forRole === currentRole; }).sort(function (a, b) { return b.ts - a.ts; });
  var el = $("#notificationsList");
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + svgBell() + '</div><div class="empty-state__text">Пока нет уведомлений</div></div>';
    return;
  }
  el.innerHTML = list.map(function (n) {
    return '<div class="list-item notification-item ' + (n.read ? "" : "notification-item--unread") + '"><div><div class="list-item__title">' + n.icon + " " + escapeHtml(n.text) + '</div><div class="list-item__meta">' + formatTime(n.ts) + '</div></div></div>';
  }).join("");
}

function render() {
  if (!currentRole) return;
  var isParent = currentRole === "parent";
  updateRoleVisibility();
  renderNotificationsBadge();

  document.getElementById("balance").textContent = data.balance + " BYN";
  document.getElementById("points").textContent = data.points;
  document.getElementById("exchangeInfo").textContent = "Доступно: " + data.points + " " + pluralPoints(data.points);

  paintSummaryDeco();
  renderStatus();
  renderMainGoal();
  renderPendingChores();
  renderWithdrawRequests();
  renderMyWithdrawStatus();
  renderChores(isParent);
  renderGrades(isParent);
  renderGoals(isParent);
  renderHistory();
  checkFreshApprovals();
  renderChildHero();
  renderParentHero();
}

function renderStatus() {
  var lvl = getLevel(data.totalEarnedPoints);
  var next = getNextLevel(data.totalEarnedPoints);
  var el = document.getElementById("levelDragon");
  if (el) el.innerHTML = dragonSvg(lvl.key);
  document.getElementById("levelName").textContent = lvl.name;
  if (next) {
    var done = data.totalEarnedPoints - lvl.min;
    var total = next.min - lvl.min;
    var p = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById("levelProgressBar").style.width = p + "%";
    document.getElementById("levelProgressText").textContent = done + " / " + total + " " + pluralPoints(total) + " до «" + next.name + "»";
  } else {
    document.getElementById("levelProgressBar").style.width = "100%";
    document.getElementById("levelProgressText").textContent = "Максимум достигнут 🎉";
  }
}

function renderMainGoal() {
  var nameEl = document.getElementById("goalName");
  if (!nameEl) return;
  var g = sortedGoals()[0];
  if (!g) {
    nameEl.textContent = "Нет цели";
    var bar = document.getElementById("goalProgressBar");
    if (bar) bar.style.width = "0%";
    var txt = document.getElementById("goalProgressText");
    if (txt) txt.textContent = "Создайте цель";
    return;
  }
  var pr = Math.min(data.points, g.price);
  var p = Math.round((pr / g.price) * 100);
  nameEl.textContent = g.title;
  var bar2 = document.getElementById("goalProgressBar");
  if (bar2) bar2.style.width = p + "%";
  var txt2 = document.getElementById("goalProgressText");
  if (txt2) txt2.textContent = pr + " из " + g.price + " " + pluralPoints(g.price) + " (" + p + "%)";
}

function sortedGoals() {
  return data.goals.map(function (g, i) {
    var copy = {};
    for (var k in g) if (Object.prototype.hasOwnProperty.call(g, k)) copy[k] = g[k];
    copy._origIndex = i;
    return copy;
  }).sort(function (a, b) {
    if (a.important && !b.important) return -1;
    if (!a.important && b.important) return 1;
    return b.price - a.price;
  });
}

function renderChores(isParent) {
  var vis = isParent ? data.chores : data.chores.filter(isChoreActiveToday);
  var el = document.getElementById("choresList");
  if (!vis.length) {
    var txt = guffyReplicasOn()
      ? (isParent ? "Гуфи скучает без заданий. Создайте первое!" : "Гуфи говорит: на сегодня заданий нет. Отдыхай 🌿")
      : (isParent ? "Создайте первое задание" : "На сегодня заданий нет");
    el.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + guffyWithNotebook(getGuffyEmotion()) + '</div><div class="empty-state__text">' + txt + '</div></div>';
    return;
  }
  var html = vis.map(function (c) {
    var max = c.maxPerDay || 1;
    var unlimited = max >= 999;
    var done = countToday(c.id);
    var pending = countTodayByStatus(c.id, "pending");
    var approved = countTodayByStatus(c.id, "approved");

    var action = "";
    if (!isParent) {
      if (unlimited) {
        action = '<button class="button button--primary button--small" type="button" data-action="complete-chore" data-id="' + c.id + '">Выполнено' + (done > 0 ? " (" + done + ")" : "") + '</button>';
      } else if (done >= max) {
        if (approved >= max) action = '<span class="amount-positive">✓ Все ' + max + ' ' + pluralTimes(max) + '</span>';
        else if (pending > 0 && approved === 0) action = '<span class="list-item__meta">На проверке (' + pending + "/" + max + ')</span>';
        else if (pending > 0) action = '<span class="list-item__meta">✓ ' + approved + " · ⏳ " + pending + '</span>';
        else action = '<span class="amount-positive">✓ Выполнено</span>';
      } else {
        var label = max > 1 ? "Выполнено (" + done + "/" + max + ")" : "Выполнено";
        action = '<button class="button button--primary button--small" type="button" data-action="complete-chore" data-id="' + c.id + '">' + label + '</button>';
      }
    }

    var pb = isParent
      ? '<button class="button button--copy button--small" type="button" data-action="duplicate-chore" data-id="' + c.id + '" title="Создать копию">Копия</button> ' +
        '<button class="button button--light button--small" type="button" data-action="edit-chore" data-id="' + c.id + '">Изменить</button> ' +
        '<button class="button button--danger button--small" type="button" data-action="delete-chore" data-id="' + c.id + '">Удалить</button>'
      : "";

    var showR = isParent || (c.repeat && c.repeat !== "daily");
    var bc = c.repeat === "custom" ? "custom" : (c.repeat || "daily");
    var rH = showR ? '<span class="badge badge--' + bc + '">' + repeatLabel(c.repeat || "daily", c.days) + '</span>' : "";
    var mH = max > 1 ? (unlimited
      ? '<span class="badge badge--multi">×∞</span>'
      : '<span class="badge badge--multi">×' + max + " " + pluralTimes(max) + '</span>') : "";
    var cH = (max > 1 && !unlimited && done > 0) ? '<span class="chore-daily-count">' + done + " из " + max + ' сегодня</span>' : "";
    var parts = [c.description, c.reward + " " + pluralPoints(c.reward)].filter(Boolean);
    var meta = mH + rH + escapeHtml(parts.join(" · "));

    var cm = null;
    data.completions.forEach(function (x) {
      if (x.choreId === c.id && x.date === today() && (x.status === "approved" || x.status === "rejected")) {
        if (!cm || (x.approvedAt || 0) > (cm.approvedAt || 0)) cm = x;
      }
    });
    var cmH = "";
    if (cm && cm.comment && !isParent) {
      var cmIcon = cm.status === "approved" ? "💬" : "❌";
      var cmCls = cm.status === "approved" ? "chore-comment" : "chore-comment chore-comment--reject";
      cmH = '<div class="' + cmCls + '">' + cmIcon + ' ' + escapeHtml(cm.comment) + '</div>';
    }

    var wp = data.completions.filter(function (x) { return x.choreId === c.id && x.date === today() && x.photo; }).slice(-1)[0];
    var pH = wp ? '<img class="chore-photo-thumb" src="' + wp.photo + '" alt="Фото">' : "";

    return '<div class="list-item"><div><div class="list-item__title">' + escapeHtml(c.title) + '</div><div class="list-item__meta">' + cH + meta + '</div>' + cmH + pH + '</div><div class="list-item__actions">' + action + pb + '</div></div>';
  }).join("");
  el.innerHTML = html;
}

function filterGrades(grades) {
  return grades.filter(function (g) {
    if (gradeFilter.subject !== "all" && g.subject !== gradeFilter.subject) return false;
    if (gradeFilter.value !== "all") {
      var v = g.value;
      if (gradeFilter.value === "high" && v < 9) return false;
      if (gradeFilter.value === "good" && (v < 7 || v > 8)) return false;
      if (gradeFilter.value === "mid" && (v < 5 || v > 6)) return false;
      if (gradeFilter.value === "low" && (v < 2 || v > 4)) return false;
    }
    if (gradeFilter.period !== "all") {
      var days = gradeFilter.period === "week" ? 7 : 30;
      var cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      if (g.date < formatDate(cutoff)) return false;
    }
    return true;
  });
}

function renderGradeFilters() {
  var el = document.getElementById("gradeFilters");
  if (!el) return;

  var subjects = {};
  data.grades.forEach(function (g) { subjects[g.subject] = true; });
  var subjectList = Object.keys(subjects).sort();

  var subjectHtml = '<option value="all">📚 Все предметы</option>';
  subjectList.forEach(function (s) {
    subjectHtml += '<option value="' + escapeHtml(s) + '"' + (gradeFilter.subject === s ? " selected" : "") + '>' + escapeHtml(s) + '</option>';
  });

  el.innerHTML =
    '<select id="gradeFilterSubject">' + subjectHtml + '</select>' +
    '<select id="gradeFilterValue">' +
      '<option value="all"' + (gradeFilter.value === "all" ? " selected" : "") + '>Все оценки</option>' +
      '<option value="high"' + (gradeFilter.value === "high" ? " selected" : "") + '>⭐ 9–10</option>' +
      '<option value="good"' + (gradeFilter.value === "good" ? " selected" : "") + '>👍 7–8</option>' +
      '<option value="mid"' + (gradeFilter.value === "mid" ? " selected" : "") + '>😐 5–6</option>' +
      '<option value="low"' + (gradeFilter.value === "low" ? " selected" : "") + '>😟 2–4</option>' +
    '</select>' +
    '<select id="gradeFilterPeriod">' +
      '<option value="all"' + (gradeFilter.period === "all" ? " selected" : "") + '>За всё время</option>' +
      '<option value="week"' + (gradeFilter.period === "week" ? " selected" : "") + '>За неделю</option>' +
      '<option value="month"' + (gradeFilter.period === "month" ? " selected" : "") + '>За месяц</option>' +
    '</select>';
}

function renderGrades(isParent) {
  var filtersEl = document.getElementById("gradeFilters");
  var has = data.grades.length > 0 || data.gradeRequests.length > 0;

  if (filtersEl) {
    if (isParent && data.grades.length > 0) {
      filtersEl.style.display = "flex";
      renderGradeFilters();
    } else {
      filtersEl.style.display = "none";
      filtersEl.innerHTML = "";
    }
  }

  var el = document.getElementById("gradesList");
  if (!has) {
    var txt = guffyReplicasOn()
      ? "Гуфи говорит: оценок пока нет"
      : (isParent ? "Добавьте первую оценку" : "Оценок пока нет");
    el.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + guffyWithDiary(getGuffyEmotion()) + '</div><div class="empty-state__text">' + txt + '</div></div>';
    return;
  }

  var filtered = isParent ? filterGrades(data.grades) : data.grades;
  var sortedGrades = filtered.slice().sort(function (a, b) {
    return String(b.date || "").localeCompare(String(a.date || ""));
  });

  var html = "";
  if (sortedGrades.length) {
    html = sortedGrades.slice(0, GRADES_LIMIT).map(function (g) {
      var em = gradeEmoji(g.value);
      var parts = [];
      if (g.payment > 0) parts.push('<span class="amount-positive">+' + g.payment + ' BYN</span>');
      else if (g.payment < 0) parts.push('<span class="amount-negative">' + g.payment + ' BYN</span>');
      var penalty = penaltyPointsForGrade(g.value);
      if (penalty) parts.push('<span class="amount-negative">' + penalty + ' ' + pluralPoints(Math.abs(penalty)) + '</span>');
      if (!parts.length) parts.push('<span class="amount-zero">0 BYN</span>');
      var a = parts.join(" ");
      var pb = isParent
        ? '<button class="button button--light button--small" type="button" data-action="edit-grade" data-id="' + g.id + '">Изменить</button> <button class="button button--danger button--small" type="button" data-action="delete-grade" data-id="' + g.id + '">Удалить</button>'
        : "";
      return '<div class="list-item"><div><div class="list-item__title">' + em + " " + escapeHtml(g.subject) + " — " + g.value + '</div><div class="list-item__meta">' + g.date + '</div></div><div class="list-item__actions">' + a + pb + '</div></div>';
    }).join("");
  } else if (isParent && data.grades.length > 0) {
    html = '<div class="empty-state"><div class="empty-state__text">По фильтрам ничего не найдено</div></div>';
  }

  if (isParent) {
    html += data.gradeRequests.map(function (r) {
      var em = gradeEmoji(r.value);
      var pay = paymentForGrade(r.value, r.subject);
      var penalty = penaltyPointsForGrade(r.value);
      var parts = [];
      if (pay > 0) parts.push('<span class="amount-positive">+' + pay + ' BYN</span>');
      else if (pay < 0) parts.push('<span class="amount-negative">' + pay + ' BYN</span>');
      if (penalty) parts.push('<span class="amount-negative">' + penalty + ' ' + pluralPoints(Math.abs(penalty)) + '</span>');
      if (!parts.length) parts.push('<span class="amount-zero">без оплаты</span>');
      return '<div class="list-item list-item--pending"><div><div class="list-item__title">' + em + " " + escapeHtml(r.subject) + " — " + r.value + '</div><div class="list-item__meta">От ребёнка · ' + r.date + " · " + parts.join(" ") + '</div></div><div class="list-item__actions"><button class="button button--primary button--small" type="button" data-action="approve-grade" data-id="' + r.id + '">Одобрить</button> <button class="button button--light button--small" type="button" data-action="reject-grade" data-id="' + r.id + '">Отклонить</button></div></div>';
    }).join("");
  } else {
    html += data.gradeRequests.map(function (r) {
      var em = gradeEmoji(r.value);
      return '<div class="list-item list-item--pending"><div><div class="list-item__title">' + em + " " + escapeHtml(r.subject) + " — " + r.value + '</div><div class="list-item__meta">На проверке · ' + r.date + '</div></div></div>';
    }).join("");
  }
  el.innerHTML = html;
}

function renderGoals(isParent) {
  var c = document.getElementById("goalsLayout");
  if (!c) return;
  if (!data.goals.length) {
    var txt = guffyReplicasOn()
      ? (isParent ? "Гуфи предлагает помечтать. Добавьте первую цель" : "Гуфи говорит: целей пока нет. О чём мечтаешь?")
      : (isParent ? "Создайте первую цель" : "Целей пока нет");
    c.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + guffyLookingAtMountain(getGuffyEmotion()) + '</div><div class="empty-state__text">' + txt + '</div></div>';
    return;
  }
  var sorted = sortedGoals();
  var hero = sorted[0];
  var rest = sorted.slice(1, MAX_GOALS);
  var html = renderGoalHero(hero, isParent);
  if (rest.length) html += '<div class="goals-mini-grid">' + rest.map(function (g) { return renderGoalMini(g, isParent); }).join("") + '</div>';
  c.innerHTML = html;
}

function renderGoalHero(g, isParent) {
  var i = g._origIndex;
  var pr = Math.min(data.points, g.price);
  var p = Math.round((pr / g.price) * 100);
  var rem = Math.max(0, g.price - pr);
  var ready = pr >= g.price;
  var claim = (!isParent && ready) ? '<button class="button button--gold button--small" type="button" data-action="claim-goal" data-index="' + i + '">🎁 Забрать награду</button>' : "";
  var pb = isParent ? '<button class="button button--light button--small" type="button" data-action="edit-goal" data-index="' + i + '">Изменить</button> <button class="button button--danger button--small" type="button" data-action="delete-goal" data-index="' + i + '">Удалить</button>' : "";

  var dH = "";
  if (g.deadline) {
    var d = daysBetween(today(), g.deadline);
    var cls = "goal-deadline", t;
    if (d < 0) { cls += " goal-deadline--overdue"; t = "⏰ Просрочено (" + Math.abs(d) + " " + pluralDays(Math.abs(d)) + ")"; }
    else if (d === 0) { cls += " goal-deadline--soon"; t = "🔥 Сегодня!"; }
    else if (d <= 3) { cls += " goal-deadline--soon"; t = "⏳ " + d + " " + pluralDays(d); }
    else { t = "⏳ " + d + " " + pluralDays(d); }
    dH = '<span class="' + cls + '">' + t + '</span>';
  }

  var ms = [25, 50, 75].map(function (m) {
    return '<span class="goal-progress__milestone ' + (p >= m ? "is-reached" : "") + '" style="left:' + m + '%">' + m + '</span>';
  }).join("");
  var hT = ready ? "🎉 Цель достигнута!" : "Осталось " + rem + " " + pluralPoints(rem);

  return '<div class="goal-hero ' + (ready ? "is-ready" : "") + '">' +
    '<div class="goal-hero__label">' + (g.important ? "⭐ Главная цель" : "🎯 Главная цель") + '</div>' +
    '<div class="goal-hero__top"><div class="goal-hero__title">' + escapeHtml(g.title) + '</div><div class="goal-hero__percent ' + (p === 0 ? "goal-hero__percent--zero" : "") + '">' + p + '%</div></div>' +
    (dH ? '<div class="goal-hero__deadline">' + dH + '</div>' : "") +
    '<div class="goal-hero__progress"><div class="goal-progress"><div class="goal-progress__bar"><div class="goal-progress__fill" style="width:' + p + '%"></div></div><div class="goal-progress__milestones">' + ms + '</div></div></div>' +
    '<div class="goal-hero__foot"><div class="goal-left">' + pr + " из " + g.price + " " + pluralPoints(g.price) + '</div><div class="goal-hint">' + hT + '</div></div>' +
    ((claim || pb) ? '<div class="goal-hero__actions">' + claim + pb + '</div>' : "") +
    '</div>';
}

function renderGoalMini(g, isParent) {
  var i = g._origIndex;
  var pr = Math.min(data.points, g.price);
  var p = Math.round((pr / g.price) * 100);
  var ready = pr >= g.price;
  var claim = (!isParent && ready) ? '<button class="button button--gold button--small" type="button" data-action="claim-goal" data-index="' + i + '">🎁 Забрать</button>' : "";
  var pb = isParent ? '<button class="button button--light button--small" type="button" data-action="edit-goal" data-index="' + i + '">Изменить</button> <button class="button button--danger button--small" type="button" data-action="delete-goal" data-index="' + i + '">Удалить</button>' : "";
  var ms = [25, 50, 75].map(function (m) {
    return '<span class="goal-progress__milestone ' + (p >= m ? "is-reached" : "") + '" style="left:' + m + '%">' + m + '</span>';
  }).join("");
  var bI = g.important ? '<span class="badge badge--important" style="margin-bottom:4px;display:inline-block">⭐ Важная</span>' : "";

  return '<div class="goal-mini ' + (ready ? "is-ready" : "") + '">' +
    bI +
    '<div class="goal-mini__row"><div class="goal-mini__title">' + escapeHtml(g.title) + '</div><div class="goal-mini__percent ' + (p === 0 ? "goal-mini__percent--zero" : "") + '">' + p + '%</div></div>' +
    '<div class="goal-progress goal-progress--mini"><div class="goal-progress__bar"><div class="goal-progress__fill" style="width:' + p + '%"></div></div><div class="goal-progress__milestones">' + ms + '</div></div>' +
    '<div class="goal-mini__meta">' + pr + " из " + g.price + " " + pluralPoints(g.price) + '</div>' +
    ((claim || pb) ? '<div class="goal-mini__actions">' + claim + pb + '</div>' : "") +
    '</div>';
}

function renderHistory() {
  var el = document.getElementById("historyList");
  if (!data.transactions.length) {
    var txt = guffyReplicasOn() ? "Гуфи говорит: история пока пуста" : "История пока пуста";
    el.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + guffyWithScroll(getGuffyEmotion()) + '</div><div class="empty-state__text">' + txt + '</div></div>';
    return;
  }
  var html = data.transactions.slice(0, HISTORY_LIMIT).map(function (t) {
    var parts = [];
    if (t.points) {
      var cls = t.points > 0 ? "amount-positive" : "amount-negative";
      parts.push('<span class="' + cls + '">' + (t.points > 0 ? "+" : "") + t.points + " " + pluralPoints(t.points) + '</span>');
    }
    if (t.byn) {
      var cls2 = t.byn > 0 ? "amount-positive" : "amount-negative";
      parts.push('<span class="' + cls2 + '">' + (t.byn > 0 ? "+" : "") + t.byn + ' BYN</span>');
    }
    var r = parts.length ? parts.join(" · ") : '<span class="amount-zero">—</span>';
    return '<div class="list-item"><div><div class="list-item__title">' + escapeHtml(t.description) + '</div><div class="list-item__meta">' + t.date + '</div></div><div class="list-item__actions">' + r + '</div></div>';
  }).join("");
  el.innerHTML = html;
}

function renderPendingChores() {
  var el = document.getElementById("pendingList");
  if (!el) return;

  var list = data.completions.filter(function (c) {
    return c.status === "pending" && data.chores.some(function (ch) { return ch.id === c.choreId; });
  });

  if (!list.length) {
    pendingSelectionIds = [];
    el.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + svgBell() + '</div><div class="empty-state__text">Нет заданий на проверке</div></div>';
    return;
  }

  pendingSelectionIds = pendingSelectionIds.filter(function (id) {
    return list.some(function (c) { return c.id === id; });
  });
  var selectedCount = pendingSelectionIds.length;

  var toolbar = '<div class="pending-toolbar">' +
    '<span class="pending-toolbar__count">' + list.length + ' на проверке' +
      (selectedCount ? ' · выбрано ' + selectedCount : '') + '</span>' +
    (selectedCount
      ? '<button class="button button--light button--small" type="button" data-bulk="clear">✕ Снять</button>' +
        '<button class="button button--primary button--small" type="button" data-bulk="approve-selected">✓ Одобрить (' + selectedCount + ')</button>' +
        '<button class="button button--danger button--small" type="button" data-bulk="reject-selected">✕ Отклонить</button>'
      : '<button class="button button--light button--small" type="button" data-bulk="select-all">☑ Выбрать все</button>' +
        '<button class="button button--primary button--small" type="button" data-bulk="approve-all">✓✓ Одобрить все</button>' +
        '<button class="button button--light button--small" type="button" data-bulk="reject-all">✕✕ Отклонить все</button>'
    ) +
  '</div>';

  var html = list.map(function (c) {
    var ch = data.chores.find(function (x) { return x.id === c.choreId; });
    if (!ch) return "";
    var pH = c.photo ? '<img class="chore-photo-thumb" src="' + c.photo + '" alt="Фото">' : "";
    var isSel = pendingSelectionIds.indexOf(c.id) >= 0;
    return '<div class="list-item ' + (isSel ? 'is-selected' : '') + '">' +
      '<div class="pending-item-wrap">' +
        '<label class="pending-checkbox">' +
          '<input type="checkbox" data-pending-id="' + c.id + '" ' + (isSel ? 'checked' : '') + '>' +
        '</label>' +
        '<div>' +
          '<div class="list-item__title">' + escapeHtml(ch.title) + '</div>' +
          '<div class="list-item__meta">' + ch.reward + " " + pluralPoints(ch.reward) + " · " + c.date + '</div>' +
          pH +
        '</div>' +
      '</div>' +
      '<div class="list-item__actions">' +
        '<button class="button button--primary button--small" type="button" data-action="approve-chore" data-id="' + c.id + '">💬 Одобрить</button> ' +
        '<button class="button button--light button--small" type="button" data-action="reject-chore" data-id="' + c.id + '">Отклонить</button>' +
      '</div>' +
    '</div>';
  }).join("");

  el.innerHTML = toolbar + html;
}

function renderWithdrawRequests() {
  var el = document.getElementById("withdrawRequestsList");
  if (!el) return;
  var list = data.withdrawRequests.slice().sort(function (a, b) {
    var ap = a.status === "pending" ? 0 : 1;
    var bp = b.status === "pending" ? 0 : 1;
    if (ap !== bp) return ap - bp;
    return String(b.date || "").localeCompare(String(a.date || ""));
  });
  if (!list.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-state__illustration">' + svgMoney() + '</div><div class="empty-state__text">Пока нет запросов на деньги</div></div>';
    return;
  }
  el.innerHTML = list.slice(0, 10).map(function (r) {
    var reason = r.reason ? escapeHtml(r.reason) : "Без причины";
    var amountLabel = "💵 " + r.amount + " BYN";
    if (r.status === "approved" && r.requestedAmount && r.requestedAmount !== r.amount) {
      amountLabel += ' <span class="list-item__meta" style="display:inline">(запрошено ' + r.requestedAmount + ')</span>';
    }
    if (r.status === "pending") {
      var enough = data.balance >= r.amount;
      var actions = enough
        ? '<button class="button button--primary button--small" type="button" data-action="approve-withdraw" data-id="' + r.id + '">💸 Выдать</button> <button class="button button--light button--small" type="button" data-action="reject-withdraw" data-id="' + r.id + '">Отклонить</button>'
        : '<span class="amount-negative" style="align-self:center;margin-right:8px">Мало средств</span> <button class="button button--light button--small" type="button" data-action="reject-withdraw" data-id="' + r.id + '">Отклонить</button>';
      return '<div class="list-item list-item--pending"><div><div class="list-item__title">' + amountLabel + '</div><div class="list-item__meta">' + reason + " · " + r.date + '</div></div><div class="list-item__actions">' + actions + '</div></div>';
    }
    var statusText = r.status === "approved"
      ? '<span class="amount-positive">✓ Выдано</span>'
      : '<span class="amount-negative">✗ Отклонено</span>';
    return '<div class="list-item"><div><div class="list-item__title">' + amountLabel + '</div><div class="list-item__meta">' + reason + " · " + r.date + '</div></div><div class="list-item__actions">' + statusText + '</div></div>';
  }).join("");
}

function renderMyWithdrawStatus() {
  var el = document.getElementById("myWithdrawStatus");
  if (!el) return;
  var mine = data.withdrawRequests.filter(function (r) { return r.status === "pending"; });
  if (!mine.length) { el.innerHTML = ""; return; }
  var r = mine[0];
  el.innerHTML = '<div class="chore-comment">⏳ Запрос на ' + r.amount + ' BYN на проверке' + (r.reason ? ": " + escapeHtml(r.reason) : "") + '</div>';
}

function renderChoreDaysGrid() {
  $$("#choreDaysGrid .weekday-btn").forEach(function (b) {
    var d = Number(b.dataset.day);
    b.classList.toggle("is-active", editingChoreDays.indexOf(d) >= 0);
  });
}

function renderChoreTemplateSelect() {
  var sel = document.getElementById("choreTemplateSelect");
  if (!sel) return;
  var html = '<option value="">— Выбрать шаблон —</option>';
  CHORE_TEMPLATES.forEach(function (t, i) {
    html += '<option value="' + i + '">' + escapeHtml(t.title) + '</option>';
  });
  sel.innerHTML = html;
}

function checkDayChange() {
  var t = today();
  if (t !== currentDay) {
    currentDay = t;
    treasureCheckedThisSession = false;
    if (currentRole) {
      render();
      if (currentRole === "child") setTimeout(checkDailyTreasure, 500);
      showToast("🌅 Новый день! Задания обновлены", "success");
    } else {
      paintStartScreen();
    }
  } else if (currentRole) {
    paintSummaryDeco();
  }
}