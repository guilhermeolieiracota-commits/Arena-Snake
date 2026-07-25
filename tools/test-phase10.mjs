import assert from "node:assert/strict";
import { StorageService } from "../js/storage/storage-service.js";
import { EconomySystem } from "../js/economy/economy-system.js";
import { ProgressionSystem } from "../js/progression/progression-system.js";
import { SeasonSystem } from "../js/seasons/season-system.js";
import { WeeklyEventSystem } from "../js/events/weekly-event-system.js";
import { getSeasonLevel } from "../js/seasons/season-config.js";
import { getWeeklyEventInfo } from "../js/events/weekly-event-catalog.js";

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
  version: 3,
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
    gamesPlayed: 12,
    deaths: 12,
    totalPlaySeconds: 920,
    totalCollected: 1800,
    totalEliminations: 17,
    bestScore: 680,
    bestMass: 540,
    bestRank: 2,
    bestEliminations: 5,
    longestSurvivalSeconds: 155,
    lastPlayedAt: "2026-07-20T12:00:00.000Z",
  },
  achievements: {
    unlocked: {},
  },
  economy: {
    coins: 720,
    lifetimeEarned: 1200,
    lifetimeSpent: 480,
    ownedSkins: [
      "neon-mint",
      "ocean",
      "royal",
    ],
    rewardLedger: {
      starterBalance: true,
    },
    purchaseHistory: [],
  },
  dailyChallenges: {
    dateKey: "",
    items: [],
  },
};

const legacyService =
  new StorageService(
    new MemoryStorage({
      [storageKey]:
        JSON.stringify(legacySave),
    })
  );

const migrated =
  legacyService.load();

assert.equal(
  migrated.version,
  8,
  "Save deve migrar para a versão atual."
);

assert.equal(
  migrated.settings.nickname,
  "Veterano",
  "Apelido deve ser preservado."
);

assert.equal(
  migrated.settings.masterVolume,
  0,
  "Volume zero deve ser preservado."
);

assert.equal(
  migrated.economy.coins,
  720,
  "Saldo anterior deve ser preservado."
);

assert.ok(
  migrated.progression.totalXp > 0,
  "Jogador antigo deve receber XP inicial baseado no histórico."
);

assert.equal(
  migrated.season.key,
  "",
  "Temporada nova deve ser preparada sem apagar dados."
);

const freshService =
  new StorageService(
    new MemoryStorage()
  );

const economy =
  new EconomySystem({
    storageService:
      freshService,
  });

const progression =
  new ProgressionSystem({
    storageService:
      freshService,
    economySystem:
      economy,
  });

const initialProgress =
  progression.getSnapshot();

assert.equal(
  initialProgress.level,
  1,
  "Novo jogador deve começar no nível 1."
);

const balanceBeforeLevel =
  economy.getBalance();

const xpResult =
  progression.addXp(
    3000,
    "test:profile",
    { unique: true }
  );

assert.ok(
  xpResult.level > 1,
  "XP deve aumentar o nível."
);

assert.ok(
  economy.getBalance() >
    balanceBeforeLevel,
  "Subir níveis deve conceder moedas."
);

const duplicateXp =
  progression.addXp(
    3000,
    "test:profile",
    { unique: true }
  );

assert.equal(
  duplicateXp.added,
  0,
  "XP único não pode duplicar."
);

assert.ok(
  progression
    .getSnapshot()
    .unlockedTitles.length > 1,
  "Níveis devem liberar títulos."
);

const season =
  new SeasonSystem({
    storageService:
      freshService,
    economySystem:
      economy,
    progressionSystem:
      progression,
  });

const seasonInitial =
  season.getSnapshot();

assert.equal(
  seasonInitial.claimedLevels.includes(1),
  true,
  "Recompensa do nível 1 da temporada deve ser recebida."
);

const seasonAdd =
  season.addPoints(
    540,
    "test:season",
    { unique: true }
  );

assert.ok(
  getSeasonLevel(
    seasonAdd.points
  ) >= 3,
  "Pontos devem subir níveis da temporada."
);

assert.ok(
  season
    .getSnapshot()
    .claimedLevels.includes(3),
  "Recompensas alcançadas devem ser automáticas."
);

const seasonDuplicate =
  season.addPoints(
    540,
    "test:season",
    { unique: true }
  );

assert.equal(
  seasonDuplicate.added,
  0,
  "Pontos únicos da temporada não podem duplicar."
);

const weekly =
  new WeeklyEventSystem({
    storageService:
      freshService,
    economySystem:
      economy,
    progressionSystem:
      progression,
    seasonSystem:
      season,
  });

const weeklyInfo =
  getWeeklyEventInfo();

const richResult = {
  score: 9999,
  collected: 9999,
  eliminations: 99,
  elapsedTime: 9999,
  maximumMass: 9999,
  rank: 1,
};

for (let index = 0; index < 10; index += 1) {
  weekly.recordMatch(
    richResult
  );
}

const weeklySnapshot =
  weekly.getSnapshot();

assert.equal(
  weeklySnapshot.key,
  weeklyInfo.key,
  "Evento deve usar a semana atual."
);

assert.equal(
  weeklySnapshot.completedCount,
  3,
  "Os três objetivos semanais devem ser concluídos."
);

assert.equal(
  weeklySnapshot.completionRewardClaimed,
  true,
  "Bônus semanal deve ser recebido."
);

assert.equal(
  progression
    .getSnapshot()
    .unlockedTitles
    .some(
      (title) =>
        title.id ===
        "campeao-semanal"
    ),
  true,
  "Evento completo deve liberar título."
);

const coinsAfterWeekly =
  economy.getBalance();

weekly.recordMatch(
  richResult
);

assert.equal(
  economy.getBalance(),
  coinsAfterWeekly,
  "Evento concluído não pode pagar novamente."
);

const selected =
  progression.selectTitle(
    "campeao-semanal"
  );

assert.equal(
  selected.success,
  true,
  "Título desbloqueado deve poder ser selecionado."
);

assert.equal(
  progression
    .getSnapshot()
    .selectedTitleId,
  "campeao-semanal",
  "Título selecionado deve persistir."
);

console.log(
  "Testes lógicos da Fase 10 aprovados."
);
