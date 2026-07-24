import { normalizeVector } from "../utils/math.js";

const DIRECTION_KEYS = new Map([
  ["ArrowUp", { x: 0, y: -1 }],
  ["KeyW", { x: 0, y: -1 }],
  ["ArrowDown", { x: 0, y: 1 }],
  ["KeyS", { x: 0, y: 1 }],
  ["ArrowLeft", { x: -1, y: 0 }],
  ["KeyA", { x: -1, y: 0 }],
  ["ArrowRight", { x: 1, y: 0 }],
  ["KeyD", { x: 1, y: 0 }],
]);

export class KeyboardInput {
  constructor() {
    this.pressed = new Set();
    this.enabled = false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  initialize() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("blur", this.handleBlur);
  }

  setEnabled(enabled) {
    this.enabled = enabled;

    if (!enabled) {
      this.pressed.clear();
    }
  }

  handleKeyDown(event) {
    if (!this.enabled) {
      return;
    }

    if (DIRECTION_KEYS.has(event.code) || event.code === "Space") {
      event.preventDefault();
      this.pressed.add(event.code);
    }
  }

  handleKeyUp(event) {
    this.pressed.delete(event.code);
  }

  handleBlur() {
    this.pressed.clear();
  }

  getDirection() {
    let x = 0;
    let y = 0;

    for (const code of this.pressed) {
      const direction = DIRECTION_KEYS.get(code);

      if (direction) {
        x += direction.x;
        y += direction.y;
      }
    }

    if (x === 0 && y === 0) {
      return null;
    }

    return normalizeVector(x, y);
  }

  isBoostPressed() {
    return this.enabled && this.pressed.has("Space");
  }

  destroy() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("blur", this.handleBlur);
  }
}
