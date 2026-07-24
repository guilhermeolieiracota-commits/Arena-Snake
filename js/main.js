import { GAME_CONFIG } from "./config/game-config.js";
import { Game } from "./core/game.js";
import { GameState } from "./core/game-state.js";
import { AudioManager } from "./audio/audio-manager.js";
import { AchievementSystem } from "./achievements/achievement-system.js";
import { DailyChallengeSystem } from "./challenges/daily-challenge-system.js";
import { EconomySystem } from "./economy/economy-system.js";
import { ProgressionSystem } from "./progression/progression-system.js";
import { SeasonSystem } from "./seasons/season-system.js";
import { WeeklyEventSystem } from "./events/weekly-event-system.js";
import { CompetitiveSystem } from "./competitive/competitive-system.js";
import { MatchHistorySystem } from "./history/match-history-system.js";
import { StreakSystem } from "./activity/streak-system.js";
import { SaveTransferService } from "./backup/save-transfer-service.js";
import { getLeagueByRating } from "./competitive/league-config.js";
import {
  CLOUD_CONFIG,
  isCloudConfigured,
} from "./config/cloud-config.js";
import { SupabaseRestClient } from "./online/supabase-rest-client.js";
import { CloudSessionService } from "./online/cloud-session-service.js";
import { CloudSyncSystem } from "./online/cloud-sync-system.js";
import { CloudCommunitySystem } from "./online/cloud-community-system.js";
import { PwaManager } from "./pwa/pwa-manager.js";
import {
  DEFAULT_SETTINGS,
} from "./storage/default-save.js";
import { StorageService } from "./storage/storage-service.js";
import {
  PLAYER_SKINS,
  getSkinById,
} from "./skins/skin-catalog.js";
import { MinimapRenderer } from "./ui/minimap-renderer.js";
import { renderAchievementsGrid } from "./ui/achievements-view.js";
import { renderDailyChallenges } from "./ui/daily-challenges-view.js";
import { renderShopGrid } from "./ui/shop-view.js";
import { renderProfile } from "./ui/profile-view.js";
import { renderSeason } from "./ui/season-view.js";
import { renderWeeklyEvent } from "./ui/weekly-event-view.js";
import { renderCompetitive } from "./ui/competitive-view.js";
import { renderMatchHistory } from "./ui/history-view.js";
import { renderDataManagement } from "./ui/data-management-view.js";
import { renderOnlineScreen as renderOnlineView } from "./ui/online-view.js";
import {
  filterLeaderboard,
  renderCloudDiagnostics,
  renderCommunityProfile,
  renderGlobalFeed,
} from "./ui/community-view.js";
import {
  formatDuration,
  renderStatsGrid,
} from "./ui/stats-view.js";
import {
  sanitizeChoice,
  sanitizeNickname,
} from "./utils/validation.js";

