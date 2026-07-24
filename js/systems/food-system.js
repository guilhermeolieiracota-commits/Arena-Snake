import { BALANCE_CONFIG } from "../config/balance-config.js";
import { QUALITY_PRESETS } from "../config/graphics-config.js";
import { Food, FoodType } from "../entities/food.js";
import { ObjectPool } from "../utils/object-pool.js";
import {
  randomBetween,
  randomItem,
  randomPointInCircle,
  randomPointNearCircle,
} from "../utils/random.js";
import { SpatialGrid } from "./spatial-grid.js";

const COMMON_PALETTES = Object.freeze([
  ["#52f2b2", "#55d9ff"],
  ["#55d9ff", "#8e6dff"],
  ["#ff7bd4", "#8e6dff"],
  ["#7cf05f", "#52f2b2"],
  ["#ff8f65", "#ffcb57"],
]);

const SPECIAL_PALETTES = Object.freeze([
  ["#ffd966", "#ff9f43"],
  ["#fff2a6", "#ffcb57"],
  ["#ffffff", "#ffd966"],
]);

export class FoodSystem {
  constructor({ qualityName = "auto" } = {}) {
    this.qualityName = qualityName;
    this.resolvedQualityName =
      this.resolveQualityName(qualityName);

    this.targetCount =
      QUALITY_PRESETS[
        this.resolvedQualityName
      ].targetFoodCount;

    this.activeFoods = [];
    this.hotspots = [];
    this.naturalCount = 0;
    this.boostDropCount = 0;
    this.remainsCount = 0;
    this.spawnOrder = 1;

    this.grid = new SpatialGrid(
      BALANCE_CONFIG.food.gridCellSize
    );

    this.pool = new ObjectPool(
      () => new Food(),
      (food) => food.deactivate()
    );

    this.createHotspots();
    this.pool.prewarm(
      Math.floor(this.targetCount * 0.35)
    );
  }

  resolveQualityName(qualityName) {
    if (qualityName === "auto") {
      return "medium";
    }

    return QUALITY_PRESETS[qualityName]
      ? qualityName
      : "medium";
  }

  setQuality(qualityName) {
    this.qualityName = qualityName;
    this.resolvedQualityName =
      this.resolveQualityName(qualityName);

    this.targetCount =
      QUALITY_PRESETS[
        this.resolvedQualityName
      ].targetFoodCount;

    this.syncPopulation();
  }

  reset() {
    for (const food of this.activeFoods) {
      this.grid.remove(food);
      this.pool.release(food);
    }

    this.activeFoods.length = 0;
    this.naturalCount = 0;
    this.boostDropCount = 0;
    this.remainsCount = 0;
    this.spawnOrder = 1;
    this.grid.clear();
    this.createHotspots();
    this.syncPopulation();
  }

  createHotspots() {
    this.hotspots.length = 0;

    const maximumRadius =
      BALANCE_CONFIG.worldRadius -
      BALANCE_CONFIG.food.arenaPadding -
      BALANCE_CONFIG.food.hotspotRadius;

    for (
      let index = 0;
      index < BALANCE_CONFIG.food.hotspotCount;
      index += 1
    ) {
      this.hotspots.push(
        randomPointInCircle(maximumRadius)
      );
    }
  }

  syncPopulation() {
    while (this.naturalCount < this.targetCount) {
      this.spawnNaturalFood();
    }

    while (this.naturalCount > this.targetCount) {
      const index = this.findLastNaturalFoodIndex();

      if (index < 0) {
        break;
      }

      this.removeFoodAt(index, false);
    }
  }

  findLastNaturalFoodIndex() {
    for (
      let index = this.activeFoods.length - 1;
      index >= 0;
      index -= 1
    ) {
      if (this.activeFoods[index].isNatural) {
        return index;
      }
    }

    return -1;
  }

  findOldestIndexByType(type) {
    let oldestIndex = -1;
    let oldestOrder = Infinity;

    for (
      let index = 0;
      index < this.activeFoods.length;
      index += 1
    ) {
      const food = this.activeFoods[index];

      if (
        food.type === type &&
        food.spawnOrder < oldestOrder
      ) {
        oldestIndex = index;
        oldestOrder = food.spawnOrder;
      }
    }

    return oldestIndex;
  }

