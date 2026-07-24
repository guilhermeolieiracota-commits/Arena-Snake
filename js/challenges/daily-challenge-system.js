import {
  DAILY_CHALLENGE_MAP,
  createDailyChallengeIds,
  getLocalDateKey,
} from "./daily-challenge-catalog.js";

export class DailyChallengeSystem {
  constructor({
    storageService,
    economySystem,
    onComplete,
  }) {
    this.storageService = storageService;
    this.economySystem = economySystem;
    this.onComplete = onComplete;
    this.state = this.ensureToday();
  }

  ensureToday(date = new Date()) {
    const dateKey = getLocalDateKey(date);
    const saved = this.storageService.getDailyChallenges();

    if (saved.dateKey === dateKey && saved.items.length === 3) {
      this.state = saved;
      return this.state;
    }

    this.state = {
      dateKey,
      items: createDailyChallengeIds(dateKey).map((id) => ({
        id,
        progress: 0,
        completed: false,
        completedAt: null,
      })),
    };

    this.storageService.saveDailyChallenges(this.state);
    return this.state;
  }

  evaluate(context) {
    this.ensureToday();

    const completedNow = [];
    let changed = false;

    for (const item of this.state.items) {
      const challenge = DAILY_CHALLENGE_MAP[item.id];

      if (!challenge || item.completed) {
        continue;
      }

      const progress = Math.max(
        item.progress,
        Number(challenge.progress(context)) || 0
      );

      if (progress !== item.progress) {
        item.progress = progress;
        changed = true;
      }

      if (progress >= challenge.goal) {
        item.completed = true;
        item.completedAt = new Date().toISOString();
        changed = true;

        this.economySystem.addCoins(
          challenge.reward,
          `daily:${this.state.dateKey}:${challenge.id}`,
          { unique: true }
        );

        const result = {
          ...challenge,
          progress,
          completedAt: item.completedAt,
        };

        completedNow.push(result);
      }
    }

    if (changed) {
      this.state =
        this.storageService.saveDailyChallenges(
          this.state
        );
    }

    for (const result of completedNow) {
      this.onComplete?.(result);
    }

    return completedNow;
  }

  getEntries(context = {}) {
    this.ensureToday();

    return this.state.items
      .map((item) => {
        const challenge = DAILY_CHALLENGE_MAP[item.id];

        if (!challenge) {
          return null;
        }

        const liveProgress = Math.max(
          item.progress,
          Number(challenge.progress(context)) || 0
        );

        return {
          ...challenge,
          progress: Math.min(liveProgress, challenge.goal),
          completed: item.completed,
          completedAt: item.completedAt,
        };
      })
      .filter(Boolean);
  }

  getCompletedCount() {
    this.ensureToday();
    return this.state.items.filter((item) => item.completed).length;
  }

  getDateKey() {
    this.ensureToday();
    return this.state.dateKey;
  }

  resetToday() {
    const dateKey = getLocalDateKey();

    this.state = {
      dateKey,
      items: createDailyChallengeIds(dateKey).map((id) => ({
        id,
        progress: 0,
        completed: false,
        completedAt: null,
      })),
    };

    this.storageService.saveDailyChallenges(this.state);
    return this.state;
  }
}
