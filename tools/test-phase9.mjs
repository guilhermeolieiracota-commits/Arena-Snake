import assert from "node:assert/strict";
import { StorageService } from "../js/storage/storage-service.js";
import { EconomySystem } from "../js/economy/economy-system.js";
import { DailyChallengeSystem } from "../js/challenges/daily-challenge-system.js";
import { DAILY_CHALLENGE_MAP } from "../js/challenges/daily-challenge-catalog.js";
import { PLAYER_SKINS } from "../js/skins/skin-catalog.js";

class MemoryStorage {
  constructor(initial = {}) {
    this.values = new Map(
      Object.entries(initial)
    );
  }

  getItem(key) {
    return this.values.has(key)
      ? this.values.get(key)
      : null;
  }

  setItem(key, value) {
    this.values.set(
      key,
      String(value)
    );
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

const storageKey =
  "snake_arena_save";

const legacySave = {
  version: 2,
  settings: {
    nickname: "Veterano",
    controlMode: "follow",
    quality: "high",
    difficulty: "normal",
    skinId: "royal",
    muted: false,
    masterVolume: 0,
    sfxVolume: 0,
    musicVolume: 0,
    showLeaderboard: true,
    showMinimap: true,
    showSnakeNames: true,
    reducedEffects: false,
  },
  stats: {
    gamesPlayed: 4,
    bestScore: 350,
  },
  achievements: {
    unlocked: {},
  },
};

const legacyStorage =
  new MemoryStorage({
    [storageKey]:
      JSON.stringify(legacySave),
  });

const legacyService =
  new StorageService(
    legacyStorage
  );

const migrated =
  legacyService.load();

assert.equal(
  migrated.version,
  8,
  "Save legado deve migrar para a versão atual."
);

assert.equal(
  migrated.settings.skinId,
  "royal",
  "Skin selecionada deve ser preservada."
);

assert.equal(
  migrated.settings.masterVolume,
  0,
  "Volume zero precisa ser preservado."
);

assert.equal(
  migrated.economy.ownedSkins.length,
  PLAYER_SKINS.length,
  "Jogadores da Fase 8 devem manter todas as skins."
);

const freshService =
  new StorageService(
    new MemoryStorage()
  );

const fresh =
  freshService.load();

assert.equal(
  fresh.economy.coins,
  180,
  "Novo jogador deve iniciar com 180 moedas."
);

assert.equal(
  fresh.economy.ownedSkins.length,
  2,
  "Novo jogador deve iniciar com duas skins."
);

const economy =
  new EconomySystem({
    storageService:
      freshService,
  });

const firstUnique =
  economy.addCoins(
    50,
    "test:unique",
    { unique: true }
  );

const duplicateUnique =
  economy.addCoins(
    50,
    "test:unique",
    { unique: true }
  );

assert.equal(
  firstUnique.added,
  50,
  "Primeira recompensa única deve ser adicionada."
);

assert.equal(
  duplicateUnique.added,
  0,
  "Recompensa única não pode duplicar."
);

const expensiveSkin =
  PLAYER_SKINS.find(
    (skin) => skin.id === "royal"
  );

const insufficient =
  economy.buySkin(
    expensiveSkin.id
  );

assert.equal(
  insufficient.success,
  false,
  "Compra sem saldo deve falhar."
);

economy.addCoins(
  1000,
  "test:funds"
);

const purchased =
  economy.buySkin(
    expensiveSkin.id
  );

assert.equal(
  purchased.success,
  true,
  "Compra com saldo deve funcionar."
);

assert.equal(
  economy.ownsSkin(
    expensiveSkin.id
  ),
  true,
  "Skin comprada deve permanecer desbloqueada."
);

const challengeService =
  new DailyChallengeSystem({
    storageService:
      freshService,
    economySystem:
      economy,
  });

const entries =
  challengeService.getEntries({
    session: {},
    stats: {},
  });

assert.equal(
  entries.length,
  3,
  "Devem existir três desafios diários."
);

assert.equal(
  new Set(
    entries.map(
      (entry) =>
        DAILY_CHALLENGE_MAP[entry.id].category
    )
  ).size,
  3,
  "Os desafios do dia devem usar categorias diferentes."
);

const balanceBefore =
  economy.getBalance();

challengeService.evaluate({
  session: {
    matchesCompleted: 1,
    collected: 9999,
    score: 9999,
    mass: 9999,
    maximumMass: 9999,
    elapsedTime: 9999,
    eliminations: 99,
    rank: 1,
  },
  stats: {},
});

assert.equal(
  challengeService.getCompletedCount(),
  3,
  "Os três desafios devem ser concluídos."
);

const balanceAfter =
  economy.getBalance();

assert.ok(
  balanceAfter > balanceBefore,
  "Desafios concluídos devem conceder moedas."
);

challengeService.evaluate({
  session: {
    matchesCompleted: 1,
    collected: 9999,
    score: 9999,
    mass: 9999,
    maximumMass: 9999,
    elapsedTime: 9999,
    eliminations: 99,
    rank: 1,
  },
  stats: {},
});

assert.equal(
  economy.getBalance(),
  balanceAfter,
  "Desafios concluídos não podem pagar novamente."
);

console.log(
  "Testes lógicos da Fase 9 aprovados."
);
