import { GameState } from "./game-state.js";
import { GameLoop } from "./game-loop.js";
import { Renderer } from "../rendering/renderer.js";
import { Camera } from "../rendering/camera.js";
import { InputManager } from "../input/input-manager.js";
import { PlayerSnake } from "../entities/player-snake.js";
import { FoodType } from "../entities/food.js";
import { BALANCE_CONFIG } from "../config/balance-config.js";
import { DEFAULT_SKIN_ID } from "../skins/skin-catalog.js";
import { BotSystem } from "../systems/bot-system.js";
import { BoostSystem } from "../systems/boost-system.js";
import { CollisionSystem } from "../systems/collision-system.js";
import { DeathSystem } from "../systems/death-system.js";
import { FoodSystem } from "../systems/food-system.js";
import { ParticleSystem } from "../systems/particle-system.js";
import { PredationSystem } from "../systems/predation-system.js";
import { RankingSystem } from "../systems/ranking-system.js";
import { clamp } from "../utils/math.js";

const MINIMAP_UPDATE_INTERVAL = 0.14;
const COMMON_AUDIO_INTERVAL = 0.055;

export class Game {
  constructor({
    canvas,
    joystickRoot,
    joystickKnob,
    boostButton,
    onStateChange,
    onFpsUpdate,
    onPlayerUpdate,
    onRankingUpdate,
    onKillFeedUpdate,
    onMinimapUpdate,
    onAudioEvent,
    onGameOver,
  }) {
    this.canvas = canvas;
    this.onStateChange = onStateChange;
    this.onPlayerUpdate = onPlayerUpdate;
    this.onRankingUpdate = onRankingUpdate;
    this.onKillFeedUpdate = onKillFeedUpdate;
    this.onMinimapUpdate = onMinimapUpdate;
    this.onAudioEvent = onAudioEvent;
    this.onGameOver = onGameOver;

    this.state = GameState.MENU;
    this.elapsedTime = 0;
    this.nickname = "Jogador";
    this.skinId = DEFAULT_SKIN_ID;
    this.boundaryDanger = 0;
    this.qualityName = "auto";
    this.difficultyId = "normal";
    this.showSnakeNames = true;
    this.reducedEffects = false;

    this.lastRankingVersion = -1;
    this.lastKillFeedSignature = "";
    this.lastPlayerBoostActive = false;
    this.lastCollectionAudioTime = -Infinity;
    this.minimapAccumulator = 0;

    this.renderer = new Renderer(canvas);
    this.camera = new Camera();

    this.input = new InputManager({
      canvas,
      joystickRoot,
      joystickKnob,
      boostButton,
    });

    this.foodSystem = new FoodSystem({
      qualityName: this.qualityName,
    });

    this.particleSystem =
      new ParticleSystem({
        qualityName: this.qualityName,
      });

    this.botSystem = new BotSystem({
      qualityName: this.qualityName,
      difficultyId: this.difficultyId,
    });

    this.boostSystem = new BoostSystem();
    this.collisionSystem =
      new CollisionSystem();
    this.predationSystem =
      new PredationSystem();
    this.deathSystem = new DeathSystem();
    this.rankingSystem =
      new RankingSystem();

    this.player = null;

    this.loop = new GameLoop({
      update: this.update,
      render: this.render,
      onFpsUpdate,
    });

    this.handleResize =
      this.handleResize.bind(this);

    this.handleVisibilityChange =
      this.handleVisibilityChange.bind(this);

    this.handleKeyDown =
      this.handleKeyDown.bind(this);
  }

  initialize() {
    this.input.initialize();

    window.addEventListener(
      "resize",
      this.handleResize
    );

    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );

    window.addEventListener(
      "keydown",
      this.handleKeyDown
    );

    this.createPlayer();
    this.foodSystem.reset();
    this.boostSystem.reset();
    this.collisionSystem.reset();
    this.predationSystem.reset();
    this.rankingSystem.reset();
    this.deathSystem.reset();

