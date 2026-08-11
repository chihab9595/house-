// Service worker HOUSE — mise en cache minimale de l'app shell pour un usage hors-ligne basique.
// Sera enrichi plus tard (cache des cours importés, file d'attente de sync, etc.).

const CACHE_NAME = "house-shell-v1";
const APP_SHELL = ["/", "/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) {
        // Sert le cache immédiatement, revalide en arrière-plan sans bloquer la réponse.
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
            }
          })
          .catch(() => {});
        return cached;
      }

      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        // Hors-ligne et route jamais mise en cache : replier sur l'app shell
        // plutôt que de laisser le navigateur afficher son erreur générique.
        const fallback = await caches.match("/");
        return fallback ?? Response.error();
      }
    })()
  );
});
