import {
  getLeagueByRating,
} from "../competitive/league-config.js";

const encode = (value) =>
  encodeURIComponent(String(value));

const cleanText = (
  value,
  maximumLength
) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximumLength);

const asNumber = (
  value,
  minimum = 0
) =>
  Math.max(
    minimum,
    Number(value) || 0
  );

export class CloudCommunitySystem {
  constructor({
    client,
    sessionService,
    storageService,
    profileLimit = 100,
    feedLimit = 30,
    onStatus,
  }) {
    this.client = client;
    this.sessionService =
      sessionService;
    this.storageService =
      storageService;
    this.profileLimit =
      profileLimit;
    this.feedLimit = feedLimit;
    this.onStatus = onStatus;
    this.operationInProgress = false;
  }

  get available() {
    return Boolean(
      this.client.configured
    );
  }

  get signedIn() {
    return this.sessionService
      .isSignedIn;
  }

  async syncPublicProfile() {
    return this.withOperation(
      "Atualizando perfil público...",
      async () => {
        const {
          token,
          user,
        } = await this.getAuth();

        const save =
          this.storageService.load();

        const cloud = save.cloud;
        const league =
          getLeagueByRating(
            save.competitive.rating
          );

        const row = {
          user_id: user.id,
          player_id:
            save.playerMeta.playerId,
          nickname:
            save.settings.nickname,
          tagline:
            cleanText(
              cloud.publicTagline,
              80
            ),
          title_id:
            save.progression
              .selectedTitleId,
          skin_id:
            save.settings.skinId,
          rating:
            save.competitive.rating,
          league_id: league.id,
          profile_level:
            this.getProfileLevel(
              save.progression.totalXp
            ),
          current_streak:
            save.playerMeta
              .currentStreak,
          total_games:
            save.stats.gamesPlayed,
          total_eliminations:
            save.stats
              .totalEliminations,
          best_score:
            save.stats.bestScore,
          best_mass:
            save.stats.bestMass,
          wins:
            save.competitive.wins,
          is_public:
            cloud.publicProfileEnabled !==
            false,
          updated_at:
            new Date().toISOString(),
        };

        await this.client.dataRequest(
          "snake_arena_public_profiles",
          {
            method: "POST",
            query:
              "on_conflict=user_id",
            accessToken: token,
            prefer:
              "resolution=merge-duplicates,return=minimal",
            body: row,
          }
        );

        this.storageService
          .saveCloudMetadata({
            lastProfilePushAt:
              row.updated_at,
            lastSyncError: null,
          });

        return row;
      }
    );
  }

  async setPublicVisibility(
    enabled
  ) {
    return this.withOperation(
      enabled
        ? "Ativando perfil público..."
        : "Ocultando perfil público...",
      async () => {
        const {
          token,
          user,
        } = await this.getAuth();

        const visible =
          Boolean(enabled);

        this.storageService
          .saveCloudMetadata({
            publicProfileEnabled:
              visible,
          });

        const save =
          this.storageService.load();

        const league =
          getLeagueByRating(
            save.competitive.rating
          );

        const profileRow = {
          user_id: user.id,
          player_id:
            save.playerMeta.playerId,
          nickname:
            save.settings.nickname,
          tagline:
            cleanText(
              save.cloud.publicTagline,
              80
            ),
          title_id:
            save.progression.selectedTitleId,
          skin_id:
            save.settings.skinId,
          rating:
            save.competitive.rating,
          league_id: league.id,
          profile_level:
            this.getProfileLevel(
              save.progression.totalXp
            ),
          current_streak:
            save.playerMeta.currentStreak,
          total_games:
            save.stats.gamesPlayed,
          total_eliminations:
            save.stats.totalEliminations,
          best_score:
            save.stats.bestScore,
          best_mass:
            save.stats.bestMass,
          wins:
            save.competitive.wins,
          is_public: visible,
          updated_at:
            new Date().toISOString(),
        };

        await this.client.dataRequest(
          "snake_arena_public_profiles",
          {
            method: "POST",
            query:
              "on_conflict=user_id",
            accessToken: token,
            prefer:
              "resolution=merge-duplicates,return=minimal",
            body: profileRow,
          }
        );

        await Promise.all([
          this.client.dataRequest(
            "snake_arena_leaderboard",
            {
              method: "PATCH",
              query:
                `user_id=eq.${encode(user.id)}`,
              accessToken: token,
              prefer:
                "return=minimal",
              body: {
                public_profile:
                  visible,
                updated_at:
                  new Date().toISOString(),
              },
            }
          ),
          this.client.dataRequest(
            "snake_arena_public_matches",
            {
              method: "PATCH",
              query:
                `user_id=eq.${encode(user.id)}`,
              accessToken: token,
              prefer:
                "return=minimal",
              body: {
                is_public:
                  visible,
                updated_at:
                  new Date().toISOString(),
              },
            }
          ),
        ]);

        return {
          visible,
        };
      }
    );
  }