const elements = {
  app: document.querySelector("#app"),
  loadingScreen: document.querySelector("#loadingScreen"),
  loadingMessage: document.querySelector("#loadingMessage"),
  canvas: document.querySelector("#gameCanvas"),

  menuScreen: document.querySelector("#menuScreen"),
  pauseScreen: document.querySelector("#pauseScreen"),
  settingsScreen: document.querySelector("#settingsScreen"),
  skinsScreen: document.querySelector("#skinsScreen"),
  statsScreen: document.querySelector("#statsScreen"),
  achievementsScreen: document.querySelector("#achievementsScreen"),
  dailyScreen: document.querySelector("#dailyScreen"),
  shopScreen: document.querySelector("#shopScreen"),
  profileScreen: document.querySelector("#profileScreen"),
  seasonScreen: document.querySelector("#seasonScreen"),
  weeklyScreen: document.querySelector("#weeklyScreen"),
  competitiveScreen: document.querySelector("#competitiveScreen"),
  historyScreen: document.querySelector("#historyScreen"),
  dataScreen: document.querySelector("#dataScreen"),
  onlineScreen: document.querySelector("#onlineScreen"),
  gameOverScreen: document.querySelector("#gameOverScreen"),

  startButton: document.querySelector("#startButton"),
  resumeButton: document.querySelector("#resumeButton"),
  pauseSettingsButton: document.querySelector("#pauseSettingsButton"),
  restartButton: document.querySelector("#restartButton"),
  menuButton: document.querySelector("#menuButton"),
  gameOverRestartButton:
    document.querySelector("#gameOverRestartButton"),
  gameOverStatsButton:
    document.querySelector("#gameOverStatsButton"),
  gameOverAchievementsButton:
    document.querySelector("#gameOverAchievementsButton"),
  gameOverDailyButton:
    document.querySelector("#gameOverDailyButton"),
  gameOverShopButton:
    document.querySelector("#gameOverShopButton"),
  gameOverProfileButton:
    document.querySelector("#gameOverProfileButton"),
  gameOverSeasonButton:
    document.querySelector("#gameOverSeasonButton"),
  gameOverShareButton: document.querySelector("#gameOverShareButton"),
  gameOverCompetitiveButton: document.querySelector("#gameOverCompetitiveButton"),
  gameOverHistoryButton: document.querySelector("#gameOverHistoryButton"),
  gameOverMenuButton:
    document.querySelector("#gameOverMenuButton"),
  pauseButton: document.querySelector("#pauseButton"),

  openCompetitiveButton: document.querySelector("#openCompetitiveButton"),
  openHistoryButton: document.querySelector("#openHistoryButton"),
  openDataButton: document.querySelector("#openDataButton"),
  openOnlineButton: document.querySelector("#openOnlineButton"),
  openOnlineSummaryButton: document.querySelector("#openOnlineSummaryButton"),
  openCompetitiveSummaryButton: document.querySelector("#openCompetitiveSummaryButton"),
  openProfileButton: document.querySelector("#openProfileButton"),
  openSeasonButton: document.querySelector("#openSeasonButton"),
  openWeeklyButton: document.querySelector("#openWeeklyButton"),
  openProfileSummaryButton: document.querySelector("#openProfileSummaryButton"),
  openSeasonSummaryButton: document.querySelector("#openSeasonSummaryButton"),
  openWeeklySummaryButton: document.querySelector("#openWeeklySummaryButton"),
  openSkinsButton: document.querySelector("#openSkinsButton"),
  openDailyButton: document.querySelector("#openDailyButton"),
  openShopButton: document.querySelector("#openShopButton"),
  openDailySummaryButton: document.querySelector("#openDailySummaryButton"),
  openStatsButton: document.querySelector("#openStatsButton"),
  openAchievementsButton: document.querySelector("#openAchievementsButton"),
  openSettingsButton: document.querySelector("#openSettingsButton"),
  menuFullscreenButton:
    document.querySelector("#menuFullscreenButton"),
  installAppButton:
    document.querySelector("#installAppButton"),

  nicknameInput: document.querySelector("#nicknameInput"),
  controlModeSelect:
    document.querySelector("#controlModeSelect"),
  qualitySelect: document.querySelector("#qualitySelect"),
  difficultySelect:
    document.querySelector("#difficultySelect"),
  selectedSkinMenuValue:
    document.querySelector("#selectedSkinMenuValue"),
  coinBalanceMenuValue:
    document.querySelector("#coinBalanceMenuValue"),
  dailySummaryValue:
    document.querySelector("#dailySummaryValue"),
  profileLevelMenuValue: document.querySelector("#profileLevelMenuValue"),
  profileTitleMenuValue: document.querySelector("#profileTitleMenuValue"),
  profileXpMenuValue: document.querySelector("#profileXpMenuValue"),
  seasonMenuValue: document.querySelector("#seasonMenuValue"),
  weeklyMenuValue: document.querySelector("#weeklyMenuValue"),
  competitiveLeagueIconMenu: document.querySelector("#competitiveLeagueIconMenu"),
  competitiveLeagueMenuValue: document.querySelector("#competitiveLeagueMenuValue"),
  competitiveRatingMenuValue: document.querySelector("#competitiveRatingMenuValue"),
  streakMenuValue: document.querySelector("#streakMenuValue"),
  onlineSummaryIcon: document.querySelector("#onlineSummaryIcon"),
  onlineSummaryLabel: document.querySelector("#onlineSummaryLabel"),
  onlineSummaryValue: document.querySelector("#onlineSummaryValue"),
  onlineSummaryState: document.querySelector("#onlineSummaryState"),

  settingsNicknameInput:
    document.querySelector("#settingsNicknameInput"),
  settingsControlModeSelect:
    document.querySelector("#settingsControlModeSelect"),
  settingsQualitySelect:
    document.querySelector("#settingsQualitySelect"),
  settingsDifficultySelect:
    document.querySelector("#settingsDifficultySelect"),
  settingsSkinButton:
    document.querySelector("#settingsSkinButton"),
  settingsSkinValue:
    document.querySelector("#settingsSkinValue"),

  masterVolumeInput:
    document.querySelector("#masterVolumeInput"),
  masterVolumeOutput:
    document.querySelector("#masterVolumeOutput"),
  sfxVolumeInput:
    document.querySelector("#sfxVolumeInput"),
  sfxVolumeOutput:
    document.querySelector("#sfxVolumeOutput"),
  musicVolumeInput:
    document.querySelector("#musicVolumeInput"),
  musicVolumeOutput:
    document.querySelector("#musicVolumeOutput"),

  mutedInput: document.querySelector("#mutedInput"),
  showLeaderboardInput:
    document.querySelector("#showLeaderboardInput"),
  showMinimapInput:
    document.querySelector("#showMinimapInput"),
  showSnakeNamesInput:
    document.querySelector("#showSnakeNamesInput"),
  reducedEffectsInput:
    document.querySelector("#reducedEffectsInput"),

  settingsSaveButton:
    document.querySelector("#settingsSaveButton"),
  settingsResetButton:
    document.querySelector("#settingsResetButton"),
  settingsBackButton:
    document.querySelector("#settingsBackButton"),

  skinPreview: document.querySelector("#skinPreview"),
  skinPreviewSnake:
    document.querySelector("#skinPreviewSnake"),
  skinPreviewName:
    document.querySelector("#skinPreviewName"),
  skinPreviewDescription:
    document.querySelector("#skinPreviewDescription"),
  skinGrid: document.querySelector("#skinGrid"),
  skinApplyButton:
    document.querySelector("#skinApplyButton"),
  skinBackButton:
    document.querySelector("#skinBackButton"),

  statsGrid: document.querySelector("#statsGrid"),
  lastPlayedValue:
    document.querySelector("#lastPlayedValue"),
  statsResetButton:
    document.querySelector("#statsResetButton"),
  statsBackButton:
    document.querySelector("#statsBackButton"),
  achievementsGrid:
    document.querySelector("#achievementsGrid"),
  achievementCountValue:
    document.querySelector("#achievementCountValue"),
  achievementsResetButton:
    document.querySelector("#achievementsResetButton"),
  achievementsBackButton:
    document.querySelector("#achievementsBackButton"),
  dailyDateValue:
    document.querySelector("#dailyDateValue"),
  dailyCompletedValue:
    document.querySelector("#dailyCompletedValue"),
  dailyCoinBalanceValue:
    document.querySelector("#dailyCoinBalanceValue"),
  dailyChallengesGrid:
    document.querySelector("#dailyChallengesGrid"),
  dailyShopButton:
    document.querySelector("#dailyShopButton"),
  dailyBackButton:
    document.querySelector("#dailyBackButton"),
  shopCoinBalanceValue:
    document.querySelector("#shopCoinBalanceValue"),
  ownedSkinsValue:
    document.querySelector("#ownedSkinsValue"),
  shopGrid:
    document.querySelector("#shopGrid"),
  shopDailyButton:
    document.querySelector("#shopDailyButton"),
  shopBackButton:
    document.querySelector("#shopBackButton"),



  onlineConfigurationState: document.querySelector("#onlineConfigurationState"),
  onlineNetworkState: document.querySelector("#onlineNetworkState"),
  onlineSyncState: document.querySelector("#onlineSyncState"),
  onlineSetupPanel: document.querySelector("#onlineSetupPanel"),
  onlineAuthPanel: document.querySelector("#onlineAuthPanel"),
  onlineRecoveryPanel: document.querySelector("#onlineRecoveryPanel"),
  onlineAccountPanel: document.querySelector("#onlineAccountPanel"),
  onlineLeaderboardPanel: document.querySelector("#onlineLeaderboardPanel"),
  onlineEmailInput: document.querySelector("#onlineEmailInput"),
  onlinePasswordInput: document.querySelector("#onlinePasswordInput"),
  onlineSignInButton: document.querySelector("#onlineSignInButton"),
  onlineSignUpButton: document.querySelector("#onlineSignUpButton"),
  onlineForgotPasswordButton: document.querySelector("#onlineForgotPasswordButton"),
  onlineResendConfirmationButton: document.querySelector("#onlineResendConfirmationButton"),
  onlineAuthMessage: document.querySelector("#onlineAuthMessage"),
  onlineNewPasswordInput: document.querySelector("#onlineNewPasswordInput"),
  onlineConfirmPasswordInput: document.querySelector("#onlineConfirmPasswordInput"),
  onlineUpdatePasswordButton: document.querySelector("#onlineUpdatePasswordButton"),
  onlineRecoveryCancelButton: document.querySelector("#onlineRecoveryCancelButton"),
  onlineRecoveryMessage: document.querySelector("#onlineRecoveryMessage"),
  onlineAccountEmailValue: document.querySelector("#onlineAccountEmailValue"),
  onlineSignOutButton: document.querySelector("#onlineSignOutButton"),
  onlineAutoSyncInput: document.querySelector("#onlineAutoSyncInput"),
  onlinePublicProfileInput: document.querySelector("#onlinePublicProfileInput"),
  onlineTaglineInput: document.querySelector("#onlineTaglineInput"),
  onlineLastPushValue: document.querySelector("#onlineLastPushValue"),
  onlineLastPullValue: document.querySelector("#onlineLastPullValue"),
  onlineLastProfilePushValue: document.querySelector("#onlineLastProfilePushValue"),
  onlineLastMatchesPushValue: document.querySelector("#onlineLastMatchesPushValue"),
  onlineUploadButton: document.querySelector("#onlineUploadButton"),
  onlineDownloadButton: document.querySelector("#onlineDownloadButton"),
  onlineChangePasswordButton: document.querySelector("#onlineChangePasswordButton"),
  onlineSavePublicProfileButton: document.querySelector("#onlineSavePublicProfileButton"),
  onlineSyncCommunityButton: document.querySelector("#onlineSyncCommunityButton"),
  onlineLeaderboardUpdatedValue: document.querySelector("#onlineLeaderboardUpdatedValue"),
  onlineRefreshLeaderboardButton: document.querySelector("#onlineRefreshLeaderboardButton"),
  onlineLeaderboardSearchInput: document.querySelector("#onlineLeaderboardSearchInput"),
  onlineLeaderboardLeagueSelect: document.querySelector("#onlineLeaderboardLeagueSelect"),
  onlineLeaderboardSortSelect: document.querySelector("#onlineLeaderboardSortSelect"),
  onlineLeaderboardCountValue: document.querySelector("#onlineLeaderboardCountValue"),
  globalLeaderboardList: document.querySelector("#globalLeaderboardList"),
  communityProfilePanel: document.querySelector("#communityProfilePanel"),
  communityProfileAvatar: document.querySelector("#communityProfileAvatar"),
  communityProfileName: document.querySelector("#communityProfileName"),
  communityProfileTagline: document.querySelector("#communityProfileTagline"),
  communityProfileId: document.querySelector("#communityProfileId"),
  communityProfileLeague: document.querySelector("#communityProfileLeague"),
  communityProfileTitle: document.querySelector("#communityProfileTitle"),
  communityProfileLevel: document.querySelector("#communityProfileLevel"),
  communityProfileGames: document.querySelector("#communityProfileGames"),
  communityProfileEliminations: document.querySelector("#communityProfileEliminations"),
  communityProfileBestScore: document.querySelector("#communityProfileBestScore"),
  communityProfileWins: document.querySelector("#communityProfileWins"),
  communityProfileStreak: document.querySelector("#communityProfileStreak"),
  communityProfileUpdated: document.querySelector("#communityProfileUpdated"),
  communityProfileMatches: document.querySelector("#communityProfileMatches"),
  communityProfileCloseButton: document.querySelector("#communityProfileCloseButton"),
  onlineGlobalFeedUpdatedValue: document.querySelector("#onlineGlobalFeedUpdatedValue"),
  onlineRefreshCommunityButton: document.querySelector("#onlineRefreshCommunityButton"),
  globalFeedList: document.querySelector("#globalFeedList"),
  onlineDiagnosticsUpdatedValue: document.querySelector("#onlineDiagnosticsUpdatedValue"),
  onlineRunDiagnosticsButton: document.querySelector("#onlineRunDiagnosticsButton"),
  cloudDiagnosticsList: document.querySelector("#cloudDiagnosticsList"),
  onlineBackButton: document.querySelector("#onlineBackButton"),

  competitiveLeagueIcon: document.querySelector("#competitiveLeagueIcon"),
  competitiveLeagueName: document.querySelector("#competitiveLeagueName"),
  competitiveRatingValue: document.querySelector("#competitiveRatingValue"),
  competitivePeakValue: document.querySelector("#competitivePeakValue"),
  competitiveProgressValue: document.querySelector("#competitiveProgressValue"),
  competitiveProgressFill: document.querySelector("#competitiveProgressFill"),
  competitiveMatchesValue: document.querySelector("#competitiveMatchesValue"),
  competitiveWinsValue: document.querySelector("#competitiveWinsValue"),
  competitiveTop3Value: document.querySelector("#competitiveTop3Value"),
  competitiveAverageRankValue: document.querySelector("#competitiveAverageRankValue"),
  competitiveBestRunsList: document.querySelector("#competitiveBestRunsList"),
  competitiveHistoryButton: document.querySelector("#competitiveHistoryButton"),
  competitiveBackButton: document.querySelector("#competitiveBackButton"),

  historyCountValue: document.querySelector("#historyCountValue"),
  matchHistoryList: document.querySelector("#matchHistoryList"),
  historyCompetitiveButton: document.querySelector("#historyCompetitiveButton"),
  historyClearButton: document.querySelector("#historyClearButton"),
  historyBackButton: document.querySelector("#historyBackButton"),

  dataPlayerIdValue: document.querySelector("#dataPlayerIdValue"),
  dataSaveVersionValue: document.querySelector("#dataSaveVersionValue"),
  dataBackupSizeValue: document.querySelector("#dataBackupSizeValue"),
  dataMatchesValue: document.querySelector("#dataMatchesValue"),
  dataLastBackupValue: document.querySelector("#dataLastBackupValue"),
  dataExportButton: document.querySelector("#dataExportButton"),
  dataImportButton: document.querySelector("#dataImportButton"),
  dataCopyIdButton: document.querySelector("#dataCopyIdButton"),
  dataResetAllButton: document.querySelector("#dataResetAllButton"),
  dataImportInput: document.querySelector("#dataImportInput"),
  dataBackButton: document.querySelector("#dataBackButton"),

  profileSkinPreview: document.querySelector("#profileSkinPreview"),
  profileNicknameValue: document.querySelector("#profileNicknameValue"),
  profileTitleValue: document.querySelector("#profileTitleValue"),
  profileLevelValue: document.querySelector("#profileLevelValue"),
  profileXpValue: document.querySelector("#profileXpValue"),
  profileXpFill: document.querySelector("#profileXpFill"),
  profileTitleSelect: document.querySelector("#profileTitleSelect"),
  profileCoinsValue: document.querySelector("#profileCoinsValue"),
  profileGamesValue: document.querySelector("#profileGamesValue"),
  profileBestScoreValue: document.querySelector("#profileBestScoreValue"),
  profileEliminationsValue: document.querySelector("#profileEliminationsValue"),
  profilePlayerIdValue: document.querySelector("#profilePlayerIdValue"),
  profileStreakValue: document.querySelector("#profileStreakValue"),
  profileHistoryList: document.querySelector("#profileHistoryList"),
  profileSeasonButton: document.querySelector("#profileSeasonButton"),
  profileBackButton: document.querySelector("#profileBackButton"),

  seasonTrack: document.querySelector("#seasonTrack"),
  seasonNameValue: document.querySelector("#seasonNameValue"),
  seasonDaysValue: document.querySelector("#seasonDaysValue"),
  seasonLevelValue: document.querySelector("#seasonLevelValue"),
  seasonPointsValue: document.querySelector("#seasonPointsValue"),
  seasonProgressFill: document.querySelector("#seasonProgressFill"),
  seasonRewardsGrid: document.querySelector("#seasonRewardsGrid"),
  seasonWeeklyButton: document.querySelector("#seasonWeeklyButton"),
  seasonBackButton: document.querySelector("#seasonBackButton"),

  weeklyEventNameValue: document.querySelector("#weeklyEventNameValue"),
  weeklyEventDescription: document.querySelector("#weeklyEventDescription"),
  weeklyDaysValue: document.querySelector("#weeklyDaysValue"),
  weeklyCompletedValue: document.querySelector("#weeklyCompletedValue"),
  weeklyObjectivesGrid: document.querySelector("#weeklyObjectivesGrid"),
  weeklyBonusCard: document.querySelector("#weeklyBonusCard"),
  weeklyBonusValue: document.querySelector("#weeklyBonusValue"),
  weeklyBonusStatus: document.querySelector("#weeklyBonusStatus"),
  weeklySeasonButton: document.querySelector("#weeklySeasonButton"),
  weeklyBackButton: document.querySelector("#weeklyBackButton"),

  gameHud: document.querySelector("#gameHud"),
  centerHint: document.querySelector("#centerHint"),
  joystick: document.querySelector("#joystick"),
  joystickKnob: document.querySelector("#joystickKnob"),
  boostButton: document.querySelector("#boostButton"),

  playerNameValue:
    document.querySelector("#playerNameValue"),
  scoreValue: document.querySelector("#scoreValue"),
  massValue: document.querySelector("#massValue"),
  rankValue: document.querySelector("#rankValue"),
  eliminationsValue:
    document.querySelector("#eliminationsValue"),
  coinBalanceHudValue:
    document.querySelector("#coinBalanceHudValue"),
  profileTitleHudValue: document.querySelector("#profileTitleHudValue"),
  profileLevelHudValue: document.querySelector("#profileLevelHudValue"),
  leagueHudNameValue: document.querySelector("#leagueHudNameValue"),
  ratingHudValue: document.querySelector("#ratingHudValue"),

  protectionCard:
    document.querySelector("#protectionCard"),
  protectionValue:
    document.querySelector("#protectionValue"),

  boostCard: document.querySelector("#boostCard"),
  boostValue: document.querySelector("#boostValue"),
  boostFill: document.querySelector("#boostFill"),

  audioToggleButton:
    document.querySelector("#audioToggleButton"),
  settingsHudButton:
    document.querySelector("#settingsHudButton"),
  fullscreenHudButton:
    document.querySelector("#fullscreenHudButton"),

  leaderboard: document.querySelector("#leaderboard"),
  leaderboardList:
    document.querySelector("#leaderboardList"),
  rankingTotalValue:
    document.querySelector("#rankingTotalValue"),

  minimap: document.querySelector("#minimap"),
  minimapCanvas:
    document.querySelector("#minimapCanvas"),

  killFeed: document.querySelector("#killFeed"),
  networkBanner: document.querySelector("#networkBanner"),
  installBanner: document.querySelector("#installBanner"),
  installNowButton: document.querySelector("#installNowButton"),
  installDismissButton: document.querySelector("#installDismissButton"),
  updateBanner: document.querySelector("#updateBanner"),
  updateNowButton: document.querySelector("#updateNowButton"),
  updateDismissButton: document.querySelector("#updateDismissButton"),
  achievementToast: document.querySelector("#achievementToast"),
  achievementToastIcon: document.querySelector("#achievementToastIcon"),
  achievementToastName: document.querySelector("#achievementToastName"),

  gameOverReason:
    document.querySelector("#gameOverReason"),
  finalScoreValue:
    document.querySelector("#finalScoreValue"),
  finalMassValue:
    document.querySelector("#finalMassValue"),
  finalEliminationsValue:
    document.querySelector("#finalEliminationsValue"),
  finalRankValue:
    document.querySelector("#finalRankValue"),
  finalTimeValue:
    document.querySelector("#finalTimeValue"),
  finalCollectedValue:
    document.querySelector("#finalCollectedValue"),
  finalCoinsEarnedValue:
    document.querySelector("#finalCoinsEarnedValue"),
  finalXpEarnedValue: document.querySelector("#finalXpEarnedValue"),
  finalSeasonEarnedValue: document.querySelector("#finalSeasonEarnedValue"),
  finalRatingDeltaValue: document.querySelector("#finalRatingDeltaValue"),
  finalMedalValue: document.querySelector("#finalMedalValue"),
  rewardToast:
    document.querySelector("#rewardToast"),
  rewardToastIcon:
    document.querySelector("#rewardToastIcon"),
  rewardToastLabel:
    document.querySelector("#rewardToastLabel"),
  rewardToastName:
    document.querySelector("#rewardToastName"),

  debugHud: document.querySelector("#debugHud"),
  stateValue: document.querySelector("#stateValue"),
  fpsValue: document.querySelector("#fpsValue"),
  positionValue: document.querySelector("#positionValue"),
  zoomValue: document.querySelector("#zoomValue"),
  speedDebugValue:
    document.querySelector("#speedDebugValue"),
  boostDebugValue:
    document.querySelector("#boostDebugValue"),
  inputValue: document.querySelector("#inputValue"),
  qualityValue: document.querySelector("#qualityValue"),
  botsDebugValue:
    document.querySelector("#botsDebugValue"),
  foodValue: document.querySelector("#foodValue"),
  remainsValue: document.querySelector("#remainsValue"),
  collisionBodiesValue:
    document.querySelector("#collisionBodiesValue"),
  collisionCellsValue:
    document.querySelector("#collisionCellsValue"),
  deathsValue: document.querySelector("#deathsValue"),
  effectsValue: document.querySelector("#effectsValue"),
  coinsDebugValue: document.querySelector("#coinsDebugValue"),
  dailyDebugValue: document.querySelector("#dailyDebugValue"),
  levelDebugValue: document.querySelector("#levelDebugValue"),
  xpDebugValue: document.querySelector("#xpDebugValue"),
  seasonDebugValue: document.querySelector("#seasonDebugValue"),
  weeklyDebugValue: document.querySelector("#weeklyDebugValue"),
  ratingDebugValue: document.querySelector("#ratingDebugValue"),
  historyDebugValue: document.querySelector("#historyDebugValue"),
  streakDebugValue: document.querySelector("#streakDebugValue"),
  cloudDebugValue: document.querySelector("#cloudDebugValue"),
};

