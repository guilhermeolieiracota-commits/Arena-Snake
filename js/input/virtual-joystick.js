import { clamp, normalizeVector } from "../utils/math.js";

export class VirtualJoystick {
  constructor(root, knob) {
    this.root = root;
    this.knob = knob;
    this.enabled = false;
    this.activePointerId = null;
    this.direction = { x: 1, y: 0 };
    this.magnitude = 0;

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
  }

  initialize() {
    this.root.addEventListener("pointerdown", this.handlePointerDown);
    this.root.addEventListener("pointermove", this.handlePointerMove);
    this.root.addEventListener("pointerup", this.handlePointerUp);
    this.root.addEventListener("pointercancel", this.handlePointerUp);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.root.classList.toggle("joystick--visible", enabled);
    this.root.setAttribute("aria-hidden", String(!enabled));

    if (!enabled) {
      this.reset();
    }
  }

  handlePointerDown(event) {
    if (!this.enabled) {
      return;
    }

    event.preventDefault();
    this.activePointerId = event.pointerId;
    this.root.setPointerCapture?.(event.pointerId);
    this.updateFromEvent(event);
  }

  handlePointerMove(event) {
    if (!this.enabled || event.pointerId !== this.activePointerId) {
      return;
    }

    event.preventDefault();
    this.updateFromEvent(event);
  }

  handlePointerUp(event) {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    this.activePointerId = null;
    this.magnitude = 0;
    this.knob.style.transform = "translate(-50%, -50%)";
  }

  updateFromEvent(event) {
    const rect = this.root.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawX = event.clientX - centerX;
    const rawY = event.clientY - centerY;
    const maxRadius = rect.width * 0.32;
    const length = Math.hypot(rawX, rawY);
    const limitedLength = Math.min(length, maxRadius);
    const normalized = normalizeVector(rawX, rawY, this.direction.x, this.direction.y);

    this.direction = normalized;
    this.magnitude = clamp(length / maxRadius, 0, 1);

    const knobX = normalized.x * limitedLength;
    const knobY = normalized.y * limitedLength;

    this.knob.style.transform =
      `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
  }

  getDirection() {
    return this.magnitude > 0.08 ? this.direction : null;
  }

  reset() {
    this.activePointerId = null;
    this.magnitude = 0;
    this.knob.style.transform = "translate(-50%, -50%)";
  }

  destroy() {
    this.root.removeEventListener("pointerdown", this.handlePointerDown);
    this.root.removeEventListener("pointermove", this.handlePointerMove);
    this.root.removeEventListener("pointerup", this.handlePointerUp);
    this.root.removeEventListener("pointercancel", this.handlePointerUp);
  }
}
