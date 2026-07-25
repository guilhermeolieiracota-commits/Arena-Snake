import {
  BALANCE_CONFIG,
  BOT_DIFFICULTY,
} from "../config/balance-config.js";
import {
  GRAPHICS_CONFIG,
  QUALITY_PRESETS,
} from "../config/graphics-config.js";
import { BOT_PROFILES } from "../ai/bot-profiles.js";
import { BotBrain } from "../ai/bot-brain.js";
import { BotSnake } from "../entities/bot-snake.js";
import { BoostSystem } from "./boost-system.js";
import { SpawnSystem } from "./spawn-system.js";
import {
  randomBetween,
} from "../utils/random.js";
import { getStageDifficulty } from "../stages/stage-config.js";

const BOT_NAMES = Object.freeze([
  "Aurora",
  "Bolt",
  "Cacto",
  "Cosmo",
  "Drift",
  "Eco",
  "Faísca",
  "Fênix",
  "Fluxo",
  "Glitch",
  "Íris",
  "Jade",
  "Kairo",
  "Lince",
  "Lua",
  "Magma",
  "Menta",
  "Nébula",
  "Neon",
  "Nix",
  "Órbita",
  "Pixel",
  "Plasma",
  "Rastro",
  "Rubi",
  "Sombra",
  "Solar",
  "Trovão",
  "Vega",
  "Vórtice",
  "Zênite",
  "Zig",
]);

const BOT_SKINS = Object.freeze([
  {
    primaryColor: "#ff7bd4",
    secondaryColor: "#8e6dff",
    skinPattern: "alternating",
    eyeStyle: "round",
  },
  {
    primaryColor: "#ff8f65",
    secondaryColor: "#ffcb57",
    skinPattern: "stripes",
    eyeStyle: "focused",
  },
  {
    primaryColor: "#55d9ff",
    secondaryColor: "#4d78ff",
    skinPattern: "waves",
    eyeStyle: "round",
  },
  {
    primaryColor: "#7cf05f",
    secondaryColor: "#52f2b2",
    skinPattern: "solid",
    eyeStyle: "focused",
  },
  {
    primaryColor: "#c890ff",
    secondaryColor: "#ff7bd4",
    skinPattern: "stripes",
    eyeStyle: "wide",
  },
  {
    primaryColor: "#ffd966",
    secondaryColor: "#ff8f65",
    skinPattern: "waves",
    eyeStyle: "focused",
  },
  {
    primaryColor: "#82e6ff",
    secondaryColor: "#52f2b2",
    skinPattern: "alternating",
    eyeStyle: "wide",
  },
  {
    primaryColor: "#ff657a",
    secondaryColor: "#ff9f43",
    skinPattern: "solid",
    eyeStyle: "focused",
  },
]);

export class BotSystem {
  constructor({
    qualityName = "auto",
    difficultyId = "normal",
  } = {}) {
    this.qualityName = qualityName;
    this.resolvedQualityName =
      this.resolveQualityName(qualityName);

    this.difficultyId = BOT_DIFFICULTY[difficultyId]
      ? difficultyId
      : "normal";

    this.stageNumber = 1;
    this.baseTargetCount =
      QUALITY_PRESETS[
        this.resolvedQualityName
      ].targetBotCount;
    this.targetCount = this.baseTargetCount;

    this.records = [];
    this.spawnSystem = new SpawnSystem();
    this.nextBotId = 1;
  }

  resolveQualityName(qualityName) {
    if (qualityName === "auto") {
      return GRAPHICS_CONFIG.autoQualityFallback;
    }

    return QUALITY_PRESETS[qualityName]
      ? qualityName
      : GRAPHICS_CONFIG.autoQualityFallback;
  }

  setQuality(qualityName, player = null, particleSystem = null) {
    this.qualityName = qualityName;
    this.resolvedQualityName =
      this.resolveQualityName(qualityName);

    this.baseTargetCount =
      QUALITY_PRESETS[
        this.resolvedQualityName
      ].targetBotCount;
    this.recalculateTargetCount();

    if (player) {
      this.syncPopulation(player, particleSystem);
    }
  }


  recalculateTargetCount() {
    const stage = getStageDifficulty(
      this.stageNumber
    );

    const qualityLimit =
      this.resolvedQualityName === "low"
        ? 16
        : this.resolvedQualityName === "medium"
          ? 26
          : 36;

    this.targetCount = Math.min(
      qualityLimit,
      this.baseTargetCount + stage.extraBots
    );
  }

