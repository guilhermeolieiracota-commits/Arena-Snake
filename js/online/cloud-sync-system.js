import {
  getLeagueByRating,
} from "../competitive/league-config.js";

const encode = (value) =>
  encodeURIComponent(
    String(value)
  );

export class CloudSyncSystem {
  constructor({
    client,
    sessionService,
    storageService,
    leaderboardLimit = 50,
    onStatus,
  }) {
    this.client = client;
    this.sessionService =
      sessionService;
    this.storageService =
      storageService;
    this.leaderboardLimit =
      leaderboardLimit;
    this.onStatus = onStatus;
    this.syncInProgress = false;
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

  async pushSave() {
    return this.withSync(
      "Enviando progresso...",
      async () => {
        const {
          token,
          user,
        } =
          await this.getAuth();

        const save =
          this.storageService.load();

        const now =
          new Date().toISOString();

        const playerMeta =
          save.playerMeta;

        await this.client
          .dataRequest(
            "snake_arena_cloud_saves",
            {
              method: "POST",
              query:
                "on_conflict=user_id",
              accessToken:
                token,
              prefer:
                "resolution=merge-duplicates,return=minimal",
              body: {
                user_id:
                  user.id,
                player_id:
                  playerMeta.playerId,
                save_version:
                  save.version,
                save_data:
                  save,
                updated_at:
                  now,
              },
            }
          );

        this.storageService
          .saveCloudMetadata({
            lastPushAt: now,
            lastCloudUserId:
              user.id,
            lastSyncError:
              null,
          });

        await this.updateLeaderboard();

        return {
          pushedAt: now,
        };
      }
    );
  }

  async pullSave() {
    return this.withSync(
      "Baixando progresso...",
      async () => {
        const {
          token,
          user,
        } =
          await this.getAuth();

        const rows =
          await this.client
            .dataRequest(
              "snake_arena_cloud_saves",
              {
                method: "GET",
                query: [
                  "select=save_data,save_version,updated_at,player_id",
                  `user_id=eq.${encode(user.id)}`,
                  "limit=1",
                ].join("&"),
                accessToken:
                  token,
              }
            );

        const row =
          Array.isArray(rows)
            ? rows[0]
            : null;

        if (!row?.save_data) {
          return {
            found: false,
          };
        }

        const restored =
          this.storageService
            .replaceSave(
              row.save_data,
              {
                preserveCloud:
                  true,
              }
            );

        this.storageService
          .saveCloudMetadata({
            lastPullAt:
              new Date().toISOString(),
            lastCloudUserId:
              user.id,
            lastCloudUpdatedAt:
              row.updated_at ??
              null,
            lastSyncError:
              null,
          });

        return {
          found: true,
          save: restored,
          cloudUpdatedAt:
            row.updated_at ??
            null,
        };
      }
    );
  }

  async updateLeaderboard() {
    const {
      token,
      user,
    } = await this.getAuth();

    const save =
      this.storageService.load();

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
      rating:
        save.competitive.rating,
      league_id:
        league.id,
      best_score:
        save.stats.bestScore,
      best_mass:
        save.stats.bestMass,
      wins:
        save.competitive.wins,
      profile_level:
        this.getProfileLevel(
          save.progression.totalXp
        ),
      selected_title_id:
        save.progression.selectedTitleId,
      skin_id:
        save.settings.skinId,
      current_streak:
        save.playerMeta.currentStreak,
      total_games:
        save.stats.gamesPlayed,
      total_eliminations:
        save.stats.totalEliminations,
      public_profile:
        save.cloud.publicProfileEnabled !== false,
      updated_at:
        new Date().toISOString(),
    };

    await this.client.dataRequest(
      "snake_arena_leaderboard",
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

    return row;
  }

  async fetchLeaderboard() {
    if (!this.available) {
      return this.storageService
        .getCloudMetadata()
        .cachedLeaderboard;
    }

    try {
      const rows =
        await this.client
          .dataRequest(
            "snake_arena_leaderboard",
            {
              method: "GET",
              query: [
                "select=player_id,nickname,rating,league_id,best_score,best_mass,wins,profile_level,selected_title_id,skin_id,current_streak,total_games,total_eliminations,updated_at",
                "order=rating.desc,best_score.desc",
                `limit=${Math.max(10, this.leaderboardLimit)}`,
              ].join("&"),
            }
          );

      const leaderboard =
        Array.isArray(rows)
          ? rows.map(
              (row) => ({
                playerId:
                  row.player_id,
                nickname:
                  String(
                    row.nickname ??
                      "Jogador"
                  ).slice(0, 24),
                rating:
                  Math.max(
                    0,
                    Number(
                      row.rating
                    ) || 0
                  ),
                leagueId:
                  row.league_id,
                bestScore:
                  Math.max(
                    0,
                    Number(
                      row.best_score
                    ) || 0
                  ),
                bestMass:
                  Math.max(
                    0,
                    Number(
                      row.best_mass
                    ) || 0
                  ),
                wins:
                  Math.max(
                    0,
                    Number(
                      row.wins
                    ) || 0
                  ),
                profileLevel:
                  Math.max(
                    1,
                    Number(
                      row.profile_level
                    ) || 1
                  ),
                titleId:
                  String(
                    row.selected_title_id ??
                      "novato"
                  ).slice(0, 40),
                skinId:
                  String(
                    row.skin_id ??
                      "neon-mint"
                  ).slice(0, 40),
                currentStreak:
                  Math.max(
                    0,
                    Math.round(
                      Number(
                        row.current_streak
                      ) || 0
                    )
                  ),
                totalGames:
                  Math.max(
                    0,
                    Math.round(
                      Number(
                        row.total_games
                      ) || 0
                    )
                  ),
                totalEliminations:
                  Math.max(
                    0,
                    Math.round(
                      Number(
                        row.total_eliminations
                      ) || 0
                    )
                  ),
                updatedAt:
                  row.updated_at,
              })
            )
          : [];

      this.storageService
        .saveCloudMetadata({
          cachedLeaderboard:
            leaderboard,
          leaderboardUpdatedAt:
            new Date().toISOString(),
          lastSyncError:
            null,
        });

      return leaderboard;
    } catch (error) {
      this.storageService
        .saveCloudMetadata({
          lastSyncError:
            error.message,
        });

      return this.storageService
        .getCloudMetadata()
        .cachedLeaderboard;
    }
  }

  async syncAfterMatch() {
    const cloud =
      this.storageService
        .getCloudMetadata();

    if (
      !this.available ||
      !this.signedIn ||
      !navigator.onLine ||
      cloud.autoSyncEnabled === false
    ) {
      return null;
    }

    try {
      return await this.pushSave();
    } catch (error) {
      this.storageService
        .saveCloudMetadata({
          lastSyncError:
            error.message,
        });

      this.onStatus?.({
        state: "error",
        message:
          "Partida salva localmente; a nuvem será tentada depois.",
      });

      return null;
    }
  }

  async getAuth() {
    if (!this.available) {
      throw new Error(
        "O modo online ainda não foi configurado."
      );
    }

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
        "Entre na sua conta para sincronizar."
      );
    }

    return {
      token,
      user:
        session.user,
    };
  }

  async withSync(
    message,
    action
  ) {
    if (this.syncInProgress) {
      throw new Error(
        "Já existe uma sincronização em andamento."
      );
    }

    if (!navigator.onLine) {
      throw new Error(
        "Sem internet. O progresso continua salvo neste dispositivo."
      );
    }

    this.syncInProgress = true;

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
          "Sincronização concluída.",
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
      this.syncInProgress = false;
    }
  }

  getProfileLevel(totalXp) {
    const safeXp =
      Math.max(
        0,
        Number(totalXp) || 0
      );

    let level = 1;
    let remaining = safeXp;

    while (
      level < 50
    ) {
      const needed =
        Math.round(
          105 +
            (level - 1) * 48 +
            Math.pow(
              level - 1,
              1.32
            ) * 13
        );

      if (
        remaining < needed
      ) {
        break;
      }

      remaining -= needed;
      level += 1;
    }

    return level;
  }
}
