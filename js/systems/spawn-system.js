import { BALANCE_CONFIG } from "../config/balance-config.js";
import { randomBetween, randomPointInCircle } from "../utils/random.js";

export class SpawnSystem {
  findBotSpawn({ player, snakes = [] }) {
    const maximumRadius =
      BALANCE_CONFIG.worldRadius -
      BALANCE_CONFIG.bots.spawnWorldPadding;

    let fallback = randomPointInCircle(maximumRadius);

    for (
      let attempt = 0;
      attempt < BALANCE_CONFIG.bots.spawnAttempts;
      attempt += 1
    ) {
      const candidate = randomPointInCircle(maximumRadius);
      fallback = candidate;

      if (
        player &&
        Math.hypot(
          candidate.x - player.x,
          candidate.y - player.y
        ) < BALANCE_CONFIG.bots.spawnPlayerDistance
      ) {
        continue;
      }

      let valid = true;

      for (const snake of snakes) {
        if (!snake?.isAlive) {
          continue;
        }

        if (
          Math.hypot(
            candidate.x - snake.x,
            candidate.y - snake.y
          ) < BALANCE_CONFIG.bots.spawnSnakeDistance
        ) {
          valid = false;
          break;
        }
      }

      if (valid) {
        return {
          x: candidate.x,
          y: candidate.y,
          angle: randomBetween(-Math.PI, Math.PI),
        };
      }
    }

    return {
      x: fallback.x,
      y: fallback.y,
      angle: randomBetween(-Math.PI, Math.PI),
    };
  }
}