  async syncRecentMatches(
    limit = 20
  ) {
    return this.withOperation(
      "Enviando partidas recentes...",
      async () => {
        const {
          token,
          user,
        } = await this.getAuth();

        const save =
          this.storageService.load();

        if (
          save.cloud.publicProfileEnabled ===
          false
        ) {
          return {
            uploaded: 0,
            skipped: true,
          };
        }

        const matches =
          save.matchHistory.slice(
            0,
            Math.max(
              1,
              Math.min(
                30,
                Math.round(limit)
              )
            )
          );

        if (matches.length === 0) {
          return {
            uploaded: 0,
          };
        }

        const rows = matches.map(
          (match) => ({
            match_id:
              match.id,
            user_id: user.id,
            player_id:
              save.playerMeta.playerId,
            nickname:
              save.settings.nickname,
            score:
              match.score,
            rank:
              match.rank,
            total_competitors:
              match.totalCompetitors,
            maximum_mass:
              match.maximumMass,
            eliminations:
              match.eliminations,
            elapsed_time:
              match.elapsedTime,
            rating_after:
              match.ratingAfter,
            league_id:
              getLeagueByRating(
                match.ratingAfter
              ).id,
            medal_icon:
              cleanText(
                match.medalIcon,
                8
              ) || "🎮",
            medal_name:
              cleanText(
                match.medalName,
                48
              ) || "Competidor",
            played_at:
              match.playedAt,
            is_public: true,
          })
        );

        await this.client.dataRequest(
          "snake_arena_public_matches",
          {
            method: "POST",
            query:
              "on_conflict=match_id",
            accessToken: token,
            prefer:
              "resolution=merge-duplicates,return=minimal",
            body: rows,
          }
        );

        const uploadedAt =
          new Date().toISOString();

        this.storageService
          .saveCloudMetadata({
            lastMatchesPushAt:
              uploadedAt,
            lastSyncError: null,
          });

        return {
          uploaded:
            rows.length,
          uploadedAt,
        };
      }
    );
  }

  async syncCommunityData() {
    if (
      !this.available ||
      !this.signedIn ||
      !navigator.onLine
    ) {
      return null;
    }

    const profile =
      await this.syncPublicProfile();

    const matches =
      await this.syncRecentMatches();

    return {
      profile,
      matches,
    };
  }

  async fetchProfiles() {
    if (!this.available) {
      return this.storageService
        .getCloudMetadata()
        .cachedCommunityProfiles;
    }

    try {
      const rows =
        await this.client.dataRequest(
          "snake_arena_public_profiles",
          {
            method: "GET",
            query: [
              "select=player_id,nickname,tagline,title_id,skin_id,rating,league_id,profile_level,current_streak,total_games,total_eliminations,best_score,best_mass,wins,updated_at",
              "is_public=eq.true",
              "order=rating.desc,best_score.desc",
              `limit=${Math.max(
                20,
                this.profileLimit
              )}`,
            ].join("&"),
          }
        );

      const profiles =
        Array.isArray(rows)
          ? rows.map(
              (row) =>
                this.normalizeProfile(
                  row
                )
            )
          : [];

      this.storageService
        .saveCloudMetadata({
          cachedCommunityProfiles:
            profiles,
          communityUpdatedAt:
            new Date().toISOString(),
          lastSyncError: null,
        });

      return profiles;
    } catch (error) {
      this.storageService
        .saveCloudMetadata({
          lastSyncError:
            error.message,
        });

      return this.storageService
        .getCloudMetadata()
        .cachedCommunityProfiles;
    }
  }

  async fetchProfile(
    playerId
  ) {
    if (!this.available) {
      return null;
    }

    const rows =
      await this.client.dataRequest(
        "snake_arena_public_profiles",
        {
          method: "GET",
          query: [
            "select=player_id,nickname,tagline,title_id,skin_id,rating,league_id,profile_level,current_streak,total_games,total_eliminations,best_score,best_mass,wins,updated_at",
            `player_id=eq.${encode(
              playerId
            )}`,
            "limit=1",
          ].join("&"),
        }
      );

    const row =
      Array.isArray(rows)
        ? rows[0]
        : null;

    return row
      ? this.normalizeProfile(row)
      : null;
  }

