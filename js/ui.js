"use strict";

/* ============================================================
   UI: модалки, события, поиск, навигация, инициализация
   ============================================================ */

function openModal(id) {
  $("#modalBackdrop").classList.remove("hidden");
  $$(".modal").forEach(function (m) { m.classList.add("hidden"); });
  var modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("hidden");
  var first = modal.querySelector("input[type=text]:not([type=hidden]), input[type=number]:not([type=hidden]), input[type=password]:not([type=hidden])");
  if (first) setTimeout(function () { first.focus(); }, 100);
}
function closeModal() {
  $("#modalBackdrop").classList.add("hidden");
  $$(".modal").forEach(function (m) { m.classList.add("hidden"); });
}

function openProfileModal() {
  pendingProfileAvatar = data.avatar || "👧";
  var grid = $("#avatarGrid");
  if (grid) {
    grid.innerHTML = AVATARS.map(function (e) {
      return '<button class="avatar-option ' + (e === pendingProfileAvatar ? "is-active" : "") + '" type="button" data-avatar="' + e + '">' + e + "</button>";
    }).join("");
  }
  var nameInput = $("#profileName");
  if (nameInput) nameInput.value = data.profile.name || "";
  var ageInput = $("#profileAge");
  if (ageInput) ageInput.value = data.profile.age || "";
  var clsInput = $("#profileClass");
  if (clsInput) clsInput.value = data.profile.className || "";
  var bdInput = $("#profileBirthday");
  if (bdInput) bdInput.value = data.profile.birthday || "";
  renderProfilePreview();
  openModal("profileModal");
}

function openNotificationsModal() {
  var changed = false;
  data.notifications.forEach(function (n) {
    if (n.forRole === currentRole && !n.read) { n.read = true; changed = true; }
  });
  renderNotificationsList();
  renderNotificationsBadge();
  openModal("notificationsModal");
  if (changed) saveData();
}

function clearNotifications() {
  if (!confirm("Очистить уведомления?")) return;
  data.notifications = data.notifications.filter(function (n) { return n.forRole !== currentRole; });
  saveData();
  closeModal();
  showToast("Уведомления очищены");
}

function openPhotoModal(id) {
  var ch = data.chores.find(function (x) { return x.id === id; });
  if (!ch) return;
  var max = ch.maxPerDay || 1;
  if (max < 999 && countToday(id) >= max) { showToast("Лимит уже достигнут"); return; }
  document.getElementById("photoChoreId").value = id;
  document.getElementById("photoChoreName").textContent = ch.title;
  document.getElementById("photoFileInput").value = "";
  document.getElementById("photoPreviewWrap").classList.add("hidden");
  document.getElementById("photoPreview").removeAttribute("src");
  pendingPhotoDataUrl = "";
  openModal("photoModal");
}

function handlePhotoFileChange(e) {
  var f = e.target.files && e.target.files[0];
  if (!f) return;
  if (f.type.indexOf("image/") !== 0) { showToast("Не изображение"); e.target.value = ""; return; }
  showToast("Обрабатываю…");
  compressImage(f, PHOTO_MAX_SIZE, PHOTO_QUALITY).then(function (url) {
    pendingPhotoDataUrl = url;
    document.getElementById("photoPreview").src = url;
    document.getElementById("photoPreviewWrap").classList.remove("hidden");
  }).catch(function () {
    showToast("Ошибка фото");
    e.target.value = "";
  });
}

function removePendingPhoto() {
  pendingPhotoDataUrl = "";
  document.getElementById("photoFileInput").value = "";
  document.getElementById("photoPreviewWrap").classList.add("hidden");
  document.getElementById("photoPreview").removeAttribute("src");
}

function openCommentModal(id, mode) {
  var c = data.completions.find(function (x) { return x.id === id; });
  if (!c) return;
  var ch = data.chores.find(function (x) { return x.id === c.choreId; });
  mode = mode === "reject" ? "reject" : "approve";
  document.getElementById("commentCompletionId").value = id;
  document.getElementById("commentMode").value = mode;
  document.getElementById("commentChoreTitle").textContent = ch ? ch.title : "Задание";
  document.getElementById("commentText").value = "";
  var titleEl = document.getElementById("commentModalTitle");
  var btnEl = document.getElementById("commentSubmitBtn");
  var lblEl = document.getElementById("commentLabel");
  var hintEl = document.getElementById("commentHint");
  var txtEl = document.getElementById("commentText");
  if (mode === "reject") {
    if (titleEl) titleEl.textContent = "Отклонить задание";
    if (btnEl) btnEl.textContent = "✗ Отклонить";
    if (lblEl) lblEl.childNodes[0].nodeValue = "Причина (необязательно)\n        ";
    if (txtEl) txtEl.placeholder = "Например: фото нечёткое, переделай";
    if (hintEl) hintEl.textContent = "Ребёнок увидит причину под заданием.";
  } else {
    if (titleEl) titleEl.textContent = "Одобрить задание";
    if (btnEl) btnEl.textContent = "✓ Одобрить";
    if (lblEl) lblEl.childNodes[0].nodeValue = "Комментарий (необязательно)\n        ";
    if (txtEl) txtEl.placeholder = "Например: Отлично получилось!";
    if (hintEl) hintEl.textContent = "Ребёнок увидит комментарий под заданием.";
  }
  openModal("commentModal");
}

