import { clamp } from "../utils/math.js";

export const STAGE_CONFIG = Object.freeze({
  durationSeconds: 120,
  minimumStage: 1,
  maximumStage: 999,
  maximumExtraBots: 12,
  extraBotEveryStages: 2,
  maximumSpeedMultiplier: 1.34,
  speedGainPerStage: 0.014,
  maximumMassMultiplier: 1.72,
  massGainPerStage: 0.032,
  minimumReactionMultiplier: 0.54,
  reactionGainPerStage: 0.022,
  maximumAggressionMultiplier: 1.85,
  aggressionGainPerStage: 0.045,
  maximumBoostMultiplier: 1.70,
  boostGainPerStage: 0.036,
  maximumPerceptionMultiplier: 1.45,
  perceptionGainPerStage: 0.022,
});

export function normalizeStage(value) {
  return clamp(
    Math.round(Number(value) || 1),
    STAGE_CONFIG.minimumStage,
    STAGE_CONFIG.maximumStage
  );
}

export function getStageDifficulty(stageValue) {
  const stage = normalizeStage(stageValue);
  const progress = Math.max(0, stage - 1);

  return Object.freeze({
    stage,
    extraBots: Math.min(
      STAGE_CONFIG.maximumExtraBots,
      Math.floor(
        progress /
          STAGE_CONFIG.extraBotEveryStages
      )
    ),
    speedMultiplier: Math.min(
      STAGE_CONFIG.maximumSpeedMultiplier,
      1 +
        progress *
          STAGE_CONFIG.speedGainPerStage
    ),
    massMultiplier: Math.min(
      STAGE_CONFIG.maximumMassMultiplier,
      1 +
        progress *
          STAGE_CONFIG.massGainPerStage
    ),
    reactionMultiplier: Math.max(
      STAGE_CONFIG.minimumReactionMultiplier,
      1 -
        progress *
          STAGE_CONFIG.reactionGainPerStage
    ),
    aggressionMultiplier: Math.min(
      STAGE_CONFIG.maximumAggressionMultiplier,
      1 +
        progress *
          STAGE_CONFIG.aggressionGainPerStage
    ),
    boostMultiplier: Math.min(
      STAGE_CONFIG.maximumBoostMultiplier,
      1 +
        progress *
          STAGE_CONFIG.boostGainPerStage
    ),
    perceptionMultiplier: Math.min(
      STAGE_CONFIG.maximumPerceptionMultiplier,
      1 +
        progress *
          STAGE_CONFIG.perceptionGainPerStage
    ),
  });
}

export function getStageDifficultyLabel(stageValue) {
  const stage = normalizeStage(stageValue);

  if (stage <= 2) {
    return "Iniciante";
  }

  if (stage <= 5) {
    return "Crescente";
  }

  if (stage <= 9) {
    return "Avançada";
  }

  if (stage <= 15) {
    return "Intensa";
  }

  return "Extrema";
}
