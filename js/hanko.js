"use strict";

/* ============================================================
   Hanko — инициализация и вход родителя
   ============================================================ */

import { register } from "https://esm.run/@teamhanko/hanko-elements";

let hankoInstance = null;

// Ключ для хранения email в localStorage
const HANKO_EMAIL_KEY = "hanko_parent_email";

// Регистрируем компоненты Hanko с нашим API URL
try {
  const { hanko } = await register(HANKO_API_URL);
  hankoInstance = hanko;

  // Колбэк: пользователь успешно вошёл
  hanko.onSessionCreated(() => {
    // Пытаемся сохранить email, если он есть в сессии
    if (hanko.user && typeof hanko.user.getCurrent === "function") {
      hanko.user.getCurrent().then(user => {
        if (user && user.email) {
          localStorage.setItem(HANKO_EMAIL_KEY, user.email);
        }
      }).catch(() => {});
    }
    
    if (typeof closeModal === "function") closeModal();
    if (typeof enterCabinet === "function") enterCabinet("parent");
  });

  // Колбэк: пользователь вышел
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

// Функция для ui.js: показать форму Hanko
window.showHankoAuth = function () {
  const container = document.getElementById("hankoAuthContainer");
  if (!container) return false;

  if (!window.__hankoReady) {
    container.innerHTML = '<p class="modal-hint">Не удалось загрузить Hanko. Проверьте интернет и обновите страницу.</p>';
    return false;
  }

  container.innerHTML = "";
  const el = document.createElement("hanko-auth");
  el.setAttribute("lang", "ru");
  
  // Вставляем сохранённый email, если он есть
  const savedEmail = localStorage.getItem(HANKO_EMAIL_KEY);
  if (savedEmail) {
    el.setAttribute("prefilled-email", savedEmail);
  }
  
  container.appendChild(el);
  return true;
};