function openEditGrade(id) {
  var g = data.grades.find(function (x) { return x.id === id; });
  if (!g) return;
  document.getElementById("gradeEditId").value = g.id;
  setSubjectSelect("#gradeSubjectSelect", "#gradeSubjectCustom", "#gradeCustomSubjectWrapper", g.subject);
  document.getElementById("gradeValue").value = g.value;
  document.getElementById("gradeModalTitle").textContent = "Редактировать оценку";
  updateGradeHint(g.subject);
  openModal("gradeModal");
}

function openWithdrawRequestModal() {
  document.getElementById("withdrawRequestForm").reset();
  document.getElementById("withdrawBalanceLabel").textContent = data.balance + " BYN";
  var amtEl = document.getElementById("withdrawAmount");
  amtEl.max = Math.max(1, data.balance);
  openModal("withdrawRequestModal");
}

function openBalanceManageModal(prefill) {
  document.getElementById("balanceManageForm").reset();
  document.getElementById("balanceManageLabel").textContent =
    data.balance + " BYN · " + data.points + " " + pluralPoints(data.points);
  var type = (prefill && prefill.type) || "byn";
  var sign = (prefill && prefill.sign != null) ? prefill.sign : 1;
  document.getElementById("balanceManageType").value = type;
  document.getElementById("balanceManageSign").value = String(sign);
  var amtEl = document.getElementById("balanceManageAmount");
  if (prefill && prefill.amount) amtEl.value = prefill.amount;
  setTimeout(function () { amtEl.focus(); }, 100);
  updateBalanceManageHint();
  openModal("balanceManageModal");
}

function openQuickManage(type, sign) {
  if (sign === 0) {
    openBalanceManageModal({ type: type, sign: 1 });
    return;
  }
  openBalanceManageModal({ type: type, sign: sign });
}

function enterCabinet(role) {
  currentRole = role;
  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  render();
  if (role === "child") setTimeout(checkDailyTreasure, 800);
}
function returnToStart() {
  currentRole = "";
  closeModal();
  closeSearch();
  gradeFilter = { subject: "all", value: "all", period: "all" };
  pendingSelectionIds = [];
  document.getElementById("app").classList.add("hidden");
  document.getElementById("startScreen").classList.remove("hidden");
  window.scrollTo(0, 0);
  paintStartScreen();
}
function updateRoleVisibility() {
  var isParent = currentRole === "parent";
  $$(".parent-only").forEach(function (el) { el.classList.toggle("role-hidden", !isParent); });
  $$(".child-only").forEach(function (el) { el.classList.toggle("role-hidden", isParent); });

  var childHero = document.getElementById("childHero");
  var parentHero = document.getElementById("parentHero");
  if (childHero) childHero.style.display = (currentRole === "child") ? "flex" : "none";
  if (parentHero) parentHero.style.display = (currentRole === "parent") ? "flex" : "none";
}

function initScrollTopButton() {
  var btn = document.getElementById("scrollTopBtn");
  if (!btn) return;
  var ticking = false;

  function update() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (y > SCROLL_TOP_THRESHOLD) btn.classList.add("is-visible");
    else btn.classList.remove("is-visible");
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();

  btn.addEventListener("click", function () {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  });
}

function bindStartScreenTap() {
  var scene = document.getElementById("piggyScene");
  if (!scene) return;
  scene.addEventListener("click", function () {
    scene.classList.remove("is-tapped");
    void scene.offsetWidth;
    scene.classList.add("is-tapped");
    var gf = document.getElementById("guffyFull");
    if (gf) gf.innerHTML = guffyFullSvg("happy");
    setTimeout(function () {
      if (gf) gf.innerHTML = guffyFullSvg(getGuffyEmotion());
    }, 1400);
  });
}

function initBottomNav() {
  var nav = document.getElementById("bottomNav");
  if (!nav) return;

  var sections = {
    top: document.querySelector(".container"),
    chores: document.getElementById("choresSection"),
    grades: document.getElementById("gradesSection"),
    goals: document.getElementById("goalsSection")
  };
  var buttons = nav.querySelectorAll(".bottom-nav__btn");

  function setActive(key) {
    buttons.forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.nav === key);
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.dataset.nav;
      if (key === "profile") {
        openProfileModal();
        return;
      }
      var target = sections[key];
      if (!target) return;
      var offset = 70;
      var y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActive(key);
    });
  });

  var ticking = false;
  function updateActive() {
    ticking = false;
    if (!currentRole) return;
    var y = window.pageYOffset + 160;
    var active = "top";
    ["chores", "grades", "goals"].forEach(function (key) {
      var el = sections[key];
      if (el && el.offsetTop <= y) active = key;
    });
    setActive(active);
  }
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateActive);
  }, { passive: true });
  updateActive();
}

