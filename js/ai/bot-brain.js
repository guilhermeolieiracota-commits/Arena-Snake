import { BALANCE_CONFIG, BOT_DIFFICULTY } from "../config/balance-config.js";
import { randomBetween } from "../utils/random.js";
import { scanEnvironment } from "./perception.js";
import { combineWeighted, rotateVector, vectorToward } from "./steering.js";

export class BotBrain {
  constructor({ profile, difficultyId = "normal" }) {
    this.profile = profile;
    this.setDifficulty(difficultyId);
    this.reset();
  }

  setDifficulty(difficultyId) {
    this.difficultyId = BOT_DIFFICULTY[difficultyId] ? difficultyId : "normal";
    this.difficulty = BOT_DIFFICULTY[this.difficultyId];
    this.decisionTimer = 0;
  }

  reset() {
    this.decisionTimer = 0;
    this.wanderTimer = 0;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.direction = { x: Math.cos(this.wanderAngle), y: Math.sin(this.wanderAngle) };
    this.boostRequested = false;
    this.lastPerception = null;
  }

  update(delta, bot, context) {
    this.decisionTimer -= delta;
    this.wanderTimer -= delta;

    if (this.wanderTimer <= 0) {
      this.wanderTimer = randomBetween(
        BALANCE_CONFIG.bots.wanderChangeMin,
        BALANCE_CONFIG.bots.wanderChangeMax
      );
      this.wanderAngle += randomBetween(-0.85, 0.85);
    }

    if (this.decisionTimer <= 0) {
      this.makeDecision(bot, context);
      this.decisionTimer = randomBetween(
        BALANCE_CONFIG.bots.decisionIntervalMin,
        BALANCE_CONFIG.bots.decisionIntervalMax
      ) * this.difficulty.reactionMultiplier;
    }

    return {
      direction: this.direction,
      boostRequested: this.boostRequested,
      perception: this.lastPerception,
    };
  }

  makeDecision(bot, context) {
    const perception = scanEnvironment({
      bot,
      snakes: context.snakes,
      foodSystem: context.foodSystem,
      profile: this.profile,
      difficulty: this.difficulty,
    });

    this.lastPerception = perception;
    const current = { x: Math.cos(bot.angle), y: Math.sin(bot.angle) };
    const wander = rotateVector(
      { x: Math.cos(this.wanderAngle), y: Math.sin(this.wanderAngle) },
      randomBetween(-0.12, 0.12)
    );

    const vectors = [
      { vector: current, weight: 0.34 },
      { vector: wander, weight: this.profile.wanderWeight },
    ];

    if (perception.bestFood) {
      vectors.push({
        vector: vectorToward(bot.x, bot.y, perception.bestFood.x, perception.bestFood.y),
        weight: this.profile.foodWeight,
      });
    }

    if (perception.prey) {
      vectors.push({
        vector: vectorToward(bot.x, bot.y, perception.prey.x, perception.prey.y),
        weight: this.profile.preyWeight * this.difficulty.aggressionMultiplier,
      });
    }

    if (perception.dangerStrength > 0) {
      vectors.push({
        vector: perception.dangerVector,
        weight:
          this.profile.dangerWeight *
          this.difficulty.avoidanceMultiplier *
          (0.65 + perception.dangerStrength),
      });
    }

    if (perception.separationStrength > 0) {
      vectors.push({
        vector: perception.separationVector,
        weight: this.profile.separationWeight * (0.55 + perception.separationStrength),
      });
    }

    if (perception.boundary.danger > 0) {
      vectors.push({
        vector: perception.boundary.inwardVector,
        weight: this.profile.boundaryWeight * (0.72 + perception.boundary.danger * 2.4),
      });
    }

    this.direction = combineWeighted(vectors, current);
    this.boostRequested = this.decideBoost(bot, perception);
  }

  decideBoost(bot, perception) {
    if (bot.mass <= BALANCE_CONFIG.boost.minimumActivationMass) {
      return false;
    }

    if (perception.boundary.danger > 0.72) {
      return false;
    }

    const boostMultiplier = this.difficulty.boostMultiplier;

    if (perception.criticalDanger) {
      return Math.random() < Math.min(0.98, this.profile.escapeBoostChance * boostMultiplier);
    }

    if (perception.prey) {
      const distance = Math.hypot(perception.prey.x - bot.x, perception.prey.y - bot.y);
      if (distance > 180 && distance < 520) {
        return Math.random() < Math.min(
          0.92,
          this.profile.chaseBoostChance * boostMultiplier * this.difficulty.aggressionMultiplier
        );
      }
    }

    if (perception.bestFood) {
      const distance = Math.hypot(
        perception.bestFood.x - bot.x,
        perception.bestFood.y - bot.y
      );

      if (distance > 220 && distance < this.profile.preferredFoodDistance) {
        return Math.random() < Math.min(
          BALANCE_CONFIG.bots.maximumBotBoostShare,
          this.profile.boostToFoodChance * boostMultiplier
        );
      }
    }

    return false;
  }
}
