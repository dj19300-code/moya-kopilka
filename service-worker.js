"use strict";

// Меняй версию, когда хочешь принудительно обновить кэш
var CACHE_NAME = "moya-kopilka-v6";

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
  "./js/push.js",
  "./js/state.js",
  "./js/render.js",
  "./js/actions.js",
  "./js/ui.js",
  "./js/app.js"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

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

/* ---------- Клик по уведомлению ---------- */

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var targetUrl = (event.notification.data && event.notification.data.url) || "./";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // Ищем уже открытое приложение
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        var clientUrl = client.url || "";
        try {
          var cUrl = new URL(clientUrl);
          var tUrl = new URL(targetUrl, self.location.origin);
          if (cUrl.origin === tUrl.origin) {
            // Передаём URL для навигации + фокусируем
            client.postMessage({ type: "navigate", url: tUrl.pathname + tUrl.search });
            if ("focus" in client) return client.focus();
            return;
          }
        } catch (e) {}
      }
      // Ничего не открыто — открываем
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});