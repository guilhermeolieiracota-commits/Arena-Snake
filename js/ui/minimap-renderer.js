import { BALANCE_CONFIG } from "../config/balance-config.js";

export class MinimapRenderer {
  constructor(canvas) {
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "Não foi possível iniciar o minimapa."
      );
    }

    this.canvas = canvas;
    this.context = context;
    this.visible = true;
    const ResizeObserverClass =
      globalThis.ResizeObserver;

    if (ResizeObserverClass) {
      this.resizeObserver =
        new ResizeObserverClass(
          () => this.resize()
        );

      this.resizeObserver.observe(canvas);
      this.removeResizeFallback = null;
    } else {
      const handleResize = () =>
        this.resize();

      window.addEventListener(
        "resize",
        handleResize,
        { passive: true }
      );

      this.resizeObserver = null;
      this.removeResizeFallback = () =>
        window.removeEventListener(
          "resize",
          handleResize
        );
    }

    this.resize();
  }

  setVisible(visible) {
    this.visible = Boolean(visible);
    this.canvas.closest(".minimap")?.classList.toggle(
      "minimap--hidden",
      !this.visible
    );
  }

  resize() {
    const rect =
      this.canvas.getBoundingClientRect();

    const ratio = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    const width = Math.max(
      1,
      Math.round(rect.width * ratio)
    );

    const height = Math.max(
      1,
      Math.round(rect.height * ratio)
    );

    if (
      this.canvas.width !== width ||
      this.canvas.height !== height
    ) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  render(snapshot) {
    if (!this.visible || !snapshot) {
      return;
    }

    this.resize();

    const context = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius =
      Math.min(width, height) * 0.44;

    context.clearRect(
      0,
      0,
      width,
      height
    );

    context.fillStyle =
      "rgba(4, 12, 24, 0.92)";

    context.beginPath();
    context.arc(
      centerX,
      centerY,
      radius,
      0,
      Math.PI * 2
    );
    context.fill();

    context.strokeStyle =
      "rgba(85, 217, 255, 0.58)";

    context.lineWidth = Math.max(
      1.5,
      width * 0.012
    );

    context.beginPath();
    context.arc(
      centerX,
      centerY,
      radius,
      0,
      Math.PI * 2
    );
    context.stroke();

    const mapPoint = (x, y) => ({
      x:
        centerX +
        (x / BALANCE_CONFIG.worldRadius) *
          radius,
      y:
        centerY +
        (y / BALANCE_CONFIG.worldRadius) *
          radius,
    });

    for (const bot of snapshot.bots) {
      const point = mapPoint(
        bot.x,
        bot.y
      );

      context.globalAlpha =
        bot.protected ? 0.50 : 0.86;

      context.fillStyle = bot.color;
      context.beginPath();
      context.arc(
        point.x,
        point.y,
        Math.max(2, width * 0.012),
        0,
        Math.PI * 2
      );
      context.fill();
    }

    const playerPoint = mapPoint(
      snapshot.player.x,
      snapshot.player.y
    );

    context.globalAlpha = 1;
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.arc(
      playerPoint.x,
      playerPoint.y,
      Math.max(3.4, width * 0.021),
      0,
      Math.PI * 2
    );
    context.fill();

    context.strokeStyle =
      snapshot.player.color;

    context.lineWidth = Math.max(
      1.2,
      width * 0.009
    );

    context.beginPath();
    context.arc(
      playerPoint.x,
      playerPoint.y,
      Math.max(5, width * 0.030),
      0,
      Math.PI * 2
    );
    context.stroke();
  }

  destroy() {
    this.resizeObserver?.disconnect();
    this.removeResizeFallback?.();
  }
}
