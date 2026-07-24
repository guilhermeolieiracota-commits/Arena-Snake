import { BALANCE_CONFIG } from "../config/balance-config.js";
import { GRAPHICS_CONFIG } from "../config/graphics-config.js";
import {
  exponentialSmoothing,
  clamp,
} from "../utils/math.js";

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
    this.targetZoom = 1;
  }

  snapTo(x, y) {
    this.x = x;
    this.y = y;
  }

  update(
    delta,
    target,
    segmentCount,
    boostIntensity = 0
  ) {
    this.x = exponentialSmoothing(
      this.x,
      target.x,
      GRAPHICS_CONFIG.cameraFollowSpeed,
      delta
    );

    this.y = exponentialSmoothing(
      this.y,
      target.y,
      GRAPHICS_CONFIG.cameraFollowSpeed,
      delta
    );

    const sizeFactor = clamp(
      (segmentCount - 30) / 160,
      0,
      1
    );

    const sizeZoom =
      GRAPHICS_CONFIG.maxZoom -
      (GRAPHICS_CONFIG.maxZoom -
        GRAPHICS_CONFIG.minZoom) *
        sizeFactor;

    this.targetZoom =
      sizeZoom -
      BALANCE_CONFIG.boost
        .cameraZoomReduction *
        clamp(boostIntensity, 0, 1);

    this.zoom = exponentialSmoothing(
      this.zoom,
      this.targetZoom,
      GRAPHICS_CONFIG.zoomFollowSpeed,
      delta
    );
  }

  applyTransform(
    context,
    viewportWidth,
    viewportHeight
  ) {
    context.translate(
      viewportWidth / 2,
      viewportHeight / 2
    );

    context.scale(this.zoom, this.zoom);
    context.translate(-this.x, -this.y);
  }
}
