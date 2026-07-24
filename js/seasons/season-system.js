import {
  SEASON_MAX_LEVEL,
  calculateSeasonPoints,
  getSeasonInfo,
  getSeasonLevel,
  getSeasonLevelProgress,
  getSeasonReward,
} from "./season-config.js";

export class SeasonSystem {
  constructor({
    storageService,
    economySystem,
    progressionSystem,
    onReward,
    onSeasonChanged,
  }) {
    this.storageService = storageService;
    this.economySystem = economySystem;
    this.progressionSystem = progressionSystem;
    this.onReward = onReward;
    this.onSeasonChanged = onSeasonChanged;
    this.state =
      this.storageService.getSeason();

    this.ensureCurrentSeason();
    this.grantReachedRewards({
      notify: false,
    });
  }

  ensureCurrentSeason(date = new Date()) {
    const info = getSeasonInfo(date);
    const saved = this.storageService.getSeason();

    if (saved.key === info.key) {
      this.state = saved;
      return this.getSnapshot(date);
    }

    const previous = saved.key
      ? {
          key: saved.key,
          points: saved.points,
          highestLevel: saved.highestLevel,
          finishedAt: new Date().toISOString(),
        }
      : null;

    this.state = {
      key: info.key,
      points: 0,
      claimedLevels: [],
      highestLevel: 1,
      history: [
        ...(previous ? [previous] : []),
        ...(saved.history ?? []),
      ].slice(0, 12),
    };

    this.storageService.saveSeason(this.state);
    this.onSeasonChanged?.(info);
    return this.getSnapshot(date);
  }

  addPoints(
    amount,
    source = "season",
    { unique = false } = {}
  ) {
    this.ensureCurrentSeason();

    const previousLevel = getSeasonLevel(
      this.state.points
    );

    const result =
      this.storageService.addSeasonPoints(
        Math.max(0, Math.round(Number(amount) || 0)),
        source,
        { unique }
      );

    this.state = result.season;
    const currentLevel = getSeasonLevel(
      this.state.points
    );

    if (currentLevel > previousLevel) {
      for (
        let level = previousLevel + 1;
        level <= currentLevel;
        level += 1
      ) {
        this.claimReward(level);
      }
    }

    return {
      added: result.added,
      ...this.getSnapshot(),
    };
  }

  rewardMatch(result) {
    return this.addPoints(
      calculateSeasonPoints(result),
      `season-match:${Date.now()}:${Math.random()
        .toString(36)
        .slice(2)}`
    );
  }

  grantReachedRewards({
    notify = true,
  } = {}) {
    const level =
      getSeasonLevel(
        this.state.points
      );

    for (
      let current = 1;
      current <= level;
      current += 1
    ) {
      if (
        this.state.claimedLevels.includes(
          current
        )
      ) {
        continue;
      }

      this.claimReward(
        current,
        { notify }
      );
    }
  }

  claimReward(
    level,
    { notify = true } = {}
  ) {
    if (
      this.state.claimedLevels.includes(level)
    ) {
      return null;
    }

    const reward = getSeasonReward(level);

    this.economySystem.addCoins(
      reward.coins,
      `season:${this.state.key}:level:${level}:coins`,
      { unique: true }
    );

    this.progressionSystem.addXp(
      reward.profileXp,
      `season:${this.state.key}:level:${level}:xp`,
      {
        unique: true,
        notify,
      }
    );

    if (reward.titleId) {
      this.progressionSystem.unlockTitle(
        reward.titleId,
        {
          source: `season:${this.state.key}:level:${level}`,
        }
      );
    }

    this.state =
      this.storageService.claimSeasonLevel(
        level
      ).season;

    if (notify) {
      this.onReward?.({
        season: getSeasonInfo(),
        reward,
      });
    }

    return reward;
  }

  getSnapshot(date = new Date()) {
    const info = getSeasonInfo(date);
    const progress = getSeasonLevelProgress(
      this.state.points
    );

    return {
      ...this.state,
      ...info,
      ...progress,
      maxLevel: SEASON_MAX_LEVEL,
      rewards: Array.from(
        { length: SEASON_MAX_LEVEL },
        (_, index) => {
          const level = index + 1;

          return {
            ...getSeasonReward(level),
            claimed:
              this.state.claimedLevels.includes(level),
            reached:
              progress.level >= level,
          };
        }
      ),
    };
  }

  getPoints() {
    return this.state.points;
  }
}
