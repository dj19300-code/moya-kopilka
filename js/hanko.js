"use strict";

/* ============================================================
   Hanko — инициализация и вход родителя
   ============================================================ */

import { register } from "https://esm.run/@teamhanko/hanko-elements";
import { en } from "https://esm.run/@teamhanko/hanko-elements/i18n/en";

// Ключ для хранения email в localStorage
const HANKO_EMAIL_KEY = "hanko_parent_email";

// Переопределяем английские надписи на русские,
// так как официальной русской локализации в Hanko нет.
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
en.headlines.verificationCode = "Введите код из письма";

let hankoInstance = null;

// Регистрируем компоненты Hanko с нашим API URL и переводами
try {
  const { hanko } = await register(HANKO_API_URL, { translations: { en } });
  hankoInstance = hanko;

  // Колбэк: пользователь успешно вошёл
  hanko.onSessionCreated(() => {
    // Запоминаем email, чтобы в следующий раз его не вводить
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
  // Используем английский как базу (с нашими русскими переопределениями)
  el.setAttribute("lang", "en");

  // Подставляем сохранённый email, если он есть
  const savedEmail = localStorage.getItem(HANKO_EMAIL_KEY);
  if (savedEmail) {
    el.setAttribute("prefilled-email", savedEmail);
  }

  container.appendChild(el);
  return true;
};