for (
  const [name, element] of
  Object.entries(elements)
) {
  if (!element) {
    throw new Error(
      `Elemento obrigatório não encontrado: ${name}`
    );
  }
}

document.title =
  `${GAME_CONFIG.name} — Fase 13 Final`;

const storageService =
  new StorageService();

let saveData = storageService.load();
let currentSettings = {
  ...saveData.settings,
};
let currentStats = {
  ...saveData.stats,
};
let currentEconomy = {
  ...saveData.economy,
};

const audioManager =
  new AudioManager();

audioManager.applySettings(
  currentSettings
);

const minimapRenderer =
  new MinimapRenderer(
    elements.minimapCanvas
  );

let game;
let achievementSystem;
let dailyChallengeSystem;
let economySystem;
let progressionSystem;
let seasonSystem;
let weeklyEventSystem;
let competitiveSystem;
let matchHistorySystem;
let streakSystem;
let saveTransferService;
let cloudClient;
let cloudSessionService;
let cloudSyncSystem;
let cloudCommunitySystem;
let pwaManager;
let debugVisible = false;
let loadingFinished = false;
let achievementToastTimer = null;
let rewardToastTimer = null;
let toastQueueTimer = null;
let toastQueueActive = false;
const toastQueue = [];
let lastAchievementEvaluationTime = -Infinity;
let liveSessionSnapshot = {};
let sessionRewardStart = {
  coins: currentEconomy.coins ?? 0,
  xp: 0,
  seasonPoints: 0,
};
let selectedSkinDraftId =
  currentSettings.skinId;
let lastCompletedMatch = null;
let onlineLeaderboard = [];
let onlineCommunityProfiles = [];
let onlineGlobalFeed = [];
let selectedCommunityProfile = null;
let selectedCommunityMatches = [];
let onlineRecoveryMode = false;
let leaderboardFilters = {
  search: "",
  league: "all",
  sort: "rating",
};
let cloudStatusMessage = "Modo local";

const overlayStack = [];
let overlayRootState = null;

const screenMap = new Map([
  ["settings", elements.settingsScreen],
  ["skins", elements.skinsScreen],
  ["stats", elements.statsScreen],
  ["achievements", elements.achievementsScreen],
  ["daily", elements.dailyScreen],
  ["shop", elements.shopScreen],
  ["profile", elements.profileScreen],
  ["season", elements.seasonScreen],
  ["weekly", elements.weeklyScreen],
  ["competitive", elements.competitiveScreen],
  ["history", elements.historyScreen],
  ["data", elements.dataScreen],
  ["online", elements.onlineScreen],
]);

const baseScreens = [
  elements.menuScreen,
  elements.pauseScreen,
  elements.gameOverScreen,
];

const numberFormatter =
  new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  });

const formatNumber = (value) =>
  numberFormatter.format(
    Math.max(0, Number(value) || 0)
  );

const formatTime = (seconds) => {
  const safeSeconds = Math.max(
    0,
    Math.floor(Number(seconds) || 0)
  );

  const minutes = Math.floor(
    safeSeconds / 60
  );

  const remainingSeconds =
    safeSeconds % 60;

  return `${minutes}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

const setScreenVisibility = (
  element,
  visible
) => {
  element.classList.toggle(
    "screen--visible",
    visible
  );

  element.setAttribute(
    "aria-hidden",
    String(!visible)
  );
};

const hideAllScreens = () => {
  for (const screen of [
    ...baseScreens,
    ...screenMap.values(),
  ]) {
    setScreenVisibility(
      screen,
      false
    );
  }
};

const showBaseScreenForState = (
  state
) => {
  if (overlayStack.length > 0) {
    return;
  }

  hideAllScreens();

  if (state === GameState.MENU) {
    setScreenVisibility(
      elements.menuScreen,
      true
    );
  } else if (
    state === GameState.PAUSED
  ) {
    setScreenVisibility(
      elements.pauseScreen,
      true
    );
  } else if (
    state === GameState.GAME_OVER
  ) {
    setScreenVisibility(
      elements.gameOverScreen,
      true
    );
  }
};

const setGameInterfaceVisibility = (
  visible
) => {
  elements.gameHud.classList.toggle(
    "game-hud--visible",
    visible
  );

  elements.gameHud.setAttribute(
    "aria-hidden",
    String(!visible)
  );

  elements.leaderboard.classList.toggle(
    "leaderboard--visible",
    visible &&
      currentSettings.showLeaderboard
  );

  elements.minimap.classList.toggle(
    "minimap--visible",
    visible &&
      currentSettings.showMinimap
  );

  elements.killFeed.hidden = !visible;

  document.body.classList.toggle(
    "gameplay-active",
    visible
  );
};

const restoreOverlayRoot = () => {
  const rootState = overlayRootState;
  overlayRootState = null;

  if (
    rootState === GameState.PLAYING
  ) {
    game.resume();
    return;
  }

  showBaseScreenForState(
    rootState ?? game.state
  );

  setGameInterfaceVisibility(
    rootState === GameState.PLAYING
  );
};

const openOverlay = (name) => {
  const screen = screenMap.get(name);

  if (!screen) {
    return;
  }

  if (overlayStack.length === 0) {
    overlayRootState = game.state;

    if (
      game.state === GameState.PLAYING
    ) {
      game.pause();
    }
  }

  hideAllScreens();
  setGameInterfaceVisibility(false);

  overlayStack.push(name);
  setScreenVisibility(screen, true);
};

const closeOverlay = () => {
  if (overlayStack.length === 0) {
    return;
  }

  const currentName =
    overlayStack.pop();

  if (currentName === "settings") {
    audioManager.applySettings(
      currentSettings
    );

    populateSettingsControls(
      currentSettings
    );
  }

  const currentScreen =
    screenMap.get(currentName);

  if (currentScreen) {
    setScreenVisibility(
      currentScreen,
      false
    );
  }

  const previousName =
    overlayStack.at(-1);

  if (previousName) {
    const previousScreen =
      screenMap.get(previousName);

    if (previousScreen) {
      setScreenVisibility(
        previousScreen,
        true
      );
    }

    return;
  }

  restoreOverlayRoot();
};

const showCenterHint = () => {
  elements.centerHint.textContent =
    "Proteção inicial ativa: use o radar e ganhe espaço";

  elements.centerHint.classList.remove(
    "center-hint--visible"
  );

  void elements.centerHint.offsetWidth;

  elements.centerHint.classList.add(
    "center-hint--visible"
  );
};

const handleStateChange = (state) => {
  elements.stateValue.textContent = state;

  if (overlayStack.length === 0) {
    showBaseScreenForState(state);
  }

  const playing =
    state === GameState.PLAYING &&
    overlayStack.length === 0;

  setGameInterfaceVisibility(playing);

  if (playing) {
    showCenterHint();
  }
};

const updateBoostHud = ({
  active,
  available,
  intensity,
}) => {
  elements.boostCard.classList.remove(
    "hud-card--boost-active",
    "hud-card--boost-blocked"
  );

  if (active) {
    elements.boostValue.textContent =
      "Ativo";

    elements.boostCard.classList.add(
      "hud-card--boost-active"
    );
  } else if (!available) {
    elements.boostValue.textContent =
      "Sem massa";

    elements.boostCard.classList.add(
      "hud-card--boost-blocked"
    );
  } else {
    elements.boostValue.textContent =
      "Pronto";
  }

  elements.boostFill.style.width =
    `${Math.round(intensity * 100)}%`;
};

const updateProtectionHud = (
  remaining
) => {
  const active = remaining > 0;

  elements.protectionCard.classList.toggle(
    "hud-card--protection-hidden",
    !active
  );

  elements.protectionValue.textContent =
    active
      ? `${remaining.toFixed(1)}s`
      : "Finalizada";
};

const renderLeaderboard = ({
  entries,
  playerRank,
  total,
}) => {
  elements.leaderboardList.replaceChildren();

  for (const entry of entries) {
    const item =
      document.createElement("li");

    item.className =
      "leaderboard__item";

    if (entry.isPlayer) {
      item.classList.add(
        "leaderboard__item--player"
      );
    }

    const dot =
      document.createElement("span");

    dot.className =
      "leaderboard__dot";

    dot.style.setProperty(
      "--ranking-color",
      entry.color
    );

    const name =
      document.createElement("span");

    name.className =
      "leaderboard__name";

    name.textContent = entry.name;

    const mass =
      document.createElement("strong");

    mass.className =
      "leaderboard__mass";

    mass.textContent =
      String(Math.round(entry.mass));

    item.append(dot, name, mass);
    elements.leaderboardList.append(item);
  }

  elements.rankingTotalValue.textContent =
    `${total} ${total === 1 ? "cobra" : "cobras"}`;

  elements.rankValue.textContent =
    playerRank
      ? `#${playerRank}/${total}`
      : "—";
};

const renderKillFeed = (feed) => {
  elements.killFeed.replaceChildren();

  for (const entry of feed) {
    const item =
      document.createElement("div");

    item.className =
      "kill-feed__item";

    item.style.setProperty(
      "--feed-color",
      entry.color
    );

    item.textContent = entry.text;
    elements.killFeed.append(item);
  }
};

const getGameOverReason = ({
  reason,
  killerName,
}) => {
  switch (reason) {
    case "BODY":
      return killerName
        ? `Você bateu no corpo de ${killerName}.`
        : "Você bateu no corpo de outra cobra.";

    case "HEAD_HEAD":
      return killerName
        ? `${killerName} venceu o choque de cabeças.`
        : "O choque de cabeças eliminou as duas cobras.";

    case "BORDER":
      return "Você atingiu a borda da arena.";

    default:
      return "Sua cobra foi eliminada.";
  }
};

const renderGameOver = (result) => {
  elements.gameOverReason.textContent =
    getGameOverReason(result);

  elements.finalScoreValue.textContent =
    formatNumber(result.score);

  elements.finalMassValue.textContent =
    formatNumber(result.maximumMass);

  elements.finalEliminationsValue.textContent =
    String(result.eliminations);

  elements.finalRankValue.textContent =
    result.rank
      ? `#${result.rank}/${result.totalCompetitors}`
      : "—";

  elements.finalTimeValue.textContent =
    formatTime(result.elapsedTime);

  elements.finalCollectedValue.textContent =
    formatNumber(result.collected);

  elements.finalCoinsEarnedValue.textContent =
    formatNumber(result.coinsEarned ?? 0);

  elements.finalXpEarnedValue.textContent =
    formatNumber(result.xpEarned ?? 0);

  elements.finalSeasonEarnedValue.textContent =
    formatNumber(result.seasonPointsEarned ?? 0);

  const ratingDelta =
    Number(result.ratingDelta) || 0;

  elements.finalRatingDeltaValue.textContent =
    `${ratingDelta >= 0 ? "+" : ""}${ratingDelta}`;

  elements.finalMedalValue.textContent =
    `${result.medalIcon ?? "🎮"} ${result.medalName ?? "Competidor"}`;
};

const updateAudioButton = () => {
  elements.audioToggleButton.textContent =
    currentSettings.muted
      ? "🔇"
      : "🔊";

  elements.audioToggleButton.setAttribute(
    "aria-label",
    currentSettings.muted
      ? "Ativar áudio"
      : "Silenciar áudio"
  );
};

const updateRangeOutput = (
  input,
  output
) => {
  output.value =
    `${Math.round(Number(input.value))}%`;
};

const populateSettingsControls = (
  settings
) => {
  elements.settingsNicknameInput.value =
    settings.nickname;

  elements.settingsControlModeSelect.value =
    settings.controlMode;

  elements.settingsQualitySelect.value =
    settings.quality;

  elements.settingsDifficultySelect.value =
    settings.difficulty;

  elements.masterVolumeInput.value =
    String(
      Math.round(
        settings.masterVolume * 100
      )
    );

  elements.sfxVolumeInput.value =
    String(
      Math.round(
        settings.sfxVolume * 100
      )
    );

  elements.musicVolumeInput.value =
    String(
      Math.round(
        settings.musicVolume * 100
      )
    );

  elements.mutedInput.checked =
    settings.muted;

  elements.showLeaderboardInput.checked =
    settings.showLeaderboard;

  elements.showMinimapInput.checked =
    settings.showMinimap;

  elements.showSnakeNamesInput.checked =
    settings.showSnakeNames;

  elements.reducedEffectsInput.checked =
    settings.reducedEffects;

  selectedSkinDraftId =
    settings.skinId;

  const skin = getSkinById(
    selectedSkinDraftId
  );

  elements.settingsSkinValue.textContent =
    skin.name;

  updateRangeOutput(
    elements.masterVolumeInput,
    elements.masterVolumeOutput
  );

  updateRangeOutput(
    elements.sfxVolumeInput,
    elements.sfxVolumeOutput
  );

  updateRangeOutput(
    elements.musicVolumeInput,
    elements.musicVolumeOutput
  );
};

