"use strict";

/* ============================================================
   Hanko — инициализация и вход родителя
   ============================================================ */

import { register } from "https://esm.run/@teamhanko/hanko-elements";
import { en } from "https://esm.run/@teamhanko/hanko-elements/i18n/en";

// Ключ для хранения email в localStorage
const HANKO_EMAIL_KEY = "hanko_parent_email";

// Переопределяем английские надписи на русские
en.labels.email = "Email";
en.labels.continue = "Продолжить";
en.labels.or = "или";
en.labels.signInPasskey = "Войти по Face ID / отпечатку";
en.labels.dontHaveAnAccount = "Нет аккаунта?";
en.labels.signUp = "Зарегистрироваться";
en.labels.back = "Назад";
en.labels.error = "Ошибка";
en.labels.passkeyLogin = "Войти по passkey";
en.labels.passkeySet = "Создать passkey";
en.headlines.signIn = "Вход для родителя";
en.headlines.signUp = "Регистрация родителя";

let hankoInstance = null;

// Регистрация Hanko с нашим API URL
try {
  const { hanko } = await register(HANKO_API_URL, { translations: { en } });
  hankoInstance = hanko;

  hanko.onSessionCreated(() => {
    try {
      if (hanko.user && typeof hanko.user.getCurrent === "function") {
        hanko.user.getCurrent().then(function (user) {
          if (user && user.email) {
            localStorage.setItem(HANKO_EMAIL_KEY, user.email);
          }
        }).catch(function () {});
      }
    } catch (e) {}

    if (typeof closeModal === "function") closeModal();
    if (typeof enterCabinet === "function") enterCabinet("parent");
  });

  hanko.onSessionExpired(() => {
    if (currentRole === "parent" && typeof returnToStart === "function") {
      returnToStart();
    }
  });

  window.__hanko = hanko;
  window.__hankoReady = true;
  if (typeof log === "function") log("Hanko готов");
} catch (err) {
  window.__hankoReady = false;
  if (typeof logWarn === "function") logWarn("Hanko не загрузился:", err);
}

// Главная функция, которую вызывает ui.js
window.showHankoAuth = function () {
  const container = document.getElementById("hankoAuthContainer");
  if (!container) return false;

  if (!window.__hankoReady) {
    container.innerHTML = '<p class="modal-hint">Не удалось загрузить Hanko. Проверьте интернет и обновите страницу.</p>';
    return false;
  }

  const savedEmail = localStorage.getItem(HANKO_EMAIL_KEY);

  // Если email уже сохранён — показываем сразу кнопку биометрии,
  // без формы email. Если нет — показываем форму Hanko.
  if (savedEmail) {
    showBiometricButton(container, savedEmail);
  } else {
    showHankoForm(container, null);
  }
  return true;
};

// Показать форму Hanko (первый вход, email ещё не сохранён)
function showHankoForm(container, savedEmail) {
  container.innerHTML = "";
  const el = document.createElement("hanko-auth");
  el.setAttribute("lang", "en");
  if (savedEmail) el.setAttribute("prefilled-email", savedEmail);
  container.appendChild(el);
}

// Показать кнопку «Войти по Face ID / отпечатку» (email уже известен)
function showBiometricButton(container, email) {
  container.innerHTML =
    '<div style="text-align:center; padding: 8px 0;">' +
      '<p style="font-size:13px; color:#8B7DA5; margin:0 0 12px;">Вход для <strong>' + escapeHtml(email) + '</strong></p>' +
      '<button id="hankoBiometricBtn" type="button" ' +
        'style="width:100%; min-height:48px; padding:12px 20px; border:0; border-radius:14px; ' +
        'background: linear-gradient(135deg,#8B5CF6,#7C3AED); color:#FFF; font-size:15px; font-weight:700; ' +
        'font-family: Nunito, sans-serif; cursor:pointer; box-shadow: 0 6px 18px rgba(139,92,246,.35);">' +
        '👆 Войти по Face ID / отпечатку' +
      '</button>' +
      '<button id="hankoOtherAccountBtn" type="button" ' +
        'style="width:100%; margin-top:10px; padding:10px; border:0; background:transparent; ' +
        'color:#8B7DA5; font-size:12px; font-weight:600; cursor:pointer; text-decoration:underline;">' +
        'Войти под другим аккаунтом' +
      '</button>' +
    '</div>';

  var bio = document.getElementById("hankoBiometricBtn");
  if (bio) {
    bio.addEventListener("click", function () {
      startBiometricLogin(email);
    });
  }

  var other = document.getElementById("hankoOtherAccountBtn");
  if (other) {
    other.addEventListener("click", function () {
      localStorage.removeItem(HANKO_EMAIL_KEY);
      showHankoForm(container, null);
    });
  }
}

// Запуск WebAuthn через Hanko
function startBiometricLogin(email) {
  // Используем <hanko-auth> с prefilled email и программно кликаем по кнопке passkey
  const container = document.getElementById("hankoAuthContainer");
  if (!container) return;

  container.innerHTML = '<p class="modal-hint" style="text-align:center;">Запрашиваю биометрию…</p>';

  const el = document.createElement("hanko-auth");
  el.setAttribute("lang", "en");
  el.setAttribute("prefilled-email", email);
  container.appendChild(el);

  // Даём Hanko секунду на инициализацию, затем ищем и кликаем кнопку passkey
  var tries = 0;
  var maxTries = 30; // ~3 секунды
  var interval = setInterval(function () {
    tries++;
    var btn = container.querySelector('button[data-testid="passkey-login-button"]') ||
              container.querySelector('[data-testid="passkey-login-button"]');
    if (!btn) {
      // Пробуем найти по тексту
      var buttons = container.querySelectorAll("button");
      for (var i = 0; i < buttons.length; i++) {
        var txt = (buttons[i].textContent || "").toLowerCase();
        if (txt.indexOf("passkey") >= 0 || txt.indexOf("face id") >= 0 || txt.indexOf("отпечат") >= 0) {
          btn = buttons[i];
          break;
        }
      }
    }
    if (btn) {
      clearInterval(interval);
      btn.click();
    } else if (tries >= maxTries) {
      clearInterval(interval);
      // Не нашли — откатываемся к обычной форме
      showHankoForm(container, email);
    }
  }, 100);
}

// Утилита escapeHtml — на случай, если она ещё не определена
function escapeHtml(str) {
  if (typeof window.escapeHtml === "function") return window.escapeHtml(str);
  return String(str == null ? "" : str).replace(/[&<>'"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c];
  });
}