function initFab() {
  var fab = document.getElementById("fab");
  var wrap = document.getElementById("fabWrap");
  if (!fab || !wrap) return;

  function close() { wrap.classList.remove("is-open"); }

  fab.addEventListener("click", function (e) {
    e.stopPropagation();
    wrap.classList.toggle("is-open");
  });

  wrap.querySelectorAll("[data-fab]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      close();
      var kind = btn.dataset.fab;
      if (kind === "chore") {
        var b = document.getElementById("openChoreModal");
        if (b) b.click();
      } else if (kind === "grade") {
        var b2 = document.getElementById("openGradeModal");
        if (b2) b2.click();
      } else if (kind === "goal") {
        var b3 = document.getElementById("openGoalModal");
        if (b3) b3.click();
      }
    });
  });

  document.addEventListener("click", close);
}

function initPullToRefresh() {
  var indicator = document.getElementById("ptrIndicator");
  if (!indicator) return;

  var startY = 0;
  var pulling = false;
  var threshold = 80;

  document.addEventListener("touchstart", function (e) {
    if (window.pageYOffset > 0) return;
    if (e.target.closest(".modal, .bottom-nav, .fab-wrap, .modal-backdrop, .search-overlay")) return;
    startY = e.touches[0].pageY;
    pulling = true;
  }, { passive: true });

  document.addEventListener("touchmove", function (e) {
    if (!pulling) return;
    if (window.pageYOffset > 0) { pulling = false; return; }
    var diff = e.touches[0].pageY - startY;
    if (diff > 0) {
      var progress = Math.min(diff / threshold, 1);
      indicator.style.transform = "translate(-50%, " + (-60 + progress * 68) + "px)";
      indicator.style.opacity = progress;
    }
  }, { passive: true });

  document.addEventListener("touchend", function (e) {
    if (!pulling) return;
    pulling = false;
    var diff = (e.changedTouches && e.changedTouches[0])
      ? e.changedTouches[0].pageY - startY
      : 0;

    if (diff > threshold) {
      indicator.classList.add("is-refreshing");
      indicator.style.transform = "translate(-50%, 8px)";
      indicator.style.opacity = 1;
      indicator.querySelector(".ptr-indicator__text").textContent = "Обновление…";

      var done = function (ok) {
        indicator.querySelector(".ptr-indicator__text").textContent = ok ? "Готово ✓" : "Ошибка";
        setTimeout(function () {
          indicator.classList.remove("is-refreshing");
          indicator.style.transform = "translate(-50%, -60px)";
          indicator.style.opacity = 0;
        }, 700);
      };

      if (firebaseReady && firebaseRef) {
        firebaseRef.once("value").then(function (snap) {
          var raw = snap.val();
          if (raw) data = normalize(raw);
          paintStartScreen();
          render();
          done(true);
        }).catch(function () { done(false); });
      } else {
        paintStartScreen();
        render();
        setTimeout(function () { done(true); }, 400);
      }
    } else {
      indicator.style.transform = "translate(-50%, -60px)";
      indicator.style.opacity = 0;
    }
    startY = 0;
  }, { passive: true });
}

function handleShare() {
  var shareData = {
    title: "Моя копилка",
    text: "Семейная копилка: баллы, задания и цели",
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(function () {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareData.url).then(function () {
      showToast("Ссылка скопирована", "success");
    }).catch(function () {
      showToast("Не удалось скопировать");
    });
  } else {
    showToast("Скопируйте адрес из строки браузера");
  }
}

function initHotkeys() {
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!document.getElementById("searchOverlay").classList.contains("hidden")) {
        e.preventDefault();
        closeSearch();
        return;
      }
      closeModal();
      return;
    }

    var isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    var mod = isMac ? e.metaKey : e.ctrlKey;
    if (!mod) return;

    var key = e.key.toLowerCase();

    if (key === "k") {
      e.preventDefault();
      if (!currentRole) return;
      openSearch();
      return;
    }

    if (!currentRole) return;

    if (key === "1") { e.preventDefault(); returnToStart(); setTimeout(function () { enterCabinet("child"); }, 100); return; }
    if (key === "2") { e.preventDefault(); returnToStart(); setTimeout(function () {
      var inp = document.getElementById("passwordInput");
      openModal("passwordModal");
      if (inp) setTimeout(function () { inp.focus(); }, 150);
    }, 100); return; }

    if (key === "n" && currentRole === "parent") {
      e.preventDefault();
      var b1 = document.getElementById("openChoreModal");
      if (b1) b1.click();
      return;
    }
    if (key === "g" && currentRole === "parent") {
      e.preventDefault();
      var b2 = document.getElementById("openGradeModal");
      if (b2) b2.click();
      return;
    }
    if (key === "t" && currentRole === "parent") {
      e.preventDefault();
      var b3 = document.getElementById("openGoalModal");
      if (b3) b3.click();
      return;
    }
    if (key === "d") {
      e.preventDefault();
      toggleTheme();
      return;
    }
  });
}

function openSearch() {
  var overlay = document.getElementById("searchOverlay");
  var input = document.getElementById("searchInput");
  if (!overlay || !input) return;
  overlay.classList.remove("hidden");
  input.value = "";
  renderSearchResults("");
  setTimeout(function () { input.focus(); }, 50);
}

function closeSearch() {
  var overlay = document.getElementById("searchOverlay");
  var input = document.getElementById("searchInput");
  if (!overlay) return;
  overlay.classList.add("hidden");
  if (input) input.value = "";
  searchState.items = [];
  searchState.activeIndex = -1;
}

