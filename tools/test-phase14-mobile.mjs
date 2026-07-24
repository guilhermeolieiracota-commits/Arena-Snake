import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

const joystick = await readFile(
  new URL(
    "js/input/virtual-joystick.js",
    root
  ),
  "utf8"
);

assert.match(
  joystick,
  /activationSurface/
);

assert.match(
  joystick,
  /this\.origin = \{/
);

assert.match(
  joystick,
  /event\.clientX/
);

assert.match(
  joystick,
  /joystick--visible/
);

assert.match(
  joystick,
  /removeEventListener\(\s*"lostpointercapture"/
);

const inputManager = await readFile(
  new URL(
    "js/input/input-manager.js",
    root
  ),
  "utf8"
);

assert.match(
  inputManager,
  /joystickKnob,\s*canvas/
);

const main = await readFile(
  new URL(
    "js/main.js",
    root
  ),
  "utf8"
);

assert.match(
  main,
  /updateBannerTimer/
);

assert.match(
  main,
  /6500/
);

assert.match(
  main,
  /hideUpdateBanner/
);

const responsive = await readFile(
  new URL(
    "css/responsive.css",
    root
  ),
  "utf8"
);

assert.match(
  responsive,
  /Fase 14\.1/
);

assert.match(
  responsive,
  /action-banner--update:not\(\[hidden\]\)/
);

assert.match(
  responsive,
  /leaderboard[\s\S]*8px !important/
);

assert.match(
  responsive,
  /minimap[\s\S]*auto 8px/
);

const graphics = await readFile(
  new URL(
    "js/config/graphics-config.js",
    root
  ),
  "utf8"
);

assert.match(
  graphics,
  /mobileZoomMultiplier: 0\.76/
);

const camera = await readFile(
  new URL(
    "js/rendering/camera.js",
    root
  ),
  "utf8"
);

assert.match(
  camera,
  /max-width: 720px/
);

assert.match(
  camera,
  /mobileZoomMultiplier/
);

const serviceWorker = await readFile(
  new URL(
    "service-worker.js",
    root
  ),
  "utf8"
);

assert.match(
  serviceWorker,
  /snake-arena-v14-2/
);

console.log(
  "Testes da correção mobile 14.1 aprovados."
);
