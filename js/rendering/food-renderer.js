import { FoodType } from "../entities/food.js";

export class FoodRenderer {
  draw(
    context,
    foods,
    camera,
    viewportWidth,
    viewportHeight,
    time,
    quality
  ) {
    const halfWidth =
      viewportWidth / (camera.zoom * 2) +
      60;

    const halfHeight =
      viewportHeight / (camera.zoom * 2) +
      60;

    const minimumX =
      camera.x - halfWidth;
    const maximumX =
      camera.x + halfWidth;
    const minimumY =
      camera.y - halfHeight;
    const maximumY =
      camera.y + halfHeight;

    for (const food of foods) {
      if (
        food.x < minimumX ||
        food.x > maximumX ||
        food.y < minimumY ||
        food.y > maximumY
      ) {
        continue;
      }

      this.drawFood(
        context,
        food,
        time,
        quality
      );
    }
  }

  drawFood(context, food, time, quality) {
    const isSpecial =
      food.type === FoodType.SPECIAL;

    const isBoostDrop =
      food.type === FoodType.BOOST_DROP;

    const isRemains =
      food.type === FoodType.REMAINS;

    const glowScale =
      Number(food.glowScale) || 1;

    const pulseSpeed = isBoostDrop
      ? 5.2
      : isRemains
        ? 3.2
        : 3.4;

    const pulse =
      1 +
      Math.sin(
        time * pulseSpeed + food.phase
      ) *
        (isBoostDrop
          ? 0.18
          : isRemains
            ? 0.16
            : 0.12);

    const radius = food.radius * pulse;

    context.save();
    context.translate(food.x, food.y);

    context.rotate(
      food.rotation +
        time *
          (isSpecial
            ? 0.8
            : isBoostDrop
              ? -1.25
              : isRemains
                ? 0.42
                : 0.2)
    );

    if (quality.glowEnabled) {
      if (isRemains) {
        context.globalAlpha = 0.22;
        context.fillStyle = food.secondaryColor;
        context.beginPath();
        context.arc(
          0,
          0,
          radius * 2.9 * glowScale,
          0,
          Math.PI * 2
        );
        context.fill();

        context.globalAlpha = 0.18;
        context.fillStyle = food.color;
        context.beginPath();
        context.arc(
          0,
          0,
          radius * 2.15 * glowScale,
          0,
          Math.PI * 2
        );
        context.fill();
      } else {
        context.globalAlpha = isSpecial
          ? 0.34
          : isBoostDrop
            ? 0.28
            : 0.20;

        context.fillStyle =
          food.secondaryColor;

        context.beginPath();
        context.arc(
          0,
          0,
          radius *
            (isSpecial
              ? 2.25
              : isBoostDrop
                ? 2.05
                : 1.85),
          0,
          Math.PI * 2
        );
        context.fill();
      }
    }

    context.globalAlpha = 1;
    context.fillStyle = food.color;

    if (isSpecial) {
      this.drawSpecialShape(
        context,
        radius
      );
    } else if (isBoostDrop) {
      this.drawBoostDropShape(
        context,
        radius
      );
    } else if (isRemains) {
      this.drawRemainsShape(
        context,
        radius
      );

      context.lineWidth =
        Math.max(1.2, radius * 0.12);
      context.strokeStyle =
        "rgba(255, 255, 255, 0.82)";
      context.stroke();

      context.globalAlpha = 0.56;
      context.strokeStyle = food.secondaryColor;
      context.lineWidth =
        Math.max(1, radius * 0.18);
      context.beginPath();
      context.arc(
        0,
        0,
        radius * 1.18,
        0,
        Math.PI * 2
      );
      context.stroke();
      context.globalAlpha = 1;
    } else {
      context.beginPath();
      context.arc(
        0,
        0,
        radius,
        0,
        Math.PI * 2
      );
      context.fill();
    }

    context.fillStyle =
      isRemains
        ? "rgba(255, 255, 255, 0.86)"
        : "rgba(255, 255, 255, 0.72)";

    context.beginPath();
    context.arc(
      -radius * 0.28,
      -radius * 0.32,
      radius * (isRemains ? 0.34 : 0.30),
      0,
      Math.PI * 2
    );
    context.fill();

    context.restore();
  }

  drawSpecialShape(context, radius) {
    context.beginPath();

    for (
      let point = 0;
      point < 10;
      point += 1
    ) {
      const angle =
        -Math.PI / 2 +
        (point / 10) *
          Math.PI *
          2;

      const pointRadius =
        point % 2 === 0
          ? radius
          : radius * 0.56;

      const x =
        Math.cos(angle) * pointRadius;

      const y =
        Math.sin(angle) * pointRadius;

      if (point === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.closePath();
    context.fill();
  }

  drawBoostDropShape(context, radius) {
    context.beginPath();
    context.moveTo(
      -radius * 0.22,
      -radius
    );
    context.lineTo(
      radius * 0.60,
      -radius * 0.20
    );
    context.lineTo(
      radius * 0.12,
      -radius * 0.08
    );
    context.lineTo(
      radius * 0.28,
      radius
    );
    context.lineTo(
      -radius * 0.62,
      radius * 0.18
    );
    context.lineTo(
      -radius * 0.12,
      radius * 0.04
    );
    context.closePath();
    context.fill();
  }

  drawRemainsShape(context, radius) {
    context.beginPath();

    for (
      let point = 0;
      point < 12;
      point += 1
    ) {
      const angle =
        (point / 12) *
        Math.PI *
        2;

      const variation =
        point % 3 === 0
          ? 1.02
          : point % 3 === 1
            ? 0.76
            : 0.92;

      const x =
        Math.cos(angle) *
        radius *
        variation;

      const y =
        Math.sin(angle) *
        radius *
        variation;

      if (point === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.closePath();
    context.fill();
  }
}
