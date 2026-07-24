import {
  ACHIEVEMENTS,
  ACHIEVEMENT_MAP,
  getAchievementProgress,
  isAchievementUnlocked,
} from "./achievement-catalog.js";

export class AchievementSystem {
  constructor({
    storageService,
    onUnlock,
  }) {
    this.storageService =
      storageService;

    this.onUnlock = onUnlock;
    this.unlocked =
      this.storageService
        .getAchievements()
        .unlocked;
  }

  reload() {
    this.unlocked =
      this.storageService
        .getAchievements()
        .unlocked;
  }

  evaluate(context, { notify = true } = {}) {
    const newlyUnlocked = [];

    for (const achievement of ACHIEVEMENTS) {
      if (this.unlocked[achievement.id]) {
        continue;
      }

      if (
        !isAchievementUnlocked(
          achievement,
          context
        )
      ) {
        continue;
      }

      const record =
        this.storageService
          .unlockAchievement(
            achievement.id,
            {
              progress:
                getAchievementProgress(
                  achievement,
                  context
                ),
            }
          );

      if (!record) {
        continue;
      }

      this.unlocked = {
        ...this.unlocked,
        [achievement.id]: record,
      };

      const result = {
        ...achievement,
        record,
      };

      newlyUnlocked.push(result);

      if (notify) {
        this.onUnlock?.(result);
      }
    }

    return newlyUnlocked;
  }

  getEntries(context) {
    return ACHIEVEMENTS.map(
      (achievement) => {
        const record =
          this.unlocked[
            achievement.id
          ] ?? null;

        const progress =
          record
            ? achievement.goal
            : getAchievementProgress(
                achievement,
                context
              );

        return {
          ...achievement,
          unlocked: Boolean(record),
          unlockedAt:
            record?.unlockedAt ?? null,
          progress,
        };
      }
    );
  }

  getUnlockedCount() {
    return Object.keys(
      this.unlocked
    ).filter(
      (id) => ACHIEVEMENT_MAP[id]
    ).length;
  }

  reset() {
    this.storageService
      .resetAchievements();

    this.reload();
  }
}