    this.loop.start();
    this.setState(GameState.MENU);
  }

  configure({
    controlMode = "follow",
    quality = "auto",
    difficulty = "normal",
    skinId = DEFAULT_SKIN_ID,
    showSnakeNames = true,
    reducedEffects = false,
  } = {}) {
    this.qualityName = quality;
    this.difficultyId = difficulty;
    this.skinId = skinId;
    this.showSnakeNames =
      Boolean(showSnakeNames);
    this.reducedEffects =
      Boolean(reducedEffects);

    this.input.setControlMode(
      controlMode
    );

    this.renderer.setQuality(quality);
    this.renderer.setShowSnakeNames(
      this.showSnakeNames
    );
    this.renderer.setReducedEffects(
      this.reducedEffects
    );

    this.foodSystem.setQuality(quality);

    this.particleSystem.setQuality(
      quality
    );
    this.particleSystem.setReducedEffects(
      this.reducedEffects
    );

    this.botSystem.setDifficulty(
      difficulty
    );

    this.botSystem.setQuality(
      quality,
      this.player
    );

    this.setPlayerSkin(skinId);
  }

  createPlayer() {
    this.player = new PlayerSnake({
      name: this.nickname,
      x: 0,
      y: 0,
      angle: 0,
      skinId: this.skinId,
    });

    this.camera.snapTo(
      this.player.x,
      this.player.y
    );
  }

  setNickname(nickname) {
    this.nickname = nickname;

    if (this.player) {
      this.player.name = nickname;
    }
  }

  setPlayerSkin(skinId) {
    this.skinId = skinId;

    if (this.player) {
      this.player.applySkin(skinId);
    }
  }

  start(nickname = "Jogador") {
    this.setNickname(nickname);
    this.elapsedTime = 0;
    this.boundaryDanger = 0;
    this.minimapAccumulator = 0;
    this.lastPlayerBoostActive = false;
    this.lastCollectionAudioTime =
      -Infinity;

    this.input.reset();
    this.createPlayer();
    this.foodSystem.reset();
    this.particleSystem.reset();
    this.boostSystem.reset();
    this.collisionSystem.reset();
    this.predationSystem.reset();
    this.deathSystem.reset();
    this.rankingSystem.reset();

    this.botSystem.setDifficulty(
      this.difficultyId
    );

    this.botSystem.setQuality(
      this.qualityName,
      this.player
    );

    this.botSystem.reset(
      this.player,
      this.particleSystem
    );

    this.input.setEnabled(true);
    this.input.setBoostAvailable(true);

    this.loop.setPaused(false);
    this.setState(GameState.PLAYING);

    this.forceRankingUpdate();
    this.emitKillFeedIfChanged(true);
    this.emitMinimapSnapshot(true);
    this.emitPlayerUpdate();
  }

  restart() {
    this.elapsedTime = 0;
    this.boundaryDanger = 0;
    this.minimapAccumulator = 0;
    this.lastPlayerBoostActive = false;
    this.lastCollectionAudioTime =
      -Infinity;

    this.input.reset();

    this.player.reset({
      x: 0,
      y: 0,
      angle: 0,
      mass:
        BALANCE_CONFIG.initialPlayerMass,
    });

    this.player.name = this.nickname;
    this.player.applySkin(this.skinId);

    this.foodSystem.reset();
    this.particleSystem.reset();
    this.boostSystem.reset();
    this.collisionSystem.reset();
    this.predationSystem.reset();
    this.deathSystem.reset();
    this.rankingSystem.reset();

    this.botSystem.reset(
      this.player,
      this.particleSystem
    );

    this.camera.snapTo(
      this.player.x,
      this.player.y
    );

    this.input.setEnabled(true);
    this.input.setBoostAvailable(true);

    this.loop.setPaused(false);
    this.setState(GameState.PLAYING);

    this.forceRankingUpdate();
    this.emitKillFeedIfChanged(true);
    this.emitMinimapSnapshot(true);
    this.emitPlayerUpdate();
  }

  pause() {
    if (
      this.state !== GameState.PLAYING
    ) {
      return;
    }

    this.input.setEnabled(false);
    this.loop.setPaused(true);
    this.setState(GameState.PAUSED);
  }

  resume() {
    if (
      this.state !== GameState.PAUSED
    ) {
      return;
    }

    this.input.setEnabled(true);
    this.input.setBoostAvailable(
      this.boostSystem.getState().available
    );

    this.loop.setPaused(false);
    this.setState(GameState.PLAYING);
  }

  returnToMenu() {
    this.input.setEnabled(false);
    this.loop.setPaused(false);
    this.setState(GameState.MENU);
  }

  update = (delta) => {
    if (
      this.state !== GameState.PLAYING ||
      !this.player?.isAlive
    ) {
      return;
    }

    this.elapsedTime += delta;
    this.minimapAccumulator += delta;
    this.deathSystem.update(delta);

    const requestedDirection =
      this.input.getDirection();

    const movementDirection =
      this.updateBoundaryDanger(
        requestedDirection
      );

    const boostState =
      this.boostSystem.update({
        delta,
        player: this.player,
        requested:
          this.input.isBoostPressed(),
        foodSystem: this.foodSystem,
      });

    this.handleBoostAudio(
      boostState.active
    );

    this.input.setBoostAvailable(
      boostState.available
    );

    this.player.updateFromDirection(
      delta,
      movementDirection
    );

    const collectedEvents =
      this.foodSystem.updateCollector(
        this.player,
        delta
      );

    for (const event of collectedEvents) {
      this.player.addFood(event);

      this.particleSystem.spawnCollection(
        event
      );

      this.emitCollectionAudio(event);
    }

    this.particleSystem.spawnBoostTrail(
      this.player,
      boostState.intensity,
      delta
    );

    this.botSystem.update({
      delta,
      player: this.player,
      foodSystem: this.foodSystem,
      particleSystem:
        this.particleSystem,
    });

    this.particleSystem.update(delta);

    const snakes =
      this.botSystem.getAllSnakes(
        this.player
      );

    const rankingChanged =
      this.rankingSystem.update(
        delta,
        snakes
      );

    if (rankingChanged) {
      this.emitRankingIfChanged();
    }

    const collisionResult =
      this.collisionSystem.detect(
        snakes,
        delta
      );

    const biteResults =
      this.predationSystem.process({
        events: collisionResult.bites,
        particleSystem:
          this.particleSystem,
      });

    if (biteResults.length > 0) {
      const playerBites =
        biteResults.filter(
          (result) =>
            result.predator === this.player
        ).length;

      if (playerBites > 0) {
        this.emitAudio(
          "special",
          Math.min(
            1.35,
            0.92 + playerBites * 0.08
          )
        );
      }

      this.rankingSystem.update(
        0,
        snakes,
        true
      );

      this.emitRankingIfChanged(true);
      this.emitMinimapSnapshot(true);
    }

    const collisionEvents =
      collisionResult.deaths;

    if (collisionEvents.length > 0) {
      this.rankingSystem.update(
        0,
        snakes,
        true
      );

      const deathResults =
        this.deathSystem.process({
          events: collisionEvents,
          foodSystem: this.foodSystem,
          particleSystem:
            this.particleSystem,
          botSystem: this.botSystem,
          rankingSystem:
            this.rankingSystem,
        });

      const playerEliminations =
        deathResults.filter(
          (result) =>
            result.killer === this.player &&
            result.awardElimination
        ).length;

      if (playerEliminations > 0) {
        this.emitAudio(
          "elimination",
          Math.min(
            1.4,
            0.9 +
              playerEliminations * 0.12
          )
        );
      }

      const survivors =
        this.botSystem.getAllSnakes(
          this.player
        );

      this.rankingSystem.update(
        0,
        survivors,
        true
      );

      this.emitRankingIfChanged(true);
      this.emitKillFeedIfChanged(true);
      this.emitMinimapSnapshot(true);

      const playerDeath =
        deathResults.find(
          (result) =>
            result.victim === this.player
        );

      if (playerDeath) {
        this.emitAudio("death", 1.15);

        this.handlePlayerDeath(
          playerDeath
        );

        this.emitPlayerUpdate();
        return;
      }
    }

    this.camera.update(
      delta,
      this.player,
      this.player.segmentCount,
      boostState.intensity
    );

    this.emitMinimapSnapshot();
    this.emitKillFeedIfChanged();
    this.emitPlayerUpdate();
  };

  render = (delta) => {
    this.renderer.render(delta, this);
  };

  updateBoundaryDanger(direction) {
    const distanceFromCenter =
      Math.hypot(
        this.player.x,
        this.player.y
      );

    const warningStart =
      BALANCE_CONFIG.worldRadius -
      BALANCE_CONFIG
        .boundaryWarningDistance;

    this.boundaryDanger = clamp(
      (distanceFromCenter -
        warningStart) /
        BALANCE_CONFIG
          .boundaryWarningDistance,
      0,
      1
    );

    return direction;
  }

  handleBoostAudio(active) {
    if (
      active ===
      this.lastPlayerBoostActive
    ) {
      return;
    }

    this.lastPlayerBoostActive =
      active;

    this.emitAudio(
      active
        ? "boostStart"
        : "boostStop",
      0.9
    );
  }

  emitCollectionAudio(event) {
    const isSpecial =
      event.type === FoodType.SPECIAL;

    const isRemains =
      event.type === FoodType.REMAINS;

    if (
      !isSpecial &&
      !isRemains &&
      this.elapsedTime -
        this.lastCollectionAudioTime <
        COMMON_AUDIO_INTERVAL
    ) {
      return;
    }

    this.lastCollectionAudioTime =
      this.elapsedTime;

    this.emitAudio(
      isSpecial
        ? "special"
        : isRemains
          ? "remains"
          : "collect",
      isSpecial ? 1.1 : 0.72
    );
  }

  emitAudio(type, intensity = 1) {
    this.onAudioEvent?.({
      type,
      intensity,
    });
  }

  handlePlayerDeath(result) {
    this.input.setEnabled(false);
    this.loop.setPaused(true);
    this.setState(GameState.GAME_OVER);

    this.onGameOver?.({
      reason: result.reason,
      killerName:
        result.killer?.name ?? null,
      score: this.player.score,
      maximumMass:
        this.player.maximumMass,
      eliminations:
        this.player.eliminations,
      collected:
        this.player.collectedCount,
      elapsedTime: this.elapsedTime,
      rank:
        result.rankBeforeDeath,
      totalCompetitors:
        result.totalCompetitors,
    });
  }

  forceRankingUpdate() {
    const snakes =
      this.botSystem.getAllSnakes(
        this.player
      );

    this.rankingSystem.update(
      0,
      snakes,
      true
    );

    this.emitRankingIfChanged(true);
  }

  emitRankingIfChanged(force = false) {
    const version =
      this.rankingSystem.getVersion();

    if (
      !force &&
      version === this.lastRankingVersion
    ) {
      return;
    }

    this.lastRankingVersion = version;

    this.onRankingUpdate?.({
      entries:
        this.rankingSystem.getVisibleEntries(),
      playerRank:
        this.rankingSystem.getRank(
          this.player
        ),
      total:
        this.rankingSystem.getTotal(),
    });
  }

  emitKillFeedIfChanged(force = false) {
    const feed =
      this.deathSystem.getKillFeed();

    const signature = feed
      .map((entry) => entry.id)
      .join("|");

    if (
      !force &&
      signature ===
        this.lastKillFeedSignature
    ) {
      return;
    }

    this.lastKillFeedSignature =
      signature;

    this.onKillFeedUpdate?.(
      feed.map((entry) => ({
        id: entry.id,
        text: entry.text,
        color: entry.color,
      }))
    );
  }

  emitMinimapSnapshot(force = false) {
    if (
      !force &&
      this.minimapAccumulator <
        MINIMAP_UPDATE_INTERVAL
    ) {
      return;
    }

    this.minimapAccumulator = 0;

    this.onMinimapUpdate?.({
      player: {
        x: this.player.x,
        y: this.player.y,
        color:
          this.player.primaryColor,
        protected:
          this.player.isProtected(),
      },
      bots: this.botSystem
        .getBots()
        .map((bot) => ({
          x: bot.x,
          y: bot.y,
          color: bot.primaryColor,
          protected: bot.isProtected(),
        })),
    });
  }

  emitPlayerUpdate() {
    const foodStats =
      this.foodSystem.getStats();

    const particleStats =
      this.particleSystem.getStats();

    const boostState =
      this.boostSystem.getState();

    const botStats =
      this.botSystem.getStats();

    const collisionStats =
      this.collisionSystem.getStats();

    this.onPlayerUpdate?.({
      x: this.player.x,
      y: this.player.y,
      speed: this.player.speed,
      length: this.player.segmentCount,
      targetLength:
        this.player.targetSegmentCount,
      mass: this.player.mass,
      score: this.player.score,
      collected:
        this.player.collectedCount,
      eliminations:
        this.player.eliminations,
      maximumMass:
        this.player.maximumMass,
      protectionRemaining:
        this.player
          .spawnProtectionRemaining,
      zoom: this.camera.zoom,
      inputSource:
        this.input.getLastSource(),
      boundaryDanger:
        this.boundaryDanger,
      quality:
        this.renderer.getQualityName(),
      foodActive: foodStats.active,
      remainsActive:
        foodStats.remains,
      boostDrops:
        foodStats.boostDrops,
      foodPooled: foodStats.pooled,
      effectsActive:
        particleStats.active,
      boostActive: boostState.active,
      boostAvailable:
        boostState.available,
      boostIntensity:
        boostState.intensity,
      botsActive: botStats.active,
      botsWaiting:
        botStats.waitingRespawn,
      botProfiles: botStats.profiles,
      difficultyId:
        botStats.difficultyId,
      collisionBodies:
        collisionStats.bodyProxies,
      collisionCells:
        collisionStats.gridCells,
      totalDeaths:
        this.deathSystem
          .getTotalDeaths(),
      playerRank:
        this.rankingSystem.getRank(
          this.player
        ),
      rankingTotal:
        this.rankingSystem.getTotal(),
      elapsedTime:
        this.elapsedTime,
    });
  }

  setState(nextState) {
    this.state = nextState;
    this.onStateChange?.(nextState);
  }

  handleResize() {
    this.renderer.resize();

    this.input.updateTouchControlsVisibility();
  }

  handleVisibilityChange() {
    if (
      document.hidden &&
      this.state === GameState.PLAYING
    ) {
      this.pause();
    }
  }

  handleKeyDown(event) {
    if (event.code !== "Escape") {
      return;
    }

    if (
      this.state === GameState.PLAYING
    ) {
      this.pause();
    } else if (
      this.state === GameState.PAUSED
    ) {
      this.resume();
    }
  }

  destroy() {
    this.loop.stop();
    this.input.destroy();

    window.removeEventListener(
      "resize",
      this.handleResize
    );

    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );

    window.removeEventListener(
      "keydown",
      this.handleKeyDown
    );
  }
}
