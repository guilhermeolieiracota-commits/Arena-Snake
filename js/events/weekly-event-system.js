import {
  WEEKLY_COMPLETION_REWARD,
  getWeeklyEventInfo,
} from "./weekly-event-catalog.js";

export class WeeklyEventSystem {
  constructor({
    storageService,
    economySystem,
    progressionSystem,
    seasonSystem,
    onObjectiveComplete,
    onEventComplete,
  }) {
    this.storageService = storageService;
    this.economySystem = economySystem;
    this.progressionSystem = progressionSystem;
    this.seasonSystem = seasonSystem;
    this.onObjectiveComplete = onObjectiveComplete;
    this.onEventComplete = onEventComplete;
    this.state =
      this.storageService.getWeeklyEvent();

    this.ensureCurrentEvent();
  }

  ensureCurrentEvent(date = new Date()) {
    const info = getWeeklyEventInfo(date);
    const saved = this.storageService.getWeeklyEvent();

    if (saved.key === info.key) {
      this.state = saved;
      return this.getSnapshot(date);
    }

    this.state = {
      key: info.key,
      progress: {},
      completedObjectives: [],
      completionRewardClaimed: false,
      history: [
        ...(saved.key
          ? [
              {
                key: saved.key,
                completed:
                  saved.completionRewardClaimed,
                finishedAt:
                  new Date().toISOString(),
              },
            ]
          : []),
        ...(saved.history ?? []),
      ].slice(0, 16),
    };

    this.storageService.saveWeeklyEvent(this.state);
    return this.getSnapshot(date);
  }

  recordMatch(result) {
    const info = getWeeklyEventInfo();
    this.ensureCurrentEvent();

    const increments = {
      matches: 1,
      collected: Math.max(
        0,
        Math.round(Number(result.collected) || 0)
      ),
      score: Math.max(
        0,
        Math.round(Number(result.score) || 0)
      ),
      eliminations: Math.max(
        0,
        Math.round(Number(result.eliminations) || 0)
      ),
      survival: Math.max(
        0,
        Math.round(Number(result.elapsedTime) || 0)
      ),
      mass: Math.max(
        0,
        Math.round(Number(result.maximumMass) || 0)
      ),
      top5:
        Number(result.rank) > 0 &&
        Number(result.rank) <= 5
          ? 1
          : 0,
    };

    for (const [key, amount] of Object.entries(increments)) {
      this.state.progress[key] =
        Math.max(0, Number(this.state.progress[key]) || 0) +
        amount;
    }

    const completedNow = [];

    for (const objective of info.objectives) {
      if (
        this.state.completedObjectives.includes(
          objective.id
        )
      ) {
        continue;
      }

      if (
        (this.state.progress[objective.id] ?? 0) <
        objective.goal
      ) {
        continue;
      }

      this.state.completedObjectives.push(
        objective.id
      );

      this.economySystem.addCoins(
        objective.rewardCoins,
        `weekly:${info.key}:${objective.id}:coins`,
        { unique: true }
      );

      this.progressionSystem.addXp(
        objective.rewardXp,
        `weekly:${info.key}:${objective.id}:xp`,
        { unique: true }
      );

      completedNow.push(objective);
    }

    const completedAll = info.objectives.every(
      (objective) =>
        this.state.completedObjectives.includes(
          objective.id
        )
    );

    let eventCompletedNow = false;

    if (
      completedAll &&
      !this.state.completionRewardClaimed
    ) {
      this.state.completionRewardClaimed = true;
      eventCompletedNow = true;

      this.economySystem.addCoins(
        WEEKLY_COMPLETION_REWARD.coins,
        `weekly:${info.key}:complete:coins`,
        { unique: true }
      );

      this.progressionSystem.addXp(
        WEEKLY_COMPLETION_REWARD.profileXp,
        `weekly:${info.key}:complete:xp`,
        { unique: true }
      );

      this.seasonSystem.addPoints(
        WEEKLY_COMPLETION_REWARD.seasonPoints,
        `weekly:${info.key}:complete:season`,
        { unique: true }
      );

      this.progressionSystem.unlockTitle(
        WEEKLY_COMPLETION_REWARD.titleId,
        {
          source: `weekly:${info.key}`,
        }
      );

    }

    this.state =
      this.storageService.saveWeeklyEvent(
        this.state
      );

    for (const objective of completedNow) {
      this.onObjectiveComplete?.({
        event: info,
        objective,
      });
    }

    if (eventCompletedNow) {
      this.onEventComplete?.({
        event: info,
        reward: WEEKLY_COMPLETION_REWARD,
      });
    }

    return this.getSnapshot();
  }

  getSnapshot(date = new Date()) {
    const info = getWeeklyEventInfo(date);

    return {
      ...this.state,
      ...info,
      objectives: info.objectives.map(
        (objective) => ({
          ...objective,
          progress: Math.min(
            Number(
              this.state.progress[
                objective.id
              ]
            ) || 0,
            objective.goal
          ),
          completed:
            this.state.completedObjectives.includes(
              objective.id
            ),
        })
      ),
      completionReward:
        WEEKLY_COMPLETION_REWARD,
      completedCount:
        this.state.completedObjectives.length,
    };
  }
}
