import { BALANCE_CONFIG } from "../config/balance-config.js";
import { SpatialGrid } from "./spatial-grid.js";

export const CollisionReason = Object.freeze({
  BODY: "BODY",
  HEAD_HEAD: "HEAD_HEAD",
  BORDER: "BORDER",
  PREDATION: "PREDATION",
});

export class CollisionSystem {
  constructor() {
    this.bodyGrid = new SpatialGrid(
      BALANCE_CONFIG.collision.spatialCellSize
    );
    this.bodyProxies = [];
    this.biteCooldowns = new Map();
  }

  reset() {
    this.bodyGrid.clear();
    this.bodyProxies.length = 0;
    this.biteCooldowns.clear();
  }

  detect(snakes, delta = 0) {
    this.updateBiteCooldowns(delta);

    const activeSnakes = snakes.filter(
      (snake) => snake?.isAlive
    );

    this.buildBodyGrid(activeSnakes);

    const deaths = new Map();
    const bites = [];

    this.detectHeadToHead(activeSnakes, deaths);
    this.detectHeadToBody(
      activeSnakes,
      deaths,
      bites
    );

    return {
      deaths: Array.from(deaths.values()),
      bites,
    };
  }

  updateBiteCooldowns(delta) {
    const elapsed = Math.max(0, Number(delta) || 0);

    for (const [key, remaining] of this.biteCooldowns) {
      const next = remaining - elapsed;

      if (next <= 0) {
        this.biteCooldowns.delete(key);
      } else {
        this.biteCooldowns.set(key, next);
      }
    }
  }

  buildBodyGrid(snakes) {
    this.bodyGrid.clear();
    this.bodyProxies.length = 0;

    for (const snake of snakes) {
      if (snake.isProtected()) {
        continue;
      }

      const segments = snake.getSegmentPositions();

      for (
        let index =
          BALANCE_CONFIG.collision.firstBodySegmentsIgnored;
        index < segments.length;
        index += 1
      ) {
        const segment = segments[index];
        const proxy = {
          x: segment.x,
          y: segment.y,
          radius: snake.getBodyRadius(
            index,
            segments.length
          ),
          snake,
          segmentIndex: index,
        };

        this.bodyProxies.push(proxy);
        this.bodyGrid.insert(proxy);
      }
    }
  }

  detectHeadToHead(snakes, deaths) {
    for (
      let firstIndex = 0;
      firstIndex < snakes.length;
      firstIndex += 1
    ) {
      const first = snakes[firstIndex];

      if (first.isProtected()) {
        continue;
      }

      for (
        let secondIndex = firstIndex + 1;
        secondIndex < snakes.length;
        secondIndex += 1
      ) {
        const second = snakes[secondIndex];

        if (second.isProtected()) {
          continue;
        }

        const collisionDistance =
          (first.radius + second.radius) *
          BALANCE_CONFIG.collision.headHeadScale;

        const distance = Math.hypot(
          first.x - second.x,
          first.y - second.y
        );

        if (distance > collisionDistance) {
          continue;
        }

        const advantage =
          BALANCE_CONFIG.collision
            .headHeadMassAdvantageRatio;

        if (first.mass >= second.mass * advantage) {
          this.addDeath(deaths, {
            kind: "death",
            victim: second,
            killer: first,
            reason: CollisionReason.HEAD_HEAD,
            awardElimination: true,
          });
        } else if (
          second.mass >= first.mass * advantage
        ) {
          this.addDeath(deaths, {
            kind: "death",
            victim: first,
            killer: second,
            reason: CollisionReason.HEAD_HEAD,
            awardElimination: true,
          });
        } else {
          this.addDeath(deaths, {
            kind: "death",
            victim: first,
            killer: null,
            reason: CollisionReason.HEAD_HEAD,
            awardElimination: false,
          });

          this.addDeath(deaths, {
            kind: "death",
            victim: second,
            killer: null,
            reason: CollisionReason.HEAD_HEAD,
            awardElimination: false,
          });
        }
      }
    }
  }

  detectHeadToBody(snakes, deaths, bites) {
    const bitingPredators = new Set();
    const bittenVictims = new Set();

    for (const snake of snakes) {
      if (
        snake.isProtected() ||
        deaths.has(snake.id)
      ) {
        continue;
      }

      const queryRadius =
        snake.radius +
        BALANCE_CONFIG.snakeMaximumRadius;

      const nearby = this.bodyGrid.queryCircle(
        snake.x,
        snake.y,
        queryRadius
      );

      for (const proxy of nearby) {
        const prey = proxy.snake;

        if (
          prey === snake ||
          !prey.isAlive ||
          prey.isProtected() ||
          deaths.has(prey.id)
        ) {
          continue;
        }

        const collisionDistance =
          (
            snake.radius *
              BALANCE_CONFIG.collision
                .headBodyHeadScale +
            proxy.radius *
              BALANCE_CONFIG.collision
                .headBodySegmentScale
          ) *
          BALANCE_CONFIG.predation
            .biteCollisionScale;

        const distance = Math.hypot(
          snake.x - proxy.x,
          snake.y - proxy.y
        );

        if (distance > collisionDistance) {
          continue;
        }

        if (
          BALANCE_CONFIG.collision
            .rivalDiesOnPlayerBody &&
          prey.isPlayer &&
          !snake.isPlayer
        ) {
          this.addDeath(deaths, {
            kind: "death",
            victim: snake,
            killer: prey,
            reason: CollisionReason.BODY,
            awardElimination: true,
          });
          break;
        }

        if (this.canPredate(snake, prey)) {
          if (
            bitingPredators.has(snake.id) ||
            bittenVictims.has(prey.id)
          ) {
            break;
          }

          const cooldownKey =
            `${snake.id}:${prey.id}`;

          if (this.biteCooldowns.has(cooldownKey)) {
            break;
          }

          bitingPredators.add(snake.id);
          bittenVictims.add(prey.id);
          this.biteCooldowns.set(
            cooldownKey,
            BALANCE_CONFIG.predation
              .biteCooldownSeconds
          );

          if (prey.canLosePredationSegment()) {
            bites.push({
              kind: "bite",
              predator: snake,
              prey,
              segmentIndex: proxy.segmentIndex,
              x: proxy.x,
              y: proxy.y,
              reason: CollisionReason.PREDATION,
            });
          } else {
            this.addDeath(deaths, {
              kind: "death",
              victim: prey,
              killer: snake,
              reason: CollisionReason.PREDATION,
              awardElimination: true,
            });
          }

          break;
        }

        this.addDeath(deaths, {
          kind: "death",
          victim: snake,
          killer: prey,
          reason: CollisionReason.BODY,
          awardElimination: true,
        });
        break;
      }
    }
  }

  canPredate(predator, prey) {
    return (
      predator.mass >=
        prey.mass *
          BALANCE_CONFIG.predation
            .massAdvantageRatio &&
      predator.segmentCount >=
        prey.segmentCount +
          BALANCE_CONFIG.predation
            .segmentAdvantage
    );
  }

  addDeath(deaths, event) {
    if (!deaths.has(event.victim.id)) {
      deaths.set(event.victim.id, event);
    }
  }

  getStats() {
    return {
      bodyProxies: this.bodyProxies.length,
      gridCells: this.bodyGrid.getCellCount(),
      biteCooldowns: this.biteCooldowns.size,
    };
  }
}
