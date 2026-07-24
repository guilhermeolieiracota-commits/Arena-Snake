import {
  getLeagueByRating,
  getPlacementMedal,
} from "../competitive/league-config.js";

function createMatchId() {
  if (
    globalThis.crypto?.randomUUID
  ) {
    return globalThis.crypto.randomUUID();
  }

  return [
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2, 10),
  ].join("-");
}

export class MatchHistorySystem {
  constructor({
    storageService,
  }) {
    this.storageService =
      storageService;
  }

  createMatchId() {
    return createMatchId();
  }

  record({
    matchId,
    result,
    rewards,
    competitive,
    profile,
    settings,
  }) {
    const medal =
      getPlacementMedal(
        result
      );

    const record = {
      id:
        matchId ??
        createMatchId(),
      playedAt:
        new Date().toISOString(),

      nickname:
        settings.nickname,
      skinId:
        settings.skinId,
      difficulty:
        settings.difficulty,

      score:
        Math.max(
          0,
          Number(
            result.score
          ) || 0
        ),
      maximumMass:
        Math.max(
          0,
          Number(
            result.maximumMass
          ) || 0
        ),
      eliminations:
        Math.max(
          0,
          Math.round(
            Number(
              result.eliminations
            ) || 0
          )
        ),
      collected:
        Math.max(
          0,
          Math.round(
            Number(
              result.collected
            ) || 0
          )
        ),
      elapsedTime:
        Math.max(
          0,
          Number(
            result.elapsedTime
          ) || 0
        ),
      rank:
        Number.isFinite(
          Number(result.rank)
        )
          ? Math.max(
              1,
              Math.round(
                Number(result.rank)
              )
            )
          : null,
      totalCompetitors:
        Math.max(
          1,
          Math.round(
            Number(
              result.totalCompetitors
            ) || 1
          )
        ),

      coinsEarned:
        Math.max(
          0,
          Math.round(
            Number(
              rewards.coins
            ) || 0
          )
        ),
      xpEarned:
        Math.max(
          0,
          Math.round(
            Number(
              rewards.xp
            ) || 0
          )
        ),
      seasonPointsEarned:
        Math.max(
          0,
          Math.round(
            Number(
              rewards.seasonPoints
            ) || 0
          )
        ),

      ratingBefore:
        competitive.ratingBefore,
      ratingAfter:
        competitive.ratingAfter,
      ratingDelta:
        competitive.ratingDelta,
      leagueId:
        getLeagueByRating(
          competitive.ratingAfter
        ).id,

      profileLevel:
        profile.level,
      titleId:
        profile.selectedTitleId,

      medalId:
        medal.id,
      medalIcon:
        medal.icon,
      medalName:
        medal.name,
    };

    return this.storageService
      .recordMatchHistory(
        record
      );
  }

  getRecent(limit = 50) {
    return this.storageService
      .getMatchHistory()
      .slice(
        0,
        Math.max(
          1,
          Math.round(limit)
        )
      );
  }

  getBestRuns(limit = 10) {
    return [
      ...this.storageService
        .getMatchHistory(),
    ]
      .sort((first, second) => {
        if (
          second.score !==
          first.score
        ) {
          return (
            second.score -
            first.score
          );
        }

        if (
          first.rank !==
          second.rank
        ) {
          return (
            (first.rank ?? 999) -
            (second.rank ?? 999)
          );
        }

        return (
          second.maximumMass -
          first.maximumMass
        );
      })
      .slice(
        0,
        Math.max(
          1,
          Math.round(limit)
        )
      );
  }

  clear() {
    return this.storageService
      .clearMatchHistory();
  }
}
