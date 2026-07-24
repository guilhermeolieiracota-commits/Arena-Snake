import { BALANCE_CONFIG } from "../config/balance-config.js";
import { CollisionReason } from "./collision-system.js";

export class DeathSystem {
  constructor() {
    this.killFeed = [];
    this.totalDeaths = 0;
  }

  reset() {
    this.killFeed.length = 0;
    this.totalDeaths = 0;
  }

  process({
    events,
    foodSystem,
    particleSystem,
    botSystem,
    rankingSystem,
  }) {
    const results = [];

    for (const event of events) {
      const victim = event.victim;

      if (!victim?.isAlive) {
        continue;
      }

      const rankBeforeDeath =
        rankingSystem.getRank(victim);

      victim.isAlive = false;
      victim.setBoostIntensity(0);

      foodSystem.spawnDeathRemains(victim);
      particleSystem.spawnDeathBurst(victim);

      if (
        event.awardElimination &&
        event.killer &&
        event.killer !== victim
      ) {
        event.killer.addElimination();
      }

      if (victim.isBot) {
        botSystem.scheduleRespawn(victim);
      }

      const result = {
        ...event,
        rankBeforeDeath,
        totalCompetitors:
          rankingSystem.getTotal(),
      };

      results.push(result);
      this.addKillFeed(result);
      this.totalDeaths += 1;
    }

    return results;
  }

  addKillFeed(event) {
    const victimName =
      event.victim?.name ?? "Cobra";

    const killerName =
      event.killer?.name ?? null;

    let text;

    switch (event.reason) {
      case CollisionReason.BODY:
        text = `${killerName ?? "Uma cobra"} eliminou ${victimName}`;
        break;

      case CollisionReason.HEAD_HEAD:
        text = killerName
          ? `${killerName} venceu o choque contra ${victimName}`
          : `${victimName} perdeu no choque de cabeças`;
        break;

      case CollisionReason.BORDER:
      default:
        text = `${victimName} bateu na borda`;
        break;
    }

    this.killFeed.unshift({
      id: `${Date.now()}-${Math.random()}`,
      text,
      color:
        event.killer?.primaryColor ??
        event.victim?.primaryColor ??
        "#ffffff",
      remaining:
        BALANCE_CONFIG.death.killFeedSeconds,
    });

    if (this.killFeed.length > 5) {
      this.killFeed.length = 5;
    }
  }

  update(delta) {
    for (
      let index = this.killFeed.length - 1;
      index >= 0;
      index -= 1
    ) {
      this.killFeed[index].remaining -= delta;

      if (this.killFeed[index].remaining <= 0) {
        this.killFeed.splice(index, 1);
      }
    }
  }

  getKillFeed() {
    return this.killFeed;
  }

  getTotalDeaths() {
    return this.totalDeaths;
  }
}
