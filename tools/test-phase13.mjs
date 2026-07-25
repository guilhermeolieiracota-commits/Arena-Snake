import assert from "node:assert/strict";
import { StorageService } from "../js/storage/storage-service.js";
import { SupabaseRestClient } from "../js/online/supabase-rest-client.js";
import { CloudSessionService } from "../js/online/cloud-session-service.js";
import { CloudCommunitySystem } from "../js/online/cloud-community-system.js";
import { filterLeaderboard } from "../js/ui/community-view.js";

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
let profileRows = [];
let publicMatchRows = [];
let leaderboardRows = [
  {
    player_id: "SA-OURO000001",
    nickname: "Ouro",
    rating: 1600,
    league_id: "gold",
    best_score: 900,
    best_mass: 600,
    wins: 4,
    profile_level: 10,
    selected_title_id: "coletor",
    skin_id: "solar",
    current_streak: 5,
    total_games: 20,
    total_eliminations: 18,
    updated_at: "2026-07-24T12:00:00.000Z",
  },
  {
    player_id: "SA-BRONZE0001",
    nickname: "Bronze",
    rating: 1050,
    league_id: "bronze",
    best_score: 1200,
    best_mass: 700,
    wins: 2,
    profile_level: 7,
    selected_title_id: "explorador",
    skin_id: "ocean",
    current_streak: 2,
    total_games: 12,
    total_eliminations: 9,
    updated_at: "2026-07-24T12:00:00.000Z",
  },
];

