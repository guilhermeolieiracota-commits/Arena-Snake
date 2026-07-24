export const BOT_DIFFICULTY = Object.freeze({
  calm: Object.freeze({
    label: "Tranquila",
    reactionMultiplier: 1.30,
    avoidanceMultiplier: 1.22,
    aggressionMultiplier: 0.58,
    boostMultiplier: 0.62,
    perceptionMultiplier: 0.88,
  }),
  normal: Object.freeze({
    label: "Normal",
    reactionMultiplier: 1,
    avoidanceMultiplier: 1,
    aggressionMultiplier: 1,
    boostMultiplier: 1,
    perceptionMultiplier: 1,
  }),
  intense: Object.freeze({
    label: "Intensa",
    reactionMultiplier: 0.72,
    avoidanceMultiplier: 0.94,
    aggressionMultiplier: 1.38,
    boostMultiplier: 1.30,
    perceptionMultiplier: 1.15,
  }),
});

export const BALANCE_CONFIG = Object.freeze({
  worldRadius: 3200,

  initialPlayerMass: 120,
  initialSegments: 30,
  massPerSegment: 8,
  segmentGrowthPerSecond: 8,
  segmentShrinkPerSecond: 12,
  segmentSpacing: 13,
  pathSampleSpacing: 4,

  snakeBaseRadius: 18,
  snakeMaximumRadius: 24,
  massForMaximumRadius: 1400,

  normalSpeed: 185,
  minimumLargeSnakeSpeedFactor: 0.82,
  maxTurnRate: 3.25,

  boundaryWarningDistance: 500,
  boundaryHardPadding: 65,
  boundarySteerStrength: 0.82,

  spawnProtection: Object.freeze({
    playerSeconds: 2.6,
    botSeconds: 2.2,
    shieldPulseSpeed: 4.2,
  }),

  collision: Object.freeze({
    spatialCellSize: 180,
    headBodyHeadScale: 0.76,
    headBodySegmentScale: 0.70,
    headHeadScale: 0.78,
    headHeadMassAdvantageRatio: 1.12,
    firstBodySegmentsIgnored: 3,
    borderRadiusScale: 0.82,
  }),

  death: Object.freeze({
    remainsSegmentStep: 2,
    remainsMinimum: 10,
    remainsMaximum: 105,
    remainsMassShare: 0.72,
    remainsRadiusMin: 3.8,
    remainsRadiusMax: 8.8,
    maximumWorldRemains: 820,
    playerGameOverDelay: 0.10,
    killFeedSeconds: 4.5,
  }),

  ranking: Object.freeze({
    updateInterval: 0.24,
    visibleEntries: 10,
  }),

  boost: Object.freeze({
    minimumActivationMass: 90,
    minimumReserveMass: 76,
    speedMultiplier: 1.52,
    massDrainPerSecond: 6,
    intensityRiseSpeed: 7.5,
    intensityFallSpeed: 5.5,
    foodDropInterval: 0.13,
    foodDropMass: 0.55,
    foodDropScore: 0,
    foodDropRadiusMin: 2.8,
    foodDropRadiusMax: 4.2,
    maximumWorldDrops: 460,
    tailOffset: 8,
    trailParticleInterval: 0.026,
    cameraZoomReduction: 0.075,
  }),

  food: Object.freeze({
    commonScore: 1,
    commonMass: 2,
    commonRadiusMin: 3.2,
    commonRadiusMax: 5.2,

    specialScore: 6,
    specialMass: 10,
    specialRadiusMin: 6,
    specialRadiusMax: 8.5,
    specialChance: 0.075,

    magnetRadius: 105,
    magnetStrength: 420,
    collectionPadding: 5,
    arenaPadding: 95,
    hotspotChance: 0.34,
    hotspotCount: 14,
    hotspotRadius: 420,
    gridCellSize: 160,
  }),

  bots: Object.freeze({
    initialMassMin: 96,
    initialMassMax: 210,
    spawnWorldPadding: 260,
    spawnPlayerDistance: 650,
    spawnSnakeDistance: 270,
    spawnAttempts: 70,

    foodSearchRadius: 760,
    specialFoodMultiplier: 3.2,
    boostDropMultiplier: 1.7,

    dangerRadius: 235,
    criticalDangerRadius: 105,
    separationRadius: 150,
    preySearchRadius: 620,

    boundaryLookAhead: 610,
    hardRespawnPadding: 180,

    decisionIntervalMin: 0.16,
    decisionIntervalMax: 0.48,
    wanderChangeMin: 0.7,
    wanderChangeMax: 1.9,

    respawnDelayMin: 1.4,
    respawnDelayMax: 2.8,

    maximumBotBoostShare: 0.42,
    botMagnetScale: 0.72,
    nearbyEffectsDistance: 1250,
  }),
});
