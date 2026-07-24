import {
  MAX_PROFILE_LEVEL,
  PROFILE_TITLE_MAP,
  PROFILE_TITLES,
  calculateMatchXp,
  getLevelFromTotalXp,
  getLevelReward,
} from "./progression-config.js";

export class ProgressionSystem {
  constructor({
    storageService,
    economySystem,
    onLevelUp,
    onTitleUnlocked,
    onChange,
  }) {
    this.storageService = storageService;
    this.economySystem = economySystem;
    this.onLevelUp = onLevelUp;
    this.onTitleUnlocked = onTitleUnlocked;
    this.onChange = onChange;
    this.state = this.storageService.getProgression();
    this.grantMissingLevelRewards();
    this.syncLevelTitles({ notify: false });
    this.reload();
  }

  reload() {
    this.state = this.storageService.getProgression();
    return this.getSnapshot();
  }

  addXp(
    amount,
    source = "xp",
    {
      unique = false,
      notify = true,
    } = {}
  ) {
    const safeAmount = Math.max(0, Math.round(Number(amount) || 0));

    if (safeAmount <= 0) {
      return {
        added: 0,
        duplicate: false,
        ...this.getSnapshot(),
      };
    }

    const previousLevel = this.getSnapshot().level;
    const result = this.storageService.addProfileXp(
      safeAmount,
      source,
      { unique }
    );

    this.state = result.progression;

    if (result.added <= 0) {
      return {
        added: 0,
        duplicate: result.duplicate,
        ...this.getSnapshot(),
      };
    }

    const snapshot = this.getSnapshot();

    if (snapshot.level > previousLevel) {
      for (
        let level = previousLevel + 1;
        level <= snapshot.level;
        level += 1
      ) {
        this.grantLevelReward(level);
        if (notify) {
          this.onLevelUp?.({
            level,
            reward: getLevelReward(level),
            snapshot: this.getSnapshot(),
          });
        }
      }
    }

    this.syncLevelTitles({ notify });
    this.reload();

    if (notify) {
      this.onChange?.(this.getSnapshot());
    }

    return {
      added: result.added,
      duplicate: false,
      ...this.getSnapshot(),
    };
  }

  rewardMatch(result) {
    const xp = calculateMatchXp(result);
    const matchId =
      `match-xp:${Date.now()}:${Math.random().toString(36).slice(2)}`;

    return this.addXp(xp, matchId);
  }

  grantMissingLevelRewards() {
    const level =
      this.getSnapshot().level;

    for (
      let current = 2;
      current <= level;
      current += 1
    ) {
      if (
        this.state.claimedLevelRewards.includes(
          current
        )
      ) {
        continue;
      }

      this.grantLevelReward(current);
      this.reload();
    }
  }

  grantLevelReward(level) {
    const reward = getLevelReward(level);
    const rewardSource = `profile-level:${level}`;

    this.economySystem.addCoins(
      reward.coins,
      rewardSource,
      { unique: true }
    );

    this.storageService.claimLevelReward(level);
  }

  syncLevelTitles({ notify }) {
    const snapshot = this.getSnapshot();

    for (const title of PROFILE_TITLES) {
      if (title.special || title.unlockLevel > snapshot.level) {
        continue;
      }

      this.unlockTitle(title.id, {
        source: `level:${title.unlockLevel}`,
        notify,
      });
    }
  }

  unlockTitle(
    titleId,
    { source = "unlock", notify = true } = {}
  ) {
    const title = PROFILE_TITLE_MAP[titleId];

    if (!title) {
      return null;
    }

    const result = this.storageService.unlockProfileTitle(
      titleId,
      source
    );

    this.state = result.progression;

    if (result.unlocked && notify) {
      this.onTitleUnlocked?.(title);
    }

    if (notify) {
      this.onChange?.(this.getSnapshot());
    }

    return {
      ...result,
      title,
    };
  }

  selectTitle(titleId) {
    const result =
      this.storageService.selectProfileTitle(titleId);

    if (!result.success) {
      return result;
    }

    this.state = result.progression;
    this.onChange?.(this.getSnapshot());
    return result;
  }

  getSnapshot() {
    const levelInfo = getLevelFromTotalXp(
      this.state.totalXp
    );

    return {
      ...this.state,
      ...levelInfo,
      maxLevel: MAX_PROFILE_LEVEL,
      selectedTitle:
        PROFILE_TITLE_MAP[
          this.state.selectedTitleId
        ] ?? PROFILE_TITLE_MAP.novato,
      unlockedTitles: this.state.unlockedTitles
        .map((id) => PROFILE_TITLE_MAP[id])
        .filter(Boolean),
    };
  }

  getTotalXp() {
    return this.state.totalXp;
  }
}
