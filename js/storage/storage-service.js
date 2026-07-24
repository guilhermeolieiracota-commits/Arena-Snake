import { GAME_CONFIG } from "../config/game-config.js";
import { ACHIEVEMENT_MAP } from "../achievements/achievement-catalog.js";
import { DAILY_CHALLENGE_MAP } from "../challenges/daily-challenge-catalog.js";
import { PROFILE_TITLE_MAP } from "../progression/progression-config.js";
import { INITIAL_RATING, getLeagueByRating } from "../competitive/league-config.js";
import {
  DEFAULT_CLOUD,
  DEFAULT_COMPETITIVE,
  DEFAULT_ECONOMY,
  DEFAULT_PLAYER_META,
  DEFAULT_PROGRESSION,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  createDefaultSave,
} from "./default-save.js";
import {
  PLAYER_SKINS,
  getSkinById,
  getStarterSkinIds,
  isValidSkinId,
} from "../skins/skin-catalog.js";
import { clamp } from "../utils/math.js";
import {
  sanitizeChoice,
  sanitizeNickname,
} from "../utils/validation.js";

const STORAGE_KEY = "snake_arena_save";

const clone = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};


const createPlayerId = () => {
  const raw =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 12)}`;

  return `SA-${raw
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 12)
    .toUpperCase()}`;
};

const xpSourceLabel = (source) => {
  const value = String(source || "");

  if (value.startsWith("match-xp:")) {
    return "Partida concluída";
  }

  if (value.startsWith("daily-xp:")) {
    return "Missão diária";
  }

  if (value.startsWith("achievement-xp:")) {
    return "Conquista";
  }

  if (value.startsWith("season:")) {
    return "Recompensa da temporada";
  }

  if (value.startsWith("weekly:")) {
    return "Evento semanal";
  }

  return "Recompensa de XP";
};

export class StorageService {
  constructor(storage = window.localStorage) {
    this.storage = storage;
    this.memoryFallback = createDefaultSave(
      GAME_CONFIG.saveVersion
    );
    this.storageAvailable = this.testStorage();
  }

  testStorage() {
    try {
      const testKey = `${STORAGE_KEY}_test`;
      this.storage.setItem(testKey, "1");
      this.storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  load() {
    if (!this.storageAvailable) {
      return clone(this.memoryFallback);
    }

    try {
      const raw = this.storage.getItem(STORAGE_KEY);

      if (!raw) {
        const initialSave = createDefaultSave(
          GAME_CONFIG.saveVersion
        );
        this.write(initialSave);
        return initialSave;
      }

      const parsed = JSON.parse(raw);
      const normalized = this.normalizeSave(parsed);
      this.write(normalized);
      return normalized;
    } catch {
      const fallback = createDefaultSave(
        GAME_CONFIG.saveVersion
      );
      this.write(fallback);
      return fallback;
    }
  }

  saveSettings(partialSettings) {
    const save = this.load();

    save.settings = this.normalizeSettings({
      ...save.settings,
      ...partialSettings,
    });

    if (
      !save.economy.ownedSkins.includes(
        save.settings.skinId
      )
    ) {
      save.economy.ownedSkins.push(
        save.settings.skinId
      );
    }

    this.write(save);
    return { ...save.settings };
  }

  saveCompletedGame(result) {
    const save = this.load();
    const stats = save.stats;

    const rank = Number.isFinite(result.rank)
      ? Math.max(1, Math.round(result.rank))
      : null;

    stats.gamesPlayed += 1;
    stats.deaths += 1;
    stats.totalPlaySeconds += Math.max(
      0,
      Number(result.elapsedTime) || 0
    );
    stats.totalCollected += Math.max(
      0,
      Math.round(Number(result.collected) || 0)
    );
    stats.totalEliminations += Math.max(
      0,
      Math.round(Number(result.eliminations) || 0)
    );

    stats.bestScore = Math.max(
      stats.bestScore,
      Number(result.score) || 0
    );
    stats.bestMass = Math.max(
      stats.bestMass,
      Number(result.maximumMass) || 0
    );
    stats.bestEliminations = Math.max(
      stats.bestEliminations,
      Number(result.eliminations) || 0
    );
    stats.longestSurvivalSeconds = Math.max(
      stats.longestSurvivalSeconds,
      Number(result.elapsedTime) || 0
    );

    if (
      rank !== null &&
      (stats.bestRank === null || rank < stats.bestRank)
    ) {
      stats.bestRank = rank;
    }

    stats.lastPlayedAt = new Date().toISOString();
    save.stats = this.normalizeStats(stats);
    this.write(save);

    return { ...save.stats };
  }

  getAchievements() {
    return clone(this.load().achievements);
  }

  unlockAchievement(
    achievementId,
    metadata = {}
  ) {
    if (!ACHIEVEMENT_MAP[achievementId]) {
      return null;
    }

    const save = this.load();

    if (
      save.achievements.unlocked[
        achievementId
      ]
    ) {
      return {
        ...save.achievements.unlocked[
          achievementId
        ],
      };
    }

    const record = {
      unlockedAt: new Date().toISOString(),
      progress: Math.max(
        0,
        Number(metadata.progress) || 0
      ),
    };

    save.achievements.unlocked[
      achievementId
    ] = record;

    this.write(save);
    return { ...record };
  }

  getEconomy() {
    return clone(this.load().economy);
  }

  addCoins(
    amount,
    source = "reward",
    { unique = false } = {}
  ) {
    const safeAmount = Math.max(
      0,
      Math.round(Number(amount) || 0)
    );
    const safeSource = String(source || "reward");
    const save = this.load();
    const economy = save.economy;

    if (
      unique &&
      economy.rewardLedger[safeSource]
    ) {
      return {
        added: 0,
        duplicate: true,
        economy: clone(economy),
      };
    }

    if (safeAmount > 0) {
      economy.coins += safeAmount;
      economy.lifetimeEarned += safeAmount;
    }

    if (unique) {
      economy.rewardLedger[safeSource] = true;
      this.trimLedger(
        economy.rewardLedger,
        600
      );
    }

    save.economy = this.normalizeEconomy(
      economy,
      save.settings.skinId
    );

    this.write(save);

    return {
      added: safeAmount,
      duplicate: false,
      economy: clone(save.economy),
    };
  }

  purchaseSkin(skinId, price) {
    const skin = getSkinById(skinId);
    const safePrice = Math.max(
      0,
      Math.round(Number(price) || 0)
    );
    const save = this.load();
    const economy = save.economy;

    if (economy.ownedSkins.includes(skin.id)) {
      return {
        success: true,
        reason: "owned",
        economy: clone(economy),
      };
    }

    if (economy.coins < safePrice) {
      return {
        success: false,
        reason: "insufficient",
        economy: clone(economy),
      };
    }

    economy.coins -= safePrice;
    economy.lifetimeSpent += safePrice;
    economy.ownedSkins.push(skin.id);
    economy.purchaseHistory.unshift({
      type: "skin",
      skinId: skin.id,
      price: safePrice,
      purchasedAt: new Date().toISOString(),
    });
    economy.purchaseHistory.length = Math.min(
      economy.purchaseHistory.length,
      40
    );

    save.economy = this.normalizeEconomy(
      economy,
      save.settings.skinId
    );

    this.write(save);

    return {
      success: true,
      reason: "purchased",
      economy: clone(save.economy),
    };
  }

  unlockSkin(skinId, source = "unlock") {
    if (!isValidSkinId(skinId)) {
      return false;
    }

    const save = this.load();

    if (
      !save.economy.ownedSkins.includes(
        skinId
      )
    ) {
      save.economy.ownedSkins.push(
        skinId
      );
      save.economy.purchaseHistory.unshift({
        type: "unlock",
        skinId,
        price: 0,
        source,
        purchasedAt: new Date().toISOString(),
      });
      save.economy.purchaseHistory.length = Math.min(
        save.economy.purchaseHistory.length,
        40
      );
      this.write(save);
    }

    return true;
  }

  ownsSkin(skinId) {
    return this.load().economy.ownedSkins.includes(
      skinId
    );
  }

  getDailyChallenges() {
    return clone(this.load().dailyChallenges);
  }

  saveDailyChallenges(state) {
    const save = this.load();
    save.dailyChallenges =
      this.normalizeDailyChallenges(state);
    this.write(save);
    return clone(save.dailyChallenges);
  }

  getProgression() {
    return clone(this.load().progression);
  }

  addProfileXp(
    amount,
    source = "xp",
    { unique = false } = {}
  ) {
    const safeAmount = Math.max(
      0,
      Math.round(Number(amount) || 0)
    );
    const safeSource = String(source || "xp");
    const save = this.load();
    const progression = save.progression;

    if (
      unique &&
      progression.xpLedger[safeSource]
    ) {
      return {
        added: 0,
        duplicate: true,
        progression: clone(progression),
      };
    }

    progression.totalXp += safeAmount;

    if (unique) {
      progression.xpLedger[safeSource] = true;
      this.trimLedger(
        progression.xpLedger,
        700
      );
    }

    if (safeAmount > 0) {
      progression.recentXp.unshift({
        source: safeSource,
        label: xpSourceLabel(safeSource),
        amount: safeAmount,
        earnedAt: new Date().toISOString(),
      });
      progression.recentXp.length = Math.min(
        progression.recentXp.length,
        30
      );
    }

    save.progression =
      this.normalizeProgression(
        progression,
        save.stats,
        false
      );

    this.write(save);

    return {
      added: safeAmount,
      duplicate: false,
      progression: clone(save.progression),
    };
  }

  claimLevelReward(level) {
    const safeLevel = Math.max(
      2,
      Math.round(Number(level) || 2)
    );
    const save = this.load();
    const progression = save.progression;

    if (
      !progression.claimedLevelRewards.includes(
        safeLevel
      )
    ) {
      progression.claimedLevelRewards.push(
        safeLevel
      );
      progression.claimedLevelRewards.sort(
        (first, second) => first - second
      );
      this.write(save);
    }

    return {
      progression: clone(save.progression),
    };
  }

  unlockProfileTitle(
    titleId,
    source = "unlock"
  ) {
    if (!PROFILE_TITLE_MAP[titleId]) {
      return {
        unlocked: false,
        progression:
          this.getProgression(),
      };
    }

    const save = this.load();
    const progression = save.progression;
    const alreadyUnlocked =
      progression.unlockedTitles.includes(
        titleId
      );

    if (!alreadyUnlocked) {
      progression.unlockedTitles.push(
        titleId
      );
      progression.titleHistory.unshift({
        titleId,
        source,
        unlockedAt:
          new Date().toISOString(),
      });
      progression.titleHistory.length =
        Math.min(
          progression.titleHistory.length,
          30
        );
      this.write(save);
    }

    return {
      unlocked: !alreadyUnlocked,
      progression: clone(
        save.progression
      ),
    };
  }

  selectProfileTitle(titleId) {
    const save = this.load();
    const progression = save.progression;

    if (
      !progression.unlockedTitles.includes(
        titleId
      )
    ) {
      return {
        success: false,
        reason: "locked",
        progression: clone(progression),
      };
    }

    progression.selectedTitleId =
      titleId;
    this.write(save);

    return {
      success: true,
      progression: clone(
        save.progression
      ),
    };
  }

  getSeason() {
    return clone(this.load().season);
  }

  saveSeason(state) {
    const save = this.load();
    save.season = this.normalizeSeason(
      state
    );
    this.write(save);
    return clone(save.season);
  }

  addSeasonPoints(
    amount,
    source = "season",
    { unique = false } = {}
  ) {
    const safeAmount = Math.max(
      0,
      Math.round(Number(amount) || 0)
    );
    const safeSource = String(source || "season");
    const save = this.load();
    const season = save.season;

    if (
      unique &&
      season.pointsLedger[safeSource]
    ) {
      return {
        added: 0,
        duplicate: true,
        season: clone(season),
      };
    }

    season.points += safeAmount;

    if (unique) {
      season.pointsLedger[safeSource] = true;
      this.trimLedger(
        season.pointsLedger,
        600
      );
    }

    save.season =
      this.normalizeSeason(season);
    this.write(save);

    return {
      added: safeAmount,
      duplicate: false,
      season: clone(save.season),
    };
  }

  claimSeasonLevel(level) {
    const safeLevel = Math.max(
      1,
      Math.round(Number(level) || 1)
    );
    const save = this.load();

    if (
      !save.season.claimedLevels.includes(
        safeLevel
      )
    ) {
      save.season.claimedLevels.push(
        safeLevel
      );
      save.season.claimedLevels.sort(
        (first, second) => first - second
      );
      save.season.highestLevel = Math.max(
        save.season.highestLevel,
        safeLevel
      );
      this.write(save);
    }

    return {
      season: clone(save.season),
    };
  }

  getWeeklyEvent() {
    return clone(this.load().weeklyEvent);
  }

  saveWeeklyEvent(state) {
    const save = this.load();
    save.weeklyEvent =
      this.normalizeWeeklyEvent(state);
    this.write(save);
    return clone(save.weeklyEvent);
  }

  getCloudMetadata() {
    return clone(
      this.load().cloud
    );
  }

  saveCloudMetadata(
    partial
  ) {
    const save = this.load();

    save.cloud =
      this.normalizeCloudMetadata({
        ...save.cloud,
        ...partial,
      });

    this.write(save);
    return clone(save.cloud);
  }

  getPlayerMeta() {
    return clone(this.load().playerMeta);
  }

  savePlayerMeta(state) {
    const save = this.load();
    save.playerMeta =
      this.normalizePlayerMeta(state);
    this.write(save);
    return clone(save.playerMeta);
  }

  getCompetitive() {
    return clone(this.load().competitive);
  }

  recordCompetitiveMatch({
    matchId,
    ratingBefore,
    ratingAfter,
    ratingDelta,
    result,
  }) {
    const save = this.load();
    const competitive = save.competitive;
    const safeMatchId = String(matchId || "");

    if (
      safeMatchId &&
      competitive.ratingLedger[
        safeMatchId
      ]
    ) {
      return {
        duplicate: true,
        competitive:
          clone(competitive),
      };
    }

    const rank = Math.max(
      1,
      Math.round(
        Number(result?.rank) || 1
      )
    );

    const total = Math.max(
      1,
      Math.round(
        Number(
          result?.totalCompetitors
        ) || 1
      )
    );

    competitive.rating = Math.max(
      0,
      Math.round(
        Number(ratingAfter) ||
          competitive.rating
      )
    );

    competitive.peakRating = Math.max(
      competitive.peakRating,
      competitive.rating
    );

    competitive.matches += 1;
    competitive.wins +=
      rank === 1 ? 1 : 0;
    competitive.top3 +=
      rank <= 3 ? 1 : 0;
    competitive.totalRank += rank;
    competitive.totalOpponents +=
      Math.max(0, total - 1);
    competitive.totalRatingDelta +=
      Math.round(
        Number(ratingDelta) || 0
      );

    if (safeMatchId) {
      competitive.ratingLedger[
        safeMatchId
      ] = true;

      this.trimLedger(
        competitive.ratingLedger,
        500
      );
    }

    const previousLeague =
      getLeagueByRating(
        ratingBefore
      );

    const currentLeague =
      getLeagueByRating(
        competitive.rating
      );

    if (
      previousLeague.id !==
      currentLeague.id
    ) {
      competitive.leagueHistory.unshift({
        matchId:
          safeMatchId,
        from:
          previousLeague.id,
        to:
          currentLeague.id,
        rating:
          competitive.rating,
        changedAt:
          new Date().toISOString(),
      });

      competitive.leagueHistory.length =
        Math.min(
          competitive.leagueHistory.length,
          30
        );
    }

    save.competitive =
      this.normalizeCompetitive(
        competitive
      );

    this.write(save);

    return {
      duplicate: false,
      competitive:
        clone(save.competitive),
    };
  }

  getMatchHistory() {
    return clone(
      this.load().matchHistory
    );
  }

  recordMatchHistory(record) {
    const save = this.load();
    const safeRecord =
      this.normalizeMatchRecord(
        record
      );

    if (
      save.matchHistory.some(
        (entry) =>
          entry.id ===
          safeRecord.id
      )
    ) {
      return {
        duplicate: true,
        record:
          clone(safeRecord),
        history:
          clone(
            save.matchHistory
          ),
      };
    }

    save.matchHistory.unshift(
      safeRecord
    );

    save.matchHistory =
      save.matchHistory.slice(
        0,
        50
      );

    this.write(save);

    return {
      duplicate: false,
      record:
        clone(safeRecord),
      history:
        clone(
          save.matchHistory
        ),
    };
  }

  clearMatchHistory() {
    const save = this.load();
    save.matchHistory = [];
    this.write(save);
    return [];
  }

  replaceSave(
    value,
    {
      preserveCloud = false,
    } = {}
  ) {
    const currentCloud =
      preserveCloud
        ? this.getCloudMetadata()
        : null;

    const normalized =
      this.normalizeSave(value);

    normalized.playerMeta.lastBackupAt =
      new Date().toISOString();

    if (currentCloud) {
      normalized.cloud =
        this.normalizeCloudMetadata({
          ...normalized.cloud,
          ...currentCloud,
        });
    }

    this.write(normalized);
    return clone(normalized);
  }

  markBackupCreated() {
    const save = this.load();
    save.playerMeta.lastBackupAt =
      new Date().toISOString();
    this.write(save);
    return clone(
      save.playerMeta
    );
  }

  resetStats() {
    const save = this.load();
    save.stats = { ...DEFAULT_STATS };
    this.write(save);
    return { ...save.stats };
  }

  resetAchievements() {
    const save = this.load();
    save.achievements = {
      unlocked: {},
    };
    this.write(save);
    return clone(save.achievements);
  }

  resetEconomy() {
    const save = this.load();
    save.economy = this.normalizeEconomy(
      {
        coins: DEFAULT_ECONOMY.coins,
        lifetimeEarned:
          DEFAULT_ECONOMY.lifetimeEarned,
        lifetimeSpent: 0,
        ownedSkins: [
          ...getStarterSkinIds(),
          save.settings.skinId,
        ],
        rewardLedger: {
          starterBalance: true,
        },
        purchaseHistory: [],
      },
      save.settings.skinId
    );
    this.write(save);
    return clone(save.economy);
  }

  resetProgression() {
    const save = this.load();
    save.progression =
      this.normalizeProgression(
        {
          totalXp: 0,
          claimedLevelRewards: [],
          unlockedTitles: ["novato"],
          selectedTitleId: "novato",
          xpLedger: {},
          recentXp: [],
          titleHistory: [],
        },
        save.stats,
        false
      );
    this.write(save);
    return clone(save.progression);
  }

  resetAll() {
    const save = createDefaultSave(
      GAME_CONFIG.saveVersion
    );
    this.write(save);
    return save;
  }

  normalizeSave(value) {
    const sourceVersion = Number(
      value?.version || 0
    );
    const settings = this.normalizeSettings(
      value?.settings ?? {}
    );
    const stats = this.normalizeStats(
      value?.stats ?? {}
    );

    return {
      version: GAME_CONFIG.saveVersion,
      settings,
      stats,
      achievements:
        this.normalizeAchievements(
          value?.achievements ?? {}
        ),
      economy: this.normalizeEconomy(
        value?.economy ?? {},
        settings.skinId,
        sourceVersion < 3 &&
          !value?.economy
      ),
      dailyChallenges:
        this.normalizeDailyChallenges(
          value?.dailyChallenges ?? {}
        ),
      progression:
        this.normalizeProgression(
          value?.progression ?? {},
          stats,
          sourceVersion < 4 &&
            !value?.progression
        ),
      season:
        this.normalizeSeason(
          value?.season ?? {}
        ),
      weeklyEvent:
        this.normalizeWeeklyEvent(
          value?.weeklyEvent ?? {}
        ),
      playerMeta:
        this.normalizePlayerMeta(
          value?.playerMeta ?? {}
        ),
      competitive:
        this.normalizeCompetitive(
          value?.competitive ?? {},
          sourceVersion < 5
        ),
      matchHistory:
        this.normalizeMatchHistory(
          value?.matchHistory ?? []
        ),
      cloud:
        this.normalizeCloudMetadata(
          value?.cloud ?? {}
        ),
    };
  }

  normalizeSettings(value) {
    const volumeValue = (
      input,
      fallback
    ) => {
      const numeric = Number(input);

      return Number.isFinite(numeric)
        ? clamp(numeric, 0, 1)
        : fallback;
    };

    return {
      nickname: sanitizeNickname(
        value.nickname ??
          DEFAULT_SETTINGS.nickname
      ),
      controlMode: sanitizeChoice(
        value.controlMode,
        ["follow", "joystick"],
        DEFAULT_SETTINGS.controlMode
      ),
      quality: sanitizeChoice(
        value.quality,
        ["auto", "low", "medium", "high"],
        DEFAULT_SETTINGS.quality
      ),
      difficulty: sanitizeChoice(
        value.difficulty,
        ["calm", "normal", "intense"],
        DEFAULT_SETTINGS.difficulty
      ),
      skinId: isValidSkinId(value.skinId)
        ? value.skinId
        : DEFAULT_SETTINGS.skinId,

      muted: Boolean(value.muted),
      masterVolume: volumeValue(
        value.masterVolume,
        DEFAULT_SETTINGS.masterVolume
      ),
      sfxVolume: volumeValue(
        value.sfxVolume,
        DEFAULT_SETTINGS.sfxVolume
      ),
      musicVolume: volumeValue(
        value.musicVolume,
        DEFAULT_SETTINGS.musicVolume
      ),

      showLeaderboard:
        value.showLeaderboard !== false,
      showMinimap:
        value.showMinimap !== false,
      showSnakeNames:
        value.showSnakeNames !== false,
      reducedEffects:
        Boolean(value.reducedEffects),
    };
  }

  normalizeStats(value) {
    const number = (input) =>
      Math.max(0, Number(input) || 0);
    const integer = (input) =>
      Math.round(number(input));

    return {
      gamesPlayed: integer(
        value.gamesPlayed ??
          DEFAULT_STATS.gamesPlayed
      ),
      deaths: integer(
        value.deaths ??
          DEFAULT_STATS.deaths
      ),
      totalPlaySeconds: number(
        value.totalPlaySeconds ??
          DEFAULT_STATS.totalPlaySeconds
      ),
      totalCollected: integer(
        value.totalCollected ??
          DEFAULT_STATS.totalCollected
      ),
      totalEliminations: integer(
        value.totalEliminations ??
          DEFAULT_STATS.totalEliminations
      ),
      bestScore: number(
        value.bestScore ??
          DEFAULT_STATS.bestScore
      ),
      bestMass: number(
        value.bestMass ??
          DEFAULT_STATS.bestMass
      ),
      bestRank:
        Number.isFinite(
          Number(value.bestRank)
        ) &&
        Number(value.bestRank) > 0
          ? Math.round(
              Number(value.bestRank)
            )
          : null,
      bestEliminations: integer(
        value.bestEliminations ??
          DEFAULT_STATS.bestEliminations
      ),
      longestSurvivalSeconds: number(
        value.longestSurvivalSeconds ??
          DEFAULT_STATS
            .longestSurvivalSeconds
      ),
      lastPlayedAt:
        typeof value.lastPlayedAt ===
        "string"
          ? value.lastPlayedAt
          : null,
    };
  }

  normalizeAchievements(value) {
    const unlocked = {};

    for (
      const [achievementId, record]
      of Object.entries(
        value?.unlocked ?? {}
      )
    ) {
      if (!ACHIEVEMENT_MAP[achievementId]) {
        continue;
      }

      unlocked[achievementId] = {
        unlockedAt:
          typeof record?.unlockedAt ===
          "string"
            ? record.unlockedAt
            : new Date(0).toISOString(),
        progress: Math.max(
          0,
          Number(record?.progress) || 0
        ),
      };
    }

    return { unlocked };
  }

  normalizeEconomy(
    value,
    selectedSkinId,
    legacyUnlockAll = false
  ) {
    const starterIds =
      getStarterSkinIds();

    const ownedSkins = Array.from(
      new Set([
        ...starterIds,
        ...(legacyUnlockAll
          ? PLAYER_SKINS.map(
              (skin) => skin.id
            )
          : []),
        ...(Array.isArray(
          value?.ownedSkins
        )
          ? value.ownedSkins.filter(
              isValidSkinId
            )
          : []),
        isValidSkinId(selectedSkinId)
          ? selectedSkinId
          : DEFAULT_SETTINGS.skinId,
      ])
    );

    const rewardLedger = {};

    for (
      const [source, claimed]
      of Object.entries(
        value?.rewardLedger ?? {}
      )
    ) {
      if (claimed) {
        rewardLedger[String(source)] = true;
      }
    }

    const hasExistingEconomy =
      value &&
      (
        Number.isFinite(
          Number(value.coins)
        ) ||
        Array.isArray(
          value.ownedSkins
        )
      );

    const coins = hasExistingEconomy
      ? Math.max(
          0,
          Math.round(
            Number(value.coins) || 0
          )
        )
      : DEFAULT_ECONOMY.coins;

    const lifetimeEarned =
      hasExistingEconomy
        ? Math.max(
            coins,
            Math.round(
              Number(
                value.lifetimeEarned
              ) || coins
            )
          )
        : DEFAULT_ECONOMY
            .lifetimeEarned;

    return {
      coins,
      lifetimeEarned,
      lifetimeSpent: Math.max(
        0,
        Math.round(
          Number(value?.lifetimeSpent) || 0
        )
      ),
      ownedSkins,
      rewardLedger:
        Object.keys(rewardLedger).length > 0
          ? rewardLedger
          : { starterBalance: true },
      purchaseHistory:
        Array.isArray(
          value?.purchaseHistory
        )
          ? value.purchaseHistory
              .filter(
                (entry) =>
                  entry &&
                  isValidSkinId(
                    entry.skinId
                  )
              )
              .slice(0, 40)
          : [],
    };
  }

  normalizeDailyChallenges(value) {
    const dateKey =
      typeof value?.dateKey === "string"
        ? value.dateKey
        : "";

    const items =
      Array.isArray(value?.items)
        ? value.items
            .filter(
              (item) =>
                item &&
                DAILY_CHALLENGE_MAP[
                  item.id
                ]
            )
            .slice(0, 3)
            .map((item) => ({
              id: item.id,
              progress: Math.max(
                0,
                Number(item.progress) || 0
              ),
              completed:
                Boolean(item.completed),
              completedAt:
                typeof item.completedAt ===
                "string"
                  ? item.completedAt
                  : null,
            }))
        : [];

    return {
      dateKey,
      items,
    };
  }

  normalizeProgression(
    value,
    stats,
    migrateFromLegacy
  ) {
    const inferredXp = migrateFromLegacy
      ? Math.min(
          7000,
          Math.round(
            stats.gamesPlayed * 70 +
              stats.totalEliminations * 38 +
              stats.bestScore * 0.16 +
              stats.totalPlaySeconds * 0.18
          )
        )
      : 0;

    const totalXp = Math.max(
      0,
      Math.round(
        Number(value?.totalXp) ||
          inferredXp ||
          DEFAULT_PROGRESSION.totalXp
      )
    );

    const unlockedTitles = Array.from(
      new Set([
        "novato",
        ...(Array.isArray(
          value?.unlockedTitles
        )
          ? value.unlockedTitles.filter(
              (id) =>
                Boolean(
                  PROFILE_TITLE_MAP[id]
                )
            )
          : []),
      ])
    );

    const selectedTitleId =
      unlockedTitles.includes(
        value?.selectedTitleId
      )
        ? value.selectedTitleId
        : "novato";

    const xpLedger = {};

    for (
      const [source, claimed]
      of Object.entries(
        value?.xpLedger ?? {}
      )
    ) {
      if (claimed) {
        xpLedger[String(source)] = true;
      }
    }

    return {
      totalXp,
      claimedLevelRewards:
        Array.from(
          new Set(
            Array.isArray(
              value?.claimedLevelRewards
            )
              ? value.claimedLevelRewards
                  .map(Number)
                  .filter(
                    (level) =>
                      Number.isFinite(level) &&
                      level >= 2 &&
                      level <= 50
                  )
              : []
          )
        ).sort(
          (first, second) =>
            first - second
        ),
      unlockedTitles,
      selectedTitleId,
      xpLedger,
      recentXp:
        Array.isArray(value?.recentXp)
          ? value.recentXp
              .filter(
                (entry) =>
                  entry &&
                  Number(entry.amount) > 0
              )
              .slice(0, 30)
              .map((entry) => ({
                source:
                  String(
                    entry.source || "xp"
                  ),
                label:
                  String(
                    entry.label ||
                      xpSourceLabel(
                        entry.source
                      )
                  ),
                amount:
                  Math.max(
                    1,
                    Math.round(
                      Number(entry.amount) ||
                        1
                    )
                  ),
                earnedAt:
                  typeof entry.earnedAt ===
                  "string"
                    ? entry.earnedAt
                    : new Date(0)
                        .toISOString(),
              }))
          : [],
      titleHistory:
        Array.isArray(
          value?.titleHistory
        )
          ? value.titleHistory
              .filter(
                (entry) =>
                  entry &&
                  PROFILE_TITLE_MAP[
                    entry.titleId
                  ]
              )
              .slice(0, 30)
          : [],
    };
  }

  normalizeSeason(value) {
    const pointsLedger = {};

    for (
      const [source, claimed]
      of Object.entries(
        value?.pointsLedger ?? {}
      )
    ) {
      if (claimed) {
        pointsLedger[String(source)] = true;
      }
    }

    return {
      key:
        typeof value?.key === "string"
          ? value.key
          : "",
      points: Math.max(
        0,
        Math.round(
          Number(value?.points) || 0
        )
      ),
      claimedLevels:
        Array.from(
          new Set(
            Array.isArray(
              value?.claimedLevels
            )
              ? value.claimedLevels
                  .map(Number)
                  .filter(
                    (level) =>
                      Number.isFinite(level) &&
                      level >= 1 &&
                      level <= 20
                  )
              : []
          )
        ).sort(
          (first, second) =>
            first - second
        ),
      highestLevel: Math.max(
        1,
        Math.min(
          20,
          Math.round(
            Number(value?.highestLevel) ||
              1
          )
        )
      ),
      pointsLedger,
      history:
        Array.isArray(value?.history)
          ? value.history
              .filter(
                (entry) =>
                  entry &&
                  typeof entry.key ===
                    "string"
              )
              .slice(0, 12)
          : [],
    };
  }

  normalizeWeeklyEvent(value) {
    const progress = {};

    for (
      const [key, amount]
      of Object.entries(
        value?.progress ?? {}
      )
    ) {
      progress[String(key)] = Math.max(
        0,
        Math.round(Number(amount) || 0)
      );
    }

    return {
      key:
        typeof value?.key === "string"
          ? value.key
          : "",
      progress,
      completedObjectives:
        Array.from(
          new Set(
            Array.isArray(
              value?.completedObjectives
            )
              ? value.completedObjectives.map(
                  String
                )
              : []
          )
        ).slice(0, 8),
      completionRewardClaimed:
        Boolean(
          value?.completionRewardClaimed
        ),
      history:
        Array.isArray(value?.history)
          ? value.history
              .filter(
                (entry) =>
                  entry &&
                  typeof entry.key ===
                    "string"
              )
              .slice(0, 16)
          : [],
    };
  }

  normalizeCloudMetadata(value) {
    const dateOrNull = (
      input
    ) =>
      typeof input === "string" &&
      input.trim()
        ? input
        : null;

    const normalizeLeaderboard = (
      entries
    ) =>
      Array.isArray(entries)
        ? entries
            .filter(
              (entry) =>
                entry &&
                typeof entry.nickname ===
                  "string"
            )
            .slice(0, 150)
            .map((entry) => ({
              playerId:
                String(
                  entry.playerId ?? ""
                ).slice(0, 32),
              nickname:
                String(
                  entry.nickname ??
                    "Jogador"
                ).slice(0, 24),
              rating:
                Math.max(
                  0,
                  Number(
                    entry.rating
                  ) || 0
                ),
              leagueId:
                String(
                  entry.leagueId ??
                    "bronze"
                ).slice(0, 24),
              bestScore:
                Math.max(
                  0,
                  Number(
                    entry.bestScore
                  ) || 0
                ),
              bestMass:
                Math.max(
                  0,
                  Number(
                    entry.bestMass
                  ) || 0
                ),
              wins:
                Math.max(
                  0,
                  Math.round(
                    Number(
                      entry.wins
                    ) || 0
                  )
                ),
              profileLevel:
                Math.max(
                  1,
                  Math.round(
                    Number(
                      entry.profileLevel
                    ) || 1
                  )
                ),
              titleId:
                String(
                  entry.titleId ??
                    "novato"
                ).slice(0, 40),
              skinId:
                String(
                  entry.skinId ??
                    "neon-mint"
                ).slice(0, 40),
              currentStreak:
                Math.max(
                  0,
                  Math.round(
                    Number(
                      entry.currentStreak
                    ) || 0
                  )
                ),
              totalGames:
                Math.max(
                  0,
                  Math.round(
                    Number(
                      entry.totalGames
                    ) || 0
                  )
                ),
              totalEliminations:
                Math.max(
                  0,
                  Math.round(
                    Number(
                      entry.totalEliminations
                    ) || 0
                  )
                ),
              updatedAt:
                dateOrNull(
                  entry.updatedAt
                ),
            }))
        : [];

    const normalizeProfiles = (
      entries
    ) =>
      Array.isArray(entries)
        ? entries
            .filter(
              (entry) =>
                entry &&
                typeof entry.nickname ===
                  "string"
            )
            .slice(0, 150)
            .map((entry) => ({
              ...normalizeLeaderboard([
                entry,
              ])[0],
              tagline:
                String(
                  entry.tagline ?? ""
                ).slice(0, 80),
            }))
        : [];

    const normalizeFeed = (
      entries
    ) =>
      Array.isArray(entries)
        ? entries
            .filter(
              (entry) =>
                entry &&
                typeof entry.nickname ===
                  "string"
            )
            .slice(0, 60)
            .map((entry) => ({
              matchId:
                String(
                  entry.matchId ?? ""
                ).slice(0, 80),
              playerId:
                String(
                  entry.playerId ?? ""
                ).slice(0, 32),
              nickname:
                String(
                  entry.nickname ??
                    "Jogador"
                ).slice(0, 24),
              score:
                Math.max(
                  0,
                  Number(
                    entry.score
                  ) || 0
                ),
              rank:
                Math.max(
                  1,
                  Math.round(
                    Number(
                      entry.rank
                    ) || 1
                  )
                ),
              totalCompetitors:
                Math.max(
                  1,
                  Math.round(
                    Number(
                      entry.totalCompetitors
                    ) || 1
                  )
                ),
              maximumMass:
                Math.max(
                  0,
                  Number(
                    entry.maximumMass
                  ) || 0
                ),
              eliminations:
                Math.max(
                  0,
                  Math.round(
                    Number(
                      entry.eliminations
                    ) || 0
                  )
                ),
              elapsedTime:
                Math.max(
                  0,
                  Number(
                    entry.elapsedTime
                  ) || 0
                ),
              ratingAfter:
                Math.max(
                  0,
                  Number(
                    entry.ratingAfter
                  ) || 0
                ),
              leagueId:
                String(
                  entry.leagueId ??
                    "bronze"
                ).slice(0, 24),
              medalIcon:
                String(
                  entry.medalIcon ??
                    "🎮"
                ).slice(0, 8),
              medalName:
                String(
                  entry.medalName ??
                    "Competidor"
                ).slice(0, 48),
              playedAt:
                dateOrNull(
                  entry.playedAt
                ),
            }))
        : [];

    const diagnostics =
      value?.diagnostics &&
      Array.isArray(
        value.diagnostics.checks
      )
        ? {
            checkedAt:
              dateOrNull(
                value.diagnostics
                  .checkedAt
              ),
            durationMs:
              Math.max(
                0,
                Math.round(
                  Number(
                    value.diagnostics
                      .durationMs
                  ) || 0
                )
              ),
            success:
              Boolean(
                value.diagnostics
                  .success
              ),
            checks:
              value.diagnostics.checks
                .slice(0, 12)
                .map((entry) => ({
                  id:
                    String(
                      entry.id ?? "check"
                    ).slice(0, 40),
                  label:
                    String(
                      entry.label ??
                        "Verificação"
                    ).slice(0, 80),
                  state:
                    entry.state ===
                    "success"
                      ? "success"
                      : "error",
                  detail:
                    String(
                      entry.detail ?? ""
                    ).slice(0, 160),
                  durationMs:
                    Math.max(
                      0,
                      Math.round(
                        Number(
                          entry.durationMs
                        ) || 0
                      )
                    ),
                })),
          }
        : null;

    return {
      autoSyncEnabled:
        value?.autoSyncEnabled !==
        false,
      publicProfileEnabled:
        value?.publicProfileEnabled !==
        false,
      publicTagline:
        String(
          value?.publicTagline ?? ""
        )
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 80),
      lastPushAt:
        dateOrNull(
          value?.lastPushAt
        ),
      lastPullAt:
        dateOrNull(
          value?.lastPullAt
        ),
      lastCloudUpdatedAt:
        dateOrNull(
          value?.lastCloudUpdatedAt
        ),
      lastCloudUserId:
        typeof value?.lastCloudUserId ===
          "string"
          ? value.lastCloudUserId.slice(
              0,
              80
            )
          : null,
      leaderboardUpdatedAt:
        dateOrNull(
          value?.leaderboardUpdatedAt
        ),
      communityUpdatedAt:
        dateOrNull(
          value?.communityUpdatedAt
        ),
      globalFeedUpdatedAt:
        dateOrNull(
          value?.globalFeedUpdatedAt
        ),
      lastProfilePushAt:
        dateOrNull(
          value?.lastProfilePushAt
        ),
      lastMatchesPushAt:
        dateOrNull(
          value?.lastMatchesPushAt
        ),
      cachedLeaderboard:
        normalizeLeaderboard(
          value?.cachedLeaderboard
        ),
      cachedCommunityProfiles:
        normalizeProfiles(
          value?.cachedCommunityProfiles
        ),
      cachedGlobalFeed:
        normalizeFeed(
          value?.cachedGlobalFeed
        ),
      diagnostics,
      lastSyncError:
        typeof value?.lastSyncError ===
          "string"
          ? value.lastSyncError.slice(
              0,
              300
            )
          : null,
    };
  }

  normalizePlayerMeta(value) {
    const activityDates =
      Array.from(
        new Set(
          Array.isArray(
            value?.activityDates
          )
            ? value.activityDates
                .filter(
                  (entry) =>
                    typeof entry ===
                      "string" &&
                    /^\d{4}-\d{2}-\d{2}$/.test(
                      entry
                    )
                )
            : []
        )
      ).slice(0, 120);

    return {
      playerId:
        typeof value?.playerId ===
          "string" &&
        value.playerId.trim()
          ? value.playerId
              .trim()
              .slice(0, 28)
          : createPlayerId(),
      createdAt:
        typeof value?.createdAt ===
          "string" &&
        value.createdAt.trim()
          ? value.createdAt
          : new Date().toISOString(),
      lastBackupAt:
        typeof value?.lastBackupAt ===
          "string"
          ? value.lastBackupAt
          : null,
      lastActiveDate:
        typeof value?.lastActiveDate ===
          "string"
          ? value.lastActiveDate
          : null,
      currentStreak: Math.max(
        0,
        Math.round(
          Number(
            value?.currentStreak
          ) || 0
        )
      ),
      longestStreak: Math.max(
        0,
        Math.round(
          Number(
            value?.longestStreak
          ) || 0
        )
      ),
      totalActiveDays: Math.max(
        activityDates.length,
        Math.round(
          Number(
            value?.totalActiveDays
          ) || 0
        )
      ),
      activityDates,
    };
  }

  normalizeCompetitive(
    value,
    migrateFromLegacy = false
  ) {
    const inferredMatches =
      migrateFromLegacy
        ? Math.max(
            0,
            Math.round(
              Number(
                value?.matches
              ) || 0
            )
          )
        : 0;

    const rating = Math.max(
      0,
      Math.round(
        Number(value?.rating) ||
          INITIAL_RATING
      )
    );

    const ratingLedger = {};

    for (
      const [matchId, claimed]
      of Object.entries(
        value?.ratingLedger ?? {}
      )
    ) {
      if (claimed) {
        ratingLedger[
          String(matchId)
        ] = true;
      }
    }

    return {
      rating,
      peakRating: Math.max(
        rating,
        Math.round(
          Number(
            value?.peakRating
          ) || rating
        )
      ),
      matches: Math.max(
        inferredMatches,
        Math.round(
          Number(
            value?.matches
          ) || 0
        )
      ),
      wins: Math.max(
        0,
        Math.round(
          Number(
            value?.wins
          ) || 0
        )
      ),
      top3: Math.max(
        0,
        Math.round(
          Number(
            value?.top3
          ) || 0
        )
      ),
      totalRank: Math.max(
        0,
        Number(
          value?.totalRank
        ) || 0
      ),
      totalOpponents: Math.max(
        0,
        Number(
          value?.totalOpponents
        ) || 0
      ),
      totalRatingDelta:
        Math.round(
          Number(
            value?.totalRatingDelta
          ) || 0
        ),
      ratingLedger,
      leagueHistory:
        Array.isArray(
          value?.leagueHistory
        )
          ? value.leagueHistory
              .filter(
                (entry) =>
                  entry &&
                  typeof entry.to ===
                    "string"
              )
              .slice(0, 30)
          : [],
    };
  }

  normalizeMatchRecord(value) {
    const number = (
      input,
      minimum = 0
    ) =>
      Math.max(
        minimum,
        Number(input) || 0
      );

    return {
      id:
        typeof value?.id ===
          "string" &&
        value.id
          ? value.id.slice(
              0,
              80
            )
          : createPlayerId(),
      playedAt:
        typeof value?.playedAt ===
          "string"
          ? value.playedAt
          : new Date().toISOString(),
      nickname:
        sanitizeNickname(
          value?.nickname ??
            DEFAULT_SETTINGS.nickname
        ),
      skinId:
        isValidSkinId(
          value?.skinId
        )
          ? value.skinId
          : DEFAULT_SETTINGS.skinId,
      difficulty:
        sanitizeChoice(
          value?.difficulty,
          [
            "calm",
            "normal",
            "intense",
          ],
          "normal"
        ),
      score:
        number(value?.score),
      maximumMass:
        number(
          value?.maximumMass
        ),
      eliminations:
        Math.round(
          number(
            value?.eliminations
          )
        ),
      collected:
        Math.round(
          number(
            value?.collected
          )
        ),
      elapsedTime:
        number(
          value?.elapsedTime
        ),
      rank:
        Number.isFinite(
          Number(value?.rank)
        )
          ? Math.max(
              1,
              Math.round(
                Number(
                  value.rank
                )
              )
            )
          : null,
      totalCompetitors:
        Math.max(
          1,
          Math.round(
            number(
              value?.totalCompetitors,
              1
            )
          )
        ),
      coinsEarned:
        Math.round(
          number(
            value?.coinsEarned
          )
        ),
      xpEarned:
        Math.round(
          number(
            value?.xpEarned
          )
        ),
      seasonPointsEarned:
        Math.round(
          number(
            value?.seasonPointsEarned
          )
        ),
      ratingBefore:
        Math.round(
          number(
            value?.ratingBefore
          )
        ),
      ratingAfter:
        Math.round(
          number(
            value?.ratingAfter
          )
        ),
      ratingDelta:
        Math.round(
          Number(
            value?.ratingDelta
          ) || 0
        ),
      leagueId:
        getLeagueByRating(
          value?.ratingAfter
        ).id,
      profileLevel:
        Math.max(
          1,
          Math.round(
            number(
              value?.profileLevel,
              1
            )
          )
        ),
      titleId:
        PROFILE_TITLE_MAP[
          value?.titleId
        ]
          ? value.titleId
          : "novato",
      medalId:
        String(
          value?.medalId ||
            "participant"
        ).slice(0, 32),
      medalIcon:
        String(
          value?.medalIcon ||
            "🎮"
        ).slice(0, 8),
      medalName:
        String(
          value?.medalName ||
            "Competidor"
        ).slice(0, 48),
    };
  }

  normalizeMatchHistory(value) {
    if (
      !Array.isArray(value)
    ) {
      return [];
    }

    const seen =
      new Set();

    const output = [];

    for (const entry of value) {
      const normalized =
        this.normalizeMatchRecord(
          entry
        );

      if (
        seen.has(
          normalized.id
        )
      ) {
        continue;
      }

      seen.add(
        normalized.id
      );

      output.push(
        normalized
      );

      if (
        output.length >= 50
      ) {
        break;
      }
    }

    return output;
  }

  trimLedger(
    ledger,
    maximumEntries
  ) {
    const entries =
      Object.keys(ledger);

    if (
      entries.length <=
      maximumEntries
    ) {
      return;
    }

    for (
      const key of
      entries.slice(
        0,
        entries.length -
          maximumEntries
      )
    ) {
      delete ledger[key];
    }
  }

  write(save) {
    this.memoryFallback = clone(save);

    if (!this.storageAvailable) {
      return;
    }

    try {
      this.storage.setItem(
        STORAGE_KEY,
        JSON.stringify(save)
      );
    } catch {
      this.storageAvailable = false;
    }
  }
}
