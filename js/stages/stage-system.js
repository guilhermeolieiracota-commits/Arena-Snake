import {
  STAGE_CONFIG,
  getStageDifficulty,
  getStageDifficultyLabel,
  normalizeStage,
} from "./stage-config.js";

export class StageSystem {
  constructor({ storageService }) {
    this.storageService = storageService;
    this.reload();
  }

  reload() {
    const playerMeta =
      this.storageService.getPlayerMeta();

    this.state = {
      currentStage: normalizeStage(
        playerMeta.currentStage
      ),
      highestStage: normalizeStage(
        Math.max(
          playerMeta.highestStage || 1,
          playerMeta.currentStage || 1
        )
      ),
      stagesCompleted: Math.max(
        0,
        Math.round(
          Number(
            playerMeta.stagesCompleted
          ) || 0
        )
      ),
      lastStageCompletedAt:
        typeof playerMeta.lastStageCompletedAt ===
        "string"
          ? playerMeta.lastStageCompletedAt
          : null,
    };

    return this.getSnapshot();
  }

  persist() {
    const playerMeta =
      this.storageService.getPlayerMeta();

    this.storageService.savePlayerMeta({
      ...playerMeta,
      ...this.state,
    });
  }

  getSnapshot() {
    const difficulty = getStageDifficulty(
      this.state.currentStage
    );

    return {
      ...this.state,
      durationSeconds:
        STAGE_CONFIG.durationSeconds,
      difficulty,
      difficultyLabel:
        getStageDifficultyLabel(
          this.state.currentStage
        ),
    };
  }

  completeCurrentStage() {
    const completedStage =
      this.state.currentStage;

    const nextStage = normalizeStage(
      completedStage + 1
    );

    this.state = {
      ...this.state,
      currentStage: nextStage,
      highestStage: Math.max(
        this.state.highestStage,
        nextStage
      ),
      stagesCompleted:
        this.state.stagesCompleted + 1,
      lastStageCompletedAt:
        new Date().toISOString(),
    };

    this.persist();

    return {
      completedStage,
      nextStage,
      ...this.getSnapshot(),
    };
  }

  failCurrentStage() {
    this.persist();
    return this.getSnapshot();
  }

  setCurrentStage(stageValue) {
    const stage = normalizeStage(stageValue);

    this.state.currentStage = Math.min(
      stage,
      this.state.highestStage
    );

    this.persist();
    return this.getSnapshot();
  }
}
