"use strict";

/* ============================================================
   Голосовой ввод: кнопки в шапке секций → слушаем → открываем модалку
   Web Speech API — работает в Chrome, Edge, Safari (iOS 14.5+)
   ============================================================ */

var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var voiceRecognition = null;
var voiceActiveButton = null;

var NUM_WORDS = {
  "ноль": 0, "один": 1, "одна": 1, "одно": 1,
  "два": 2, "две": 2, "три": 3, "четыре": 4, "пять": 5,
  "шесть": 6, "семь": 7, "восемь": 8, "девять": 9, "десять": 10
};

function voiceSupported() {
  return !!SpeechRecognition;
}

function createRecognition() {
  if (!SpeechRecognition) return null;
  var r = new SpeechRecognition();
  r.lang = "ru-RU";
  r.continuous = false;
  r.interimResults = false;
  r.maxAlternatives = 3;
  return r;
}

/* ---------- Нормализация ---------- */

function normalizeVoiceText(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[.,!?;:—–]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNumber(text) {
  var m = text.match(/\b([1-9]|10)\b/);
  if (m) return Number(m[1]);
  var words = text.split(" ");
  for (var i = 0; i < words.length; i++) {
    if (NUM_WORDS[words[i]] !== undefined) return NUM_WORDS[words[i]];
  }
  return null;
}

function extractSubject(text) {
  var t = normalizeVoiceText(text);
  for (var i = 0; i < KNOWN_SUBJECTS.length; i++) {
    var sub = KNOWN_SUBJECTS[i].toLowerCase().replace(/ё/g, "е");
    if (t.indexOf(sub) >= 0) return KNOWN_SUBJECTS[i];
  }
  if (/\bматем/.test(t)) return "Математика";
  if (/\bрусск/.test(t)) return "Русский язык";
  if (/\bбелорус/.test(t)) return "Белорусский язык";
  if (/\bлит/.test(t)) return "Литературное чтение";
  if (/\bокруж|\bмир\b/.test(t)) return "Окружающий мир";
  if (/\bангл/.test(t)) return "Английский язык";
  if (/\bтруд/.test(t)) return "Трудовое обучение";
  if (/\bизо\b|\bрис/.test(t)) return "Изобразительное искусство";
  if (/\bфиз|\bспорт/.test(t)) return "Физическая культура";
  return null;
}

function extractRepeat(text) {
  var t = normalizeVoiceText(text);
  if (/каждый\s+день|ежедневно|ежедневн/.test(t)) return "daily";
  if (/по\s+будням|будни|будн/.test(t)) return "weekdays";
  if (/выходн/.test(t)) return "weekend";
  if (/один\s+раз|однократн|одноразов/.test(t)) return "once";
  return null;
}

function extractReward(text) {
  var t = normalizeVoiceText(text);
  var m = t.match(/(\d+)\s*(балл|балов|очк)/);
  if (m) return Number(m[1]);
  var words = t.split(" ");
  for (var i = 0; i < words.length - 1; i++) {
    var n = NUM_WORDS[words[i]];
    if (n !== undefined && /балл|балов|очк/.test(words[i + 1])) return n;
  }
  return null;
}

/* ---------- Парсеры ---------- */

function parseChoreText(text) {
  var t = normalizeVoiceText(text);
  if (!t) return null;

  var reward = extractReward(t);
  var repeat = extractRepeat(t);

  var title = t
    .replace(/\d+\s*(балл|балов|очк)\w*/g, "")
    .replace(/(один|одна|одно|два|две|три|четыре|пять|шесть|семь|восемь|девять|десять)\s*(балл|балов|очк)\w*/g, "")
    .replace(/каждый\s+день|ежедневно|ежедневн\w*|по\s+будням|будни\w*|выходн\w*|один\s+раз|однократн\w*|одноразов\w*/g, "")
    .replace(/\bна\s+\d+\b/g, "")
    .replace(/^(добавь|создай|запиши|новое|новая|новый)\s+(задание|задачу|задача)\s*/g, "")
    .replace(/^(задание|задачу|задача)\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (title) title = title.charAt(0).toUpperCase() + title.slice(1);

  return {
    title: title || null,
    reward: reward,
    repeat: repeat
  };
}

function parseGradeText(text) {
  var t = normalizeVoiceText(text);
  if (!t) return null;

  var subject = extractSubject(t);
  var searchIn = subject ? t.replace(subject.toLowerCase().replace(/ё/g, "е"), "") : t;
  var value = extractNumber(searchIn);
  if (value !== null && (value < 2 || value > 10)) value = null;

  return {
    subject: subject,
    value: value
  };
}

/* ---------- Применение к формам ---------- */

function applyVoiceToChoreForm(parsed, rawText) {
  if (!parsed) return;
  if (parsed.title) document.getElementById("choreTitle").value = parsed.title;
  if (parsed.reward !== null && parsed.reward !== undefined) {
    document.getElementById("choreReward").value = parsed.reward;
  }
  if (parsed.repeat) {
    document.getElementById("choreRepeat").value = parsed.repeat;
    if (typeof syncChoreDaysVisibility === "function") syncChoreDaysVisibility();
  }
  showToast("🎤 " + rawText, "success");
}

function applyVoiceToGradeForm(parsed, rawText) {
  if (!parsed) return;
  if (parsed.subject) {
    setSubjectSelect("#gradeSubjectSelect", "#gradeSubjectCustom", "#gradeCustomSubjectWrapper", parsed.subject);
    if (typeof updateGradeHint === "function") updateGradeHint(parsed.subject);
  }
  if (parsed.value !== null && parsed.value !== undefined) {
    document.getElementById("gradeValue").value = parsed.value;
  }
  showToast("🎤 " + rawText, "success");
}

/* ---------- Управление распознаванием ---------- */

function stopVoice() {
  if (voiceRecognition) {
    try { voiceRecognition.abort(); } catch (e) {}
    voiceRecognition = null;
  }
  if (voiceActiveButton) {
    voiceActiveButton.classList.remove("is-listening");
    voiceActiveButton = null;
  }
}

function startVoice(btn, onResult) {
  if (!voiceSupported()) {
    showToast("Голосовой ввод не поддерживается в этом браузере");
    return;
  }

  if (voiceRecognition && voiceActiveButton === btn) {
    stopVoice();
    return;
  }

  stopVoice();

  voiceRecognition = createRecognition();
  if (!voiceRecognition) return;

  voiceActiveButton = btn;
  btn.classList.add("is-listening");
  showToast("🎤 Слушаю...");

  voiceRecognition.onresult = function (e) {
    var text = e.results[0][0].transcript || "";
    stopVoice();
    if (onResult) onResult(text);
  };

  voiceRecognition.onerror = function (e) {
    var msg;
    if (e.error === "no-speech") msg = "🎤 Не расслышал, попробуй ещё";
    else if (e.error === "not-allowed" || e.error === "service-not-allowed") msg = "Разреши доступ к микрофону";
    else if (e.error === "audio-capture") msg = "Микрофон недоступен";
    else if (e.error === "aborted") msg = "";
    else msg = "Ошибка голосового ввода";
    if (msg) showToast(msg);
    stopVoice();
  };

  voiceRecognition.onend = function () {
    stopVoice();
  };

  try {
    voiceRecognition.start();
  } catch (err) {
    showToast("Не удалось запустить микрофон");
    stopVoice();
  }
}

/* ---------- Создание кнопки в шапке ---------- */

function createVoiceHeaderButton(title, onResult) {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "button button--light voice-btn-inline parent-only";
  btn.setAttribute("aria-label", title);
  btn.title = title;
  btn.innerHTML = '<span class="voice-btn__icon">🎤</span>';
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    startVoice(btn, onResult);
  });
  return btn;
}

