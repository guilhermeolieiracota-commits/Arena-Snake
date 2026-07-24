const CACHE_NAME = "snake-arena-v15-0";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/components.css",
  "./css/game.css",
  "./css/layout.css",
  "./css/reset.css",
  "./css/responsive.css",
  "./css/variables.css",
  "./js/achievements/achievement-catalog.js",
  "./js/achievements/achievement-system.js",
  "./js/activity/streak-system.js",
  "./js/ai/aggressive-behavior.js",
  "./js/ai/bot-brain.js",
  "./js/ai/bot-profiles.js",
  "./js/ai/cautious-behavior.js",
  "./js/ai/collector-behavior.js",
  "./js/ai/opportunist-behavior.js",
  "./js/ai/perception.js",
  "./js/ai/steering.js",
  "./js/audio/audio-manager.js",
  "./js/backup/save-transfer-service.js",
  "./js/boot.js",
  "./js/challenges/daily-challenge-catalog.js",
  "./js/challenges/daily-challenge-system.js",
  "./js/competitive/competitive-system.js",
  "./js/competitive/league-config.js",
  "./js/config/balance-config.js",
  "./js/config/cloud-config.js",
  "./js/config/game-config.js",
  "./js/config/graphics-config.js",
  "./js/core/game-loop.js",
  "./js/core/game-state.js",
  "./js/core/game.js",
  "./js/economy/economy-system.js",
  "./js/entities/bot-snake.js",
  "./js/entities/floating-text.js",
  "./js/entities/food.js",
  "./js/entities/particle.js",
  "./js/entities/player-snake.js",
  "./js/entities/snake.js",
  "./js/events/weekly-event-catalog.js",
  "./js/events/weekly-event-system.js",
  "./js/history/match-history-system.js",
  "./js/input/input-manager.js",
  "./js/input/keyboard-input.js",
  "./js/input/virtual-joystick.js",
  "./js/main.js",
  "./js/online/cloud-community-system.js",
  "./js/online/cloud-session-service.js",
  "./js/online/cloud-sync-system.js",
  "./js/online/supabase-rest-client.js",
  "./js/progression/progression-config.js",
  "./js/progression/progression-system.js",
  "./js/pwa/pwa-manager.js",
  "./js/rendering/camera.js",
  "./js/rendering/food-renderer.js",
  "./js/rendering/particle-renderer.js",
  "./js/rendering/renderer.js",
  "./js/rendering/snake-renderer.js",
  "./js/seasons/season-config.js",
  "./js/seasons/season-system.js",
  "./js/skins/skin-catalog.js",
  "./js/storage/default-save.js",
  "./js/storage/storage-service.js",
  "./js/systems/boost-system.js",
  "./js/systems/bot-system.js",
  "./js/systems/collision-system.js",
  "./js/systems/death-system.js",
  "./js/systems/food-system.js",
  "./js/systems/particle-system.js",
  "./js/systems/predation-system.js",
  "./js/systems/ranking-system.js",
  "./js/systems/spatial-grid.js",
  "./js/systems/spawn-system.js",
  "./js/ui/achievements-view.js",
  "./js/ui/community-view.js",
  "./js/ui/competitive-view.js",
  "./js/ui/daily-challenges-view.js",
  "./js/ui/data-management-view.js",
  "./js/ui/history-view.js",
  "./js/ui/minimap-renderer.js",
  "./js/ui/online-view.js",
  "./js/ui/profile-view.js",
  "./js/ui/season-view.js",
  "./js/ui/shop-view.js",
  "./js/ui/stats-view.js",
  "./js/ui/weekly-event-view.js",
  "./js/utils/math.js",
  "./js/utils/object-pool.js",
  "./js/utils/random.js",
  "./js/utils/validation.js",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/favicon-32.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/icon.svg"
];

const toScopeUrl = (path) =>
  new URL(path, self.registration.scope).href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_SHELL.map(toScopeUrl))
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) =>
              cacheName.startsWith("snake-arena-") &&
              cacheName !== CACHE_NAME
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedNavigation = await cache.match(request, {
      ignoreSearch: true,
    });

    if (cachedNavigation) {
      return cachedNavigation;
    }

    const cachedIndex = await cache.match(toScopeUrl("./index.html"));

    if (cachedIndex) {
      return cachedIndex;
    }

    return new Response(
      "Snake Arena indisponível. Conecte-se uma vez para preparar o modo offline.",
      {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      }
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request, {
    ignoreSearch: true,
  });

  const networkResponsePromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => null);

  if (cachedResponse) {
    networkResponsePromise.catch(() => null);
    return cachedResponse;
  }

  const networkResponse = await networkResponsePromise;

  if (networkResponse) {
    return networkResponse;
  }

  return new Response("", {
    status: 504,
    statusText: "Gateway Timeout",
  });
}
