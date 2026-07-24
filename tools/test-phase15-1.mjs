import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

const read = (path) =>
  readFile(new URL(path, root), "utf8");

const [
  main,
  boot,
  pwa,
  serviceWorker,
  components,
  gameConfig,
] = await Promise.all([
  read("js/main.js"),
  read("js/boot.js"),
  read("js/pwa/pwa-manager.js"),
  read("service-worker.js"),
  read("css/components.css"),
  read("js/config/game-config.js"),
]);

assert.match(
  boot,
  /BOOT_FIX_VERSION = "15-(1|2)"/
);

assert.match(
  serviceWorker,
  /CACHE_NAME = "snake-arena-v15-(1|2)"/
);

assert.match(
  serviceWorker,
  /then\(\(\) => self\.skipWaiting\(\)\)/
);

assert.match(
  pwa,
  /registration\.waiting\.postMessage/
);

assert.match(
  pwa,
  /worker\.postMessage\(\{\s*type: "SKIP_WAITING"/
);

assert.match(
  main,
  /numericValues\.every\(\s*\(value\) => value <= 0/
);

assert.match(
  main,
  /document\.body\.classList\.contains\(\s*"gameplay-active"/
);

assert.match(
  main,
  /toastQueue\.length = 0/
);

assert.match(
  main,
  /elements\.rewardToast\.hidden = true/
);

assert.match(
  main,
  /onUpdateAvailable: null/
);

assert.match(
  components,
  /#updateBanner \{\s*display: none !important;/
);

assert.match(
  gameConfig,
  /version: "0\.15\.(1|2)"/
);

console.log(
  "Testes de compatibilidade dos popups 15.1 aprovados."
);