const mockFetch = async (url, options = {}) => {
  const body = options.body
    ? JSON.parse(options.body)
    : null;

  requests.push({
    url,
    method: options.method,
    headers: options.headers,
    body,
  });

  if (url.includes("/auth/v1/recover")) {
    return response(null, 200);
  }

  if (url.includes("/auth/v1/resend")) {
    return response(null, 200);
  }

  if (
    url.endsWith("/auth/v1/user") &&
    options.method === "GET"
  ) {
    return response({
      id: "user-13",
      email: "fase13@example.com",
    });
  }

  if (
    url.endsWith("/auth/v1/user") &&
    options.method === "PUT"
  ) {
    return response({
      id: "user-13",
      email: "fase13@example.com",
    });
  }

  if (url.includes("grant_type=password")) {
    return response({
      user: {
        id: "user-13",
        email: body.email,
      },
      access_token: "access-13",
      refresh_token: "refresh-13",
      expires_in: 3600,
      token_type: "bearer",
    });
  }

  if (url.includes("snake_arena_public_profiles")) {
    if (options.method === "POST") {
      profileRows = [body];
      return response(null, 201);
    }

    if (options.method === "PATCH") {
      profileRows = profileRows.map((row) => ({
        ...row,
        ...body,
      }));
      return response(null, 200);
    }

    return response(profileRows);
  }

  if (url.includes("snake_arena_public_matches")) {
    if (options.method === "POST") {
      publicMatchRows = Array.isArray(body)
        ? body
        : [body];
      return response(null, 201);
    }

    if (options.method === "PATCH") {
      publicMatchRows = publicMatchRows.map((row) => ({
        ...row,
        ...body,
      }));
      return response(null, 200);
    }

    return response(publicMatchRows);
  }

  if (url.includes("snake_arena_leaderboard")) {
    if (options.method === "PATCH") {
      return response(null, 200);
    }

    return response(leaderboardRows);
  }

  if (url.includes("snake_arena_cloud_saves")) {
    return response([]);
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

Object.defineProperty(
  globalThis,
  "window",
  {
    configurable: true,
    value: {
      location: {
        href: "https://game.example/index.html#access_token=recovery-access&refresh_token=recovery-refresh&expires_in=3600&token_type=bearer&type=recovery",
      },
      history: {
        replaceState() {},
      },
    },
  }
);

Object.defineProperty(
  globalThis,
  "document",
  {
    configurable: true,
    value: {
      title: "Snake Arena",
    },
  }
);

const storageService =
  new StorageService(
    new MemoryStorage()
  );

const migrated =
  storageService.load();

assert.equal(
  migrated.version,
  8,
  "Novo save deve usar versão 8."
);

assert.equal(
  migrated.cloud.publicProfileEnabled,
  true,
  "Perfil público deve iniciar ativo."
);

assert.equal(
  migrated.cloud.publicTagline,
  "",
  "Frase pública deve iniciar vazia."
);

const save = storageService.load();
save.settings.nickname = "Fase 13";
save.settings.skinId = "solar";
save.playerMeta.playerId = "SA-FASE130001";
save.playerMeta.currentStreak = 4;
save.stats.gamesPlayed = 15;
save.stats.totalEliminations = 22;
save.stats.bestScore = 1500;
save.stats.bestMass = 830;
save.competitive.rating = 1700;
save.competitive.wins = 5;
save.progression.totalXp = 4200;
save.progression.selectedTitleId = "coletor";
save.matchHistory = [
  {
    id: "match-phase13",
    playedAt: "2026-07-24T12:00:00.000Z",
    nickname: "Fase 13",
    skinId: "solar",
    difficulty: "normal",
    score: 780,
    maximumMass: 510,
    eliminations: 3,
    collected: 120,
    elapsedTime: 95,
    rank: 2,
    totalCompetitors: 15,
    coinsEarned: 100,
    xpEarned: 140,
    seasonPointsEarned: 80,
    ratingBefore: 1660,
    ratingAfter: 1700,
    ratingDelta: 40,
    leagueId: "gold",
    profileLevel: 12,
    titleId: "coletor",
    medalId: "silver",
    medalIcon: "🥈",
    medalName: "Vice-campeão",
  },
];
save.cloud.publicTagline = "Rumo ao topo";
storageService.replaceSave(save);

const client =
  new SupabaseRestClient({
    projectUrl:
      "https://demo.supabase.co",
    publishableKey:
      "sb_publishable_phase13_example_123456",
    fetchImpl: mockFetch,
  });

const sessionService =
  new CloudSessionService({
    client,
    storage:
      new MemoryStorage(),
  });

await sessionService.signIn({
  email: "fase13@example.com",
  password: "123456",
});

await sessionService.requestPasswordRecovery({
  email: "fase13@example.com",
  redirectTo:
    "https://game.example/index.html",
});

assert.equal(
  requests.some((entry) =>
    entry.url.includes("/auth/v1/recover")
  ),
  true,
  "Recuperação deve usar endpoint de recover."
);

await sessionService.resendSignupConfirmation({
  email: "fase13@example.com",
  redirectTo:
    "https://game.example/index.html",
});

assert.equal(
  requests.some((entry) =>
    entry.url.includes("/auth/v1/resend")
  ),
  true,
  "Reenvio deve usar endpoint de resend."
);

const redirect =
  await sessionService.consumeAuthRedirect();

assert.equal(
  redirect.type,
  "recovery",
  "Link de recuperação deve ser reconhecido."
);

await sessionService.updatePassword("nova123");

const passwordRequest =
  requests.find((entry) =>
    entry.url.endsWith("/auth/v1/user") &&
    entry.method === "PUT"
  );

assert.equal(
  passwordRequest.body.password,
  "nova123",
  "Nova senha deve ser enviada autenticada."
);

const community =
  new CloudCommunitySystem({
    client,
    sessionService,
    storageService,
    profileLimit: 100,
    feedLimit: 30,
  });

const profile =
  await community.syncPublicProfile();

assert.equal(
  profile.nickname,
  "Fase 13",
  "Perfil deve usar apelido local."
);

assert.equal(
  profile.tagline,
  "Rumo ao topo",
  "Perfil deve usar frase pública."
);

const matchUpload =
  await community.syncRecentMatches();

assert.equal(
  matchUpload.uploaded,
  1,
  "Partida recente deve ser enviada."
);

assert.equal(
  publicMatchRows[0].user_id,
  "user-13",
  "Partida deve pertencer ao usuário autenticado."
);

const profiles =
  await community.fetchProfiles();

assert.equal(
  profiles.length,
  1,
  "Perfil público deve ser lido."
);

const feed =
  await community.fetchGlobalFeed();

assert.equal(
  feed.length,
  1,
  "Feed deve carregar partida pública."
);

await community.setPublicVisibility(false);

assert.equal(
  storageService
    .getCloudMetadata()
    .publicProfileEnabled,
  false,
  "Preferência de visibilidade deve persistir."
);

assert.equal(
  profileRows[0].is_public,
  false,
  "Perfil remoto deve ser ocultado."
);

assert.equal(
  publicMatchRows[0].is_public,
  false,
  "Partidas antigas devem ser ocultadas."
);

const diagnostics =
  await community.runDiagnostics();

assert.equal(
  diagnostics.checks.length >= 5,
  true,
  "Diagnóstico deve verificar banco e autenticação."
);

assert.equal(
  storageService
    .getCloudMetadata()
    .diagnostics.checks.length,
  diagnostics.checks.length,
  "Diagnóstico deve ser salvo localmente."
);

const filtered =
  filterLeaderboard(
    leaderboardRows.map((row) => ({
      playerId: row.player_id,
      nickname: row.nickname,
      rating: row.rating,
      bestScore: row.best_score,
      wins: row.wins,
      profileLevel: row.profile_level,
    })),
    {
      search: "bron",
      league: "bronze",
      sort: "score",
    }
  );

assert.equal(
  filtered.length,
  1,
  "Busca e filtro de liga devem combinar."
);

assert.equal(
  filtered[0].nickname,
  "Bronze",
  "Filtro deve retornar o jogador correto."
);

console.log(
  "Testes lógicos da Fase 13 aprovados."
);
