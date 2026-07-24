import { BALANCE_CONFIG } from "../config/balance-config.js";
import { SpatialGrid } from "./spatial-grid.js";

export const CollisionReason = Object.freeze({
  BODY: "BODY",
  HEAD_HEAD: "HEAD_HEAD",
  BORDER: "BORDER",
});

export class CollisionSystem {
  constructor() {
    this.bodyGrid = new SpatialGrid(
      BALANCE_CONFIG.collision.spatialCellSize
    );
    this.bodyProxies = [];
  }

  detect(snakes) {
    const activeSnakes = snakes.filter(
      (snake) => snake?.isAlive
    );

    this.buildBodyGrid(activeSnakes);

    const deaths = new Map();

    this.detectHeadToHead(activeSnakes, deaths);
    this.detectHeadToBody(activeSnakes, deaths);
    this.detectBorder(activeSnakes, deaths);

    return Array.from(deaths.values());
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
        const taper = Math.max(
          0.48,
          1 - index / (segments.length * 1.32)
        );

        const proxy = {
          x: segment.x,
          y: segment.y,
          radius: snake.radius * taper,
          snake,
          segmentIndex: index,
        };

        this.bodyProxies.push(proxy);
        this.bodyGrid.insert(proxy);
      }
    }
  }

  detectHeadToHead(snakes, deaths) {
    for (let firstIndex = 0; firstIndex < snakes.length; firstIndex += 1) {
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
          BALANCE_CONFIG.collision.headHeadMassAdvantageRatio;

        if (first.mass >= second.mass * advantage) {
          this.addDeath(deaths, {
            victim: second,
            killer: first,
            reason: CollisionReason.HEAD_HEAD,
            awardElimination: true,
          });
        } else if (second.mass >= first.mass * advantage) {
          this.addDeath(deaths, {
            victim: first,
            killer: second,
            reason: CollisionReason.HEAD_HEAD,
            awardElimination: true,
          });
        } else {
          this.addDeath(deaths, {
            victim: first,
            killer: null,
            reason: CollisionReason.HEAD_HEAD,
            awardElimination: false,
          });

          this.addDeath(deaths, {
            victim: second,
            killer: null,
            reason: CollisionReason.HEAD_HEAD,
            awardElimination: false,
          });
        }
      }
    }
  }

  detectHeadToBody(snakes, deaths) {
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
        if (
          proxy.snake === snake ||
          !proxy.snake.isAlive ||
          proxy.snake.isProtected()
        ) {
          continue;
        }

        const collisionDistance =
          snake.radius *
            BALANCE_CONFIG.collision.headBodyHeadScale +
          proxy.radius *
            BALANCE_CONFIG.collision.headBodySegmentScale;

        const distance = Math.hypot(
          snake.x - proxy.x,
          snake.y - proxy.y
        );

        if (distance <= collisionDistance) {
          this.addDeath(deaths, {
            victim: snake,
            killer: proxy.snake,
            reason: CollisionReason.BODY,
            awardElimination: true,
          });
          break;
        }
      }
    }
  }

  detectBorder(snakes, deaths) {
    const radius =
      BALANCE_CONFIG.worldRadius;

    for (const snake of snakes) {
      if (
        snake.isProtected() ||
        deaths.has(snake.id)
      ) {
        continue;
      }

      const distance = Math.hypot(
        snake.x,
        snake.y
      );

      const effectiveRadius =
        snake.radius *
        BALANCE_CONFIG.collision.borderRadiusScale;

      if (distance + effectiveRadius >= radius) {
        this.addDeath(deaths, {
          victim: snake,
          killer: null,
          reason: CollisionReason.BORDER,
          awardElimination: false,
        });
      }
    }
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
    };
  }
}