function attachVoiceButtonBefore(targetId, title, onResult) {
  var target = document.getElementById(targetId);
  if (!target || !target.parentNode) return;
  var btn = createVoiceHeaderButton(title, onResult);
  target.parentNode.insertBefore(btn, target);
}

/* ---------- Инициализация ---------- */

function initVoiceInput() {
  if (!voiceSupported()) {
    console.log("Голосовой ввод не поддерживается этим браузером");
    return;
  }

  // Кнопка 🎤 рядом с "+ Добавить" в секции «Задания на сегодня»
  attachVoiceButtonBefore(
    "openChoreModal",
    "Сказать задание голосом",
    function (text) {
      var openBtn = document.getElementById("openChoreModal");
      if (openBtn) openBtn.click();
      setTimeout(function () {
        applyVoiceToChoreForm(parseChoreText(text), text);
      }, 180);
    }
  );

  // Кнопка 🎤 рядом с "+ Добавить" в секции «Оценки»
  attachVoiceButtonBefore(
    "openGradeModal",
    "Сказать оценку голосом",
    function (text) {
      var openBtn = document.getElementById("openGradeModal");
      if (openBtn) openBtn.click();
      setTimeout(function () {
        applyVoiceToGradeForm(parseGradeText(text), text);
      }, 180);
    }
  );

  console.log("Голосовой ввод активирован");
}