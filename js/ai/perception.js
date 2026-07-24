import { BALANCE_CONFIG } from "../config/balance-config.js";
import { FoodType } from "../entities/food.js";
import { clamp, normalizeVector } from "../utils/math.js";

function foodScore(bot, food, profile) {
  const distance = Math.max(1, Math.hypot(food.x - bot.x, food.y - bot.y));
  let typeMultiplier = 1;

  if (food.type === FoodType.SPECIAL) {
    typeMultiplier = profile.specialFoodWeight * 3.2;
  } else if (food.type === FoodType.BOOST_DROP) {
    typeMultiplier = profile.boostDropWeight * 1.7;
  }

  const value = Math.max(0.5, food.massValue + food.scoreValue * 0.42);
  return (value * typeMultiplier) / Math.pow(distance, 0.82);
}

function scanFood(bot, foodSystem, profile, difficulty) {
  const radius = BALANCE_CONFIG.bots.foodSearchRadius * difficulty.perceptionMultiplier;
  const foods = foodSystem.queryFoods(bot.x, bot.y, radius);
  let bestFood = null;
  let bestScore = -Infinity;

  for (const food of foods) {
    const score = foodScore(bot, food, profile);
    if (score > bestScore) {
      bestScore = score;
      bestFood = food;
    }
  }

  return bestFood;
}

function scanSnakes(bot, snakes, difficulty) {
  const dangerRadius = BALANCE_CONFIG.bots.dangerRadius * difficulty.perceptionMultiplier;
  const preyRadius = BALANCE_CONFIG.bots.preySearchRadius * difficulty.perceptionMultiplier;
  let dangerX = 0;
  let dangerY = 0;
  let dangerStrength = 0;
  let nearestDangerDistance = Infinity;
  let separationX = 0;
  let separationY = 0;
  let separationStrength = 0;
  let prey = null;
  let preyScore = -Infinity;

  for (const other of snakes) {
    if (!other || other === bot || !other.isAlive) {
      continue;
    }

    const headDx = bot.x - other.x;
    const headDy = bot.y - other.y;
    const headDistance = Math.hypot(headDx, headDy);

    if (headDistance < BALANCE_CONFIG.bots.separationRadius && headDistance > 0.001) {
      const factor = 1 - headDistance / BALANCE_CONFIG.bots.separationRadius;
      const normal = normalizeVector(headDx, headDy, 0, 0);
      separationX += normal.x * factor;
      separationY += normal.y * factor;
      separationStrength += factor;
    }

    const segments = other.getSegmentPositions();
    const step = Math.max(1, Math.floor(segments.length / 9));

    for (let index = 0; index < segments.length; index += step) {
      const segment = segments[index];
      const dx = bot.x - segment.x;
      const dy = bot.y - segment.y;
      const distance = Math.hypot(dx, dy);

      if (distance >= dangerRadius || distance < 0.001) {
        continue;
      }

      const normal = normalizeVector(dx, dy, 0, 0);
      const strength = (1 - distance / dangerRadius) * (index === 0 ? 0.82 : 1.08);
      dangerX += normal.x * strength;
      dangerY += normal.y * strength;
      dangerStrength += strength;
      nearestDangerDistance = Math.min(nearestDangerDistance, distance);
    }

    if (headDistance < preyRadius && other.mass < bot.mass * 0.84) {
      const score = (bot.mass / Math.max(other.mass, 1)) / Math.pow(Math.max(headDistance, 60), 0.72);
      if (score > preyScore) {
        preyScore = score;
        prey = other;
      }
    }
  }

  return {
    dangerVector: normalizeVector(dangerX, dangerY, 0, 0),
    dangerStrength: clamp(dangerStrength, 0, 2.5),
    criticalDanger: nearestDangerDistance <= BALANCE_CONFIG.bots.criticalDangerRadius,
    separationVector: normalizeVector(separationX, separationY, 0, 0),
    separationStrength: clamp(separationStrength, 0, 2),
    prey,
  };
}

function scanBoundary(bot) {
  const distance = Math.hypot(bot.x, bot.y);
  const warningStart = BALANCE_CONFIG.worldRadius - BALANCE_CONFIG.bots.boundaryLookAhead;

  return {
    danger: clamp(
      (distance - warningStart) / BALANCE_CONFIG.bots.boundaryLookAhead,
      0,
      1
    ),
    inwardVector: normalizeVector(-bot.x, -bot.y, 1, 0),
  };
}

export function scanEnvironment({ bot, snakes, foodSystem, profile, difficulty }) {
  return {
    bestFood: scanFood(bot, foodSystem, profile, difficulty),
    ...scanSnakes(bot, snakes, difficulty),
    boundary: scanBoundary(bot),
  };
}