const readSettingsControls = () => ({
  nickname: sanitizeNickname(
    elements.settingsNicknameInput.value
  ),
  controlMode: sanitizeChoice(
    elements.settingsControlModeSelect.value,
    ["follow", "joystick"],
    "follow"
  ),
  quality: sanitizeChoice(
    elements.settingsQualitySelect.value,
    ["auto", "low", "medium", "high"],
    "auto"
  ),
  difficulty: sanitizeChoice(
    elements.settingsDifficultySelect.value,
    ["calm", "normal", "intense"],
    "normal"
  ),
  skinId: selectedSkinDraftId,

  muted:
    elements.mutedInput.checked,
  masterVolume:
    Number(elements.masterVolumeInput.value) /
    100,
  sfxVolume:
    Number(elements.sfxVolumeInput.value) /
    100,
  musicVolume:
    Number(elements.musicVolumeInput.value) /
    100,

  showLeaderboard:
    elements.showLeaderboardInput.checked,
  showMinimap:
    elements.showMinimapInput.checked,
  showSnakeNames:
    elements.showSnakeNamesInput.checked,
  reducedEffects:
    elements.reducedEffectsInput.checked,
});

const syncMenuControls = (
  settings
) => {
  elements.nicknameInput.value =
    settings.nickname;

  elements.controlModeSelect.value =
    settings.controlMode;

  elements.qualitySelect.value =
    settings.quality;

  elements.difficultySelect.value =
    settings.difficulty;

  const skin = getSkinById(
    settings.skinId
  );

  elements.selectedSkinMenuValue.textContent =
    skin.name;

  elements.playerNameValue.textContent =
    settings.nickname;
};

const applySettings = (
  settings,
  { persist = true } = {}
) => {
  currentSettings = persist
    ? storageService.saveSettings(
        settings
      )
    : { ...settings };

  syncMenuControls(
    currentSettings
  );

  populateSettingsControls(
    currentSettings
  );

  game.configure({
    controlMode:
      currentSettings.controlMode,
    quality:
      currentSettings.quality,
    difficulty:
      currentSettings.difficulty,
    skinId:
      currentSettings.skinId,
    showSnakeNames:
      currentSettings.showSnakeNames,
    reducedEffects:
      currentSettings.reducedEffects,
  });

  game.setNickname(
    currentSettings.nickname
  );

  audioManager.applySettings(
    currentSettings
  );

  minimapRenderer.setVisible(
    currentSettings.showMinimap
  );

  updateAudioButton();

  setGameInterfaceVisibility(
    game.state === GameState.PLAYING &&
    overlayStack.length === 0
  );
};

const renderSkinPreview = (
  skinId
) => {
  const skin = getSkinById(skinId);

  elements.skinPreviewName.textContent =
    skin.name;

  elements.skinPreviewDescription.textContent =
    skin.description;

  elements.skinPreviewSnake.style.setProperty(
    "--skin-primary",
    skin.primaryColor
  );

  elements.skinPreviewSnake.style.setProperty(
    "--skin-secondary",
    skin.secondaryColor
  );

  elements.settingsSkinValue.textContent =
    skin.name;
};

const updateSkinCardSelection = () => {
  for (
    const card of
    elements.skinGrid.querySelectorAll(
      ".skin-card"
    )
  ) {
    card.classList.toggle(
      "skin-card--selected",
      card.dataset.skinId ===
        selectedSkinDraftId
    );
  }
};

const buildSkinGrid = () => {
  elements.skinGrid.replaceChildren();

  const ownedSkinIds =
    new Set(
      economySystem?.getOwnedSkinIds() ??
      currentEconomy.ownedSkins ??
      []
    );

  const ownedSkins =
    PLAYER_SKINS.filter(
      (skin) => ownedSkinIds.has(skin.id)
    );

  for (const skin of ownedSkins) {
    const card =
      document.createElement("button");

    card.type = "button";
    card.className = "skin-card";
    card.dataset.skinId = skin.id;

    const colors =
      document.createElement("span");

    colors.className =
      "skin-card__colors";

    for (const color of [
      skin.primaryColor,
      skin.secondaryColor,
    ]) {
      const swatch =
        document.createElement("span");

      swatch.className =
        "skin-card__color";

      swatch.style.setProperty(
        "--skin-color",
        color
      );

      colors.append(swatch);
    }

    const name =
      document.createElement("strong");

    name.textContent = skin.name;

    const description =
      document.createElement("small");

    description.textContent =
      `${skin.rarity} • ${skin.description}`;

    card.append(
      colors,
      name,
      description
    );

    card.addEventListener(
      "click",
      () => {
        selectedSkinDraftId =
          skin.id;

        renderSkinPreview(
          selectedSkinDraftId
        );

        updateSkinCardSelection();
      }
    );

    elements.skinGrid.append(card);
  }

  if (
    !ownedSkinIds.has(
      selectedSkinDraftId
    )
  ) {
    selectedSkinDraftId =
      currentSettings.skinId;
  }

  renderSkinPreview(
    selectedSkinDraftId
  );

  updateSkinCardSelection();
};

const renderStats = () => {
  renderStatsGrid(
    elements.statsGrid,
    currentStats,
    numberFormatter
  );

  if (!currentStats.lastPlayedAt) {
    elements.lastPlayedValue.textContent =
      "Nenhuma partida concluída ainda.";
    return;
  }

  const date = new Date(
    currentStats.lastPlayedAt
  );

  elements.lastPlayedValue.textContent =
    `Última partida: ${date.toLocaleString("pt-BR")}`;
};


const updateCoinBalance = (
  balance = economySystem?.getBalance() ??
    currentEconomy.coins ??
    0
) => {
  const value = String(
    Math.max(0, Math.round(balance))
  );

  currentEconomy = {
    ...(economySystem?.state ??
      currentEconomy),
    coins: Math.max(
      0,
      Math.round(balance)
    ),
  };

  elements.coinBalanceMenuValue.textContent =
    value;
  elements.coinBalanceHudValue.textContent =
    value;
  elements.dailyCoinBalanceValue.textContent =
    value;
  elements.shopCoinBalanceValue.textContent =
    value;
  elements.coinsDebugValue.textContent =
    value;
};

const isZeroValueReward = (name) =>
  /^\+?0(?:[.,]0+)?\s*(?:moedas?|xp|pontos?)$/i.test(
    String(name ?? "").trim()
  );

const processToastQueue = () => {
  if (
    toastQueueActive ||
    toastQueue.length === 0
  ) {
    return;
  }

  toastQueueActive = true;
  const toast = toastQueue.shift();

  window.clearTimeout(toastQueueTimer);
  elements.rewardToast.hidden = true;
  elements.achievementToast.hidden = true;

  if (toast.type === "achievement") {
    elements.achievementToastIcon.textContent =
      toast.icon;
    elements.achievementToastName.textContent =
      toast.name;
    elements.achievementToast.hidden = false;
  } else {
    elements.rewardToastIcon.textContent =
      toast.icon;
    elements.rewardToastLabel.textContent =
      toast.label;
    elements.rewardToastName.textContent =
      toast.name;
    elements.rewardToast.hidden = false;
  }

  audioManager.playEvent(
    toast.sound,
    toast.volume ?? 1.05
  );

  const mobile = window.matchMedia(
    "(max-width: 720px)"
  ).matches;

  toastQueueTimer = window.setTimeout(
    () => {
      elements.rewardToast.hidden = true;
      elements.achievementToast.hidden = true;
      toastQueueActive = false;
      processToastQueue();
    },
    mobile ? 2300 : toast.duration ?? 3200
  );
};

const enqueueToast = (toast) => {
  toastQueue.push(toast);
  processToastQueue();
};

const showRewardToast = ({
  icon = "🪙",
  label = "Recompensa recebida",
  name,
  sound = "coins",
}) => {
  if (
    !name ||
    isZeroValueReward(name)
  ) {
    return;
  }

  enqueueToast({
    type: "reward",
    icon,
    label,
    name,
    sound,
    duration: 3200,
  });
};

const getDailyContext = (
  session = liveSessionSnapshot
) => ({
  session,
  stats: currentStats,
});

const renderDaily = () => {
  const entries =
    dailyChallengeSystem?.getEntries(
      getDailyContext()
    ) ?? [];

  renderDailyChallenges(
    elements.dailyChallengesGrid,
    entries
  );

  const completed =
    entries.filter(
      (entry) => entry.completed
    ).length;

  const dateKey =
    dailyChallengeSystem?.getDateKey() ??
    "—";

  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(
      dateKey
    )
      ? new Date(
          `${dateKey}T12:00:00`
        )
      : null;

  elements.dailyDateValue.textContent =
    date
      ? date.toLocaleDateString(
          "pt-BR",
          {
            day: "2-digit",
            month: "long",
          }
        )
      : "—";

  elements.dailyCompletedValue.textContent =
    `${completed}/${entries.length || 3}`;

  elements.dailySummaryValue.textContent =
    `${completed}/${entries.length || 3}`;

  elements.dailyDebugValue.textContent =
    `${completed}/${entries.length || 3}`;
};

const selectOwnedSkin = (
  skin,
  { notify = true } = {}
) => {
  if (!economySystem.ownsSkin(skin.id)) {
    return;
  }

  selectedSkinDraftId = skin.id;

  applySettings({
    ...currentSettings,
    skinId: skin.id,
  });

  renderShop();
  buildSkinGrid();

  if (notify) {
    showRewardToast({
      icon: "🎨",
      label: "Skin equipada",
      name: skin.name,
      sound: "ui",
    });
  }
};

const buyShopSkin = (
  skin
) => {
  const result =
    economySystem.buySkin(skin.id);

  if (!result.success) {
    showRewardToast({
      icon: "🪙",
      label: "Compra não realizada",
      name: "Moedas insuficientes",
      sound: "ui",
    });
    return;
  }

  if (result.reason === "purchased") {
    showRewardToast({
      icon: "🛍️",
      label: "Skin desbloqueada",
      name: skin.name,
      sound: "purchase",
    });
  }

  selectOwnedSkin(
    skin,
    { notify: result.reason !== "purchased" }
  );

  renderShop();
  buildSkinGrid();
};

const renderShop = () => {
  const ownedSkinIds =
    economySystem?.getOwnedSkinIds() ??
    [];

  elements.ownedSkinsValue.textContent =
    `${ownedSkinIds.length}/${PLAYER_SKINS.length}`;

  renderShopGrid({
    container:
      elements.shopGrid,
    skins: PLAYER_SKINS,
    ownedSkinIds,
    selectedSkinId:
      currentSettings.skinId,
    balance:
      economySystem?.getBalance() ?? 0,
    onSelect:
      selectOwnedSkin,
    onBuy:
      buyShopSkin,
  });
};

const showDailyCompleteToast = (
  challenge
) => {
  progressionSystem.addXp(
    55,
    `daily-xp:${dailyChallengeSystem.getDateKey()}:${challenge.id}`,
    { unique: true }
  );

  updateCoinBalance();
  updateProgressionUi();
  renderDaily();
  renderShop();
  renderProfileScreen();

  showRewardToast({
    icon: challenge.icon,
    label: "Missão concluída",
    name:
      `${challenge.title} • +${challenge.reward} moedas`,
    sound: "challenge",
  });
};

const openDaily = () => {
  dailyChallengeSystem?.ensureToday();
  renderDaily();
  openOverlay("daily");
};

const openShop = () => {
  renderShop();
  openOverlay("shop");
};

const updateProgressionUi = (
  snapshot =
    progressionSystem?.getSnapshot()
) => {
  if (!snapshot) {
    return;
  }

  elements.profileLevelMenuValue.textContent =
    String(snapshot.level);

  elements.profileTitleMenuValue.textContent =
    snapshot.selectedTitle.name;

  elements.profileXpMenuValue.textContent =
    snapshot.level >= snapshot.maxLevel
      ? "Nível máximo"
      : `${Math.round(snapshot.currentLevelXp)}/${snapshot.nextLevelXp} XP`;

  elements.profileLevelHudValue.textContent =
    String(snapshot.level);

  elements.profileTitleHudValue.textContent =
    snapshot.selectedTitle.name;

  elements.levelDebugValue.textContent =
    String(snapshot.level);

  elements.xpDebugValue.textContent =
    String(Math.round(snapshot.totalXp));
};

const renderProfileScreen = () => {
  const snapshot =
    progressionSystem.getSnapshot();

  renderProfile({
    elements,
    progression: snapshot,
    settings: currentSettings,
    stats: currentStats,
    economy:
      economySystem.state,
    skin: getSkinById(
      currentSettings.skinId
    ),
    playerMeta:
      streakSystem.getSnapshot(),
    onTitleChange: (titleId) => {
      const result =
        progressionSystem.selectTitle(
          titleId
        );

      if (result.success) {
        updateProgressionUi(
          progressionSystem.getSnapshot()
        );
        renderProfileScreen();

        showRewardToast({
          icon: "🏷️",
          label: "Título selecionado",
          name:
            progressionSystem
              .getSnapshot()
              .selectedTitle.name,
          sound: "title",
        });
      }
    },
  });

  updateProgressionUi(snapshot);
};

const renderSeasonScreen = () => {
  const snapshot =
    seasonSystem.ensureCurrentSeason();

  renderSeason({
    elements,
    season: snapshot,
  });

  elements.seasonMenuValue.textContent =
    `Nível ${snapshot.level}/${snapshot.maxLevel}`;

  elements.seasonDebugValue.textContent =
    `${snapshot.level}/${snapshot.maxLevel}`;
};