  spawnNaturalFood() {
    const food = this.pool.acquire();

    const isSpecial =
      Math.random() <
      BALANCE_CONFIG.food.specialChance;

    const type = isSpecial
      ? FoodType.SPECIAL
      : FoodType.COMMON;

    const palette = randomItem(
      isSpecial
        ? SPECIAL_PALETTES
        : COMMON_PALETTES
    );

    const position = this.createSpawnPosition();

    const radius = isSpecial
      ? randomBetween(
          BALANCE_CONFIG.food.specialRadiusMin,
          BALANCE_CONFIG.food.specialRadiusMax
        )
      : randomBetween(
          BALANCE_CONFIG.food.commonRadiusMin,
          BALANCE_CONFIG.food.commonRadiusMax
        );

    food.reset({
      x: position.x,
      y: position.y,
      radius,
      scoreValue: isSpecial
        ? BALANCE_CONFIG.food.specialScore
        : BALANCE_CONFIG.food.commonScore,
      massValue: isSpecial
        ? BALANCE_CONFIG.food.specialMass
        : BALANCE_CONFIG.food.commonMass,
      type,
      color: palette[0],
      secondaryColor: palette[1],
      phase: Math.random() * Math.PI * 2,
      replaceOnCollect: true,
      isNatural: true,
      spawnOrder: this.spawnOrder++,
    });

    this.activateFood(food);
    this.naturalCount += 1;
  }

  spawnBoostDrop({
    x,
    y,
    radius,
    massValue,
    scoreValue,
  }) {
    if (
      this.boostDropCount >=
      BALANCE_CONFIG.boost.maximumWorldDrops
    ) {
      const oldestIndex =
        this.findOldestIndexByType(
          FoodType.BOOST_DROP
        );

      if (oldestIndex >= 0) {
        this.removeFoodAt(oldestIndex, false);
      }
    }

    const food = this.pool.acquire();

    food.reset({
      x,
      y,
      radius,
      scoreValue,
      massValue,
      type: FoodType.BOOST_DROP,
      color: "#ffcb57",
      secondaryColor: "#ff7bd4",
      phase: Math.random() * Math.PI * 2,
      replaceOnCollect: false,
      isNatural: false,
      spawnOrder: this.spawnOrder++,
    });

    this.activateFood(food);
    this.boostDropCount += 1;
  }

  spawnDeathRemains(snake) {
    const segments = snake.getSegmentPositions();
    const step =
      BALANCE_CONFIG.death.remainsSegmentStep;

    const candidateCount = Math.ceil(
      segments.length / step
    );

    const remainsCount = Math.max(
      BALANCE_CONFIG.death.remainsMinimum,
      Math.min(
        BALANCE_CONFIG.death.remainsMaximum,
        candidateCount
      )
    );

    const totalMass =
      Math.max(8, snake.mass) *
      BALANCE_CONFIG.death.remainsMassShare;

    const massPerRemain =
      totalMass / remainsCount;

    for (
      let remainIndex = 0;
      remainIndex < remainsCount;
      remainIndex += 1
    ) {
      while (
        this.remainsCount >=
        BALANCE_CONFIG.death.maximumWorldRemains
      ) {
        const oldestIndex =
          this.findOldestIndexByType(
            FoodType.REMAINS
          );

        if (oldestIndex < 0) {
          break;
        }

        this.removeFoodAt(oldestIndex, false);
      }

      const sourceIndex = Math.min(
        segments.length - 1,
        Math.floor(
          (remainIndex /
            Math.max(remainsCount - 1, 1)) *
            Math.max(segments.length - 1, 0)
        )
      );

      const segment =
        segments[sourceIndex] ?? {
          x: snake.x,
          y: snake.y,
        };

      const food = this.pool.acquire();
      const sizeProgress =
        remainIndex /
        Math.max(remainsCount - 1, 1);

      food.reset({
        x:
          segment.x +
          randomBetween(
            -snake.radius * 0.42,
            snake.radius * 0.42
          ),
        y:
          segment.y +
          randomBetween(
            -snake.radius * 0.42,
            snake.radius * 0.42
          ),
        radius: randomBetween(
          BALANCE_CONFIG.death.remainsRadiusMin,
          BALANCE_CONFIG.death.remainsRadiusMax
        ) *
          (1 - sizeProgress * 0.20),
        scoreValue: Math.max(
          1,
          Math.round(massPerRemain * 0.55)
        ),
        massValue: massPerRemain,
        type: FoodType.REMAINS,
        color: snake.primaryColor,
        secondaryColor:
          snake.secondaryColor,
        phase: Math.random() * Math.PI * 2,
        replaceOnCollect: false,
        isNatural: false,
        spawnOrder: this.spawnOrder++,
      });

      this.activateFood(food);
      this.remainsCount += 1;
    }
  }

