import {
  DEFAULT_SKIN_ID,
  getStarterSkinIds,
} from "../skins/skin-catalog.js";

export const DEFAULT_SETTINGS = Object.freeze({
  nickname: "Jogador",
  controlMode: "follow",
  quality: "auto",
  difficulty: "normal",
  skinId: DEFAULT_SKIN_ID,

  muted: false,
  masterVolume: 0.82,
  sfxVolume: 0.88,
  musicVolume: 0.34,

  showLeaderboard: true,
  showMinimap: true,
  showSnakeNames: true,
  reducedEffects: false,
});

export const DEFAULT_STATS = Object.freeze({
  gamesPlayed: 0,
  deaths: 0,
  totalPlaySeconds: 0,
  totalCollected: 0,
  totalEliminations: 0,

  bestScore: 0,
  bestMass: 0,
  bestRank: null,
  bestEliminations: 0,
  longestSurvivalSeconds: 0,

  lastPlayedAt: null,
});

export const DEFAULT_ECONOMY = Object.freeze({
  coins: 180,
  lifetimeEarned: 180,
  lifetimeSpent: 0,
  ownedSkins: Object.freeze(getStarterSkinIds()),
  rewardLedger: Object.freeze({
    starterBalance: true,
  }),
  purchaseHistory: Object.freeze([]),
});

export const DEFAULT_PROGRESSION = Object.freeze({
  totalXp: 0,
  claimedLevelRewards: Object.freeze([]),
  unlockedTitles: Object.freeze(["novato"]),
  selectedTitleId: "novato",
  xpLedger: Object.freeze({}),
  recentXp: Object.freeze([]),
});


export const DEFAULT_PLAYER_META = Object.freeze({
  playerId: "",
  createdAt: "",
  lastBackupAt: null,
  lastActiveDate: null,
  currentStreak: 0,
  longestStreak: 0,
  totalActiveDays: 0,
  activityDates: Object.freeze([]),
  currentStage: 1,
  highestStage: 1,
  stagesCompleted: 0,
  lastStageCompletedAt: null,
});

export const DEFAULT_COMPETITIVE = Object.freeze({
  rating: 1000,
  peakRating: 1000,
  matches: 0,
  wins: 0,
  top3: 0,
  totalRank: 0,
  totalOpponents: 0,
  totalRatingDelta: 0,
  ratingLedger: Object.freeze({}),
  leagueHistory: Object.freeze([]),
});

export const DEFAULT_CLOUD = Object.freeze({
  autoSyncEnabled: true,
  publicProfileEnabled: true,
  publicTagline: "",
  lastPushAt: null,
  lastPullAt: null,
  lastCloudUpdatedAt: null,
  lastCloudUserId: null,
  leaderboardUpdatedAt: null,
  communityUpdatedAt: null,
  globalFeedUpdatedAt: null,
  lastProfilePushAt: null,
  lastMatchesPushAt: null,
  cachedLeaderboard: Object.freeze([]),
  cachedCommunityProfiles: Object.freeze([]),
  cachedGlobalFeed: Object.freeze([]),
  diagnostics: null,
  lastSyncError: null,
});

export function createDefaultSave(
  saveVersion = 1
) {
  return {
    version: saveVersion,
    settings: { ...DEFAULT_SETTINGS },
    stats: { ...DEFAULT_STATS },
    achievements: {
      unlocked: {},
    },
    economy: {
      coins: DEFAULT_ECONOMY.coins,
      lifetimeEarned:
        DEFAULT_ECONOMY.lifetimeEarned,
      lifetimeSpent:
        DEFAULT_ECONOMY.lifetimeSpent,
      ownedSkins: [
        ...DEFAULT_ECONOMY.ownedSkins,
      ],
      rewardLedger: {
        ...DEFAULT_ECONOMY.rewardLedger,
      },
      purchaseHistory: [],
    },
    dailyChallenges: {
      dateKey: "",
      items: [],
    },
    progression: {
      totalXp:
        DEFAULT_PROGRESSION.totalXp,
      claimedLevelRewards: [],
      unlockedTitles: ["novato"],
      selectedTitleId: "novato",
      xpLedger: {},
      recentXp: [],
    },
    season: {
      key: "",
      points: 0,
      claimedLevels: [],
      highestLevel: 1,
      pointsLedger: {},
      history: [],
    },
    weeklyEvent: {
      key: "",
      progress: {},
      completedObjectives: [],
      completionRewardClaimed: false,
      history: [],
    },
    playerMeta: {
      playerId: "",
      createdAt: "",
      lastBackupAt: null,
      lastActiveDate: null,
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      activityDates: [],
      currentStage: 1,
      highestStage: 1,
      stagesCompleted: 0,
      lastStageCompletedAt: null,
    },
    competitive: {
      rating: 1000,
      peakRating: 1000,
      matches: 0,
      wins: 0,
      top3: 0,
      totalRank: 0,
      totalOpponents: 0,
      totalRatingDelta: 0,
      ratingLedger: {},
      leagueHistory: [],
    },
    matchHistory: [],
    cloud: {
      autoSyncEnabled: true,
      publicProfileEnabled: true,
      publicTagline: "",
      lastPushAt: null,
      lastPullAt: null,
      lastCloudUpdatedAt: null,
      lastCloudUserId: null,
      leaderboardUpdatedAt: null,
      communityUpdatedAt: null,
      globalFeedUpdatedAt: null,
      lastProfilePushAt: null,
      lastMatchesPushAt: null,
      cachedLeaderboard: [],
      cachedCommunityProfiles: [],
      cachedGlobalFeed: [],
      diagnostics: null,
      lastSyncError: null,
    },
  };
}
