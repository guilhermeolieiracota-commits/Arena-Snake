import {
  INITIAL_RATING,
  calculateRatingDelta,
  getLeagueByRating,
  getLeagueProgress,
} from "./league-config.js";

export class CompetitiveSystem {
  constructor({
    storageService,
    onLeagueChange,
    onRatingChange,
  }) {
    this.storageService =
      storageService;
    this.onLeagueChange =
      onLeagueChange;
    this.onRatingChange =
      onRatingChange;
    this.state =
      this.storageService
        .getCompetitive();
  }

  reload() {
    this.state =
      this.storageService
        .getCompetitive();

    return this.getSnapshot();
  }

  recordMatch(
    result,
    matchId
  ) {
    const ratingBefore =
      Math.max(
        0,
        Number(
          this.state.rating
        ) || INITIAL_RATING
      );

    const leagueBefore =
      getLeagueByRating(
        ratingBefore
      );

    const ratingDelta =
      calculateRatingDelta(
        result
      );

    const ratingAfter =
      Math.max(
        0,
        ratingBefore +
          ratingDelta
      );

    const recordResult =
      this.storageService
        .recordCompetitiveMatch({
          matchId,
          ratingBefore,
          ratingAfter,
          ratingDelta,
          result,
        });

    if (
      recordResult.duplicate
    ) {
      return {
        duplicate: true,
        ratingBefore,
        ratingAfter:
          this.state.rating,
        ratingDelta: 0,
        ...this.getSnapshot(),
      };
    }

    this.state =
      recordResult.competitive;

    const leagueAfter =
      getLeagueByRating(
        this.state.rating
      );

    if (
      leagueAfter.id !==
      leagueBefore.id
    ) {
      this.onLeagueChange?.({
        previous:
          leagueBefore,
        current:
          leagueAfter,
        rating:
          this.state.rating,
      });
    }

    this.onRatingChange?.(
      this.getSnapshot()
    );

    return {
      duplicate: false,
      ratingBefore,
      ratingAfter:
        this.state.rating,
      ratingDelta,
      leagueBefore,
      leagueAfter,
      ...this.getSnapshot(),
    };
  }

  getSnapshot() {
    const progress =
      getLeagueProgress(
        this.state.rating
      );

    const averageRank =
      this.state.matches > 0
        ? this.state.totalRank /
          this.state.matches
        : 0;

    return {
      ...this.state,
      ...progress,
      averageRank,
      winRate:
        this.state.matches > 0
          ? this.state.wins /
            this.state.matches
          : 0,
      top3Rate:
        this.state.matches > 0
          ? this.state.top3 /
            this.state.matches
          : 0,
    };
  }
}
