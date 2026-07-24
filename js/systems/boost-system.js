import { BALANCE_CONFIG } from "../config/balance-config.js";
import {
  clamp,
  exponentialSmoothing,
} from "../utils/math.js";
import { randomBetween } from "../utils/random.js";

export class BoostSystem {
  constructor() {
    this.intensity = 0;
    this.active = false;
    this.available = true;
    this.dropAccumulator = 0;
  }

  reset() {
    this.intensity = 0;
    this.active = false;
    this.available = true;
    this.dropAccumulator = 0;
  }

  update({
    delta,
    player,
    requested,
    foodSystem,
  }) {
    this.available =
      player.mass >
      BALANCE_CONFIG.boost.minimumActivationMass;

    const canContinue =
      player.mass >
      BALANCE_CONFIG.boost.minimumReserveMass;

    const canStart =
      this.active ? canContinue : this.available;

    this.active =
      Boolean(requested) &&
      canStart;

    const targetIntensity =
      this.active ? 1 : 0;

    const smoothingSpeed = this.active
      ? BALANCE_CONFIG.boost.intensityRiseSpeed
      : BALANCE_CONFIG.boost.intensityFallSpeed;

    this.intensity = exponentialSmoothing(
      this.intensity,
      targetIntensity,
      smoothingSpeed,
      delta
    );

    if (this.active) {
      this.consumeMass(delta, player);
      this.spawnDrops(delta, player, foodSystem);
    } else {
      this.dropAccumulator = Math.min(
        this.dropAccumulator,
        BALANCE_CONFIG.boost.foodDropInterval
      );
    }

    player.setBoostIntensity(this.intensity);

    return {
      active: this.active,
      available: this.available,
      intensity: this.intensity,
    };
  }

  consumeMass(delta, player) {
    const maximumDrain =
      Math.max(
        0,
        player.mass -
          BALANCE_CONFIG.boost.minimumReserveMass
      );

    const requestedDrain =
      BALANCE_CONFIG.boost.massDrainPerSecond *
      delta;

    const actualDrain = Math.min(
      maximumDrain,
      requestedDrain
    );

    player.removeMass(actualDrain);

    if (actualDrain < requestedDrain) {
      this.active = false;
    }
  }

  spawnDrops(delta, player, foodSystem) {
    this.dropAccumulator += delta;

    while (
      this.dropAccumulator >=
      BALANCE_CONFIG.boost.foodDropInterval
    ) {
      this.dropAccumulator -=
        BALANCE_CONFIG.boost.foodDropInterval;

      const tail =
        player.getSegmentPositions().at(-1) ?? {
          x: player.x,
          y: player.y,
        };

      const sideAngle =
        player.angle + Math.PI / 2;

      const lateralOffset =
        randomBetween(-1, 1) *
        player.radius *
        0.65;

      const backwardOffset =
        BALANCE_CONFIG.boost.tailOffset +
        randomBetween(0, player.radius * 0.7);

      const x =
        tail.x -
        Math.cos(player.angle) *
          backwardOffset +
        Math.cos(sideAngle) * lateralOffset;

      const y =
        tail.y -
        Math.sin(player.angle) *
          backwardOffset +
        Math.sin(sideAngle) * lateralOffset;

      foodSystem.spawnBoostDrop({
        x,
        y,
        radius: randomBetween(
          BALANCE_CONFIG.boost.foodDropRadiusMin,
          BALANCE_CONFIG.boost.foodDropRadiusMax
        ),
        massValue:
          BALANCE_CONFIG.boost.foodDropMass,
        scoreValue:
          BALANCE_CONFIG.boost.foodDropScore,
      });
    }
  }

  getState() {
    return {
      active: this.active,
      available: this.available,
      intensity: clamp(this.intensity, 0, 1),
    };
  }
}
