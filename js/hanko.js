"use strict";

/* ============================================================
   Hanko — вход родителя через биометрию
   ============================================================ */

import { register } from "https://esm.run/@teamhanko/hanko-elements";
import { en } from "https://esm.run/@teamhanko/hanko-elements/i18n/en";

const HANKO_EMAIL_KEY = "hanko_parent_email";
const HANKO_USERID_KEY = "hanko_parent_userid";

en.labels.email = "Email";
en.labels.continue = "Продолжить";
en.labels.or = "или";
en.labels.signInPasskey = "Войти по Face ID / отпечатку";
en.labels.dontHaveAnAccount = "Нет аккаунта?";
en.labels.signUp = "Зарегистрироваться";
en.labels.back = "Назад";
en.headlines.signIn = "Вход для родителя";

let hankoInstance = null;

/* Сохраняет userId и email залогиненного пользователя */
async function saveCurrentUser() {
  try {
    if (!hankoInstance || !hankoInstance.user) return;
    var user = await hankoInstance.user.getCurrent();
    if (user && user.id) {
      localStorage.setItem(HANKO_USERID_KEY, user.id);
      if (user.email) localStorage.setItem(HANKO_EMAIL_KEY, user.email);
      if (typeof log === "function") log("Hanko user saved:", user.id);
    }
  } catch (e) {}
}

try {
  const { hanko } = await register(HANKO_API_URL, { translations: { en } });
  hankoInstance = hanko;
  window.__hanko = hanko;
  window.__hankoReady = true;

  // Если сессия уже была — сохраняем userId
  await saveCurrentUser();

  hanko.onSessionCreated(async () => {
    await saveCurrentUser();
    if (typeof closeModal === "function") closeModal();
    if (typeof enterCabinet === "function") enterCabinet("parent");
  });

  hanko.onSessionExpired(() => {
    if (currentRole === "parent" && typeof returnToStart === "function") returnToStart();
  });

  if (typeof log === "function") log("Hanko готов");
} catch (err) {
  window.__hankoReady = false;
  if (typeof logWarn === "function") logWarn("Hanko не загрузился:", err);
}

/* ============================================================
   Главная функция — вызывается из ui.js
   ============================================================ */
window.showHankoAuth = function () {
  const container = document.getElementById("hankoAuthContainer");
  if (!container) return false;

  if (!window.__hankoReady) {
    container.innerHTML = '<p class="modal-hint">Hanko не загрузился. Обновите страницу.</p>';
    return false;
  }

  const savedUserId = localStorage.getItem(HANKO_USERID_KEY);
  const savedEmail = localStorage.getItem(HANKO_EMAIL_KEY);

  if (savedUserId) {
    // Устройство уже привязано — только биометрия
    showBiometricButton(container, savedEmail || "");
  } else {
    // Первый вход на устройстве — обычная форма Hanko
    showHankoForm(container, null);
  }
  return true;
};

/* ============================================================
   Кнопка биометрии (устройство привязано)
   ============================================================ */
function showBiometricButton(container, email) {
  var safeEmail = String(email || "").replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });

  var subtitle = safeEmail ? ('Вход для <strong>' + safeEmail + '</strong>') : 'Вход для родителя';

  container.innerHTML =
    '<div style="text-align:center; padding:8px 0;">' +
      '<p style="font-size:13px; color:#8B7DA5; margin:0 0 14px;">' + subtitle + '</p>' +
      '<button id="hankoBioBtn" type="button" style="' +
        'width:100%; min-height:52px; padding:14px 20px; border:0; border-radius:14px; ' +
        'background:linear-gradient(135deg,#8B5CF6,#7C3AED); color:#FFF; font-size:16px; font-weight:700; ' +
        'font-family:Nunito,sans-serif; cursor:pointer; box-shadow:0 6px 18px rgba(139,92,246,.35);">' +
        '👆 Войти по Face ID / отпечатку' +
      '</button>' +
      '<button id="hankoSwitchBtn" type="button" style="' +
        'width:100%; margin-top:12px; padding:10px; border:0; background:transparent; ' +
        'color:#8B7DA5; font-size:12px; font-weight:600; cursor:pointer; text-decoration:underline;">' +
        'Сменить аккаунт на этом устройстве' +
      '</button>' +
    '</div>';

  document.getElementById("hankoBioBtn").addEventListener("click", function () {
    triggerPasskeyLogin(container);
  });
  document.getElementById("hankoSwitchBtn").addEventListener("click", function () {
    localStorage.removeItem(HANKO_EMAIL_KEY);
    localStorage.removeItem(HANKO_USERID_KEY);
    showHankoForm(container, null);
  });
}

/* ============================================================
   Обычная форма Hanko (только первый вход)
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
   Прямой вызов WebAuthn — без формы
   ============================================================ */
async function triggerPasskeyLogin(container) {
  container.innerHTML = '<p class="modal-hint" style="text-align:center;">Запрашиваю биометрию…</p>';

  const userId = localStorage.getItem(HANKO_USERID_KEY);
  if (!userId) {
    showHankoForm(container, null);
    return;
  }

  try {
    if (hankoInstance && hankoInstance.webauthn && typeof hankoInstance.webauthn.login === "function") {
      await hankoInstance.webauthn.login(userId);
      return;
    }
    throw new Error("Метод webauthn.login недоступен");
  } catch (e) {
    if (typeof logWarn === "function") logWarn("Ошибка passkey login:", e);
    showHankoForm(container, null);
  }
}