const renderWeeklyScreen = () => {
  const snapshot =
    weeklyEventSystem.ensureCurrentEvent();

  renderWeeklyEvent({
    elements,
    weeklyEvent: snapshot,
  });

  elements.weeklyMenuValue.textContent =
    `${snapshot.completedCount}/${snapshot.objectives.length}`;

  elements.weeklyDebugValue.textContent =
    `${snapshot.completedCount}/${snapshot.objectives.length}`;
};

const showLevelUpToast = ({
  level,
  reward,
}) => {
  updateCoinBalance();
  updateProgressionUi();
  renderProfileScreen();

  showRewardToast({
    icon: "⬆️",
    label: `Nível ${level} alcançado`,
    name: `+${reward.coins} moedas`,
    sound: "levelUp",
  });
};

const showTitleUnlockedToast = (
  title
) => {
  updateProgressionUi();
  renderProfileScreen();

  showRewardToast({
    icon: "🏷️",
    label: "Novo título desbloqueado",
    name: title.name,
    sound: "title",
  });
};

const showSeasonRewardToast = ({
  reward,
}) => {
  updateCoinBalance();
  updateProgressionUi();
  renderSeasonScreen();

  const titleBonus =
    reward.titleId
      ? " • novo título"
      : "";

  showRewardToast({
    icon: "🌀",
    label: `Temporada • nível ${reward.level}`,
    name:
      `🪙 ${reward.coins} • ⭐ ${reward.profileXp} XP${titleBonus}`,
    sound: "season",
  });
};

const showWeeklyObjectiveToast = ({
  objective,
}) => {
  updateCoinBalance();
  updateProgressionUi();
  renderWeeklyScreen();

  showRewardToast({
    icon: "🎪",
    label: "Objetivo semanal concluído",
    name:
      `${objective.label} • 🪙 ${objective.rewardCoins} • ⭐ ${objective.rewardXp} XP`,
    sound: "weekly",
  });
};

const showWeeklyCompleteToast = ({
  reward,
}) => {
  updateCoinBalance();
  updateProgressionUi();
  renderSeasonScreen();
  renderWeeklyScreen();

  showRewardToast({
    icon: "🏆",
    label: "Evento semanal completo",
    name:
      `🪙 ${reward.coins} • ⭐ ${reward.profileXp} XP • 🌀 ${reward.seasonPoints}`,
    sound: "weekly",
  });
};

const openProfile = () => {
  saveData = storageService.load();
  currentStats = {
    ...saveData.stats,
  };
  renderProfileScreen();
  openOverlay("profile");
};

const openSeason = () => {
  renderSeasonScreen();
  openOverlay("season");
};

const openWeekly = () => {
  renderWeeklyScreen();
  openOverlay("weekly");
};

const updateCompetitiveUi = (
  snapshot =
    competitiveSystem?.getSnapshot()
) => {
  if (!snapshot) {
    return;
  }

  elements.competitiveLeagueIconMenu.textContent =
    snapshot.league.icon;

  elements.competitiveLeagueMenuValue.textContent =
    snapshot.league.name;

  elements.competitiveRatingMenuValue.textContent =
    String(
      Math.round(snapshot.rating)
    );

  elements.leagueHudNameValue.textContent =
    snapshot.league.name;

  elements.ratingHudValue.textContent =
    String(
      Math.round(snapshot.rating)
    );

  elements.ratingDebugValue.textContent =
    String(
      Math.round(snapshot.rating)
    );
};

const updateStreakUi = (
  snapshot =
    streakSystem?.getSnapshot()
) => {
  if (!snapshot) {
    return;
  }

  elements.streakMenuValue.textContent =
    String(snapshot.currentStreak);

  elements.streakDebugValue.textContent =
    String(snapshot.currentStreak);
};

const getShareText = (
  match
) => {
  const league =
    getLeagueByRating(
      match.ratingAfter
    );

  return [
    "🐍 Snake Arena",
    `${match.medalIcon} ${match.medalName}`,
    `Pontuação: ${Math.round(match.score)}`,
    `Posição: #${match.rank ?? "—"}/${match.totalCompetitors}`,
    `Massa: ${Math.round(match.maximumMass)}`,
    `Eliminações: ${match.eliminations}`,
    `${league.icon} Liga ${league.name}: ${match.ratingAfter} RP (${match.ratingDelta >= 0 ? "+" : ""}${match.ratingDelta})`,
    `Nível do perfil: ${match.profileLevel}`,
  ].join("\n");
};

const shareMatch = async (
  match
) => {
  const result =
    await saveTransferService.shareText(
      getShareText(match)
    );

  if (
    result.method ===
      "clipboard"
  ) {
    showRewardToast({
      icon: "📋",
      label: "Resultado copiado",
      name: "Pronto para compartilhar",
      sound: "ui",
    });
  }
};

const renderCompetitiveScreen = () => {
  const snapshot =
    competitiveSystem.getSnapshot();

  renderCompetitive({
    elements,
    competitive: snapshot,
    bestRuns:
      matchHistorySystem.getBestRuns(10),
  });

  updateCompetitiveUi(snapshot);
};

const renderHistoryScreen = () => {
  const matches =
    matchHistorySystem.getRecent(50);

  renderMatchHistory({
    elements,
    matches,
    getLeague:
      getLeagueByRating,
    onShare:
      shareMatch,
  });

  elements.historyDebugValue.textContent =
    String(matches.length);
};

const renderDataScreen = () => {
  const save =
    storageService.load();

  renderDataManagement({
    elements,
    save,
  });
};

const openCompetitive = () => {
  competitiveSystem.reload();
  renderCompetitiveScreen();
  openOverlay("competitive");
};

const openHistory = () => {
  renderHistoryScreen();
  openOverlay("history");
};

const openData = () => {
  renderDataScreen();
  openOverlay("data");
};

const showLeagueChangeToast = ({
  current,
}) => {
  updateCompetitiveUi();
  renderCompetitiveScreen();

  showRewardToast({
    icon: current.icon,
    label: "Nova liga alcançada",
    name: current.name,
    sound: "levelUp",
  });
};

const showDailyActivityToast = ({
  amount,
  streak,
}) => {
  updateCoinBalance();
  updateStreakUi();

  showRewardToast({
    icon: "🔥",
    label: `Sequência de ${streak} dia${streak === 1 ? "" : "s"}`,
    name: `+${amount} moedas`,
    sound: "coins",
  });
};

const showStreakMilestoneToast = ({
  streak,
  amount,
}) => {
  updateCoinBalance();
  updateStreakUi();

  showRewardToast({
    icon: "🔥",
    label: `Marco de ${streak} dias`,
    name: `+${amount} moedas extras`,
    sound: "achievement",
  });
};

const setOnlineMessage = (
  message,
  state = "idle"
) => {
  cloudStatusMessage =
    String(message || "Modo local");

  elements.onlineSyncState.textContent =
    cloudStatusMessage;

  elements.onlineSyncState.dataset.state =
    state;

  elements.cloudDebugValue.textContent =
    state === "syncing"
      ? "sync"
      : cloudSessionService?.isSignedIn
        ? "online"
        : "local";
};

const updateOnlineSummary = () => {
  const configured =
    isCloudConfigured(
      CLOUD_CONFIG
    );

  const session =
    cloudSessionService?.getSnapshot();

  if (!configured) {
    elements.onlineSummaryIcon.textContent =
      "☁️";
    elements.onlineSummaryLabel.textContent =
      "Modo local";
    elements.onlineSummaryValue.textContent =
      "Configurar nuvem";
    elements.onlineSummaryState.textContent =
      "Offline seguro";
    return;
  }

  if (session) {
    elements.onlineSummaryIcon.textContent =
      navigator.onLine
        ? "🌐"
        : "☁️";
    elements.onlineSummaryLabel.textContent =
      "Conta conectada";
    elements.onlineSummaryValue.textContent =
      session.user?.email ??
      "Jogador online";
    elements.onlineSummaryState.textContent =
      navigator.onLine
        ? "Nuvem ativa"
        : "Sem internet";
    return;
  }

  elements.onlineSummaryIcon.textContent =
    "🔐";
  elements.onlineSummaryLabel.textContent =
    "Online disponível";
  elements.onlineSummaryValue.textContent =
    "Entrar na conta";
  elements.onlineSummaryState.textContent =
    navigator.onLine
      ? "Pronto"
      : "Sem internet";
};

const getFilteredLeaderboard = () =>
  filterLeaderboard(
    onlineLeaderboard.length > 0
      ? onlineLeaderboard
      : storageService
          .getCloudMetadata()
          .cachedLeaderboard,
    leaderboardFilters
  );

const renderCommunityState = () => {
  const cloud =
    storageService.getCloudMetadata();

  renderCommunityProfile({
    elements,
    profile:
      selectedCommunityProfile,
    matches:
      selectedCommunityMatches,
  });

  renderGlobalFeed({
    container:
      elements.globalFeedList,
    matches:
      onlineGlobalFeed.length > 0
        ? onlineGlobalFeed
        : cloud.cachedGlobalFeed,
    onOpenProfile:
      openCommunityProfile,
  });

  renderCloudDiagnostics({
    container:
      elements.cloudDiagnosticsList,
    diagnostics:
      cloud.diagnostics,
  });
};

const renderOnlineState = () => {
  const configured =
    isCloudConfigured(
      CLOUD_CONFIG
    );

  const session =
    cloudSessionService?.getSnapshot();

  const cloud =
    storageService.getCloudMetadata();

  const leaderboard =
    getFilteredLeaderboard();

  elements.onlineLeaderboardCountValue.textContent =
    String(leaderboard.length);

  renderOnlineView({
    elements,
    configured,
    session,
    cloud,
    leaderboard,
    online:
      navigator.onLine,
    recoveryMode:
      onlineRecoveryMode,
    currentPlayerId:
      storageService
        .getPlayerMeta()
        .playerId,
    onOpenProfile:
      openCommunityProfile,
  });

  elements.onlineSyncState.textContent =
    cloudStatusMessage;

  renderCommunityState();
  updateOnlineSummary();
};

const openCommunityProfile = async (
  playerId
) => {
  if (!playerId) {
    return;
  }

  const leaderboardFallback =
    onlineLeaderboard.find(
      (entry) =>
        entry.playerId ===
        playerId
    ) ??
    storageService
      .getCloudMetadata()
      .cachedLeaderboard.find(
        (entry) =>
          entry.playerId ===
          playerId
      );

  const cached =
    onlineCommunityProfiles.find(
      (entry) =>
        entry.playerId ===
        playerId
    ) ??
    storageService
      .getCloudMetadata()
      .cachedCommunityProfiles.find(
        (entry) =>
          entry.playerId ===
          playerId
      ) ??
    (leaderboardFallback
      ? {
          ...leaderboardFallback,
          tagline: "",
          titleId:
            leaderboardFallback.titleId ??
            "novato",
          skinId:
            leaderboardFallback.skinId ??
            "neon-mint",
          currentStreak:
            leaderboardFallback.currentStreak ??
            0,
          totalGames:
            leaderboardFallback.totalGames ??
            0,
          totalEliminations:
            leaderboardFallback.totalEliminations ??
            0,
        }
      : null);

  selectedCommunityProfile =
    cached ?? null;
  selectedCommunityMatches = [];
  renderCommunityState();

  if (
    cloudCommunitySystem?.available &&
    navigator.onLine
  ) {
    try {
      const [profile, matches] =
        await Promise.all([
          cloudCommunitySystem
            .fetchProfile(playerId),
          cloudCommunitySystem
            .fetchRecentMatches(
              playerId,
              10
            ),
        ]);

      selectedCommunityProfile =
        profile ?? cached ?? null;
      selectedCommunityMatches =
        matches;
    } catch (error) {
      setOnlineMessage(
        error?.message ??
          "Não foi possível abrir o perfil público.",
        "error"
      );
    }
  }

  renderCommunityState();

  elements.communityProfilePanel
    .scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
};

const refreshCommunity = async ({
  silent = false,
} = {}) => {
  if (
    !cloudCommunitySystem?.available
  ) {
    renderOnlineState();
    return {
      profiles: [],
      feed: [],
    };
  }

  if (!silent) {
    setOnlineMessage(
      "Atualizando comunidade...",
      "syncing"
    );
  }

  const [profiles, feed] =
    await Promise.all([
      cloudCommunitySystem
        .fetchProfiles(),
      cloudCommunitySystem
        .fetchGlobalFeed(),
    ]);

  onlineCommunityProfiles =
    profiles;
  onlineGlobalFeed = feed;

  if (!silent) {
    setOnlineMessage(
      navigator.onLine
        ? "Comunidade atualizada"
        : "Comunidade em cache",
      "success"
    );
  }

  renderOnlineState();

  return {
    profiles,
    feed,
  };
};

const refreshGlobalLeaderboard = async ({
  silent = false,
  includeCommunity = true,
} = {}) => {
  if (
    !cloudSyncSystem?.available
  ) {
    renderOnlineState();
    return [];
  }

  if (!silent) {
    setOnlineMessage(
      "Atualizando placar...",
      "syncing"
    );
  }

  onlineLeaderboard =
    await cloudSyncSystem
      .fetchLeaderboard();

  if (includeCommunity) {
    await refreshCommunity({
      silent: true,
    });
  }

  if (!silent) {
    setOnlineMessage(
      navigator.onLine
        ? "Placar atualizado"
        : "Placar em cache",
      "success"
    );
  }

  renderOnlineState();
  return onlineLeaderboard;
};