  setStage(stageNumber, player = null, particleSystem = null) {
    this.stageNumber = Math.max(
      1,
      Math.round(Number(stageNumber) || 1)
    );

    this.recalculateTargetCount();

    for (const record of this.records) {
      record.brain.setStage(
        this.stageNumber
      );
      this.applyStageToBot(record.bot);
    }

    if (player) {
      this.syncPopulation(
        player,
        particleSystem
      );
    }
  }

  getStageDifficulty() {
    return getStageDifficulty(
      this.stageNumber
    );
  }

  getBotMassRange() {
    const stage = this.getStageDifficulty();

    return {
      minimum:
        BALANCE_CONFIG.bots.initialMassMin *
        stage.massMultiplier,
      maximum:
        BALANCE_CONFIG.bots.initialMassMax *
        stage.massMultiplier,
    };
  }

  applyStageToBot(bot) {
    const stage = this.getStageDifficulty();

    bot.baseSpeed =
      BALANCE_CONFIG.normalSpeed *
      stage.speedMultiplier;
  }

  setDifficulty(difficultyId) {
    this.difficultyId = BOT_DIFFICULTY[difficultyId]
      ? difficultyId
      : "normal";

    for (const record of this.records) {
      record.brain.setDifficulty(
        this.difficultyId
      );
    }
  }

  reset(player, particleSystem = null) {
    this.records.length = 0;
    this.nextBotId = 1;

    for (
      let index = 0;
      index < this.targetCount;
      index += 1
    ) {
      this.createBot(player, particleSystem);
    }
  }

  syncPopulation(player, particleSystem = null) {
    while (this.records.length < this.targetCount) {
      this.createBot(player, particleSystem);
    }

    while (this.records.length > this.targetCount) {
      this.records.pop();
    }
  }

  createBot(player, particleSystem = null) {
    const spawn = this.spawnSystem.findBotSpawn({
      player,
      snakes: this.getBots(),
    });

    const profile =
      BOT_PROFILES[
        (this.nextBotId - 1) %
          BOT_PROFILES.length
      ];

    const skin =
      BOT_SKINS[
        (this.nextBotId - 1) %
          BOT_SKINS.length
      ];

    const baseName =
      BOT_NAMES[
        (this.nextBotId - 1) %
          BOT_NAMES.length
      ];

    const name =
      this.nextBotId > BOT_NAMES.length
        ? `${baseName} ${Math.ceil(
            this.nextBotId /
              BOT_NAMES.length
          )}`
        : baseName;

    const massRange =
      this.getBotMassRange();

    const mass = randomBetween(
      massRange.minimum,
      massRange.maximum
    );

    const bot = new BotSnake({
      id: `bot-${this.nextBotId}`,
      name,
      x: spawn.x,
      y: spawn.y,
      angle: spawn.angle,
      mass,
      profileId: profile.id,
      profileLabel: profile.label,
      ...skin,
    });

    this.applyStageToBot(bot);

    const brain = new BotBrain({
      profile,
      difficultyId: this.difficultyId,
    });

    brain.setStage(this.stageNumber);

    const record = {
      bot,
      brain,
      boostSystem: new BoostSystem(),
      respawnTimer: 0,
      active: true,
    };

    this.records.push(record);
    this.nextBotId += 1;

    particleSystem?.spawnBotArrival(bot);
    return record;
  }

