"use strict";

/* ============================================================
   Hanko — вход родителя через биометрию
   ============================================================ */

import { register } from "https://esm.run/@teamhanko/hanko-elements";
import { en } from "https://esm.run/@teamhanko/hanko-elements/i18n/en";

const HANKO_EMAIL_KEY = "hanko_parent_email";

en.labels.email = "Email";
en.labels.continue = "Продолжить";
en.labels.or = "или";
en.labels.signInPasskey = "Войти по Face ID / отпечатку";
en.labels.dontHaveAnAccount = "Нет аккаунта?";
en.labels.signUp = "Зарегистрироваться";
en.labels.back = "Назад";
en.headlines.signIn = "Вход для родителя";

let hankoInstance = null;

try {
  const { hanko } = await register(HANKO_API_URL, { translations: { en } });
  hankoInstance = hanko;

  hanko.onSessionCreated(() => {
    if (typeof closeModal === "function") closeModal();
    if (typeof enterCabinet === "function") enterCabinet("parent");
  });

  hanko.onSessionExpired(() => {
    if (currentRole === "parent" && typeof returnToStart === "function") returnToStart();
  });

  window.__hanko = hanko;
  window.__hankoReady = true;
  if (typeof log === "function") log("Hanko готов");
} catch (err) {
  window.__hankoReady = false;
  if (typeof logWarn === "function") logWarn("Hanko не загрузился:", err);
}

/* ============================================================
   Главная функция, которую вызывает ui.js
   ============================================================ */
window.showHankoAuth = function () {
  const container = document.getElementById("hankoAuthContainer");
  if (!container) return false;

  if (!window.__hankoReady) {
    container.innerHTML = '<p class="modal-hint">Hanko не загрузился. Обновите страницу.</p>';
    return false;
  }

  const savedEmail = localStorage.getItem(HANKO_EMAIL_KEY);

  if (savedEmail) {
    // Устройство уже привязано к родителю — сразу биометрия
    showBiometricButton(container, savedEmail);
  } else if (typeof PARENT_ACCOUNTS !== "undefined" && PARENT_ACCOUNTS.length) {
    // Первый раз на этом устройстве — показываем выбор "Папа / Мама"
    showParentChooser(container);
  } else {
    // Фолбэк: если список пуст — обычная форма Hanko
    showHankoForm(container, null);
  }
  return true;
};

/* ============================================================
   Первый вход: выбор родителя (один раз на устройстве)
   ============================================================ */
function showParentChooser(container) {
  var html = '<div style="text-align:center; padding:8px 0;">' +
    '<p style="font-size:13px; color:#8B7DA5; margin:0 0 14px;">Кто будет входить с этого устройства?</p>';

  PARENT_ACCOUNTS.forEach(function (acc, i) {
    var safeLabel = String(acc.label || ("Родитель " + (i + 1))).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
    html += '<button type="button" data-parent-idx="' + i + '" style="' +
      'width:100%; min-height:48px; padding:12px 20px; margin-bottom:10px; border:0; border-radius:14px; ' +
      'background:linear-gradient(135deg,#8B5CF6,#7C3AED); color:#FFF; font-size:15px; font-weight:700; ' +
      'font-family:Nunito,sans-serif; cursor:pointer; box-shadow:0 6px 18px rgba(139,92,246,.35);">' +
      safeLabel +
    '</button>';
  });

  html += '<p style="font-size:11px; color:#A89BB0; margin:8px 0 0;">Выбор запомнится на этом устройстве.</p></div>';

  container.innerHTML = html;

  container.querySelectorAll("[data-parent-idx]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var idx = Number(btn.dataset.parentIdx);
      var acc = PARENT_ACCOUNTS[idx];
      if (!acc || !acc.email) return;

      // Сохраняем email — теперь это устройство привязано к этому родителю
      localStorage.setItem(HANKO_EMAIL_KEY, acc.email);

      // Сразу запускаем биометрию
      triggerPasskeyLogin(container, acc.email);
    });
  });
}

/* ============================================================
   Обычная форма Hanko (фолбэк)
   ============================================================ */
function showHankoForm(container, email) {
  container.innerHTML = "";
  const el = document.createElement("hanko-auth");
  el.setAttribute("lang", "en");
  el.setAttribute("shadow", "false");
  if (email) el.setAttribute("prefilled-email", email);
  container.appendChild(el);
}

/* ============================================================
   Кнопка биометрии (устройство уже привязано)
   ============================================================ */
function showBiometricButton(container, email) {
  var safeEmail = String(email).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });

  container.innerHTML =
    '<div style="text-align:center; padding:8px 0;">' +
      '<p style="font-size:13px; color:#8B7DA5; margin:0 0 14px;">Вход для <strong>' + safeEmail + '</strong></p>' +
      '<button id="hankoBioBtn" type="button" style="' +
        'width:100%; min-height:52px; padding:14px 20px; border:0; border-radius:14px; ' +
        'background:linear-gradient(135deg,#8B5CF6,#7C3AED); color:#FFF; font-size:16px; font-weight:700; ' +
        'font-family:Nunito,sans-serif; cursor:pointer; box-shadow:0 6px 18px rgba(139,92,246,.35);">' +
        '👆 Войти по Face ID / отпечатку' +
      '</button>' +
      '<button id="hankoSwitchBtn" type="button" style="' +
        'width:100%; margin-top:12px; padding:10px; border:0; background:transparent; ' +
        'color:#8B7DA5; font-size:12px; font-weight:600; cursor:pointer; text-decoration:underline;">' +
        'Сменить родителя на этом устройстве' +
      '</button>' +
    '</div>';

  document.getElementById("hankoBioBtn").addEventListener("click", function () {
    triggerPasskeyLogin(container, email);
  });
  document.getElementById("hankoSwitchBtn").addEventListener("click", function () {
    localStorage.removeItem(HANKO_EMAIL_KEY);
    showParentChooser(container);
  });
}

/* ============================================================
   Запуск passkey через Hanko
   ============================================================ */
function triggerPasskeyLogin(container, email) {
  container.innerHTML = '<p class="modal-hint" style="text-align:center;">Запрашиваю биометрию…</p>';

  const el = document.createElement("hanko-auth");
  el.setAttribute("lang", "en");
  el.setAttribute("shadow", "false");
  el.setAttribute("prefilled-email", email);
  container.appendChild(el);

  var tries = 0;
  var maxTries = 40;
  var interval = setInterval(function () {
    tries++;
    var allButtons = container.querySelectorAll("button");
    var target = null;
    for (var i = 0; i < allButtons.length; i++) {
      var txt = (allButtons[i].textContent || "").toLowerCase();
      if (txt.indexOf("passkey") >= 0 || txt.indexOf("face id") >= 0 || txt.indexOf("отпечат") >= 0) {
        target = allButtons[i];
        break;
      }
    }
    if (target) {
      clearInterval(interval);
      target.click();
    } else if (tries >= maxTries) {
      clearInterval(interval);
      showHankoForm(container, email);
    }
  }, 100);
}