function getSearchItems() {
  var items = [];
  var isParent = currentRole === "parent";

  data.chores.forEach(function (c) {
    items.push({
      kind: "chore",
      icon: "📋",
      title: c.title,
      hint: c.description || (c.reward + " " + pluralPoints(c.reward)),
      action: function () {
        if (isParent) {
          var btn = document.querySelector('[data-action="edit-chore"][data-id="' + c.id + '"]');
          if (btn) btn.click();
        } else {
          var btn2 = document.querySelector('[data-action="complete-chore"][data-id="' + c.id + '"]');
          if (btn2) btn2.click();
        }
      },
      search: (c.title + " " + (c.description || "")).toLowerCase()
    });
  });

  data.grades.forEach(function (g) {
    items.push({
      kind: "grade",
      icon: gradeEmoji(g.value),
      title: g.subject + " — " + g.value,
      hint: g.date + (g.payment ? " · " + (g.payment > 0 ? "+" : "") + g.payment + " BYN" : ""),
      action: function () {
        if (isParent) {
          var btn = document.querySelector('[data-action="edit-grade"][data-id="' + g.id + '"]');
          if (btn) btn.click();
        }
      },
      search: (g.subject + " " + g.value).toLowerCase()
    });
  });

  data.goals.forEach(function (g, i) {
    items.push({
      kind: "goal",
      icon: "🎯",
      title: g.title,
      hint: g.price + " " + pluralPoints(g.price),
      action: function () {
        if (isParent) {
          var btn = document.querySelector('[data-action="edit-goal"][data-index="' + i + '"]');
          if (btn) btn.click();
        } else if (data.points >= g.price) {
          claimGoal(i);
        }
      },
      search: g.title.toLowerCase()
    });
  });

  if (isParent) {
    items.push({
      kind: "action", icon: "📋", title: "Новое задание", hint: "Ctrl+N",
      action: function () { var b = document.getElementById("openChoreModal"); if (b) b.click(); },
      search: "новое задание создать добавить chore"
    });
    items.push({
      kind: "action", icon: "🎓", title: "Новая оценка", hint: "Ctrl+G",
      action: function () { var b = document.getElementById("openGradeModal"); if (b) b.click(); },
      search: "новая оценка создать добавить grade"
    });
    items.push({
      kind: "action", icon: "🎯", title: "Новая цель", hint: "Ctrl+T",
      action: function () { var b = document.getElementById("openGoalModal"); if (b) b.click(); },
      search: "новая цель создать добавить goal"
    });
    items.push({
      kind: "action", icon: "📊", title: "Отчёт за неделю", hint: "",
      action: function () { openWeeklyReport(); },
      search: "отчёт неделя статистика report"
    });
    items.push({
      kind: "action", icon: "💰", title: "Управление балансом", hint: "",
      action: function () { openBalanceManageModal(); },
      search: "баланс деньги управление balance"
    });
  }

  items.push({
    kind: "action", icon: "🌙", title: "Переключить тему", hint: "Ctrl+D",
    action: function () { toggleTheme(); },
    search: "тема тёмная светлая theme dark light"
  });

  return items;
}

function renderSearchResults(query) {
  var el = document.getElementById("searchResults");
  if (!el) return;
  var q = String(query || "").trim().toLowerCase();

  var all = getSearchItems();
  var filtered = q ? all.filter(function (item) { return item.search.indexOf(q) >= 0; }) : all;
  filtered = filtered.slice(0, 20);

  searchState.items = filtered;
  searchState.activeIndex = filtered.length ? 0 : -1;

  if (!filtered.length) {
    el.innerHTML = '<div class="search-empty"><span class="search-empty__emoji">🔍</span>Ничего не найдено</div>';
    return;
  }

  var groups = { chore: [], grade: [], goal: [], action: [] };
  filtered.forEach(function (item) {
    if (groups[item.kind]) groups[item.kind].push(item);
  });

  var labels = { chore: "Задания", grade: "Оценки", goal: "Цели", action: "Действия" };
  var globalIdx = 0;
  var html = "";
  ["chore", "grade", "goal", "action"].forEach(function (kind) {
    if (!groups[kind].length) return;
    html += '<span class="search-group__label">' + labels[kind] + '</span>';
    groups[kind].forEach(function (item) {
      var idx = globalIdx++;
      html += '<div class="search-result ' + (idx === 0 ? "is-active" : "") + '" data-idx="' + idx + '">' +
        '<div class="search-result__icon">' + item.icon + '</div>' +
        '<div class="search-result__body">' +
          '<div class="search-result__title">' + escapeHtml(item.title) + '</div>' +
          (item.hint ? '<div class="search-result__hint">' + escapeHtml(item.hint) + '</div>' : '') +
        '</div>' +
        (item.hint && item.hint.indexOf("Ctrl+") === 0 ? '<span class="search-result__kbd">' + item.hint + '</span>' : '') +
      '</div>';
    });
  });
  el.innerHTML = html;
}

