import { BALANCE_CONFIG } from "../config/balance-config.js";
import { QUALITY_PRESETS } from "../config/graphics-config.js";
import { FoodType } from "../entities/food.js";
import { FloatingText } from "../entities/floating-text.js";
import { Particle } from "../entities/particle.js";
import { ObjectPool } from "../utils/object-pool.js";
import { randomBetween } from "../utils/random.js";

export class ParticleSystem {
  constructor({ qualityName = "auto" } = {}) {
    this.qualityName = qualityName;
    this.resolvedQualityName =
      this.resolveQualityName(qualityName);

    this.particles = [];
    this.texts = [];
    this.boostTrailAccumulator = new Map();
    this.reducedEffects = false;

    this.particlePool = new ObjectPool(
      () => new Particle(),
      (particle) => particle.deactivate()
    );

    this.textPool = new ObjectPool(
      () => new FloatingText(),
      (text) => text.deactivate()
    );

    this.particlePool.prewarm(220);
    this.textPool.prewarm(28);
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
  }

  setReducedEffects(reducedEffects) {
    this.reducedEffects = Boolean(reducedEffects);
  }

  reset() {
    while (this.particles.length > 0) {
      this.releaseParticleAt(
        this.particles.length - 1
      );
    }

    while (this.texts.length > 0) {
      this.releaseTextAt(
        this.texts.length - 1
      );
    }

    this.boostTrailAccumulator.clear();
  }

  spawnCollection(
    event,
    {
      showText = true,
      particleScale = 1,
    } = {}
  ) {
    const multiplier =
      QUALITY_PRESETS[
        this.resolvedQualityName
      ].collectionParticleMultiplier *
      Math.max(0, particleScale) *
      (this.reducedEffects ? 0.45 : 1);

    const baseCount =
      event.type === FoodType.SPECIAL
        ? 14
        : event.type === FoodType.REMAINS
          ? 14
          : event.type === FoodType.BOOST_DROP
            ? 5
            : 7;

    const particleCount = Math.max(
      2,
      Math.round(baseCount * multiplier)
    );

    for (
      let index = 0;
      index < particleCount;
      index += 1
    ) {
      const particle =
        this.particlePool.acquire();

      const angle =
        Math.random() * Math.PI * 2;

      const speed = randomBetween(
        45,
        event.type === FoodType.SPECIAL ||
          event.type === FoodType.REMAINS
          ? 150
          : 105
      );

      particle.reset({
        x: event.x,
        y: event.y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: randomBetween(0.32, 0.72),
        size: randomBetween(
          1.8,
          Math.max(
            event.type === FoodType.REMAINS ? 4.4 : 2.4,
            event.radius *
              (event.type === FoodType.REMAINS ? 0.96 : 0.72)
          )
        ),
        color:
          Math.random() < 0.5
            ? event.color
            : event.secondaryColor,
        drag: 0.90,
      });

      particle.activeIndex =
        this.particles.length;

      this.particles.push(particle);
    }

    if (showText && event.scoreValue > 0) {
      const floatingText =
        this.textPool.acquire();

      floatingText.reset({
        x: event.x,
        y:
          event.y -
          event.radius * 1.6,
        text: `+${Math.round(event.scoreValue)}`,
        color:
          event.type === FoodType.SPECIAL
            ? "#ffd966"
            : event.type === FoodType.REMAINS
              ? event.color
              : "#ffffff",
        life:
          event.type === FoodType.SPECIAL ||
          event.type === FoodType.REMAINS
            ? 0.95
            : 0.68,
      });

      floatingText.activeIndex =
        this.texts.length;

      this.texts.push(floatingText);
    }
  }

  spawnDeathBurst(snake) {
    const segments =
      snake.getSegmentPositions();

    const sampleStep = Math.max(
      1,
      Math.floor(
        segments.length /
          (this.reducedEffects ? 7 : 14)
      )
    );

    for (
      let index = 0;
      index < segments.length;
      index += sampleStep
    ) {
      const segment = segments[index];

      for (
        let particleIndex = 0;
        particleIndex < 3;
        particleIndex += 1
      ) {
        const particle =
          this.particlePool.acquire();

        const angle =
          Math.random() * Math.PI * 2;

        const speed = randomBetween(75, 230);

        particle.reset({
          x: segment.x,
          y: segment.y,
          velocityX:
            Math.cos(angle) * speed,
          velocityY:
            Math.sin(angle) * speed,
          life: randomBetween(0.45, 1.05),
          size: randomBetween(
            3.4,
            snake.radius * 0.68
          ),
          color:
            Math.random() < 0.5
              ? snake.primaryColor
              : snake.secondaryColor,
          drag: 0.91,
        });

        particle.activeIndex =
          this.particles.length;

        this.particles.push(particle);
      }
    }
  }

