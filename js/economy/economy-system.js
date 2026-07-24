import {
  DEFAULT_SKIN_ID,
  getSkinById,
  getStarterSkinIds,
} from "../skins/skin-catalog.js";

export class EconomySystem {
  constructor({
    storageService,
    onBalanceChange,
  }) {
    this.storageService = storageService;
    this.onBalanceChange = onBalanceChange;
    this.state = this.storageService.getEconomy();
  }

  reload() {
    this.state = this.storageService.getEconomy();
    return this.state;
  }

  getBalance() {
    return this.state.coins;
  }

  getOwnedSkinIds() {
    return [...this.state.ownedSkins];
  }

  ownsSkin(skinId) {
    return this.state.ownedSkins.includes(skinId);
  }

  addCoins(amount, source = "reward", { unique = false } = {}) {
    const safeAmount = Math.max(0, Math.round(Number(amount) || 0));

    if (safeAmount <= 0) {
      return {
        added: 0,
        balance: this.state.coins,
      };
    }

    const result = this.storageService.addCoins(
      safeAmount,
      source,
      { unique }
    );
    this.state = result.economy;
    this.onBalanceChange?.(this.state.coins);

    return {
      added: result.added,
      duplicate: result.duplicate,
      balance: this.state.coins,
    };
  }

  calculateMatchReward(result) {
    const scoreReward = Math.floor((Number(result.score) || 0) * 0.07);
    const eliminationReward =
      Math.max(0, Math.round(Number(result.eliminations) || 0)) * 28;

    let rankReward = 0;
    const rank = Number(result.rank);

    if (rank === 1) {
      rankReward = 120;
    } else if (rank > 0 && rank <= 3) {
      rankReward = 75;
    } else if (rank > 0 && rank <= 5) {
      rankReward = 40;
    }

    const survivalReward = Math.min(
      55,
      Math.floor((Number(result.elapsedTime) || 0) / 12) * 5
    );

    return Math.min(
      320,
      18 + scoreReward + eliminationReward + rankReward + survivalReward
    );
  }

  rewardMatch(result) {
    const reward = this.calculateMatchReward(result);
    return this.addCoins(reward, "match");
  }

  buySkin(skinId) {
    const skin = getSkinById(skinId);

    if (!skin || skin.id === DEFAULT_SKIN_ID) {
      return {
        success: true,
        reason: "owned",
        skin,
        balance: this.state.coins,
      };
    }

    if (this.ownsSkin(skinId)) {
      return {
        success: true,
        reason: "owned",
        skin,
        balance: this.state.coins,
      };
    }

    const result = this.storageService.purchaseSkin(
      skinId,
      skin.price
    );

    this.state = result.economy;
    this.onBalanceChange?.(this.state.coins);

    return {
      ...result,
      skin,
      balance: this.state.coins,
    };
  }

  ensureStarterSkins() {
    const starterIds = getStarterSkinIds();

    for (const skinId of starterIds) {
      this.storageService.unlockSkin(skinId, "starter");
    }

    this.reload();
  }
}
