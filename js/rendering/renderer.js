import {
  GRAPHICS_CONFIG,
  QUALITY_PRESETS,
} from "../config/graphics-config.js";
import { BALANCE_CONFIG } from "../config/balance-config.js";
import { FoodRenderer } from "./food-renderer.js";
import { ParticleRenderer } from "./particle-renderer.js";
import { SnakeRenderer } from "./snake-renderer.js";

export class Renderer {
  constructor(canvas) {
    const context =
      canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "Não foi possível criar o contexto 2D do Canvas."
      );
    }

    this.canvas = canvas;
    this.context = context;
    this.cssWidth = 0;
    this.cssHeight = 0;
    this.pixelRatio = 1;
    this.time = 0;
    this.qualityName =
      GRAPHICS_CONFIG.defaultQuality;
    this.quality =
      QUALITY_PRESETS[
        GRAPHICS_CONFIG
          .autoQualityFallback
      ];

    this.snakeRenderer =
      new SnakeRenderer();

    this.foodRenderer =
      new FoodRenderer();

    this.particleRenderer =
      new ParticleRenderer();

    this.backgroundGradient = null;
    this.speedLineSeed = 0;
    this.reducedEffects = false;

    this.resize();
  }

  setQuality(qualityName) {
    const resolvedName =
      qualityName === "auto"
        ? GRAPHICS_CONFIG
            .autoQualityFallback
        : qualityName;

    this.qualityName = qualityName;

    this.quality =
      QUALITY_PRESETS[resolvedName] ??
      QUALITY_PRESETS[
        GRAPHICS_CONFIG
          .autoQualityFallback
      ];

    this.resize();
  }

  getQualityName() {
    return this.qualityName;
  }

  setShowSnakeNames(showNames) {
    this.snakeRenderer.setShowNames(showNames);
  }

  setReducedEffects(reducedEffects) {
    this.reducedEffects = Boolean(reducedEffects);
  }

  resize() {
    this.cssWidth = Math.max(
      window.innerWidth,
      1
    );

    this.cssHeight = Math.max(
      window.innerHeight,
      1
    );

    this.pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      this.quality.maxDevicePixelRatio
    );

    this.canvas.width = Math.floor(
      this.cssWidth * this.pixelRatio
    );

    this.canvas.height = Math.floor(
      this.cssHeight * this.pixelRatio
    );

    this.canvas.style.width =
      `${this.cssWidth}px`;

    this.canvas.style.height =
      `${this.cssHeight}px`;

    this.context.setTransform(
      this.pixelRatio,
      0,
      0,
      this.pixelRatio,
      0,
      0
    );

    this.backgroundGradient =
      this.context.createRadialGradient(
        this.cssWidth * 0.5,
        this.cssHeight * 0.45,
        10,
        this.cssWidth * 0.5,
        this.cssHeight * 0.45,
        Math.max(
          this.cssWidth,
          this.cssHeight
        ) * 0.8
      );

    this.backgroundGradient.addColorStop(
      0,
      "#10243c"
    );

    this.backgroundGradient.addColorStop(
      1,
      "#07111f"
    );
  }

  render(delta, game) {
    this.time += delta;
    this.speedLineSeed += delta;

    this.drawScreenBackground();

    if (!game.player || !game.camera) {
      return;
    }

    const context = this.context;

    context.save();

    game.camera.applyTransform(
      context,
      this.cssWidth,
      this.cssHeight
    );

    this.drawArena(
      context,
      game.camera,
      game.boundaryDanger
    );

    this.foodRenderer.draw(
      context,
      game.foodSystem.getFoods(),
      game.camera,
      this.cssWidth,
      this.cssHeight,
      this.time,
      this.quality
    );

    this.particleRenderer.draw(
      context,
      game.particleSystem.getParticles(),
      game.particleSystem.getTexts(),
      game.camera,
      this.cssWidth,
      this.cssHeight
    );

    const bots = game.botSystem?.getBots() ?? [];

    for (const bot of bots) {
      if (this.isSnakeVisible(bot, game.camera)) {
        this.snakeRenderer.draw(context, bot, this.quality, this.time);
      }
    }

    this.snakeRenderer.draw(
      context,
      game.player,
      this.quality,
      this.time
    );

    context.restore();

    this.drawDirectionIndicator(
      game.player
    );

    this.drawBoostOverlay(
      game.player.boostIntensity,
      game.player.angle
    );

    this.drawBoundaryOverlay(
      game.boundaryDanger
    );
  }

  isSnakeVisible(snake, camera) {
    const halfWidth = this.cssWidth / (camera.zoom * 2);
    const halfHeight = this.cssHeight / (camera.zoom * 2);
    const margin = Math.min(snake.segmentCount * snake.segmentSpacing, 720) + 120;

    return (
      snake.x >= camera.x - halfWidth - margin &&
      snake.x <= camera.x + halfWidth + margin &&
      snake.y >= camera.y - halfHeight - margin &&
      snake.y <= camera.y + halfHeight + margin
    );
  }

  drawScreenBackground() {
    this.context.fillStyle =
      this.backgroundGradient ??
      "#07111f";

    this.context.fillRect(
      0,
      0,
      this.cssWidth,
      this.cssHeight
    );
  }

  drawArena(
    context,
    camera,
    boundaryDanger
  ) {
    const radius =
      BALANCE_CONFIG.worldRadius;

    const gridSize =
      GRAPHICS_CONFIG.worldGridSize;

    context.save();
    context.fillStyle =
      GRAPHICS_CONFIG.arenaFill;

    context.beginPath();
    context.arc(
      0,
      0,
      radius,
      0,
      Math.PI * 2
    );
    context.fill();
    context.clip();

    const halfWorldWidth =
      this.cssWidth /
      (camera.zoom * 2);

    const halfWorldHeight =
      this.cssHeight /
      (camera.zoom * 2);

    const left =
      camera.x -
      halfWorldWidth -
      gridSize;

    const right =
      camera.x +
      halfWorldWidth +
      gridSize;

    const top =
      camera.y -
      halfWorldHeight -
      gridSize;

    const bottom =
      camera.y +
      halfWorldHeight +
      gridSize;

    if (this.quality.gridEnabled) {
      this.drawGrid(
        context,
        camera,
        left,
        right,
        top,
        bottom
      );
    }

    if (!this.reducedEffects) {
      this.drawAmbientDots(
        context,
        camera,
        left,
        right,
        top,
        bottom
      );
    }

    context.restore();
    context.save();

    if (this.quality.glowEnabled) {
      context.shadowColor =
        boundaryDanger > 0.65
          ? "#ff657a"
          : GRAPHICS_CONFIG
              .arenaBorder;

      context.shadowBlur =
        34 / camera.zoom;
    }

    context.strokeStyle =
      boundaryDanger > 0.65
        ? "rgba(255, 101, 122, 0.92)"
        : "rgba(67, 216, 255, 0.78)";

    context.lineWidth =
      9 / camera.zoom;

    context.beginPath();
    context.arc(
      0,
      0,
      radius,
      0,
      Math.PI * 2
    );
    context.stroke();
    context.restore();
  }

  drawGrid(
    context,
    camera,
    left,
    right,
    top,
    bottom
  ) {
    const gridSize =
      GRAPHICS_CONFIG.worldGridSize;

    const startX =
      Math.floor(left / gridSize) *
      gridSize;

    const startY =
      Math.floor(top / gridSize) *
      gridSize;

    context.strokeStyle =
      "rgba(112, 180, 220, 0.075)";

    context.lineWidth =
      1 / camera.zoom;

    context.beginPath();

    for (
      let x = startX;
      x <= right;
      x += gridSize
    ) {
      context.moveTo(x, top);
      context.lineTo(x, bottom);
    }

    for (
      let y = startY;
      y <= bottom;
      y += gridSize
    ) {
      context.moveTo(left, y);
      context.lineTo(right, y);
    }

    context.stroke();
  }

  drawAmbientDots(
    context,
    camera,
    left,
    right,
    top,
    bottom
  ) {
    const spacing =
      this.quality.ambientDotSpacing;

    const startX =
      Math.floor(left / spacing) *
      spacing;

    const startY =
      Math.floor(top / spacing) *
      spacing;

    context.save();
    context.fillStyle =
      "rgba(82, 242, 178, 0.12)";

    for (
      let x = startX;
      x <= right;
      x += spacing
    ) {
      for (
        let y = startY;
        y <= bottom;
        y += spacing
      ) {
        const offset =
          ((x * 17 + y * 29) %
            70) -
          35;

        const dotX = x + offset;
        const dotY =
          y - offset * 0.6;

        if (
          Math.hypot(dotX, dotY) <
          BALANCE_CONFIG.worldRadius -
            80
        ) {
          const pulse =
            1.3 +
            Math.sin(
              this.time * 1.6 +
                (x + y) * 0.01
            ) *
              0.4;

          context.beginPath();
          context.arc(
            dotX,
            dotY,
            pulse / camera.zoom,
            0,
            Math.PI * 2
          );
          context.fill();
        }
      }
    }

    context.restore();
  }

  drawDirectionIndicator(player) {
    const context = this.context;

    const centerX =
      this.cssWidth / 2;

    const centerY =
      this.cssHeight / 2;

    const indicatorDistance =
      64 +
      player.boostIntensity * 11;

    const x =
      centerX +
      Math.cos(player.targetAngle) *
        indicatorDistance;

    const y =
      centerY +
      Math.sin(player.targetAngle) *
        indicatorDistance;

    context.save();
    context.globalAlpha =
      0.48 +
      player.boostIntensity * 0.24;

    context.strokeStyle =
      player.boostIntensity > 0.1
        ? "#ffd966"
        : "#ffffff";

    context.lineWidth = 2;
    context.beginPath();
    context.arc(
      x,
      y,
      5 +
        player.boostIntensity * 2,
      0,
      Math.PI * 2
    );
    context.stroke();
    context.restore();
  }

  drawBoostOverlay(
    intensity,
    angle
  ) {
    if (intensity <= 0.02) {
      return;
    }

    const context = this.context;
    const lineCount =
      this.reducedEffects
        ? Math.max(
            4,
            Math.round(
              this.quality.speedLineCount * 0.45
            )
          )
        : this.quality.speedLineCount;

    const centerX =
      this.cssWidth / 2;

    const centerY =
      this.cssHeight / 2;

    const forwardX = Math.cos(angle);
    const forwardY = Math.sin(angle);
    const sideX = -forwardY;
    const sideY = forwardX;

    context.save();
    context.globalAlpha =
      intensity * 0.34;
    context.strokeStyle =
      "rgba(255, 235, 155, 0.92)";
    context.lineWidth = 1.5;

    const phase =
      this.speedLineSeed * 460;

    for (
      let index = 0;
      index < lineCount;
      index += 1
    ) {
      const lane =
        ((index * 83.37) %
          Math.max(
            this.cssWidth,
            this.cssHeight
          )) -
        Math.max(
          this.cssWidth,
          this.cssHeight
        ) /
          2;

      const depth =
        ((phase +
          index * 97.13) %
          420) -
        90;

      const startX =
        centerX -
        forwardX *
          (120 + depth) +
        sideX * lane;

      const startY =
        centerY -
        forwardY *
          (120 + depth) +
        sideY * lane;

      const length =
        22 +
        intensity * 58 +
        (index % 4) * 7;

      context.beginPath();
      context.moveTo(
        startX,
        startY
      );
      context.lineTo(
        startX -
          forwardX * length,
        startY -
          forwardY * length
      );
      context.stroke();
    }

    if (this.reducedEffects) {
      context.restore();
      return;
    }

    const vignette =
      context.createRadialGradient(
        centerX,
        centerY,
        Math.min(
          this.cssWidth,
          this.cssHeight
        ) * 0.18,
        centerX,
        centerY,
        Math.max(
          this.cssWidth,
          this.cssHeight
        ) * 0.72
      );

    vignette.addColorStop(
      0,
      "rgba(255, 203, 87, 0)"
    );

    vignette.addColorStop(
      1,
      `rgba(255, 159, 67, ${
        intensity * 0.16
      })`
    );

    context.fillStyle = vignette;
    context.fillRect(
      0,
      0,
      this.cssWidth,
      this.cssHeight
    );

    context.restore();
  }

  drawBoundaryOverlay(danger) {
    if (danger <= 0) {
      return;
    }

    const context = this.context;
    const alpha = Math.min(
      0.32,
      danger * 0.32
    );

    const gradient =
      context.createRadialGradient(
        this.cssWidth / 2,
        this.cssHeight / 2,
        Math.min(
          this.cssWidth,
          this.cssHeight
        ) * 0.28,
        this.cssWidth / 2,
        this.cssHeight / 2,
        Math.max(
          this.cssWidth,
          this.cssHeight
        ) * 0.72
      );

    gradient.addColorStop(
      0,
      "rgba(255, 101, 122, 0)"
    );

    gradient.addColorStop(
      1,
      `rgba(255, 101, 122, ${alpha})`
    );

    context.fillStyle = gradient;

    context.fillRect(
      0,
      0,
      this.cssWidth,
      this.cssHeight
    );
  }
}
