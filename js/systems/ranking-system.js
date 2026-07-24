import { BALANCE_CONFIG } from "../config/balance-config.js";

export class RankingSystem {
  constructor() {
    this.timer = 0;
    this.entries = [];
    this.rankBySnakeId = new Map();
    this.version = 0;
  }

  reset() {
    this.timer = 0;
    this.entries.length = 0;
    this.rankBySnakeId.clear();
    this.version += 1;
  }

  update(delta, snakes, force = false) {
    this.timer -= delta;

    if (!force && this.timer > 0) {
      return false;
    }

    this.timer =
      BALANCE_CONFIG.ranking.updateInterval;

    const ranked = snakes
      .filter((snake) => snake?.isAlive)
      .slice()
      .sort((first, second) => {
        if (second.mass !== first.mass) {
          return second.mass - first.mass;
        }

        if (second.score !== first.score) {
          return second.score - first.score;
        }

        return second.eliminations - first.eliminations;
      });

    this.entries = ranked.map((snake, index) => ({
      rank: index + 1,
      id: snake.id,
      name: snake.name,
      mass: snake.mass,
      score: snake.score,
      eliminations: snake.eliminations,
      color: snake.primaryColor,
      isPlayer: snake.isPlayer,
    }));

    this.rankBySnakeId.clear();

    for (const entry of this.entries) {
      this.rankBySnakeId.set(entry.id, entry.rank);
    }

    this.version += 1;
    return true;
  }

  getVisibleEntries() {
    return this.entries.slice(
      0,
      BALANCE_CONFIG.ranking.visibleEntries
    );
  }

  getRank(snakeOrId) {
    const id =
      typeof snakeOrId === "string"
        ? snakeOrId
        : snakeOrId?.id;

    return this.rankBySnakeId.get(id) ?? null;
  }

  getTotal() {
    return this.entries.length;
  }

  getVersion() {
    return this.version;
  }
}