function updateSearchActive() {
  var el = document.getElementById("searchResults");
  if (!el) return;
  var items = el.querySelectorAll(".search-result");
  items.forEach(function (it, i) {
    it.classList.toggle("is-active", i === searchState.activeIndex);
  });
  var active = el.querySelector(".search-result.is-active");
  if (active) active.scrollIntoView({ block: "nearest" });
}

function executeSearchItem(idx) {
  var item = searchState.items[idx];
  if (!item) return;
  closeSearch();
  setTimeout(function () { item.action(); }, 120);
}

function initSearch() {
  var overlay = document.getElementById("searchOverlay");
  var input = document.getElementById("searchInput");
  var closeBtn = document.getElementById("searchCloseBtn");
  var results = document.getElementById("searchResults");
  if (!overlay || !input) return;

  input.addEventListener("input", function () {
    renderSearchResults(input.value);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!searchState.items.length) return;
      searchState.activeIndex = (searchState.activeIndex + 1) % searchState.items.length;
      updateSearchActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!searchState.items.length) return;
      searchState.activeIndex = (searchState.activeIndex - 1 + searchState.items.length) % searchState.items.length;
      updateSearchActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      executeSearchItem(searchState.activeIndex);
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeSearch);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeSearch();
  });

  if (results) {
    results.addEventListener("click", function (e) {
      var item = e.target.closest(".search-result");
      if (!item) return;
      var idx = Number(item.dataset.idx);
      if (Number.isInteger(idx)) executeSearchItem(idx);
    });
    results.addEventListener("mousemove", function (e) {
      var item = e.target.closest(".search-result");
      if (!item) return;
      var idx = Number(item.dataset.idx);
      if (Number.isInteger(idx) && idx !== searchState.activeIndex) {
        searchState.activeIndex = idx;
        updateSearchActive();
      }
    });
  }
}

