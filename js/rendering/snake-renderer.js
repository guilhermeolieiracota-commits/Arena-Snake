import { BALANCE_CONFIG } from "../config/balance-config.js";

export class SnakeRenderer {
  constructor() {
    this.showNames = true;
  }

  setShowNames(showNames) {
    this.showNames = Boolean(showNames);
  }

  draw(context, snake, quality, time = 0) {
    if (!snake?.isAlive) {
      return;
    }

    const segments =
      snake.getSegmentPositions();

    context.save();

    if (snake.isProtected()) {
      context.globalAlpha = 0.72;
    }

    context.lineCap = "round";
    context.lineJoin = "round";

    if (
      quality.glowEnabled ||
      snake.boostIntensity > 0.05
    ) {
      this.drawOuterGlow(
        context,
        segments,
        snake
      );
    }

    this.drawSegments(
      context,
      segments,
      snake
    );

    this.drawHead(context, snake);

    if (this.showNames) {
      this.drawName(context, snake);
    }

    if (snake.isProtected()) {
      this.drawSpawnShield(
        context,
        snake,
        time
      );
    }

    context.restore();
  }

  resolveSegmentColor(snake, index) {
    if (
      snake.boostIntensity > 0.2 &&
      index % 6 < 2
    ) {
      return "#ffd966";
    }

    switch (snake.skinPattern) {
      case "solid":
        return snake.primaryColor;

      case "stripes":
        return index % 6 < 3
          ? snake.primaryColor
          : snake.secondaryColor;

      case "waves":
        return index % 8 < 4
          ? snake.primaryColor
          : snake.secondaryColor;

      case "alternating":
      default:
        return index % 4 < 2
          ? snake.primaryColor
          : snake.secondaryColor;
    }
  }

  drawOuterGlow(
    context,
    segments,
    snake
  ) {
    context.save();

    context.globalAlpha =
      0.16 +
      snake.boostIntensity * 0.24;

    context.strokeStyle =
      snake.boostIntensity > 0.1
        ? "#ffd966"
        : snake.secondaryColor;

    context.lineWidth =
      snake.radius *
      (2.45 +
        snake.boostIntensity * 0.8);

    if (snake.boostIntensity > 0.08) {
      context.shadowColor = "#ffcb57";
      context.shadowBlur =
        22 * snake.boostIntensity;
    }

    context.beginPath();

    for (
      let index =
        segments.length - 1;
      index >= 0;
      index -= 1
    ) {
      const segment = segments[index];

      if (
        index ===
        segments.length - 1
      ) {
        context.moveTo(
          segment.x,
          segment.y
        );
      } else {
        context.lineTo(
          segment.x,
          segment.y
        );
      }
    }

    context.stroke();
    context.restore();
  }

  drawSegments(
    context,
    segments,
    snake
  ) {
    for (
      let index =
        segments.length - 1;
      index >= 1;
      index -= 1
    ) {
      const segment = segments[index];

      const taper = Math.max(
        0.48,
        1 -
          index /
            (segments.length * 1.32)
      );

      const radius =
        snake.radius *
        taper *
        (1 +
          snake.boostIntensity *
            0.035);

      context.fillStyle =
        this.resolveSegmentColor(
          snake,
          index
        );

      context.beginPath();
      context.arc(
        segment.x,
        segment.y,
        radius,
        0,
        Math.PI * 2
      );
      context.fill();

      context.fillStyle =
        "rgba(255, 255, 255, 0.12)";

      context.beginPath();
      context.arc(
        segment.x -
          radius * 0.27,
        segment.y -
          radius * 0.29,
        radius * 0.28,
        0,
        Math.PI * 2
      );
      context.fill();
    }
  }

