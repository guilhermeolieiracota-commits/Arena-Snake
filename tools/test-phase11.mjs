import assert from "node:assert/strict";
import { StorageService } from "../js/storage/storage-service.js";
import { EconomySystem } from "../js/economy/economy-system.js";
import { CompetitiveSystem } from "../js/competitive/competitive-system.js";
import { MatchHistorySystem } from "../js/history/match-history-system.js";
import { StreakSystem } from "../js/activity/streak-system.js";
import { SaveTransferService } from "../js/backup/save-transfer-service.js";
import { getLeagueByRating } from "../js/competitive/league-config.js";

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

const phase10Save = {
  version: 4,
  settings: {
    nickname: "Competidor",
    controlMode: "follow",
    quality: "high",
    difficulty: "intense",
    skinId: "royal",
    muted: false,
    masterVolume: 0,
    sfxVolume: 0.5,
    musicVolume: 0,
    showLeaderboard: true,
    showMinimap: true,
    showSnakeNames: true,
    reducedEffects: false,
  },
  stats: {
    gamesPlayed: 18,
    deaths: 18,
    totalPlaySeconds: 1500,
    totalCollected: 3400,
    totalEliminations: 29,
    bestScore: 990,
    bestMass: 720,
    bestRank: 1,
    bestEliminations: 7,
    longestSurvivalSeconds: 210,
    lastPlayedAt:
      "2026-07-22T12:00:00.000Z",
  },
  achievements: {
    unlocked: {},
  },
  economy: {
    coins: 910,
    lifetimeEarned: 1800,
    lifetimeSpent: 890,
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
  progression: {
    totalXp: 4400,
    claimedLevelRewards: [
      2,
      3,
      4,
      5,
    ],
    unlockedTitles: [
      "novato",
      "explorador",
      "coletor",
    ],
    selectedTitleId:
      "coletor",
    xpLedger: {},
    recentXp: [],
    titleHistory: [],
  },
  season: {
    key: "season-7",
    points: 780,
    claimedLevels: [
      1,
      2,
      3,
      4,
    ],
    highestLevel: 4,
    pointsLedger: {},
    history: [],
  },
  weeklyEvent: {
    key: "2026-W30",
    progress: {
      matches: 3,
    },
    completedObjectives: [],
    completionRewardClaimed: false,
    history: [],
  },
};

const migratedService =
  new StorageService(
    new MemoryStorage({
      [storageKey]:
        JSON.stringify(
          phase10Save
        ),
    })
  );

const migrated =
  migratedService.load();

assert.equal(
  migrated.version,
  7,
  "Save deve migrar para a versão atual."
);

assert.equal(
  migrated.settings.nickname,
  "Competidor",
  "Apelido anterior deve permanecer."
);

assert.equal(
  migrated.settings.masterVolume,
  0,
  "Volume zero deve permanecer."
);

assert.equal(
  migrated.economy.coins,
  910,
  "Saldo deve permanecer."
);

assert.equal(
  migrated.progression.totalXp,
  4400,
  "XP deve permanecer."
);

assert.match(
  migrated.playerMeta.playerId,
  /^SA-[A-Z0-9]{1,12}$/,
  "ID local deve ser criado."
);

assert.equal(
  migrated.competitive.rating,
  1000,
  "Liga deve iniciar em 1000 RP."
);

assert.deepEqual(
  migrated.matchHistory,
  [],
  "Histórico novo deve iniciar vazio."
);

const service =
  new StorageService(
    new MemoryStorage()
  );

const economy =
  new EconomySystem({
    storageService: service,
  });

const competitive =
  new CompetitiveSystem({
    storageService: service,
  });

const history =
  new MatchHistorySystem({
    storageService: service,
  });

const streak =
  new StreakSystem({
    storageService: service,
    economySystem: economy,
  });

const firstActivity =
  streak.registerToday(
    new Date(
      "2026-07-20T12:00:00"
    )
  );

assert.equal(
  firstActivity.firstActivityToday,
  true,
  "Primeira atividade do dia deve ser registrada."
);

assert.equal(
  firstActivity.currentStreak,
  1,
  "Sequência deve começar em 1."
);

const balanceAfterFirst =
  economy.getBalance();

const duplicateActivity =
  streak.registerToday(
    new Date(
      "2026-07-20T18:00:00"
    )
  );

assert.equal(
  duplicateActivity.firstActivityToday,
  false,
  "Mesmo dia não pode registrar novamente."
);

assert.equal(
  economy.getBalance(),
  balanceAfterFirst,
  "Mesmo dia não pode pagar novamente."
);

const secondDay =
  streak.registerToday(
    new Date(
      "2026-07-21T12:00:00"
    )
  );

assert.equal(
  secondDay.currentStreak,
  2,
  "Dia consecutivo deve aumentar a sequência."
);

const gapDay =
  streak.registerToday(
    new Date(
      "2026-07-23T12:00:00"
    )
  );

assert.equal(
  gapDay.currentStreak,
  1,
  "Intervalo deve reiniciar a sequência."
);

const result = {
  score: 620,
  maximumMass: 480,
  eliminations: 4,
  collected: 250,
  elapsedTime: 118,
  rank: 2,
  totalCompetitors: 15,
};

const matchId =
  history.createMatchId();

const competitiveResult =
  competitive.recordMatch(
    result,
    matchId
  );

assert.equal(
  competitiveResult.duplicate,
  false,
  "Primeiro rating da partida deve ser registrado."
);

assert.ok(
  competitiveResult.ratingDelta > 0,
  "Bom resultado deve aumentar rating."
);

const duplicateRating =
  competitive.recordMatch(
    result,
    matchId
  );

assert.equal(
  duplicateRating.duplicate,
  true,
  "Mesma partida não pode alterar rating duas vezes."
);

const historyRecord =
  history.record({
    matchId,
    result,
    rewards: {
      coins: 120,
      xp: 180,
      seasonPoints: 95,
    },
    competitive:
      competitiveResult,
    profile: {
      level: 8,
      selectedTitleId:
        "cacador",
    },
    settings: {
      nickname:
        "Competidor",
      skinId:
        "royal",
      difficulty:
        "intense",
    },
  });

assert.equal(
  historyRecord.duplicate,
  false,
  "Partida deve entrar no histórico."
);

assert.equal(
  historyRecord.record.medalId,
  "silver",
  "Segundo lugar deve receber medalha correta."
);

assert.equal(
  history.getRecent().length,
  1,
  "Histórico deve conter a partida."
);

const duplicateHistory =
  history.record({
    matchId,
    result,
    rewards: {
      coins: 120,
      xp: 180,
      seasonPoints: 95,
    },
    competitive:
      competitiveResult,
    profile: {
      level: 8,
      selectedTitleId:
        "cacador",
    },
    settings: {
      nickname:
        "Competidor",
      skinId:
        "royal",
      difficulty:
        "intense",
    },
  });

assert.equal(
  duplicateHistory.duplicate,
  true,
  "Mesma partida não pode entrar duas vezes no histórico."
);

for (
  let index = 0;
  index < 60;
  index += 1
) {
  const id =
    `history-${index}`;

  const rating =
    competitive.recordMatch(
      {
        ...result,
        score:
          result.score + index,
        rank:
          (index % 10) + 1,
      },
      id
    );

  history.record({
    matchId: id,
    result: {
      ...result,
      score:
        result.score + index,
      rank:
        (index % 10) + 1,
    },
    rewards: {
      coins: 20,
      xp: 30,
      seasonPoints: 15,
    },
    competitive:
      rating,
    profile: {
      level: 8,
      selectedTitleId:
        "cacador",
    },
    settings: {
      nickname:
        "Competidor",
      skinId:
        "royal",
      difficulty:
        "intense",
    },
  });
}

assert.equal(
  history.getRecent(100).length,
  50,
  "Histórico deve limitar em 50 partidas."
);

const snapshot =
  competitive.getSnapshot();

assert.equal(
  snapshot.matches,
  61,
  "Competitivo deve contar partidas únicas."
);

assert.ok(
  snapshot.peakRating >=
    snapshot.rating,
  "Pico de rating deve ser preservado."
);

assert.equal(
  getLeagueByRating(
    snapshot.rating
  ).id,
  snapshot.league.id,
  "Liga deve corresponder ao rating."
);

const transfer =
  new SaveTransferService({
    storageService: service,
  });

const backup =
  transfer.createBackupObject();

const backupText =
  JSON.stringify(backup);

const replacementService =
  new StorageService(
    new MemoryStorage()
  );

const replacementTransfer =
  new SaveTransferService({
    storageService:
      replacementService,
  });

const restored =
  replacementTransfer.importText(
    backupText
  );

assert.equal(
  restored.playerMeta.playerId,
  service.getPlayerMeta().playerId,
  "Importação deve preservar ID do jogador."
);

assert.equal(
  restored.matchHistory.length,
  50,
  "Importação deve preservar histórico."
);

assert.equal(
  restored.competitive.rating,
  service.getCompetitive().rating,
  "Importação deve preservar rating."
);

const corrupted = {
  ...backup,
  checksum: "invalid",
};

assert.throws(
  () =>
    replacementTransfer.importText(
      JSON.stringify(corrupted)
    ),
  /corrompido|alterado/i,
  "Backup alterado deve ser rejeitado."
);

history.clear();

assert.equal(
  history.getRecent().length,
  0,
  "Limpeza deve remover somente o histórico."
);

assert.ok(
  competitive.getSnapshot().matches > 0,
  "Limpar histórico não deve apagar competitivo."
);

console.log(
  "Testes lógicos da Fase 11 aprovados."
);
