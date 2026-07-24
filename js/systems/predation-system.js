import { BALANCE_CONFIG } from "../config/balance-config.js";
import { FoodType } from "../entities/food.js";

export class PredationSystem {
  constructor() {
    this.totalBites = 0;
  }

  reset() {
    this.totalBites = 0;
  }

  process({
    events,
    particleSystem,
  }) {
    const results = [];

    for (const event of events) {
      const predator = event.predator;
      const prey = event.prey;

      if (
        !predator?.isAlive ||
        !prey?.isAlive ||
        predator === prey ||
        predator.isProtected() ||
        prey.isProtected()
      ) {
        continue;
      }

      const removed =
        prey.consumePredationSegment();

      if (!removed) {
        continue;
      }

      predator.addPredationSegment({
        scoreValue:
          BALANCE_CONFIG.predation
            .scorePerBite,
        massValue:
          BALANCE_CONFIG.predation
            .predatorMassGainPerBite,
      });

      particleSystem.spawnCollection(
        {
          x: Number.isFinite(event.x)
            ? event.x
            : removed.x,
          y: Number.isFinite(event.y)
            ? event.y
            : removed.y,
          radius: removed.radius,
          scoreValue:
            BALANCE_CONFIG.predation
              .scorePerBite,
          massValue:
            BALANCE_CONFIG.predation
              .predatorMassGainPerBite,
          type: FoodType.REMAINS,
          color: removed.color,
          secondaryColor:
            removed.secondaryColor,
        },
        {
          showText:
            predator.isPlayer,
          particleScale:
            predator.isPlayer
              ? 1.05
              : 0.58,
        }
      );

      results.push({
        ...event,
        removed,
        scoreValue:
          BALANCE_CONFIG.predation
            .scorePerBite,
        massValue:
          BALANCE_CONFIG.predation
            .predatorMassGainPerBite,
      });

      this.totalBites += 1;
    }

    return results;
  }

  getTotalBites() {
    return this.totalBites;
  }
}
