const MAX_DELTA_SECONDS = 0.05;

export class GameLoop {
  constructor({ update, render, onFpsUpdate }) {
    this.update = update;
    this.render = render;
    this.onFpsUpdate = onFpsUpdate;

    this.running = false;
    this.paused = false;
    this.lastTimestamp = 0;
    this.frameRequestId = null;
    this.fpsAccumulator = 0;
    this.fpsFrames = 0;
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.paused = false;
    this.lastTimestamp = performance.now();
    this.frameRequestId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;

    if (this.frameRequestId !== null) {
      cancelAnimationFrame(this.frameRequestId);
      this.frameRequestId = null;
    }
  }

  setPaused(paused) {
    this.paused = paused;
    this.lastTimestamp = performance.now();
  }

  tick = (timestamp) => {
    if (!this.running) {
      return;
    }

    const rawDelta = (timestamp - this.lastTimestamp) / 1000;
    const delta = Math.min(Math.max(rawDelta, 0), MAX_DELTA_SECONDS);
    this.lastTimestamp = timestamp;

    if (!this.paused) {
      this.update(delta);
    }

    this.render(delta);
    this.updateFps(rawDelta);
    this.frameRequestId = requestAnimationFrame(this.tick);
  };

  updateFps(delta) {
    if (delta <= 0 || delta > 1) {
      return;
    }

    this.fpsAccumulator += delta;
    this.fpsFrames += 1;

    if (this.fpsAccumulator >= 0.5) {
      const fps = Math.round(this.fpsFrames / this.fpsAccumulator);
      this.onFpsUpdate?.(fps);
      this.fpsAccumulator = 0;
      this.fpsFrames = 0;
    }
  }
}