const openOnline = () => {
  renderOnlineState();
  openOverlay("online");

  if (
    navigator.onLine &&
    cloudSyncSystem?.available
  ) {
    void refreshGlobalLeaderboard({
      silent: true,
    });
  }
};

const getAuthRedirectUrl = () => {
  const url =
    new URL(
      window.location.href
    );

  url.hash = "";
  url.search = "";

  return url.toString();
};

const readOnlineEmail = () => {
  const email =
    elements.onlineEmailInput.value
      .trim()
      .toLowerCase();

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    throw new Error(
      "Digite um e-mail válido."
    );
  }

  return email;
};

const readOnlineCredentials = () => {
  const email =
    elements.onlineEmailInput.value
      .trim()
      .toLowerCase();

  const password =
    elements.onlinePasswordInput.value;

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    throw new Error(
      "Digite um e-mail válido."
    );
  }

  if (password.length < 6) {
    throw new Error(
      "A senha precisa ter pelo menos 6 caracteres."
    );
  }

  return {
    email,
    password,
  };
};

const runOnlineAction = async (
  action
) => {
  elements.onlineAuthMessage.textContent =
    "";
  elements.onlineRecoveryMessage.textContent =
    "";

  try {
    return await action();
  } catch (error) {
    const message =
      error?.message ??
      "Não foi possível concluir a operação.";

    if (onlineRecoveryMode) {
      elements.onlineRecoveryMessage.textContent =
        message;
    } else {
      elements.onlineAuthMessage.textContent =
        message;
    }

    setOnlineMessage(
      message,
      "error"
    );

    renderOnlineState();
    return null;
  }
};

const getAchievementContext = (
  session = liveSessionSnapshot
) => ({
  session,
  stats: currentStats,
});

const renderAchievements = () => {
  achievementSystem?.reload();

  const entries =
    achievementSystem?.getEntries(
      getAchievementContext()
    ) ?? [];

  renderAchievementsGrid(
    elements.achievementsGrid,
    entries
  );

  const unlocked =
    entries.filter(
      (entry) => entry.unlocked
    ).length;

  elements.achievementCountValue.textContent =
    `${unlocked}/${entries.length}`;
};

const showAchievementToast = (
  achievement
) => {
  enqueueToast({
    type: "achievement",
    icon: achievement.icon,
    name: achievement.name,
    sound: "achievement",
    volume: 1.15,
    duration: 3600,
  });

  const coinReward =
    economySystem.addCoins(
      35,
      `achievement:${achievement.id}`,
      { unique: true }
    );

  progressionSystem.addXp(
    75,
    `achievement-xp:${achievement.id}`,
    { unique: true }
  );

  if (coinReward.added > 0) {
    updateCoinBalance(
      coinReward.balance
    );

    showRewardToast({
      icon: "🪙",
      label: "Bônus de conquista",
      name: "+35 moedas",
      sound: "coins",
    });
  }

  renderAchievements();
};

const openAchievements = () => {
  saveData = storageService.load();

  currentStats = {
    ...saveData.stats,
  };

  renderAchievements();
  openOverlay("achievements");
};

const resetLiveSession = () => {
  seasonSystem?.ensureCurrentSeason();
  seasonSystem?.grantReachedRewards({
    notify: true,
  });
  weeklyEventSystem?.ensureCurrentEvent();

  liveSessionSnapshot = {
    matchesCompleted: 0,
  };

  sessionRewardStart = {
    coins:
      economySystem?.getBalance() ?? 0,
    xp:
      progressionSystem?.getTotalXp() ?? 0,
    seasonPoints:
      seasonSystem?.getPoints() ?? 0,
  };

  lastAchievementEvaluationTime =
    -Infinity;
};

const finishLoading = () => {
  if (loadingFinished) {
    return;
  }

  loadingFinished = true;
  elements.loadingMessage.textContent =
    navigator.onLine
      ? "Arena pronta"
      : "Arena offline pronta";

  window.setTimeout(
    () => {
      elements.loadingScreen.classList.add(
        "loading-screen--hidden"
      );

      window.setTimeout(
        () => {
          elements.loadingScreen.hidden =
            true;
        },
        320
      );
    },
    160
  );
};

const setInstallAvailability = (
  available
) => {
  const visible =
    Boolean(available) &&
    !pwaManager?.isStandalone();

  elements.installAppButton.classList.toggle(
    "pwa-install-hidden",
    !visible
  );

  elements.installBanner.hidden =
    !visible;
};

const setNetworkStatus = (
  online
) => {
  elements.networkBanner.hidden =
    Boolean(online);

  elements.loadingMessage.textContent =
    online
      ? "Preparando a arena..."
      : "Carregando arquivos offline...";

  if (!online) {
    setOnlineMessage(
      "Sem internet • progresso local protegido",
      "offline"
    );
  } else if (
    cloudSessionService?.isSignedIn
  ) {
    setOnlineMessage(
      "Conta conectada",
      "success"
    );

    void refreshGlobalLeaderboard({
      silent: true,
    });
  }

  renderOnlineState();
};

const showUpdateAvailable = () => {
  elements.updateBanner.hidden =
    false;
};

const runInstallPrompt = async () => {
  const result =
    await pwaManager.install();

  if (
    result.available &&
    !result.accepted
  ) {
    elements.installBanner.hidden =
      true;
  }
};

const openSettings = () => {
  populateSettingsControls(
    currentSettings
  );

  openOverlay("settings");
};

const openSkins = () => {
  selectedSkinDraftId =
    currentSettings.skinId;

  buildSkinGrid();
  openOverlay("skins");
};

const openStats = () => {
  saveData = storageService.load();
  currentStats = {
    ...saveData.stats,
  };

  renderStats();
  openOverlay("stats");
};

const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch {
    // O jogo continua normalmente sem tela cheia.
  }
};

const updateFullscreenButtons = () => {
  const active =
    Boolean(document.fullscreenElement);

  elements.menuFullscreenButton.lastChild.textContent =
    active
      ? " Sair da tela cheia"
      : " Tela cheia";

  elements.fullscreenHudButton.textContent =
    active
      ? "⊡"
      : "⛶";
};

game = new Game({
  canvas: elements.canvas,
  joystickRoot: elements.joystick,
  joystickKnob:
    elements.joystickKnob,
  boostButton: elements.boostButton,

  onStateChange: handleStateChange,

  onFpsUpdate: (fps) => {
    elements.fpsValue.textContent =
      String(fps);
  },

  onRankingUpdate:
    renderLeaderboard,

  onKillFeedUpdate:
    renderKillFeed,

  onMinimapUpdate: (snapshot) => {
    minimapRenderer.render(snapshot);
  },

  onAudioEvent: ({
    type,
    intensity,
  }) => {
    audioManager.playEvent(
      type,
      intensity
    );
  },

  onGameOver: (result) => {
    const matchId =
      matchHistorySystem.createMatchId();

    currentStats =
      storageService.saveCompletedGame(
        result
      );

    liveSessionSnapshot = {
      ...liveSessionSnapshot,
      ...result,
      mass: result.maximumMass,
      rank: result.rank,
      matchesCompleted: 1,
    };

    economySystem.rewardMatch(
      result
    );

    progressionSystem.rewardMatch(
      result
    );

    seasonSystem.rewardMatch(
      result
    );

    weeklyEventSystem.recordMatch(
      result
    );

    dailyChallengeSystem.evaluate(
      getDailyContext(
        liveSessionSnapshot
      )
    );

    achievementSystem.evaluate(
      getAchievementContext(
        liveSessionSnapshot
      )
    );

    const competitiveResult =
      competitiveSystem.recordMatch(
        result,
        matchId
      );

    const coinsEarned =
      Math.max(
        0,
        economySystem.getBalance() -
          sessionRewardStart.coins
      );

    const xpEarned =
      Math.max(
        0,
        progressionSystem.getTotalXp() -
          sessionRewardStart.xp
      );

    const seasonPointsEarned =
      Math.max(
        0,
        seasonSystem.getPoints() -
          sessionRewardStart.seasonPoints
      );

    const historyResult =
      matchHistorySystem.record({
        matchId,
        result,
        rewards: {
          coins: coinsEarned,
          xp: xpEarned,
          seasonPoints:
            seasonPointsEarned,
        },
        competitive:
          competitiveResult,
        profile:
          progressionSystem.getSnapshot(),
        settings:
          currentSettings,
      });

    lastCompletedMatch =
      historyResult.record;

    renderGameOver({
      ...result,
      coinsEarned,
      xpEarned,
      seasonPointsEarned,
      ratingDelta:
        lastCompletedMatch.ratingDelta,
      medalIcon:
        lastCompletedMatch.medalIcon,
      medalName:
        lastCompletedMatch.medalName,
    });

    updateCoinBalance();
    updateProgressionUi();
    updateCompetitiveUi();
    updateStreakUi();
    renderStats();
    renderAchievements();
    renderDaily();
    renderShop();
    renderProfileScreen();
    renderSeasonScreen();
    renderWeeklyScreen();
    renderCompetitiveScreen();
    renderHistoryScreen();
    renderDataScreen();
    renderOnlineState();

    void cloudSyncSystem
      ?.syncAfterMatch()
      .then(async (result) => {
        if (result) {
          await cloudCommunitySystem
            ?.syncCommunityData();
        }

        await refreshGlobalLeaderboard({
          silent: true,
        });
      })
      .catch(() => {
        // O progresso principal já permanece salvo localmente.
      });
  },

  onPlayerUpdate: ({
    x,
    y,
    speed,
    mass,
    score,
    collected,
    eliminations,
    maximumMass,
    elapsedTime,
    protectionRemaining,
    zoom,
    inputSource,
    quality,
    foodActive,
    remainsActive,
    effectsActive,
    boostActive,
    boostAvailable,
    boostIntensity,
    botsActive,
    botsWaiting,
    collisionBodies,
    collisionCells,
    totalDeaths,
    playerRank,
    rankingTotal,
  }) => {
    elements.positionValue.textContent =
      `${Math.round(x)}, ${Math.round(y)}`;

    elements.scoreValue.textContent =
      formatNumber(score);

    elements.massValue.textContent =
      formatNumber(mass);

    elements.eliminationsValue.textContent =
      String(eliminations);

    if (playerRank) {
      elements.rankValue.textContent =
        `#${playerRank}/${rankingTotal}`;
    }

    elements.zoomValue.textContent =
      zoom.toFixed(2);

    elements.speedDebugValue.textContent =
      String(Math.round(speed));

    elements.boostDebugValue.textContent =
      boostIntensity.toFixed(2);

    elements.inputValue.textContent =
      inputSource;

    elements.qualityValue.textContent =
      quality;

    elements.botsDebugValue.textContent =
      botsWaiting > 0
        ? `${botsActive} (+${botsWaiting})`
        : String(botsActive);

    elements.foodValue.textContent =
      String(foodActive);

    elements.remainsValue.textContent =
      String(remainsActive);

    elements.collisionBodiesValue.textContent =
      String(collisionBodies);

    elements.collisionCellsValue.textContent =
      String(collisionCells);

    elements.deathsValue.textContent =
      String(totalDeaths);

    elements.effectsValue.textContent =
      String(effectsActive);

    updateProtectionHud(
      protectionRemaining
    );

    updateBoostHud({
      active: boostActive,
      available: boostAvailable,
      intensity: boostIntensity,
    });

    liveSessionSnapshot = {
      mass,
      maximumMass,
      score,
      collected,
      eliminations,
      elapsedTime,
    };

    if (
      elapsedTime -
        lastAchievementEvaluationTime >=
      0.25
    ) {
      lastAchievementEvaluationTime =
        elapsedTime;

      achievementSystem.evaluate(
        getAchievementContext()
      );

      dailyChallengeSystem.evaluate(
        getDailyContext()
      );

      renderDaily();
    }
  },
});

economySystem =
  new EconomySystem({
    storageService,
    onBalanceChange:
      updateCoinBalance,
  });

economySystem.ensureStarterSkins();
currentEconomy =
  economySystem.reload();

competitiveSystem =
  new CompetitiveSystem({
    storageService,
    onLeagueChange:
      showLeagueChangeToast,
    onRatingChange:
      updateCompetitiveUi,
  });

matchHistorySystem =
  new MatchHistorySystem({
    storageService,
  });

saveTransferService =
  new SaveTransferService({
    storageService,
  });

cloudClient =
  new SupabaseRestClient({
    projectUrl:
      CLOUD_CONFIG.projectUrl,
    publishableKey:
      CLOUD_CONFIG.publishableKey,
  });

cloudSessionService =
  new CloudSessionService({
    client: cloudClient,
    onChange: () => {
      renderOnlineState();
    },
  });

cloudSyncSystem =
  new CloudSyncSystem({
    client: cloudClient,
    sessionService:
      cloudSessionService,
    storageService,
    leaderboardLimit:
      CLOUD_CONFIG.leaderboardLimit,
    onStatus: ({
      state,
      message,
    }) => {
      setOnlineMessage(
        message,
        state
      );
      renderOnlineState();
    },
  });

