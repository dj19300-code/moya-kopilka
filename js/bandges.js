"use strict";

/* ============================================================
   Достижения (бейджи) и стрик (серия дней подряд)
   ============================================================ */

/* Вспомогательная: событие случилось позже, чем since?
   Используется для сброса бейджей (badgesResetAt). */
function _after(ts, since) {
  if (!since) return true;
  return (ts || 0) > since;
}

var BADGES = [
  {
    id: "first_ten", icon: "🥇", title: "Первая десятка",
    desc: "Получить оценку 10",
    check: function (d, since) {
      return d.grades.some(function (g) { return g.value === 10 && _after(g.ts, since); });
    }
  },
  {
    id: "excellent", icon: "📚", title: "Отличник",
    desc: "5 оценок 9 или 10",
    check: function (d, since) {
      return d.grades.filter(function (g) { return g.value >= 9 && _after(g.ts, since); }).length >= 5;
    }
  },
  {
    id: "first_goal", icon: "🎯", title: "Первая цель",
    desc: "Получить награду за цель",
    check: function (d, since) {
      return d.transactions.some(function (t) {
        return typeof t.description === "string" &&
               t.description.indexOf("🎁 Награда:") === 0 &&
               _after(t.ts, since);
      });
    }
  },
  {
    id: "chores_10", icon: "💪", title: "Трудяга",
    desc: "10 заданий за неделю",
    check: function (d, since) {
      var weekAgo = Date.now() - 7 * 86400000;
      var cut = Math.max(since || 0, weekAgo);
      return d.completions.filter(function (c) {
        return c.status === "approved" && (c.approvedAt || 0) > cut;
      }).length >= 10;
    }
  },
  {
    id: "streak_3", icon: "🔥", title: "Три дня подряд",
    desc: "Активность 3 дня подряд",
    check: function (d) { return (d.streakBest || 0) >= 3; }
  },
  {
    id: "streak_7", icon: "🔥🔥", title: "Неделя подряд",
    desc: "Активность 7 дней подряд",
    check: function (d) { return (d.streakBest || 0) >= 7; }
  },
  {
    id: "streak_30", icon: "🔥🔥🔥", title: "Месяц подряд",
    desc: "Активность 30 дней подряд",
    check: function (d) { return (d.streakBest || 0) >= 30; }
  },
  {
    id: "balance_10", icon: "💰", title: "Первая десятка BYN",
    desc: "Накопить 10 BYN",
    check: function (d, since) {
      var sum = 0;
      d.transactions.forEach(function (t) {
        if (t.byn > 0 && _after(t.ts, since)) sum += t.byn;
      });
      return sum >= 10;
    }
  },
  {
    id: "points_100", icon: "⭐", title: "Сотня",
    desc: "Заработать 100 баллов",
    check: function (d, since) {
      var sum = 0;
      d.transactions.forEach(function (t) {
        if (t.points > 0 && _after(t.ts, since)) sum += t.points;
      });
      return sum >= 100;
    }
  },
  {
    id: "points_1000", icon: "🌟", title: "Тысячник",
    desc: "Заработать 1000 баллов",
    check: function (d, since) {
      var sum = 0;
      d.transactions.forEach(function (t) {
        if (t.points > 0 && _after(t.ts, since)) sum += t.points;
      });
      return sum >= 1000;
    }
  },
  {
    id: "level_dragon", icon: "🐉", title: "Настоящий дракон",
    desc: "Достичь уровня «Дракон»",
    check: function (d, since) {
      var sum = 0;
      d.transactions.forEach(function (t) {
        if (t.points > 0 && _after(t.ts, since)) sum += t.points;
      });
      return sum >= 1200;
    }
  },
  {
    id: "level_legend", icon: "🦸", title: "Легенда",
    desc: "Достичь высшего уровня",
    check: function (d, since) {
      var sum = 0;
      d.transactions.forEach(function (t) {
        if (t.points > 0 && _after(t.ts, since)) sum += t.points;
      });
      return sum >= 5000;
    }
  }
];

/* Обновление серии дней. Вызывается из addTransaction при
   положительных начислениях. */
function updateStreak() {
  var ts = today();
  if (data.streakLastDate === ts) return;

  var yest = new Date();
  yest.setDate(yest.getDate() - 1);
  var yestStr = formatDate(yest);

  if (data.streakLastDate === yestStr) {
    data.streak = (data.streak || 0) + 1;
  } else {
    data.streak = 1;
  }
  data.streakLastDate = ts;
  if ((data.streak || 0) > (data.streakBest || 0)) {
    data.streakBest = data.streak;
  }
}

/* Проверка и выдача новых бейджей.
   opts.silent = true — не показывать тосты.
   Если data.badgesResetAt > 0 — учитываются только события после сброса. */
function checkBadges(opts) {
  opts = opts || {};
  var silent = !!opts.silent;

  if (!Array.isArray(data.badges)) data.badges = [];
  if (typeof BADGES === "undefined" || !BADGES.length) return 0;

  var since = data.badgesResetAt || 0;
  var newOnes = [];
  BADGES.forEach(function (b) {
    if (data.badges.indexOf(b.id) >= 0) return;
    var ok = false;
    try { ok = !!b.check(data, since); } catch (e) { ok = false; }
    if (ok) {
      data.badges.push(b.id);
      newOnes.push(b);
    }
  });

  if (!silent) {
    newOnes.forEach(function (b, i) {
      addNotification("child", "🏆 Новое достижение: «" + b.title + "»", "🏆");
      setTimeout(function () {
        showToast(b.icon + " " + b.title, "levelup");
        spawnConfetti(24);
      }, 600 + i * 900);
    });
  }
  return newOnes.length;
}