  update({
    delta,
    player,
    foodSystem,
    particleSystem,
  }) {
    this.processRespawns(
      delta,
      player,
      particleSystem
    );

    const activeBots = this.getBots();
    const snakes = [player, ...activeBots];

    for (const record of this.records) {
      if (!record.active || !record.bot.isAlive) {
        continue;
      }

      const bot = record.bot;

      if (
        !Number.isFinite(bot.x) ||
        !Number.isFinite(bot.y) ||
        Math.hypot(bot.x, bot.y) >
          BALANCE_CONFIG.worldRadius +
            BALANCE_CONFIG.bots.hardRespawnPadding
      ) {
        this.scheduleRespawn(record);
        continue;
      }

      const decision = record.brain.update(
        delta,
        bot,
        {
          snakes,
          foodSystem,
        }
      );

      const boostState =
        record.boostSystem.update({
          delta,
          player: bot,
          requested:
            decision.boostRequested,
          foodSystem,
        });

      bot.updateFromDecision(
        delta,
        decision.direction
      );


      const events =
        foodSystem.updateCollector(
          bot,
          delta,
          {
            magnetScale:
              BALANCE_CONFIG.bots
                .botMagnetScale,
          }
        );

      const botNearPlayer =
        Math.hypot(
          bot.x - player.x,
          bot.y - player.y
        ) <=
        BALANCE_CONFIG.bots
          .nearbyEffectsDistance;

      for (const event of events) {
        bot.addFood(event);

        if (botNearPlayer) {
          particleSystem.spawnCollection(
            event,
            {
              showText: false,
              particleScale: 0.42,
            }
          );
        }
      }

      if (botNearPlayer) {
        particleSystem.spawnBoostTrail(
          bot,
          boostState.intensity,
          delta,
          { isBot: true }
        );
      }
    }
  }

  keepBotInsideArena(bot) {
    const maximumDistance =
      BALANCE_CONFIG.worldRadius -
      BALANCE_CONFIG.boundaryHardPadding;

    const distanceFromCenter =
      Math.hypot(bot.x, bot.y);

    if (distanceFromCenter <= maximumDistance) {
      return;
    }

    const normalX = bot.x / distanceFromCenter;
    const normalY = bot.y / distanceFromCenter;

    bot.x = normalX * maximumDistance;
    bot.y = normalY * maximumDistance;
    bot.setTargetDirection(-normalX, -normalY);

    bot.pathHistory.unshift({
      x: bot.x,
      y: bot.y,
    });

    bot.rebuildSegmentPositions();
  }

  scheduleRespawn(
    recordOrBot,
    delay = null
  ) {
    const record = recordOrBot?.bot
      ? recordOrBot
      : this.records.find(
          (item) =>
            item.bot === recordOrBot ||
            item.bot.id === recordOrBot?.id
        );

    if (!record || !record.active) {
      return false;
    }

    record.active = false;
    record.bot.isAlive = false;
    record.bot.setBoostIntensity(0);
    record.boostSystem.reset();

    record.respawnTimer =
      delay ??
      randomBetween(
        BALANCE_CONFIG.bots.respawnDelayMin,
        BALANCE_CONFIG.bots.respawnDelayMax
      );

    return true;
  }

  processRespawns(
    delta,
    player,
    particleSystem
  ) {
    for (const record of this.records) {
      if (record.active) {
        continue;
      }

      record.respawnTimer -= delta;

      if (record.respawnTimer > 0) {
        continue;
      }

      const spawn =
        this.spawnSystem.findBotSpawn({
          player,
          snakes: this.getBots(),
        });

      const massRange =
        this.getBotMassRange();

      const mass = randomBetween(
        massRange.minimum,
        massRange.maximum
      );

      record.bot.reset({
        x: spawn.x,
        y: spawn.y,
        angle: spawn.angle,
        mass,
      });

      this.applyStageToBot(
        record.bot
      );
      record.brain.setStage(
        this.stageNumber
      );
      record.brain.reset();
      record.boostSystem.reset();
      record.active = true;

      particleSystem?.spawnBotArrival(
        record.bot
      );
    }
  }

  clear() {
    for (const record of this.records) {
      record.active = false;
      record.bot.isAlive = false;
      record.boostSystem.reset();
    }

    this.records.length = 0;
  }

  getBots() {
    return this.records
      .filter(
        (record) =>
          record.active &&
          record.bot.isAlive
      )
      .map((record) => record.bot);
  }

  getAllSnakes(player) {
    return [player, ...this.getBots()];
  }

  getStats() {
    const profiles = {};

    for (const record of this.records) {
      if (!record.active) {
        continue;
      }

      const label =
        record.bot.profileLabel ||
        record.bot.profileId ||
        "Bot";

      profiles[label] =
        (profiles[label] ?? 0) + 1;
    }

    return {
      active: this.getBots().length,
      total: this.records.length,
      waitingRespawn:
        this.records.filter(
          (record) => !record.active
        ).length,
      difficultyId: this.difficultyId,
      stageNumber: this.stageNumber,
      profiles,
    };
  }
}