cloudCommunitySystem =
  new CloudCommunitySystem({
    client: cloudClient,
    sessionService:
      cloudSessionService,
    storageService,
    profileLimit:
      CLOUD_CONFIG.communityProfileLimit,
    feedLimit:
      CLOUD_CONFIG.globalFeedLimit,
    onStatus: ({
      state,
      message,
    }) => {
      setOnlineMessage(
        message,
        state
      );
      renderOnlineState();
    },
  });

streakSystem =
  new StreakSystem({
    storageService,
    economySystem,
    onDailyReward:
      showDailyActivityToast,
    onStreakMilestone:
      showStreakMilestoneToast,
  });

progressionSystem =
  new ProgressionSystem({
    storageService,
    economySystem,
    onLevelUp:
      showLevelUpToast,
    onTitleUnlocked:
      showTitleUnlockedToast,
    onChange:
      updateProgressionUi,
  });

seasonSystem =
  new SeasonSystem({
    storageService,
    economySystem,
    progressionSystem,
    onReward:
      showSeasonRewardToast,
    onSeasonChanged: () => {
      if (seasonSystem) {
        renderSeasonScreen();
      }
    },
  });

weeklyEventSystem =
  new WeeklyEventSystem({
    storageService,
    economySystem,
    progressionSystem,
    seasonSystem,
    onObjectiveComplete:
      showWeeklyObjectiveToast,
    onEventComplete:
      showWeeklyCompleteToast,
  });

dailyChallengeSystem =
  new DailyChallengeSystem({
    storageService,
    economySystem,
    onComplete:
      showDailyCompleteToast,
  });

achievementSystem =
  new AchievementSystem({
    storageService,
    onUnlock:
      showAchievementToast,
  });

achievementSystem.evaluate(
  getAchievementContext({}),
  { notify: false }
);

syncMenuControls(
  currentSettings
);

populateSettingsControls(
  currentSettings
);

buildSkinGrid();
renderStats();
renderAchievements();
renderDaily();
renderShop();
renderProfileScreen();
renderSeasonScreen();
renderWeeklyScreen();
renderCompetitiveScreen();
renderHistoryScreen();
renderDataScreen();
renderOnlineState();
updateCoinBalance();
updateProgressionUi();
updateCompetitiveUi();
updateStreakUi();
updateAudioButton();

game.configure({
  controlMode:
    currentSettings.controlMode,
  quality:
    currentSettings.quality,
  difficulty:
    currentSettings.difficulty,
  skinId:
    currentSettings.skinId,
  showSnakeNames:
    currentSettings.showSnakeNames,
  reducedEffects:
    currentSettings.reducedEffects,
});

game.setNickname(
  currentSettings.nickname
);

game.initialize();

elements.startButton.addEventListener(
  "click",
  () => {
    const nextSettings = {
      ...currentSettings,
      nickname: sanitizeNickname(
        elements.nicknameInput.value
      ),
      controlMode: sanitizeChoice(
        elements.controlModeSelect.value,
        ["follow", "joystick"],
        "follow"
      ),
      quality: sanitizeChoice(
        elements.qualitySelect.value,
        [
          "auto",
          "low",
          "medium",
          "high",
        ],
        "auto"
      ),
      difficulty: sanitizeChoice(
        elements.difficultySelect.value,
        ["calm", "normal", "intense"],
        "normal"
      ),
    };

    applySettings(nextSettings);
    streakSystem.registerToday();
    resetLiveSession();
    dailyChallengeSystem.ensureToday();
    renderDaily();

    void audioManager.ensureStarted();
    audioManager.startMusic();

    game.start(
      currentSettings.nickname
    );
  }
);

elements.resumeButton.addEventListener(
  "click",
  () => {
    game.resume();
  }
);

elements.pauseSettingsButton.addEventListener(
  "click",
  openSettings
);

elements.restartButton.addEventListener(
  "click",
  () => {
    resetLiveSession();
    game.restart();
  }
);

elements.gameOverRestartButton.addEventListener(
  "click",
  () => {
    resetLiveSession();
    game.restart();
  }
);

elements.menuButton.addEventListener(
  "click",
  () => {
    game.returnToMenu();
  }
);

elements.gameOverMenuButton.addEventListener(
  "click",
  () => {
    game.returnToMenu();
  }
);

elements.gameOverStatsButton.addEventListener(
  "click",
  openStats
);

elements.pauseButton.addEventListener(
  "click",
  () => {
    game.pause();
  }
);

elements.openCompetitiveButton.addEventListener(
  "click",
  openCompetitive
);

elements.openCompetitiveSummaryButton.addEventListener(
  "click",
  openCompetitive
);

elements.openHistoryButton.addEventListener(
  "click",
  openHistory
);

elements.openDataButton.addEventListener(
  "click",
  openData
);

elements.openOnlineButton.addEventListener(
  "click",
  openOnline
);

elements.openOnlineSummaryButton.addEventListener(
  "click",
  openOnline
);

elements.gameOverCompetitiveButton.addEventListener(
  "click",
  openCompetitive
);

elements.gameOverHistoryButton.addEventListener(
  "click",
  openHistory
);

elements.gameOverShareButton.addEventListener(
  "click",
  () => {
    if (lastCompletedMatch) {
      void shareMatch(
        lastCompletedMatch
      );
    }
  }
);

elements.openProfileButton.addEventListener(
  "click",
  openProfile
);

elements.openProfileSummaryButton.addEventListener(
  "click",
  openProfile
);

elements.openSeasonButton.addEventListener(
  "click",
  openSeason
);

elements.openSeasonSummaryButton.addEventListener(
  "click",
  openSeason
);

elements.openWeeklyButton.addEventListener(
  "click",
  openWeekly
);

elements.openWeeklySummaryButton.addEventListener(
  "click",
  openWeekly
);

elements.gameOverProfileButton.addEventListener(
  "click",
  openProfile
);

elements.gameOverSeasonButton.addEventListener(
  "click",
  openSeason
);

elements.openSkinsButton.addEventListener(
  "click",
  openSkins
);

elements.openDailyButton.addEventListener(
  "click",
  openDaily
);

elements.openDailySummaryButton.addEventListener(
  "click",
  openDaily
);

elements.openShopButton.addEventListener(
  "click",
  openShop
);

elements.gameOverDailyButton.addEventListener(
  "click",
  openDaily
);

elements.gameOverShopButton.addEventListener(
  "click",
  openShop
);

elements.openStatsButton.addEventListener(
  "click",
  openStats
);

elements.openAchievementsButton.addEventListener(
  "click",
  openAchievements
);

elements.gameOverAchievementsButton.addEventListener(
  "click",
  openAchievements
);

elements.openSettingsButton.addEventListener(
  "click",
  openSettings
);

elements.settingsHudButton.addEventListener(
  "click",
  openSettings
);

elements.settingsSkinButton.addEventListener(
  "click",
  () => {
    buildSkinGrid();
    openOverlay("skins");
  }
);

elements.settingsSaveButton.addEventListener(
  "click",
  () => {
    const nextSettings =
      readSettingsControls();

    applySettings(nextSettings);
    closeOverlay();
  }
);

elements.settingsResetButton.addEventListener(
  "click",
  () => {
    selectedSkinDraftId =
      DEFAULT_SETTINGS.skinId;

    populateSettingsControls({
      ...DEFAULT_SETTINGS,
    });

    renderSkinPreview(
      selectedSkinDraftId
    );
  }
);

elements.settingsBackButton.addEventListener(
  "click",
  closeOverlay
);

elements.skinApplyButton.addEventListener(
  "click",
  () => {
    if (
      !economySystem.ownsSkin(
        selectedSkinDraftId
      )
    ) {
      openShop();
      return;
    }

    const previousOverlay =
      overlayStack.at(-2);

    if (previousOverlay === "settings") {
      renderSkinPreview(
        selectedSkinDraftId
      );

      closeOverlay();
      return;
    }

    applySettings({
      ...currentSettings,
      skinId:
        selectedSkinDraftId,
    });

    closeOverlay();
  }
);

elements.skinBackButton.addEventListener(
  "click",
  closeOverlay
);

elements.competitiveBackButton.addEventListener(
  "click",
  closeOverlay
);

elements.competitiveHistoryButton.addEventListener(
  "click",
  openHistory
);

elements.historyBackButton.addEventListener(
  "click",
  closeOverlay
);

elements.historyCompetitiveButton.addEventListener(
  "click",
  openCompetitive
);

elements.historyClearButton.addEventListener(
  "click",
  () => {
    const confirmed =
      window.confirm(
        "Deseja apagar o histórico das últimas partidas? Rating, moedas e recordes não serão removidos."
      );

    if (!confirmed) {
      return;
    }

    matchHistorySystem.clear();
    lastCompletedMatch = null;
    renderHistoryScreen();
    renderCompetitiveScreen();
    renderDataScreen();
  }
);

elements.onlineBackButton.addEventListener(
  "click",
  closeOverlay
);

elements.onlineSignInButton.addEventListener(
  "click",
  () => {
    void runOnlineAction(
      async () => {
        const credentials =
          readOnlineCredentials();

        setOnlineMessage(
          "Entrando na conta...",
          "syncing"
        );

        await cloudSessionService
          .signIn(credentials);

        elements.onlinePasswordInput.value =
          "";

        setOnlineMessage(
          "Conta conectada",
          "success"
        );

        await refreshGlobalLeaderboard({
          silent: true,
        });

        renderOnlineState();
      }
    );
  }
);

elements.onlineSignUpButton.addEventListener(
  "click",
  () => {
    void runOnlineAction(
      async () => {
        const credentials =
          readOnlineCredentials();

        setOnlineMessage(
          "Criando conta...",
          "syncing"
        );

        const result =
          await cloudSessionService
            .signUp({
              ...credentials,
              nickname:
                currentSettings.nickname,
            });

        elements.onlinePasswordInput.value =
          "";

        if (
          result.confirmationRequired
        ) {
          elements.onlineAuthMessage.textContent =
            "Conta criada. Confirme o e-mail antes de entrar.";

          setOnlineMessage(
            "Confirmação de e-mail necessária",
            "success"
          );
        } else {
          setOnlineMessage(
            "Conta criada e conectada",
            "success"
          );
        }

        renderOnlineState();
      }
    );
  }
);

elements.onlineForgotPasswordButton.addEventListener(
  "click",
  () => {
    void runOnlineAction(
      async () => {
        const email =
          readOnlineEmail();

        setOnlineMessage(
          "Enviando recuperação...",
          "syncing"
        );

        await cloudSessionService
          .requestPasswordRecovery({
            email,
            redirectTo:
              getAuthRedirectUrl(),
          });

        elements.onlineAuthMessage.textContent =
          "Se o e-mail estiver cadastrado, você receberá um link para definir uma nova senha.";

        setOnlineMessage(
          "E-mail de recuperação solicitado",
          "success"
        );
      }
    );
  }
);

elements.onlineResendConfirmationButton.addEventListener(
  "click",
  () => {
    void runOnlineAction(
      async () => {
        const email =
          readOnlineEmail();

        await cloudSessionService
          .resendSignupConfirmation({
            email,
            redirectTo:
              getAuthRedirectUrl(),
          });

        elements.onlineAuthMessage.textContent =
          "A confirmação foi solicitada novamente. Verifique também a pasta de spam.";

        setOnlineMessage(
          "Confirmação reenviada",
          "success"
        );
      }
    );
  }
);

elements.onlineChangePasswordButton.addEventListener(
  "click",
  () => {
    onlineRecoveryMode = true;
    elements.onlineRecoveryMessage.textContent =
      "Digite uma nova senha para a conta conectada.";
    renderOnlineState();
  }
);

elements.onlineRecoveryCancelButton.addEventListener(
  "click",
  () => {
    onlineRecoveryMode = false;
    elements.onlineNewPasswordInput.value = "";
    elements.onlineConfirmPasswordInput.value = "";
    elements.onlineRecoveryMessage.textContent = "";
    renderOnlineState();
  }
);

elements.onlineUpdatePasswordButton.addEventListener(
  "click",
  () => {
    void runOnlineAction(
      async () => {
        const password =
          elements.onlineNewPasswordInput.value;

        const confirmation =
          elements.onlineConfirmPasswordInput.value;

        if (password.length < 6) {
          throw new Error(
            "A nova senha precisa ter pelo menos 6 caracteres."
          );
        }

        if (password !== confirmation) {
          throw new Error(
            "As duas senhas precisam ser iguais."
          );
        }

        await cloudSessionService
          .updatePassword(password);

        elements.onlineNewPasswordInput.value = "";
        elements.onlineConfirmPasswordInput.value = "";
        elements.onlineRecoveryMessage.textContent =
          "Senha atualizada com sucesso.";
        onlineRecoveryMode = false;

        setOnlineMessage(
          "Senha atualizada",
          "success"
        );

        renderOnlineState();
      }
    );
  }
);

elements.onlineSignOutButton.addEventListener(
  "click",
  () => {
    void runOnlineAction(
      async () => {
        await cloudSessionService
          .signOut();

        onlineRecoveryMode = false;
        selectedCommunityProfile = null;
        selectedCommunityMatches = [];

        setOnlineMessage(
          "Sessão encerrada neste aparelho",
          "idle"
        );

        renderOnlineState();
      }
    );
  }
);