  async fetchRecentMatches(
    playerId,
    limit = 10
  ) {
    if (!this.available) {
      return [];
    }

    const rows =
      await this.client.dataRequest(
        "snake_arena_public_matches",
        {
          method: "GET",
          query: [
            "select=match_id,player_id,nickname,score,rank,total_competitors,maximum_mass,eliminations,elapsed_time,rating_after,league_id,medal_icon,medal_name,played_at",
            `player_id=eq.${encode(
              playerId
            )}`,
            "is_public=eq.true",
            "order=played_at.desc",
            `limit=${Math.max(
              1,
              Math.min(
                30,
                Math.round(limit)
              )
            )}`,
          ].join("&"),
        }
      );

    return Array.isArray(rows)
      ? rows.map((row) =>
          this.normalizeMatch(row)
        )
      : [];
  }

  async fetchGlobalFeed() {
    if (!this.available) {
      return this.storageService
        .getCloudMetadata()
        .cachedGlobalFeed;
    }

    try {
      const rows =
        await this.client.dataRequest(
          "snake_arena_public_matches",
          {
            method: "GET",
            query: [
              "select=match_id,player_id,nickname,score,rank,total_competitors,maximum_mass,eliminations,elapsed_time,rating_after,league_id,medal_icon,medal_name,played_at",
              "is_public=eq.true",
              "order=played_at.desc",
              `limit=${Math.max(
                10,
                this.feedLimit
              )}`,
            ].join("&"),
          }
        );

      const feed =
        Array.isArray(rows)
          ? rows.map((row) =>
              this.normalizeMatch(row)
            )
          : [];

      this.storageService
        .saveCloudMetadata({
          cachedGlobalFeed:
            feed,
          globalFeedUpdatedAt:
            new Date().toISOString(),
          lastSyncError: null,
        });

      return feed;
    } catch (error) {
      this.storageService
        .saveCloudMetadata({
          lastSyncError:
            error.message,
        });

      return this.storageService
        .getCloudMetadata()
        .cachedGlobalFeed;
    }
  }

  async getCloudSaveInfo() {
    if (
      !this.available ||
      !this.signedIn
    ) {
      return null;
    }

    const {
      token,
      user,
    } = await this.getAuth();

    const rows =
      await this.client.dataRequest(
        "snake_arena_cloud_saves",
        {
          method: "GET",
          query: [
            "select=save_version,updated_at,player_id",
            `user_id=eq.${encode(
              user.id
            )}`,
            "limit=1",
          ].join("&"),
          accessToken: token,
        }
      );

    return Array.isArray(rows)
      ? rows[0] ?? null
      : null;
  }

  async runDiagnostics() {
    const startedAt =
      performance.now();

    const checks = [];

    const check = async (
      id,
      label,
      action
    ) => {
      const start =
        performance.now();

      try {
        const detail =
          await action();

        checks.push({
          id,
          label,
          state: "success",
          detail:
            cleanText(
              detail ?? "Aprovado",
              120
            ),
          durationMs:
            Math.round(
              performance.now() -
                start
            ),
        });
      } catch (error) {
        checks.push({
          id,
          label,
          state: "error",
          detail:
            cleanText(
              error?.message ??
                "Falha",
              120
            ),
          durationMs:
            Math.round(
              performance.now() -
                start
            ),
        });
      }
    };

    checks.push({
      id: "configuration",
      label: "Configuração pública",
      state:
        this.available
          ? "success"
          : "error",
      detail:
        this.available
          ? "URL e chave pública válidas"
          : "Configuração incompleta",
      durationMs: 0,
    });

    checks.push({
      id: "network",
      label: "Conexão do dispositivo",
      state:
        navigator.onLine
          ? "success"
          : "error",
      detail:
        navigator.onLine
          ? "Dispositivo online"
          : "Dispositivo offline",
      durationMs: 0,
    });

    if (
      this.available &&
      navigator.onLine
    ) {
      await check(
        "leaderboard",
        "Tabela do placar",
        async () => {
          await this.client.dataRequest(
            "snake_arena_leaderboard",
            {
              method: "GET",
              query:
                "select=player_id&limit=1",
            }
          );

          return "Leitura pública disponível";
        }
      );

      await check(
        "profiles",
        "Perfis públicos",
        async () => {
          await this.client.dataRequest(
            "snake_arena_public_profiles",
            {
              method: "GET",
              query:
                "select=player_id&limit=1",
            }
          );

          return "Tabela da Fase 13 disponível";
        }
      );

      await check(
        "matches",
        "Partidas públicas",
        async () => {
          await this.client.dataRequest(
            "snake_arena_public_matches",
            {
              method: "GET",
              query:
                "select=match_id&limit=1",
            }
          );

          return "Tabela da Fase 13 disponível";
        }
      );

      if (this.signedIn) {
        await check(
          "session",
          "Sessão autenticada",
          async () => {
            const {
              user,
            } = await this.getAuth();

            return user.email ??
              "Usuário autenticado";
          }
        );

        await check(
          "cloud-save",
          "Save privado",
          async () => {
            const info =
              await this.getCloudSaveInfo();

            return info
              ? `Save v${info.save_version} encontrado`
              : "Conta ainda sem save na nuvem";
          }
        );
      }
    }

    const result = {
      checkedAt:
        new Date().toISOString(),
      durationMs:
        Math.round(
          performance.now() -
            startedAt
        ),
      checks,
      success:
        checks.every(
          (entry) =>
            entry.state ===
            "success"
        ),
    };

    this.storageService
      .saveCloudMetadata({
        diagnostics: result,
      });

    return result;
  }

