function getLocalDateKey(
  date = new Date()
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateKeyToNoon(
  dateKey
) {
  return new Date(
    `${dateKey}T12:00:00`
  );
}

function differenceInDays(
  firstKey,
  secondKey
) {
  const first =
    dateKeyToNoon(firstKey);

  const second =
    dateKeyToNoon(secondKey);

  return Math.round(
    (
      second.getTime() -
      first.getTime()
    ) /
      86_400_000
  );
}

export class StreakSystem {
  constructor({
    storageService,
    economySystem,
    onDailyReward,
    onStreakMilestone,
  }) {
    this.storageService =
      storageService;
    this.economySystem =
      economySystem;
    this.onDailyReward =
      onDailyReward;
    this.onStreakMilestone =
      onStreakMilestone;
    this.state =
      this.storageService
        .getPlayerMeta();
  }

  registerToday(
    date = new Date()
  ) {
    const dateKey =
      getLocalDateKey(date);

    if (
      this.state.lastActiveDate ===
      dateKey
    ) {
      return {
        firstActivityToday:
          false,
        ...this.getSnapshot(),
      };
    }

    const previousDate =
      this.state.lastActiveDate;

    const consecutive =
      previousDate &&
      differenceInDays(
        previousDate,
        dateKey
      ) === 1;

    const currentStreak =
      consecutive
        ? this.state.currentStreak + 1
        : 1;

    const activityDates =
      Array.from(
        new Set([
          dateKey,
          ...this.state.activityDates,
        ])
      ).slice(0, 120);

    this.state =
      this.storageService
        .savePlayerMeta({
          ...this.state,
          lastActiveDate:
            dateKey,
          currentStreak,
          longestStreak:
            Math.max(
              this.state.longestStreak,
              currentStreak
            ),
          totalActiveDays:
            this.state.totalActiveDays + 1,
          activityDates,
        });

    const dailyReward =
      25 +
      Math.min(
        35,
        currentStreak * 3
      );

    const rewardResult =
      this.economySystem
        .addCoins(
          dailyReward,
          `activity:${dateKey}`,
          { unique: true }
        );

    if (
      rewardResult.added > 0
    ) {
      this.onDailyReward?.({
        amount:
          rewardResult.added,
        streak:
          currentStreak,
      });
    }

    if (
      currentStreak > 0 &&
      currentStreak % 7 === 0
    ) {
      const milestoneReward =
        100 +
        currentStreak * 2;

      const milestone =
        this.economySystem
          .addCoins(
            milestoneReward,
            `streak:${currentStreak}:${dateKey}`,
            { unique: true }
          );

      if (
        milestone.added > 0
      ) {
        this.onStreakMilestone?.({
          streak:
            currentStreak,
          amount:
            milestone.added,
        });
      }
    }

    return {
      firstActivityToday:
        true,
      dailyReward:
        rewardResult.added,
      ...this.getSnapshot(),
    };
  }

  reload() {
    this.state =
      this.storageService
        .getPlayerMeta();

    return this.getSnapshot();
  }

  getSnapshot() {
    return {
      ...this.state,
      todayKey:
        getLocalDateKey(),
    };
  }
}
