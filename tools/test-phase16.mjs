import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { STAGE_CONFIG, getStageDifficulty } from "../js/stages/stage-config.js";
import { StageSystem } from "../js/stages/stage-system.js";
import { RunGuard } from "../js/stages/run-guard.js";
import { Snake } from "../js/entities/snake.js";
import { BALANCE_CONFIG } from "../js/config/balance-config.js";
import { SupabaseRestClient } from "../js/online/supabase-rest-client.js";
import { CloudSessionService } from "../js/online/cloud-session-service.js";

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.has(key)
      ? this.values.get(key)
      : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

class PlayerMetaStorage {
  constructor() {
    this.meta = {
      currentStage: 1,
      highestStage: 1,
      stagesCompleted: 0,
      lastStageCompletedAt: null,
    };
  }

  getPlayerMeta() {
    return structuredClone(this.meta);
  }

  savePlayerMeta(meta) {
    this.meta = structuredClone(meta);
    return this.getPlayerMeta();
  }
}

assert.equal(
  STAGE_CONFIG.durationSeconds,
  120,
  "Cada fase deve durar dois minutos."
);

const firstDifficulty = getStageDifficulty(1);
const advancedDifficulty = getStageDifficulty(10);

assert.ok(
  advancedDifficulty.speedMultiplier >
    firstDifficulty.speedMultiplier,
  "As fases avançadas devem acelerar os bots."
);
assert.ok(
  advancedDifficulty.aggressionMultiplier >
    firstDifficulty.aggressionMultiplier,
  "As fases avançadas devem aumentar a agressividade."
);
assert.ok(
  advancedDifficulty.extraBots >
    firstDifficulty.extraBots,
  "As fases avançadas devem incluir mais rivais."
);

const stageStorage = new PlayerMetaStorage();
const stageSystem = new StageSystem({
  storageService: stageStorage,
});

const completed = stageSystem.completeCurrentStage();
assert.equal(completed.completedStage, 1);
assert.equal(completed.nextStage, 2);
assert.equal(stageSystem.getSnapshot().currentStage, 2);
assert.equal(stageSystem.getSnapshot().highestStage, 2);
assert.equal(stageSystem.getSnapshot().stagesCompleted, 1);

const guardStorage = new MemoryStorage();
const runGuard = new RunGuard(guardStorage);
runGuard.markActive({ stage: 4 });
const interrupted = runGuard.consumeInterruptedRun();
assert.equal(interrupted.stage, 4);
assert.equal(runGuard.consumeInterruptedRun(), null);

const snake = new Snake({
  mass: BALANCE_CONFIG.initialPlayerMass,
});
const initialTargetRadius = snake.targetRadius;
snake.addFood({
  scoreValue: 10,
  massValue: 1000,
});
assert.ok(
  snake.targetRadius > initialTargetRadius,
  "A cobra deve ganhar espessura conforme acumula massa."
);
assert.ok(
  snake.targetSegmentSpacing >
    BALANCE_CONFIG.segmentSpacing,
  "O espaçamento do corpo deve acompanhar o volume."
);
assert.ok(
  snake.getBodyRadius(4, 20) >
    snake.getBodyRadius(19, 20),
  "A cauda deve continuar afinando naturalmente."
);

let capturedRequest = null;
const client = new SupabaseRestClient({
  projectUrl: "https://example.supabase.co",
  publishableKey: "sb_publishable_test_key_1234567890",
  fetchImpl: async (url, options) => {
    capturedRequest = {
      url,
      options,
    };

    return new Response(
      JSON.stringify({
        user: {
          id: "user-1",
          identities: [{ id: "identity-1" }],
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  },
});

const sessionService = new CloudSessionService({
  client,
  storage: new MemoryStorage(),
});

const signup = await sessionService.signUp({
  email: "teste@example.com",
  password: "123456",
  nickname: "Cota",
  redirectTo: "https://example.github.io/Arena-Snake/",
});

assert.equal(signup.confirmationRequired, true);
assert.match(capturedRequest.url, /redirect_to=/);
const signupBody = JSON.parse(capturedRequest.options.body);
assert.equal(signupBody.email, "teste@example.com");
assert.equal(signupBody.data.nickname, "Cota");

const gameSource = await readFile(
  new URL("../js/core/game.js", import.meta.url),
  "utf8"
);
const mainSource = await readFile(
  new URL("../js/main.js", import.meta.url),
  "utf8"
);
const manifest = JSON.parse(
  await readFile(
    new URL("../manifest-v16.webmanifest", import.meta.url),
    "utf8"
  )
);

assert.match(gameSource, /visibilitychange/);
assert.match(gameSource, /pagehide/);
assert.match(gameSource, /beforeunload/);
assert.match(gameSource, /freeze/);
assert.match(gameSource, /this\.loop\.stop\(\)/);
assert.match(gameSource, /this\.botSystem\.clear\(\)/);
assert.match(gameSource, /this\.foodSystem\.clear\(\)/);
assert.match(mainSource, /onlineSignupConfirmPasswordInput/);
assert.match(mainSource, /getAuthRedirectUrl\(\)/);
assert.match(mainSource, /runGuard\.markActive/);
assert.match(mainSource, /stageSystem\.completeCurrentStage/);
assert.match(mainSource, /stopBackgroundActivity/);

assert.equal(manifest.start_url, "./?source=pwa&version=16-0");
assert.ok(
  manifest.icons.every((icon) =>
    icon.src.includes("v16")
  ),
  "O manifesto deve usar somente os novos ícones v16."
);

for (const path of [
  "../assets/icons/snake-arena-favicon-32-v16.png",
  "../assets/icons/snake-arena-apple-touch-v16.png",
  "../assets/icons/snake-arena-icon-192-v16.png",
  "../assets/icons/snake-arena-icon-512-v16.png",
  "../assets/icons/snake-arena-maskable-512-v16.png",
]) {
  await access(new URL(path, import.meta.url));
}

console.log("Testes lógicos da Fase 16 aprovados.");