function bindEvents() {
  var childBtn = document.getElementById("childLogin");
  if (childBtn) childBtn.addEventListener("click", function (e) { e.preventDefault(); enterCabinet("child"); });

  var parentBtn = document.getElementById("parentLogin");
  if (parentBtn) {
    parentBtn.addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("passwordForm").reset();
      openModal("passwordModal");
    });
  }

  var passForm = document.getElementById("passwordForm");
  if (passForm) {
    passForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var inp = document.getElementById("passwordInput");
      if (inp.value === PARENT_PASSWORD) { closeModal(); enterCabinet("parent"); }
      else { showToast("Неверный пароль"); inp.value = ""; inp.focus(); }
    });
  }

  var cha = document.getElementById("childHeroAvatar");
  if (cha) cha.addEventListener("click", openProfileModal);

  document.addEventListener("click", function (e) {
    var photoImg = e.target.closest(".chore-photo-thumb");
    if (photoImg) { openPhotoViewer(photoImg.src); return; }
    if (e.target.id === "modalBackdrop") { closeModal(); return; }

    var quickBtn = e.target.closest("[data-quick-amount]");
    if (quickBtn) {
      e.preventDefault();
      var inp = document.getElementById("withdrawAmount");
      if (inp) inp.value = quickBtn.dataset.quickAmount;
      return;
    }

    var quickManage = e.target.closest("[data-quick-manage]");
    if (quickManage) {
      e.preventDefault();
      openQuickManage(quickManage.dataset.quickManage, Number(quickManage.dataset.sign));
      return;
    }

    var avatarBtn = e.target.closest("#avatarGrid [data-avatar]");
    if (avatarBtn) { pickProfileAvatar(avatarBtn.dataset.avatar); return; }

    var dayBtn = e.target.closest("#choreDaysGrid .weekday-btn");
    if (dayBtn) { e.preventDefault(); toggleChoreDay(Number(dayBtn.dataset.day)); return; }

    var bulkBtn = e.target.closest("[data-bulk]");
    if (bulkBtn) { e.preventDefault(); handleBulkAction(bulkBtn.dataset.bulk); return; }

    var btn = e.target.closest("[data-action], #exchangeButton, #openChoreModal, #openGradeModal, #openGoalModal, #suggestGradeButton, #exportButton, #importButton, #weeklyReportButton, #resetPointsButton, #resetBalanceButton, #clearHistoryButton, #resetLevelButton, #editLevelButton, #resetAllButton, #clearNotificationsBtn, #openBalanceManage, #requestWithdrawButton, [data-close-modal]");
    if (!btn) return;

    var id = btn.id;
    var action = btn.dataset.action;
    var dataId = Number(btn.dataset.id);
    var dataIndex = Number(btn.dataset.index);

    if (action === "toggle-theme") return toggleTheme();
    if (action === "share") return handleShare();
    if (action === "open-search") return openSearch();
    if (action === "open-notifications") return openNotificationsModal();
    if (action === "change-cabinet") return returnToStart();
    if (action === "open-advanced") {
      var elGM = document.getElementById("guffyModeSelect");
      if (elGM) elGM.value = data.guffyMode || "active";
      return openModal("advancedModal");
    }

    if (id === "clearNotificationsBtn") return clearNotifications();
    if (id === "weeklyReportButton") return openWeeklyReport();
    if (id === "importButton") {
      var fi = document.getElementById("importFileInput");
      if (fi) fi.click();
      return;
    }
    if (id === "resetPointsButton") return resetPointsOnly();
    if (id === "resetBalanceButton") return resetBalanceOnly();
    if (id === "clearHistoryButton") return clearHistoryOnly();
    if (id === "resetLevelButton") return resetLevelOnly();
    if (id === "editLevelButton") {
      document.getElementById("levelEditValue").value = data.totalEarnedPoints;
      return openModal("levelEditModal");
    }
    if (id === "resetAllButton") return resetEverything();
    if (id === "exchangeButton") return exchangePoints();
    if (id === "requestWithdrawButton") return openWithdrawRequestModal();
    if (id === "openBalanceManage") return openBalanceManageModal();

    if (id === "openChoreModal") {
      document.getElementById("choreForm").reset();
      document.getElementById("choreEditId").value = "";
      document.getElementById("choreReward").value = 5;
      setMaxPerDaySelect("1");
      document.getElementById("choreRepeat").value = "daily";
      editingChoreDays = [];
      renderChoreDaysGrid();
      syncChoreDaysVisibility();
      setChoreTemplatesVisible(true);
      document.getElementById("choreModalTitle").textContent = "Новое задание";
      return openModal("choreModal");
    }
    if (id === "openGradeModal") {
      document.getElementById("gradeForm").reset();
      document.getElementById("gradeEditId").value = "";
      document.getElementById("gradeModalTitle").textContent = "Новая оценка";
      document.getElementById("gradeSubjectSelect").value = "Математика";
      document.getElementById("gradeCustomSubjectWrapper").classList.add("hidden");
      updateGradeHint("Математика");
      return openModal("gradeModal");
    }
    if (id === "openGoalModal") {
      if (data.goals.length >= MAX_GOALS) { showToast("Максимум " + MAX_GOALS + " целей"); return; }
      document.getElementById("goalForm").reset();
      document.getElementById("goalEditIndex").value = "";
      document.getElementById("goalDeadline").value = "";
      document.getElementById("goalImportant").checked = false;
      document.getElementById("goalModalTitle").textContent = "Новая цель";
      return openModal("goalModal");
    }
    if (id === "suggestGradeButton") {
      document.getElementById("suggestGradeForm").reset();
      document.getElementById("suggestSubjectSelect").value = "Математика";
      document.getElementById("suggestCustomSubjectWrapper").classList.add("hidden");
      return openModal("suggestGradeModal");
    }
    if (id === "exportButton") {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = "family-balance-backup.json"; a.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (btn.hasAttribute("data-close-modal")) return closeModal();

    if (action === "complete-chore") return openPhotoModal(dataId);
    if (action === "delete-chore") return deleteChore(dataId);
    if (action === "duplicate-chore") return duplicateChore(dataId);
    if (action === "edit-chore") {
      var ch = data.chores.find(function (x) { return x.id === dataId; });
      if (!ch) return;
      document.getElementById("choreEditId").value = ch.id;
      document.getElementById("choreTitle").value = ch.title;
      document.getElementById("choreDescription").value = ch.description;
      document.getElementById("choreReward").value = ch.reward;
      setMaxPerDaySelect(ch.maxPerDay || 1);
      document.getElementById("choreRepeat").value = ch.repeat || "daily";
      editingChoreDays = Array.isArray(ch.days) ? ch.days.slice() : [];
      renderChoreDaysGrid();
      syncChoreDaysVisibility();
      setChoreTemplatesVisible(false);
      document.getElementById("choreModalTitle").textContent = "Редактировать задание";
      return openModal("choreModal");
    }
    if (action === "approve-chore") return openCommentModal(dataId, "approve");
    if (action === "reject-chore") return openCommentModal(dataId, "reject");
    if (action === "approve-grade") return approveGrade(dataId);
    if (action === "reject-grade") return rejectGrade(dataId);
    if (action === "edit-grade") return openEditGrade(dataId);
    if (action === "delete-grade") return deleteGrade(dataId);
    if (action === "approve-withdraw") return approveWithdraw(dataId);
    if (action === "reject-withdraw") return rejectWithdraw(dataId);
    if (action === "claim-goal") return claimGoal(dataIndex);
    if (action === "delete-goal") return deleteGoal(dataIndex);
    if (action === "edit-goal") {
      var g = data.goals[dataIndex];
      if (!g) return;
      document.getElementById("goalEditIndex").value = String(dataIndex);
      document.getElementById("goalTitle").value = g.title;
      document.getElementById("goalPrice").value = g.price;
      document.getElementById("goalDeadline").value = g.deadline || "";
      document.getElementById("goalImportant").checked = !!g.important;
      document.getElementById("goalModalTitle").textContent = "Редактировать цель";
      return openModal("goalModal");
    }
  });

  document.addEventListener("change", function (e) {
    var pendingCb = e.target.closest("[data-pending-id]");
    if (pendingCb) {
      togglePendingSelection(Number(pendingCb.dataset.pendingId));
      return;
    }
    if (e.target.id === "gradeFilterSubject") {
      gradeFilter.subject = e.target.value;
      renderGrades(currentRole === "parent");
      return;
    }
    if (e.target.id === "gradeFilterValue") {
      gradeFilter.value = e.target.value;
      renderGrades(currentRole === "parent");
      return;
    }
    if (e.target.id === "gradeFilterPeriod") {
      gradeFilter.period = e.target.value;
      renderGrades(currentRole === "parent");
      return;
    }
  });

  var elRepeat = document.getElementById("choreRepeat");
  if (elRepeat) elRepeat.addEventListener("change", syncChoreDaysVisibility);

  var elTemplateSelect = document.getElementById("choreTemplateSelect");
  if (elTemplateSelect) {
    elTemplateSelect.addEventListener("change", function (e) {
      var val = e.target.value;
      if (val === "") return;
      var idx = Number(val);
      if (Number.isInteger(idx) && idx >= 0) applyChoreTemplate(idx);
    });
  }

  var elGradeSel = document.getElementById("gradeSubjectSelect");
  if (elGradeSel) {
    elGradeSel.addEventListener("change", function (e) {
      var w = document.getElementById("gradeCustomSubjectWrapper");
      if (e.target.value === "__custom__") w.classList.remove("hidden");
      else w.classList.add("hidden");
      updateGradeHint(e.target.value);
    });
  }
  var elSuggestSel = document.getElementById("suggestSubjectSelect");
  if (elSuggestSel) {
    elSuggestSel.addEventListener("change", function (e) {
      var w = document.getElementById("suggestCustomSubjectWrapper");
      if (e.target.value === "__custom__") w.classList.remove("hidden");
      else w.classList.add("hidden");
    });
  }
  var elPhoto = document.getElementById("photoFileInput");
  if (elPhoto) elPhoto.addEventListener("change", handlePhotoFileChange);

  var elImport = document.getElementById("importFileInput");
  if (elImport) {
    elImport.addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      importDataFromJson(f);
      e.target.value = "";
    });
  }

  var elGuffyMode = document.getElementById("guffyModeSelect");
  if (elGuffyMode) {
    elGuffyMode.addEventListener("change", function (e) {
      var v = e.target.value;
      if (["active", "quiet", "off"].indexOf(v) < 0) return;
      data.guffyMode = v;
      saveData();
      closeModal();
      var msg = v === "active" ? "Гуфи активен 🐙"
              : v === "quiet" ? "Гуфи теперь тихий"
              : "Гуфи выключен";
      showToast(msg);
    });
  }

  ["profileName", "profileAge", "profileClass", "profileBirthday"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", renderProfilePreview);
  });

  var profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("profileName").value.trim().slice(0, 20);
      var raw = document.getElementById("profileAge").value.trim();
      var cls = document.getElementById("profileClass").value.trim().slice(0, 6);
      var bd = document.getElementById("profileBirthday").value || "";
      var age = "";
      if (raw) {
        var a = toInt(raw);
        if (Number.isInteger(a) && a > 0 && a <= 120) age = String(a);
      }
      data.profile = { name: name, age: age, className: cls, birthday: bd };
      data.avatar = pendingProfileAvatar;
      closeModal();
      saveData();
      showToast(name ? "Привет, " + name + "!" : "Профиль сохранён", "success");
    });
  }

  var choreForm = document.getElementById("choreForm");
  if (choreForm) {
    choreForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var id = Number(document.getElementById("choreEditId").value);
      var title = document.getElementById("choreTitle").value.trim();
      var desc = document.getElementById("choreDescription").value.trim();
      var reward = toInt(document.getElementById("choreReward").value);
      var repeat = document.getElementById("choreRepeat").value;
      var days = repeat === "custom" ? editingChoreDays.slice() : [];
      var mpd = toInt(document.getElementById("choreMaxPerDay").value);
      if (!Number.isInteger(mpd) || mpd < 1) mpd = 1;

      if (!title) return showToast("Введите название");
      if (!isNonNegativeInt(reward)) return showToast("Баллы — целое ≥ 0");
      if (repeat === "custom" && days.length === 0) return showToast("Отметь день");

      if (id) {
        var ch = data.chores.find(function (x) { return x.id === id; });
        if (ch) {
          ch.title = title; ch.description = desc; ch.reward = reward;
          ch.repeat = repeat; ch.days = days; ch.maxPerDay = mpd;
        }
      } else {
        data.chores.push({
          id: uniqueId(), title: title, description: desc,
          reward: reward, repeat: repeat, days: days, maxPerDay: mpd
        });
      }
      closeModal();
      saveData();
      showToast("Задание сохранено");
    });
  }

  var gradeForm = document.getElementById("gradeForm");
  if (gradeForm) {
    gradeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var editId = Number(document.getElementById("gradeEditId").value) || 0;
      var sub = getSubjectValue("#gradeSubjectSelect", "#gradeSubjectCustom");
      var v = toInt(document.getElementById("gradeValue").value);
      if (!sub) return showToast("Выберите предмет");
      if (!Number.isInteger(v) || v < 2 || v > 10) return showToast("Оценка 2–10");
      var newPay = paymentForGrade(v, sub);
      var newPenalty = penaltyPointsForGrade(v);
      if (editId) {
        var g = data.grades.find(function (x) { return x.id === editId; });
        if (!g) { closeModal(); return showToast("Не найдена"); }
        var oldPenalty = penaltyPointsForGrade(g.value);
        var diff = newPay - g.payment;
        var penaltyDiff = newPenalty - oldPenalty;
        g.subject = sub; g.value = v; g.payment = newPay;
        if (diff) addTransaction("Изменение оценки: " + sub, { byn: diff });
        if (penaltyDiff) addTransaction("Изменение штрафа за оценку: " + sub, { points: penaltyDiff, affectLevel: true });
        closeModal();
        saveData();
        if (penaltyDiff) { checkLevelUp(); checkGoalsReady(); }
        if (diff > 0) showToast("+" + diff + " BYN", "success");
        else if (diff < 0) showToast("−" + Math.abs(diff) + " BYN");
        else if (penaltyDiff) showToast((penaltyDiff > 0 ? "+" : "−") + Math.abs(penaltyDiff) + " " + pluralPoints(Math.abs(penaltyDiff)));
        else showToast("Обновлено");
      } else {
        data.grades.unshift({ id: uniqueId(), subject: sub, value: v, payment: newPay, date: today() });
        if (newPay) addTransaction("Оценка " + v + ": " + sub, { byn: newPay });
        if (newPenalty) addTransaction("Штраф за оценку " + v + ": " + sub, { points: newPenalty, affectLevel: true });
        closeModal();
        saveData();
        if (newPenalty) { checkLevelUp(); checkGoalsReady(); }
        if (newPay > 0) showToast("Начислено " + newPay + " BYN", "success");
        else if (newPay < 0) showToast("Штраф " + Math.abs(newPay) + " BYN");
        else if (newPenalty) showToast("Штраф " + Math.abs(newPenalty) + " " + pluralPoints(Math.abs(newPenalty)));
        else showToast("Оценка добавлена");
      }
    });
  }

  var suggestForm = document.getElementById("suggestGradeForm");
  if (suggestForm) {
    suggestForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var sub = getSubjectValue("#suggestSubjectSelect", "#suggestSubjectCustom");
      var v = toInt(document.getElementById("suggestValue").value);
      if (!sub) return showToast("Выберите предмет");
      if (!Number.isInteger(v) || v < 2 || v > 10) return showToast("Оценка 2–10");
      data.gradeRequests.push({ id: uniqueId(), subject: sub, value: v, date: today() });
      addNotification("parent", "Предложение оценки: «" + sub + " — " + v + "»", "🎓");
      closeModal();
      saveData();
      showToast("Отправлено родителю");
    });
  }

  var goalForm = document.getElementById("goalForm");
  if (goalForm) {
    goalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var raw = document.getElementById("goalEditIndex").value;
      var t = document.getElementById("goalTitle").value.trim();
      var pr = toInt(document.getElementById("goalPrice").value);
      var dl = document.getElementById("goalDeadline").value || "";
      var imp = !!document.getElementById("goalImportant").checked;
      if (!t || !Number.isInteger(pr) || pr < 1) return showToast("Проверьте данные");
      if (raw !== "") {
        var g = data.goals[Number(raw)];
        if (g) {
          g.title = t; g.price = pr; g.deadline = dl;
          g.important = imp; g.notifiedReady = false;
        }
      } else {
        if (data.goals.length >= MAX_GOALS) { closeModal(); return showToast("Максимум " + MAX_GOALS + " целей"); }
        data.goals.push({ title: t, price: pr, deadline: dl, important: imp, notifiedReady: false });
      }
      closeModal();
      saveData();
      checkGoalsReady();
      saveData();
      showToast("Цель сохранена");
    });
  }

  var commentForm = document.getElementById("commentForm");
  if (commentForm) {
    commentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var id = Number(document.getElementById("commentCompletionId").value);
      var mode = document.getElementById("commentMode").value || "approve";
      var c = document.getElementById("commentText").value.trim();
      closeModal();
      if (mode === "reject") rejectChoreWithComment(id, c);
      else approveChoreWithComment(id, c);
    });
  }

  var levelForm = document.getElementById("levelEditForm");
  if (levelForm) {
    levelForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = toInt(document.getElementById("levelEditValue").value);
      if (!Number.isInteger(v) || v < 0) return showToast("Число ≥ 0");
      data.totalEarnedPoints = v;
      data.lastLevel = getLevel(v).name;
      saveData();
      closeModal();
      showToast("Обновлено");
    });
  }

  var photoForm = document.getElementById("photoForm");
  if (photoForm) {
    photoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitPhotoForm();
    });
  }

  var withdrawForm = document.getElementById("withdrawRequestForm");
  if (withdrawForm) {
    withdrawForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitWithdrawRequest();
    });
  }

  var balanceForm = document.getElementById("balanceManageForm");
  if (balanceForm) {
    balanceForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitBalanceManage();
    });
  }

  var approveWithdrawForm = document.getElementById("approveWithdrawForm");
  if (approveWithdrawForm) {
    approveWithdrawForm.addEventListener("submit", function (e) {
      e.preventDefault();
      confirmApproveWithdraw();
    });
  }

  var elBmType = document.getElementById("balanceManageType");
  if (elBmType) elBmType.addEventListener("change", updateBalanceManageHint);

  var elBmSign = document.getElementById("balanceManageSign");
  if (elBmSign) elBmSign.addEventListener("change", updateBalanceManageHint);

  bindStartScreenTap();
}