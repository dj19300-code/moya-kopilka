"use strict";

// Меняй версию, когда хочешь принудительно обновить кэш (например, после больших правок)
var CACHE_NAME = "moya-kopilka-v4";

var URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./web-app-manifest-192x192.png",
  "./web-app-manifest-512x512.png",
  "./js/config.js",
  "./js/utils.js",
  "./js/icons.js",
  "./js/state.js",
  "./js/render.js",
  "./js/actions.js",
  "./js/ui.js",
  "./js/voice.js",
  "./js/app.js"
];

// Установка: скачиваем и кэшируем все файлы
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Активация: удаляем старые кэши (если версия менялась)
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Перехват запросов: сеть → при неудаче кэш
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(event.request).then(function (r) {
          return r || caches.match("./index.html");
        });
      })
  );
});