  spawnBoostTrail(
    snake,
    intensity,
    delta,
    { isBot = false } = {}
  ) {
    if (intensity <= 0.08) {
      this.boostTrailAccumulator.set(
        snake.id,
        0
      );
      return;
    }

    const preset =
      QUALITY_PRESETS[
        this.resolvedQualityName
      ];

    const qualityMultiplier =
      preset.boostParticleMultiplier *
      (isBot
        ? preset.botParticleMultiplier
        : 1) *
      (this.reducedEffects ? 0.42 : 1);

    let accumulator =
      this.boostTrailAccumulator.get(
        snake.id
      ) ?? 0;

    accumulator +=
      delta *
      intensity *
      qualityMultiplier;

    const interval =
      BALANCE_CONFIG.boost
        .trailParticleInterval;

    while (accumulator >= interval) {
      accumulator -= interval;

      const tail =
        snake.getSegmentPositions().at(-1) ??
        {
          x: snake.x,
          y: snake.y,
        };

      const particle =
        this.particlePool.acquire();

      const angle =
        snake.angle +
        Math.PI +
        randomBetween(-0.45, 0.45);

      const speed = randomBetween(30, 95);

      particle.reset({
        x:
          tail.x +
          randomBetween(
            -snake.radius * 0.45,
            snake.radius * 0.45
          ),
        y:
          tail.y +
          randomBetween(
            -snake.radius * 0.45,
            snake.radius * 0.45
          ),
        velocityX:
          Math.cos(angle) * speed,
        velocityY:
          Math.sin(angle) * speed,
        life: randomBetween(0.22, 0.48),
        size: randomBetween(1.5, 4.4),
        color:
          Math.random() < 0.55
            ? "#ffd966"
            : snake.secondaryColor,
        drag: 0.88,
      });

      particle.activeIndex =
        this.particles.length;

      this.particles.push(particle);
    }

    this.boostTrailAccumulator.set(
      snake.id,
      accumulator
    );
  }

  spawnBotArrival(bot) {
    const event = {
      x: bot.x,
      y: bot.y,
      radius: bot.radius * 0.85,
      scoreValue: 0,
      type: FoodType.SPECIAL,
      color: bot.primaryColor,
      secondaryColor: bot.secondaryColor,
    };

    this.spawnCollection(event, {
      showText: false,
      particleScale: 0.8,
    });
  }

  update(delta) {
    for (
      let index =
        this.particles.length - 1;
      index >= 0;
      index -= 1
    ) {
      const particle =
        this.particles[index];

      particle.update(delta);

      if (!particle.active) {
        this.releaseParticleAt(index);
      }
    }

    for (
      let index =
        this.texts.length - 1;
      index >= 0;
      index -= 1
    ) {
      const text = this.texts[index];
      text.update(delta);

      if (!text.active) {
        this.releaseTextAt(index);
      }
    }
  }

  releaseParticleAt(index) {
    const particle =
      this.particles[index];

    const lastIndex =
      this.particles.length - 1;

    const lastParticle =
      this.particles[lastIndex];

    if (index !== lastIndex) {
      this.particles[index] =
        lastParticle;

      lastParticle.activeIndex = index;
    }

    this.particles.pop();
    this.particlePool.release(particle);
  }

  releaseTextAt(index) {
    const text = this.texts[index];

    const lastIndex =
      this.texts.length - 1;

    const lastText =
      this.texts[lastIndex];

    if (index !== lastIndex) {
      this.texts[index] = lastText;
      lastText.activeIndex = index;
    }

    this.texts.pop();
    this.textPool.release(text);
  }

  getParticles() {
    return this.particles;
  }

  getTexts() {
    return this.texts;
  }

  getStats() {
    return {
      active:
        this.particles.length +
        this.texts.length,
      particlePool:
        this.particlePool.getAvailableCount(),
      textPool:
        this.textPool.getAvailableCount(),
    };
  }
}