  async getAuth() {
    const token =
      await this.sessionService
        .getAccessToken();

    const session =
      this.sessionService
        .getSnapshot();

    if (
      !token ||
      !session?.user?.id
    ) {
      throw new Error(
        "Entre na sua conta para continuar."
      );
    }

    return {
      token,
      user: session.user,
    };
  }

  async withOperation(
    message,
    action
  ) {
    if (
      this.operationInProgress
    ) {
      throw new Error(
        "Já existe uma operação online em andamento."
      );
    }

    if (!navigator.onLine) {
      throw new Error(
        "Sem internet. O jogo continua salvo localmente."
      );
    }

    this.operationInProgress = true;
    this.onStatus?.({
      state: "syncing",
      message,
    });

    try {
      const result =
        await action();

      this.onStatus?.({
        state: "success",
        message:
          "Comunidade atualizada.",
      });

      return result;
    } catch (error) {
      this.storageService
        .saveCloudMetadata({
          lastSyncError:
            error.message,
        });

      this.onStatus?.({
        state: "error",
        message:
          error.message,
      });

      throw error;
    } finally {
      this.operationInProgress = false;
    }
  }

  normalizeProfile(row) {
    return {
      playerId:
        cleanText(
          row.player_id,
          32
        ),
      nickname:
        cleanText(
          row.nickname ||
            "Jogador",
          24
        ),
      tagline:
        cleanText(
          row.tagline,
          80
        ),
      titleId:
        cleanText(
          row.title_id ||
            "novato",
          40
        ),
      skinId:
        cleanText(
          row.skin_id ||
            "neon-mint",
          40
        ),
      rating:
        asNumber(row.rating),
      leagueId:
        cleanText(
          row.league_id ||
            "bronze",
          24
        ),
      profileLevel:
        Math.max(
          1,
          Math.round(
            asNumber(
              row.profile_level,
              1
            )
          )
        ),
      currentStreak:
        Math.round(
          asNumber(
            row.current_streak
          )
        ),
      totalGames:
        Math.round(
          asNumber(
            row.total_games
          )
        ),
      totalEliminations:
        Math.round(
          asNumber(
            row.total_eliminations
          )
        ),
      bestScore:
        asNumber(
          row.best_score
        ),
      bestMass:
        asNumber(
          row.best_mass
        ),
      wins:
        Math.round(
          asNumber(row.wins)
        ),
      updatedAt:
        row.updated_at ?? null,
    };
  }

  normalizeMatch(row) {
    return {
      matchId:
        cleanText(
          row.match_id,
          80
        ),
      playerId:
        cleanText(
          row.player_id,
          32
        ),
      nickname:
        cleanText(
          row.nickname ||
            "Jogador",
          24
        ),
      score:
        asNumber(row.score),
      rank:
        Math.max(
          1,
          Math.round(
            asNumber(row.rank, 1)
          )
        ),
      totalCompetitors:
        Math.max(
          1,
          Math.round(
            asNumber(
              row.total_competitors,
              1
            )
          )
        ),
      maximumMass:
        asNumber(
          row.maximum_mass
        ),
      eliminations:
        Math.round(
          asNumber(
            row.eliminations
          )
        ),
      elapsedTime:
        asNumber(
          row.elapsed_time
        ),
      ratingAfter:
        asNumber(
          row.rating_after
        ),
      leagueId:
        cleanText(
          row.league_id ||
            "bronze",
          24
        ),
      medalIcon:
        cleanText(
          row.medal_icon ||
            "🎮",
          8
        ),
      medalName:
        cleanText(
          row.medal_name ||
            "Competidor",
          48
        ),
      playedAt:
        row.played_at ?? null,
    };
  }

  getProfileLevel(totalXp) {
    let level = 1;
    let remaining =
      Math.max(
        0,
        Number(totalXp) || 0
      );

    while (level < 50) {
      const needed =
        Math.round(
          105 +
            (level - 1) * 48 +
            Math.pow(
              level - 1,
              1.32
            ) * 13
        );

      if (remaining < needed) {
        break;
      }

      remaining -= needed;
      level += 1;
    }

    return level;
  }
}