elements.onlineAutoSyncInput.addEventListener(
  "change",
  () => {
    storageService
      .saveCloudMetadata({
        autoSyncEnabled:
          elements.onlineAutoSyncInput.checked,
      });

    setOnlineMessage(
      elements.onlineAutoSyncInput.checked
        ? "Sincronização automática ativada"
        : "Sincronização automática desativada",
      "success"
    );

    renderOnlineState();
  }
);

elements.onlineUploadButton.addEventListener(
  "click",
  () => {
    void runOnlineAction(
      async () => {
        await cloudSyncSystem
          .pushSave();

        await cloudCommunitySystem
          .syncCommunityData();

        await refreshGlobalLeaderboard({
          silent: true,
        });

        renderOnlineState();
      }
    );
  }
);

elements.onlineDownloadButton.addEventListener(
  "click",
  () => {
    void runOnlineAction(
      async () => {
        const confirmed =
          window.confirm(
            "O save da nuvem substituirá todo o progresso deste dispositivo. Deseja continuar?"
          );

        if (!confirmed) {
          return;
        }

        const result =
          await cloudSyncSystem
            .pullSave();

        if (!result.found) {
          window.alert(
            "Ainda não existe um save na nuvem para esta conta."
          );
          return;
        }

        window.alert(
          "Progresso restaurado da nuvem. O jogo será recarregado."
        );

        window.location.reload();
      }
    );
  }
);

elements.onlineRefreshLeaderboardButton.addEventListener(
  "click",
  () => {
    void runOnlineAction(
      async () => {
        await refreshGlobalLeaderboard();
      }
    );
  }
);

elements.onlineLeaderboardSearchInput.addEventListener(
  "input",
  () => {
    leaderboardFilters.search =
      elements.onlineLeaderboardSearchInput.value;
    renderOnlineState();
  }
);

elements.onlineLeaderboardLeagueSelect.addEventListener(
  "change",
  () => {
    leaderboardFilters.league =
      elements.onlineLeaderboardLeagueSelect.value;
    renderOnlineState();
  }
);

elements.onlineLeaderboardSortSelect.addEventListener(
  "change",
  () => {
    leaderboardFilters.sort =
      elements.onlineLeaderboardSortSelect.value;
    renderOnlineState();
  }
);

elements.communityProfileCloseButton.addEventListener(
  "click",
  () => {
    selectedCommunityProfile = null;
    selectedCommunityMatches = [];
    renderCommunityState();
  }
);

elements.onlineRefreshCommunityButton.addEventListener(
  "click",
  () => {
    void runOnlineAction(
      async () => {
        await refreshCommunity();
      }
    );
  }
);

elements.onlineSavePublicProfileButton.addEventListener(
  "click",
  () => {
    void runOnlineAction(
      async () => {
        const enabled =
          elements.onlinePublicProfileInput.checked;

        const tagline =
          elements.onlineTaglineInput.value
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 80);

        storageService.saveCloudMetadata({
          publicProfileEnabled:
            enabled,
          publicTagline:
            tagline,
        });

        await cloudCommunitySystem
          .setPublicVisibility(
            enabled
          );

        if (enabled) {
          await cloudCommunitySystem
            .syncRecentMatches();
        }

        await cloudSyncSystem
          .updateLeaderboard();

        await refreshGlobalLeaderboard({
          silent: true,
        });

        setOnlineMessage(
          enabled
            ? "Perfil público atualizado"
            : "Perfil ocultado da comunidade",
          "success"
        );
      }
    );
  }
);

elements.onlineSyncCommunityButton.addEventListener(
  "click",
  () => {
    void runOnlineAction(
      async () => {
        const tagline =
          elements.onlineTaglineInput.value
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 80);

        storageService.saveCloudMetadata({
          publicProfileEnabled:
            elements.onlinePublicProfileInput.checked,
          publicTagline:
            tagline,
        });

        await cloudCommunitySystem
          .syncCommunityData();

        await refreshGlobalLeaderboard({
          silent: true,
        });
      }
    );
  }
);

elements.onlineRunDiagnosticsButton.addEventListener(
  "click",
  () => {
    void runOnlineAction(
      async () => {
        setOnlineMessage(
          "Executando diagnóstico...",
          "syncing"
        );

        const result =
          await cloudCommunitySystem
            .runDiagnostics();

        setOnlineMessage(
          result.success
            ? "Diagnóstico aprovado"
            : "Diagnóstico encontrou pendências",
          result.success
            ? "success"
            : "error"
        );

        renderOnlineState();
      }
    );
  }
);

elements.dataBackButton.addEventListener(
  "click",
  closeOverlay
);

elements.dataExportButton.addEventListener(
  "click",
  () => {
    saveTransferService.exportBackup();
    storageService.markBackupCreated();
    renderDataScreen();

    showRewardToast({
      icon: "💾",
      label: "Backup criado",
      name: "Arquivo salvo no dispositivo",
      sound: "ui",
    });
  }
);

elements.dataImportButton.addEventListener(
  "click",
  () => {
    elements.dataImportInput.value = "";
    elements.dataImportInput.click();
  }
);

elements.dataImportInput.addEventListener(
  "change",
  async () => {
    const file =
      elements.dataImportInput.files?.[0];

    if (!file) {
      return;
    }

    const confirmed =
      window.confirm(
        "Importar este backup substituirá o progresso atual. Deseja continuar?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await saveTransferService.importFile(
        file
      );

      window.alert(
        "Backup importado com sucesso. O jogo será recarregado."
      );

      window.location.reload();
    } catch (error) {
      window.alert(
        error?.message ??
          "Não foi possível importar o backup."
      );
    }
  }
);

elements.dataCopyIdButton.addEventListener(
  "click",
  async () => {
    const playerId =
      storageService
        .getPlayerMeta()
        .playerId;

    await saveTransferService.shareText(
      playerId
    );

    showRewardToast({
      icon: "🆔",
      label: "ID copiado",
      name: playerId,
      sound: "ui",
    });
  }
);

elements.dataResetAllButton.addEventListener(
  "click",
  () => {
    const firstConfirmation =
      window.confirm(
        "Isso apagará moedas, skins, XP, recordes, histórico, liga e configurações. Continuar?"
      );

    if (!firstConfirmation) {
      return;
    }

    const finalConfirmation =
      window.confirm(
        "Esta ação não pode ser desfeita sem um backup. Apagar tudo agora?"
      );

    if (!finalConfirmation) {
      return;
    }

    storageService.resetAll();
    window.location.reload();
  }
);

elements.profileBackButton.addEventListener(
  "click",
  closeOverlay
);

elements.profileSeasonButton.addEventListener(
  "click",
  openSeason
);

elements.seasonBackButton.addEventListener(
  "click",
  closeOverlay
);

elements.seasonWeeklyButton.addEventListener(
  "click",
  openWeekly
);

elements.weeklyBackButton.addEventListener(
  "click",
  closeOverlay
);

elements.weeklySeasonButton.addEventListener(
  "click",
  openSeason
);

elements.statsBackButton.addEventListener(
  "click",
  closeOverlay
);

elements.dailyBackButton.addEventListener(
  "click",
  closeOverlay
);

elements.shopBackButton.addEventListener(
  "click",
  closeOverlay
);

elements.dailyShopButton.addEventListener(
  "click",
  openShop
);

elements.shopDailyButton.addEventListener(
  "click",
  openDaily
);

elements.achievementsBackButton.addEventListener(
  "click",
  closeOverlay
);

elements.achievementsResetButton.addEventListener(
  "click",
  () => {
    const confirmed = window.confirm(
      "Deseja apagar todas as conquistas desbloqueadas?"
    );

    if (!confirmed) {
      return;
    }

    achievementSystem.reset();
    renderAchievements();
  }
);

elements.statsResetButton.addEventListener(
  "click",
  () => {
    const confirmed = window.confirm(
      "Deseja realmente apagar todos os recordes locais?"
    );

    if (!confirmed) {
      return;
    }

    currentStats =
      storageService.resetStats();

    renderStats();
  }
);

elements.audioToggleButton.addEventListener(
  "click",
  () => {
    applySettings({
      ...currentSettings,
      muted:
        !currentSettings.muted,
    });

    if (!currentSettings.muted) {
      void audioManager.ensureStarted();
      audioManager.startMusic();
    }
  }
);

elements.menuFullscreenButton.addEventListener(
  "click",
  toggleFullscreen
);

elements.fullscreenHudButton.addEventListener(
  "click",
  toggleFullscreen
);

for (const [input, output] of [
  [
    elements.masterVolumeInput,
    elements.masterVolumeOutput,
  ],
  [
    elements.sfxVolumeInput,
    elements.sfxVolumeOutput,
  ],
  [
    elements.musicVolumeInput,
    elements.musicVolumeOutput,
  ],
]) {
  input.addEventListener(
    "input",
    () => {
      updateRangeOutput(
        input,
        output
      );

      audioManager.applySettings({
        muted:
          elements.mutedInput.checked,
        masterVolume:
          Number(
            elements.masterVolumeInput.value
          ) / 100,
        sfxVolume:
          Number(
            elements.sfxVolumeInput.value
          ) / 100,
        musicVolume:
          Number(
            elements.musicVolumeInput.value
          ) / 100,
      });
    }
  );
}

elements.mutedInput.addEventListener(
  "change",
  () => {
    audioManager.applySettings({
      muted:
        elements.mutedInput.checked,
      masterVolume:
        Number(
          elements.masterVolumeInput.value
        ) / 100,
      sfxVolume:
        Number(
          elements.sfxVolumeInput.value
        ) / 100,
      musicVolume:
        Number(
          elements.musicVolumeInput.value
        ) / 100,
    });
  }
);

elements.installAppButton.addEventListener(
  "click",
  runInstallPrompt
);

elements.installNowButton.addEventListener(
  "click",
  runInstallPrompt
);

elements.installDismissButton.addEventListener(
  "click",
  () => {
    elements.installBanner.hidden =
      true;
  }
);

elements.updateNowButton.addEventListener(
  "click",
  () => {
    pwaManager.applyUpdate();
  }
);

elements.updateDismissButton.addEventListener(
  "click",
  () => {
    elements.updateBanner.hidden =
      true;
  }
);

document.addEventListener(
  "fullscreenchange",
  updateFullscreenButtons
);

window.addEventListener(
  "keydown",
  (event) => {
    if (
      event.code === "Escape" &&
      overlayStack.length > 0
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeOverlay();
      return;
    }

    if (
      event.code !== "F3" ||
      event.repeat
    ) {
      return;
    }

    event.preventDefault();
    debugVisible = !debugVisible;

    elements.debugHud.classList.toggle(
      "debug-hud--hidden",
      !debugVisible
    );
  },
  true
);

document.addEventListener(
  "click",
  (event) => {
    const interactive =
      event.target.closest(
        "button"
      );

    if (!interactive) {
      return;
    }

    void audioManager.ensureStarted();
    audioManager.playUI();
  }
);

window.addEventListener(
  "beforeunload",
  () => {
    storageService.saveSettings(
      currentSettings
    );
  }
);

pwaManager =
  new PwaManager({
    onInstallAvailabilityChange:
      setInstallAvailability,

    onUpdateAvailable:
      showUpdateAvailable,

    onNetworkChange:
      setNetworkStatus,

    onInstalled: () => {
      setInstallAvailability(false);
      elements.installBanner.hidden =
        true;
    },
  });

const pwaBoot =
  pwaManager.initialize();

const cloudBoot =
  (async () => {
    if (
      !isCloudConfigured(
        CLOUD_CONFIG
      )
    ) {
      setOnlineMessage(
        "Modo local • configure o Supabase para ativar a nuvem",
        "idle"
      );
      renderOnlineState();
      return;
    }

    if (!navigator.onLine) {
      setOnlineMessage(
        "Sem internet • usando dados locais",
        "offline"
      );
      renderOnlineState();
      return;
    }

    try {
      const redirectResult =
        await cloudSessionService
          .consumeAuthRedirect();

      if (
        redirectResult.consumed &&
        redirectResult.type ===
          "recovery"
      ) {
        onlineRecoveryMode = true;
        elements.onlineRecoveryMessage.textContent =
          "Link de recuperação validado. Defina sua nova senha.";

        setOnlineMessage(
          "Recuperação de senha ativa",
          "success"
        );

        window.setTimeout(
          openOnline,
          250
        );
      } else if (
        cloudSessionService.isSignedIn
      ) {
        await cloudSessionService
          .validateSession();

        setOnlineMessage(
          "Conta conectada",
          "success"
        );
      } else {
        setOnlineMessage(
          "Online disponível • entre para sincronizar",
          "idle"
        );
      }

      await refreshGlobalLeaderboard({
        silent: true,
      });
    } catch (error) {
      setOnlineMessage(
        error?.message ??
          "Não foi possível validar a sessão online.",
        "error"
      );
    }

    renderOnlineState();
  })();

const fontsReady =
  document.fonts?.ready ??
  Promise.resolve();

Promise.allSettled([
  pwaBoot,
  cloudBoot,
  fontsReady,
]).finally(
  finishLoading
);

window.addEventListener(
  "load",
  () => {
    window.setTimeout(
      finishLoading,
      120
    );
  },
  { once: true }
);

window.setTimeout(
  finishLoading,
  3600
);

updateFullscreenButtons();