  activateFood(food) {
    food.activeIndex = this.activeFoods.length;
    this.activeFoods.push(food);
    this.grid.insert(food);
  }

  createSpawnPosition() {
    const maximumRadius =
      BALANCE_CONFIG.worldRadius -
      BALANCE_CONFIG.food.arenaPadding;

    if (
      this.hotspots.length > 0 &&
      Math.random() <
        BALANCE_CONFIG.food.hotspotChance
    ) {
      const hotspot = randomItem(this.hotspots);

      return randomPointNearCircle(
        hotspot.x,
        hotspot.y,
        BALANCE_CONFIG.food.hotspotRadius,
        maximumRadius
      );
    }

    return randomPointInCircle(maximumRadius);
  }

  updateCollector(
    collector,
    delta,
    { magnetScale = 1 } = {}
  ) {
    const events = [];

    const magnetRadius =
      BALANCE_CONFIG.food.magnetRadius *
      Math.max(0, magnetScale);

    const queryRadius =
      magnetRadius +
      collector.radius +
      BALANCE_CONFIG.food.specialRadiusMax;

    const nearbyFoods = this.grid.queryCircle(
      collector.x,
      collector.y,
      queryRadius
    );

    for (const food of nearbyFoods) {
      if (!food.active) {
        continue;
      }

      const differenceX =
        collector.x - food.x;

      const differenceY =
        collector.y - food.y;

      const distanceToCollector = Math.hypot(
        differenceX,
        differenceY
      );

      const collectionDistance =
        collector.radius +
        food.radius +
        BALANCE_CONFIG.food.collectionPadding;

      if (
        distanceToCollector <= collectionDistance
      ) {
        events.push(this.collect(food));
        continue;
      }

      if (
        magnetRadius > 0 &&
        distanceToCollector <= magnetRadius
      ) {
        const strengthFactor =
          1 -
          distanceToCollector /
            magnetRadius;

        const speed =
          BALANCE_CONFIG.food.magnetStrength *
          magnetScale *
          (0.18 +
            strengthFactor * strengthFactor);

        food.moveToward(
          collector.x,
          collector.y,
          delta,
          speed
        );

        this.grid.update(food);
      }
    }

    return events;
  }

  update(collector, delta) {
    return this.updateCollector(
      collector,
      delta
    );
  }

  queryFoods(x, y, radius) {
    return this.grid
      .queryCircle(x, y, radius)
      .filter((food) => food.active);
  }

  collect(food) {
    const event = {
      x: food.x,
      y: food.y,
      radius: food.radius,
      scoreValue: food.scoreValue,
      massValue: food.massValue,
      type: food.type,
      color: food.color,
      secondaryColor: food.secondaryColor,
    };

    const index = food.activeIndex;
    const replace = food.replaceOnCollect;

    this.removeFoodAt(index, replace);
    return event;
  }

  removeFoodAt(index, replaceNatural) {
    const food = this.activeFoods[index];

    if (!food) {
      return;
    }

    this.grid.remove(food);

    if (food.isNatural) {
      this.naturalCount = Math.max(
        0,
        this.naturalCount - 1
      );
    } else if (
      food.type === FoodType.BOOST_DROP
    ) {
      this.boostDropCount = Math.max(
        0,
        this.boostDropCount - 1
      );
    } else if (
      food.type === FoodType.REMAINS
    ) {
      this.remainsCount = Math.max(
        0,
        this.remainsCount - 1
      );
    }

    const lastIndex =
      this.activeFoods.length - 1;

    const lastFood =
      this.activeFoods[lastIndex];

    if (index !== lastIndex) {
      this.activeFoods[index] = lastFood;
      lastFood.activeIndex = index;
    }

    this.activeFoods.pop();
    this.pool.release(food);

    if (
      replaceNatural &&
      this.naturalCount < this.targetCount
    ) {
      this.spawnNaturalFood();
    }
  }

  getFoods() {
    return this.activeFoods;
  }

  getStats() {
    return {
      active: this.activeFoods.length,
      natural: this.naturalCount,
      boostDrops: this.boostDropCount,
      remains: this.remainsCount,
      pooled: this.pool.getAvailableCount(),
      created: this.pool.getCreatedCount(),
      cells: this.grid.getCellCount(),
    };
  }
}