  drawHead(context, snake) {
    const headRadius =
      snake.radius *
      (1.12 +
        snake.boostIntensity * 0.03);

    const forwardX =
      Math.cos(snake.angle);

    const forwardY =
      Math.sin(snake.angle);

    const sideX = -forwardY;
    const sideY = forwardX;

    context.fillStyle =
      snake.boostIntensity > 0.35
        ? "#7df6bf"
        : snake.primaryColor;

    context.beginPath();
    context.arc(
      snake.x,
      snake.y,
      headRadius,
      0,
      Math.PI * 2
    );
    context.fill();

    context.fillStyle =
      "rgba(255, 255, 255, 0.16)";

    context.beginPath();
    context.arc(
      snake.x -
        headRadius * 0.25,
      snake.y -
        headRadius * 0.30,
      headRadius * 0.34,
      0,
      Math.PI * 2
    );
    context.fill();

    const eyeForward =
      headRadius *
      (snake.eyeStyle === "wide"
        ? 0.45
        : 0.48);

    const eyeSide =
      headRadius *
      (snake.eyeStyle === "wide"
        ? 0.50
        : 0.43);

    const eyeRadius =
      headRadius *
      (snake.eyeStyle === "focused"
        ? 0.25
        : 0.29);

    const pupilRadius =
      eyeRadius *
      (snake.eyeStyle === "focused"
        ? 0.54
        : 0.46);

    for (const side of [-1, 1]) {
      const eyeX =
        snake.x +
        forwardX * eyeForward +
        sideX * eyeSide * side;

      const eyeY =
        snake.y +
        forwardY * eyeForward +
        sideY * eyeSide * side;

      context.fillStyle = "#ffffff";
      context.beginPath();
      context.arc(
        eyeX,
        eyeY,
        eyeRadius,
        0,
        Math.PI * 2
      );
      context.fill();

      context.fillStyle = "#07111f";
      context.beginPath();
      context.arc(
        eyeX +
          forwardX *
            eyeRadius *
            0.31,
        eyeY +
          forwardY *
            eyeRadius *
            0.31,
        pupilRadius,
        0,
        Math.PI * 2
      );
      context.fill();
    }

    context.strokeStyle =
      "rgba(5, 28, 24, 0.72)";

    context.lineWidth = 2.2;
    context.beginPath();
    context.arc(
      snake.x +
        forwardX *
          headRadius *
          0.34,
      snake.y +
        forwardY *
          headRadius *
          0.34,
      headRadius * 0.22,
      snake.angle + 0.35,
      snake.angle +
        Math.PI -
        0.35
    );
    context.stroke();
  }

  drawName(context, snake) {
    context.save();

    context.font =
      snake.isPlayer
        ? "800 15px Inter, system-ui, sans-serif"
        : "700 13px Inter, system-ui, sans-serif";

    context.textAlign = "center";
    context.textBaseline = "bottom";

    context.fillStyle = snake.isPlayer
      ? "rgba(255, 255, 255, 0.96)"
      : "rgba(232, 239, 255, 0.88)";

    context.shadowColor =
      "rgba(0, 0, 0, 0.70)";

    context.shadowBlur = 8;

    context.fillText(
      snake.name,
      snake.x,
      snake.y -
        snake.radius * 1.9
    );

    if (
      !snake.isPlayer &&
      snake.profileLabel
    ) {
      context.font =
        "600 9px Inter, system-ui, sans-serif";

      context.fillStyle =
        "rgba(200, 213, 235, 0.68)";

      context.fillText(
        snake.profileLabel,
        snake.x,
        snake.y -
          snake.radius * 1.9 -
          15
      );
    }

    context.restore();
  }

  drawSpawnShield(
    context,
    snake,
    time
  ) {
    const pulse =
      1 +
      Math.sin(
        time *
          BALANCE_CONFIG.spawnProtection
            .shieldPulseSpeed
      ) *
        0.08;

    context.save();
    context.globalAlpha = 0.86;
    context.strokeStyle =
      snake.isPlayer
        ? "#ffffff"
        : snake.secondaryColor;

    context.lineWidth = 2.5;
    context.setLineDash([8, 7]);
    context.lineDashOffset = -time * 20;

    context.beginPath();
    context.arc(
      snake.x,
      snake.y,
      snake.radius * 1.85 * pulse,
      0,
      Math.PI * 2
    );
    context.stroke();

    context.globalAlpha = 0.18;
    context.fillStyle =
      snake.secondaryColor;

    context.beginPath();
    context.arc(
      snake.x,
      snake.y,
      snake.radius * 1.72 * pulse,
      0,
      Math.PI * 2
    );
    context.fill();

    context.restore();
  }
}
