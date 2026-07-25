import assert from "node:assert/strict";
import { StorageService } from "../js/storage/storage-service.js";
import { SupabaseRestClient } from "../js/online/supabase-rest-client.js";
import { CloudSessionService } from "../js/online/cloud-session-service.js";
import { CloudSyncSystem } from "../js/online/cloud-sync-system.js";
import { SaveTransferService } from "../js/backup/save-transfer-service.js";
import { isCloudConfigured } from "../js/config/cloud-config.js";

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
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

const response = (body, status = 200) =>
  new Response(
    body === null
      ? ""
      : JSON.stringify(body),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

const requests = [];
let cloudSaveRow = null;
let leaderboardRow = null;
let refreshCount = 0;

const mockFetch = async (url, options = {}) => {
  const parsedBody = options.body
    ? JSON.parse(options.body)
    : null;

  requests.push({
    url,
    options,
    body: parsedBody,
  });

  if (url.includes("/auth/v1/signup")) {
    return response({
      user: {
        id: "user-signup",
        email: parsedBody.email,
      },
      access_token: "signup-access",
      refresh_token: "signup-refresh",
      expires_in: 3600,
      token_type: "bearer",
    });
  }

  if (
    url.includes(
      "grant_type=password"
    )
  ) {
    return response({
      user: {
        id: "user-123",
        email: parsedBody.email,
      },
      access_token: "access-1",
      refresh_token: "refresh-1",
      expires_in: 3600,
      token_type: "bearer",
    });
  }

  if (
    url.includes(
      "grant_type=refresh_token"
    )
  ) {
    refreshCount += 1;

    return response({
      user: {
        id: "user-123",
        email: "jogador@example.com",
      },
      access_token: `access-refresh-${refreshCount}`,
      refresh_token: `refresh-${refreshCount + 1}`,
      expires_in: 3600,
      token_type: "bearer",
    });
  }

  if (url.endsWith("/auth/v1/user")) {
    return response({
      id: "user-123",
      email: "jogador@example.com",
    });
  }

  if (url.includes("/auth/v1/logout")) {
    return response(null, 204);
  }

  if (
    url.includes(
      "/rest/v1/snake_arena_cloud_saves"
    )
  ) {
    if (options.method === "POST") {
      cloudSaveRow = parsedBody;
      return response(null, 201);
    }

    return response(
      cloudSaveRow
        ? [
            {
              save_data:
                cloudSaveRow.save_data,
              save_version:
                cloudSaveRow.save_version,
              updated_at:
                cloudSaveRow.updated_at,
              player_id:
                cloudSaveRow.player_id,
            },
          ]
        : []
    );
  }

  if (
    url.includes(
      "/rest/v1/snake_arena_leaderboard"
    )
  ) {
    if (options.method === "POST") {
      leaderboardRow = parsedBody;
      return response(null, 201);
    }

    return response(
      leaderboardRow
        ? [leaderboardRow]
        : [
            {
              player_id: "SA-GLOBAL000001",
              nickname: "Campeão",
              rating: 2300,
              league_id: "diamond",
              best_score: 4200,
              best_mass: 1500,
              wins: 18,
              profile_level: 24,
              updated_at:
                "2026-07-24T12:00:00.000Z",
            },
          ]
    );
  }

  return response(
    { message: "Not found" },
    404
  );
};

Object.defineProperty(
  globalThis,
  "navigator",
  {
    configurable: true,
    value: {
      onLine: true,
    },
  }
);

assert.equal(
  isCloudConfigured({
    enabled: false,
    projectUrl:
      "https://demo.supabase.co",
    publishableKey:
      "sb_publishable_example_key_123456",
  }),
  false,
  "Cloud desativado deve permanecer local."
);

assert.equal(
  isCloudConfigured({
    enabled: true,
    projectUrl:
      "https://demo.supabase.co",
    publishableKey:
      "sb_publishable_example_key_123456",
  }),
  true,
  "Configuração pública válida deve ativar cloud."
);

const phase11Save = {
  version: 5,
  settings: {
    nickname: "Jogador Cloud",
    controlMode: "follow",
    quality: "high",
    difficulty: "normal",
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
    gamesPlayed: 12,
    deaths: 12,
    totalPlaySeconds: 800,
    totalCollected: 1500,
    totalEliminations: 15,
    bestScore: 900,
    bestMass: 600,
    bestRank: 1,
    bestEliminations: 5,
    longestSurvivalSeconds: 140,
    lastPlayedAt: null,
  },
  achievements: {
    unlocked: {},
  },
  economy: {
    coins: 700,
    lifetimeEarned: 1200,
    lifetimeSpent: 500,
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
    totalXp: 3200,
    claimedLevelRewards: [],
    unlockedTitles: ["novato"],
    selectedTitleId: "novato",
    xpLedger: {},
    recentXp: [],
    titleHistory: [],
  },
  season: {
    key: "",
    points: 400,
    claimedLevels: [],
    highestLevel: 1,
    pointsLedger: {},
    history: [],
  },
  weeklyEvent: {
    key: "",
    progress: {},
    completedObjectives: [],
    completionRewardClaimed: false,
    history: [],
  },
  playerMeta: {
    playerId: "SA-CLOUDTEST01",
    createdAt:
      "2026-07-20T12:00:00.000Z",
    lastBackupAt: null,
    lastActiveDate: null,
    currentStreak: 0,
    longestStreak: 0,
    totalActiveDays: 0,
    activityDates: [],
  },
  competitive: {
    rating: 1600,
    peakRating: 1700,
    matches: 12,
    wins: 2,
    top3: 5,
    totalRank: 70,
    totalOpponents: 168,
    totalRatingDelta: 600,
    ratingLedger: {},
    leagueHistory: [],
  },
  matchHistory: [],
};

const storageKey =
  "snake_arena_save";

const localStorage =
  new MemoryStorage({
    [storageKey]:
      JSON.stringify(
        phase11Save
      ),
  });

const storageService =
  new StorageService(
    localStorage
  );

const migrated =
  storageService.load();

assert.equal(
  migrated.version,
  8,
  "Save deve migrar para a versão atual."
);

assert.equal(
  migrated.settings.masterVolume,
  0,
  "Volume zero deve ser preservado."
);

assert.equal(
  migrated.cloud.autoSyncEnabled,
  true,
  "Auto sync deve iniciar ativo."
);

assert.deepEqual(
  migrated.cloud.cachedLeaderboard,
  [],
  "Cache global deve iniciar vazio."
);

const client =
  new SupabaseRestClient({
    projectUrl:
      "https://demo.supabase.co",
    publishableKey:
      "sb_publishable_example_key_123456",
    fetchImpl: mockFetch,
  });

const sessionStorage =
  new MemoryStorage();

const sessionService =
  new CloudSessionService({
    client,
    storage: sessionStorage,
  });

const signedIn =
  await sessionService.signIn({
    email:
      "jogador@example.com",
    password:
      "123456",
  });

assert.equal(
  signedIn.user.id,
  "user-123",
  "Login deve armazenar usuário."
);

assert.equal(
  sessionService.isSignedIn,
  true,
  "Sessão deve permanecer conectada."
);

sessionService.session.expiresAt =
  Date.now() - 1;

const refreshedToken =
  await sessionService.getAccessToken();

assert.equal(
  refreshedToken,
  "access-refresh-1",
  "Sessão expirada deve renovar token."
);

assert.equal(
  refreshCount,
  1,
  "Refresh deve ocorrer uma vez."
);

const cloudSync =
  new CloudSyncSystem({
    client,
    sessionService,
    storageService,
    leaderboardLimit: 50,
  });

const pushed =
  await cloudSync.pushSave();

assert.ok(
  pushed.pushedAt,
  "Envio deve retornar data."
);

assert.equal(
  cloudSaveRow.user_id,
  "user-123",
  "Save deve usar o usuário autenticado."
);

assert.equal(
  cloudSaveRow.player_id,
  "SA-CLOUDTEST01",
  "ID local deve ir para a nuvem."
);

const saveRequest =
  requests.find(
    (entry) =>
      entry.url.includes(
        "snake_arena_cloud_saves"
      ) &&
      entry.options.method === "POST"
  );

assert.equal(
  saveRequest.options.headers.apikey,
  "sb_publishable_example_key_123456",
  "Data API deve receber chave pública."
);

assert.match(
  saveRequest.options.headers.Authorization,
  /^Bearer access-/,
  "Data API privada deve receber JWT do usuário."
);

assert.ok(
  leaderboardRow,
  "Envio deve atualizar o placar."
);

const leaderboard =
  await cloudSync.fetchLeaderboard();

assert.equal(
  leaderboard.length,
  1,
  "Placar deve retornar uma linha."
);

assert.equal(
  storageService
    .getCloudMetadata()
    .cachedLeaderboard.length,
  1,
  "Placar deve ser salvo no cache local."
);

const cloudNickname =
  cloudSaveRow.save_data.settings.nickname;

cloudSaveRow.save_data.settings.nickname =
  "Restaurado da nuvem";

const pulled =
  await cloudSync.pullSave();

assert.equal(
  pulled.found,
  true,
  "Download deve encontrar save."
);

assert.equal(
  storageService.load().settings.nickname,
  "Restaurado da nu",
  "Download deve substituir save local e aplicar a validação do apelido."
);

assert.equal(
  storageService
    .getCloudMetadata()
    .autoSyncEnabled,
  true,
  "Download deve preservar preferência cloud local."
);

cloudSaveRow.save_data.settings.nickname =
  cloudNickname;

const transfer =
  new SaveTransferService({
    storageService,
  });

const backup =
  transfer.createBackupObject();

assert.equal(
  Object.hasOwn(
    backup,
    "session"
  ),
  false,
  "Backup não pode conter sessão."
);

const backupText =
  JSON.stringify(backup);

assert.equal(
  backupText.includes(
    "access-refresh-1"
  ),
  false,
  "Backup não pode conter access token."
);

assert.equal(
  backupText.includes(
    "refresh-2"
  ),
  false,
  "Backup não pode conter refresh token."
);

await sessionService.signOut();

assert.equal(
  sessionService.isSignedIn,
  false,
  "Logout local deve remover a sessão."
);

console.log(
  "Testes lógicos da Fase 12 aprovados."
);
