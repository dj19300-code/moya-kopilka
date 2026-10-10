"use strict";

/* ============================================================
   Hanko — вход родителя через WebAuthn напрямую
   Первый вход: форма. Далее: только биометрия.
   ============================================================ */

import { register } from "https://esm.run/@teamhanko/hanko-elements";
import { en } from "https://esm.run/@teamhanko/hanko-elements/i18n/en";

const HANKO_USERID_KEY = "hanko_parent_userid";
const HANKO_EMAIL_KEY = "hanko_parent_email";

en.labels.email = "Email";
en.labels.continue = "Продолжить";
en.labels.or = "или";
en.labels.signInPasskey = "Войти по Face ID / отпечатку";
en.labels.back = "Назад";
en.headlines.signIn = "Вход для родителя";

let hankoInstance = null;

/* ---------- base64url ---------- */
function b64urlDecode(s) {
  s = String(s).replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const raw = atob(s);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}
function b64urlEncode(buf) {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/* ---------- Сохраняем user_id после первого входа ---------- */
async function saveUser() {
  try {
    if (!hankoInstance || !hankoInstance.user) return;
    const user = await hankoInstance.user.getCurrent();
    if (user && user.id) {
      localStorage.setItem(HANKO_USERID_KEY, user.id);
      if (user.email) localStorage.setItem(HANKO_EMAIL_KEY, user.email);
      if (typeof log === "function") log("Saved user:", user.id);
    }
  } catch (e) {}
}

/* ---------- Инициализация Hanko Elements (нужна для первого входа) ---------- */
try {
  const { hanko } = await register(HANKO_API_URL, { translations: { en } });
  hankoInstance = hanko;
  window.__hanko = hanko;
  window.__hankoReady = true;

  await saveUser();

  hanko.onSessionCreated(async () => {
    await saveUser();
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
   Главная функция
   ============================================================ */
window.showHankoAuth = function () {
  const container = document.getElementById("hankoAuthContainer");
  if (!container) return false;
  if (!window.__hankoReady) {
    container.innerHTML = '<p class="modal-hint">Hanko не загрузился. Обновите страницу.</p>';
    return false;
  }

  const userId = localStorage.getItem(HANKO_USERID_KEY);
  if (userId) {
    showBiometricButton(container);
  } else {
    showHankoForm(container);
  }
  return true;
};

/* ---------- Кнопка биометрии ---------- */
function showBiometricButton(container) {
  const email = localStorage.getItem(HANKO_EMAIL_KEY) || "";
  const safeEmail = String(email).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  container.innerHTML =
    '<div style="text-align:center; padding:8px 0;">' +
      (safeEmail ? '<p style="font-size:13px; color:#8B7DA5; margin:0 0 14px;">Вход для <strong>' + safeEmail + '</strong></p>' : '') +
      '<button id="hankoBioBtn" type="button" style="' +
        'width:100%; min-height:52px; padding:14px 20px; border:0; border-radius:14px; ' +
        'background:linear-gradient(135deg,#8B5CF6,#7C3AED); color:#FFF; font-size:16px; font-weight:700; ' +
        'font-family:Nunito,sans-serif; cursor:pointer;">' +
        '👆 Войти по Face ID / отпечатку' +
      '</button>' +
      '<button id="hankoSwitchBtn" type="button" style="' +
        'width:100%; margin-top:12px; padding:10px; border:0; background:transparent; ' +
        'color:#8B7DA5; font-size:12px; cursor:pointer; text-decoration:underline;">' +
        'Сменить аккаунт на этом устройстве' +
      '</button>' +
    '</div>';

  document.getElementById("hankoBioBtn").addEventListener("click", function () {
    directLogin(container);
  });
  document.getElementById("hankoSwitchBtn").addEventListener("click", function () {
    localStorage.removeItem(HANKO_USERID_KEY);
    localStorage.removeItem(HANKO_EMAIL_KEY);
    showHankoForm(container);
  });
}

/* ---------- Форма Hanko (первый вход) ---------- */
function showHankoForm(container) {
  container.innerHTML = "";
  const el = document.createElement("hanko-auth");
  el.setAttribute("lang", "en");
  el.setAttribute("shadow", "false");
  container.appendChild(el);
}

/* ============================================================
   Прямой вызов WebAuthn через Hanko Flow API
   ============================================================ */
async function directLogin(container) {
  container.innerHTML = '<p class="modal-hint" style="text-align:center;">Запрашиваю биометрию…</p>';

  const userId = localStorage.getItem(HANKO_USERID_KEY);
  if (!userId) { showHankoForm(container); return; }

  try {
    // 1. Инициализация — получаем challenge
    const initRes = await fetch(HANKO_API_URL + "/webauthn/login/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId })
    });
    if (!initRes.ok) throw new Error("initialize HTTP " + initRes.status);
    const initData = await initRes.json();
    const pk = initData.publicKey;
    if (!pk) throw new Error("no publicKey in response");

    // 2. Вызов системного окна биометрии
    const publicKey = {
      challenge: b64urlDecode(pk.challenge),
      timeout: pk.timeout || 60000,
      rpId: pk.rpId,
      allowCredentials: (pk.allowCredentials || []).map(function (c) {
        return { type: c.type, id: b64urlDecode(c.id), transports: c.transports };
      }),
      userVerification: pk.userVerification || "preferred"
    };

    const cred = await navigator.credentials.get({ publicKey });
    if (!cred) throw new Error("cancelled by user");

    // 3. Финализация — отправляем ответ на сервер
    const finalizeBody = {
      id: b64urlEncode(cred.rawId),
      rawId: b64urlEncode(cred.rawId),
      type: cred.type,
      response: {
        clientDataJSON: b64urlEncode(cred.response.clientDataJSON),
        authenticatorData: b64urlEncode(cred.response.authenticatorData),
        signature: b64urlEncode(cred.response.signature),
        userHandle: cred.response.userHandle ? b64urlEncode(cred.response.userHandle) : undefined
      }
    };

    const finRes = await fetch(HANKO_API_URL + "/webauthn/login/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalizeBody)
    });
    if (!finRes.ok) {
      const errText = await finRes.text();
      throw new Error("finalize HTTP " + finRes.status + " " + errText);
    }

    // Успех — входим в кабинет
    if (typeof closeModal === "function") closeModal();
    if (typeof enterCabinet === "function") enterCabinet("parent");

  } catch (e) {
    if (typeof logWarn === "function") logWarn("Direct login failed:", e);
    console.error("Direct login failed:", e);
    // Фолбэк — показываем форму, чтобы можно было войти
    showHankoForm(container);
  }
}