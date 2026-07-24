import { clamp, normalizeVector } from "../utils/math.js";

export class VirtualJoystick {
  constructor(
    root,
    knob,
    activationSurface = root
  ) {
    this.root = root;
    this.knob = knob;
    this.activationSurface =
      activationSurface;

    this.enabled = false;
    this.activePointerId = null;
    this.origin = {
      x: 0,
      y: 0,
    };
    this.direction = {
      x: 1,
      y: 0,
    };
    this.magnitude = 0;

    this.handlePointerDown =
      this.handlePointerDown.bind(this);
    this.handlePointerMove =
      this.handlePointerMove.bind(this);
    this.handlePointerUp =
      this.handlePointerUp.bind(this);
  }

  initialize() {
    this.activationSurface.addEventListener(
      "pointerdown",
      this.handlePointerDown
    );

    this.activationSurface.addEventListener(
      "pointermove",
      this.handlePointerMove
    );

    this.activationSurface.addEventListener(
      "pointerup",
      this.handlePointerUp
    );

    this.activationSurface.addEventListener(
      "pointercancel",
      this.handlePointerUp
    );

    this.activationSurface.addEventListener(
      "lostpointercapture",
      this.handlePointerUp
    );
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    this.root.classList.toggle(
      "joystick--enabled",
      this.enabled
    );

    if (!this.enabled) {
      this.reset();
    }
  }

  handlePointerDown(event) {
    if (
      !this.enabled ||
      event.pointerType === "mouse" ||
      this.activePointerId !== null
    ) {
      return;
    }

    event.preventDefault();

    this.activePointerId =
      event.pointerId;

    this.origin = {
      x: event.clientX,
      y: event.clientY,
    };

    this.root.style.left =
      `${this.origin.x}px`;

    this.root.style.top =
      `${this.origin.y}px`;

    this.root.classList.add(
      "joystick--visible",
      "joystick--active"
    );

    this.root.setAttribute(
      "aria-hidden",
      "false"
    );

    this.activationSurface
      .setPointerCapture?.(
        event.pointerId
      );

    this.magnitude = 0;

    this.knob.style.transform =
      "translate(-50%, -50%)";
  }

  handlePointerMove(event) {
    if (
      !this.enabled ||
      event.pointerId !==
        this.activePointerId
    ) {
      return;
    }

    event.preventDefault();
    this.updateFromEvent(event);
  }

  handlePointerUp(event) {
    if (
      event.pointerId !==
      this.activePointerId
    ) {
      return;
    }

    this.activePointerId = null;
    this.magnitude = 0;

    this.root.classList.remove(
      "joystick--visible",
      "joystick--active"
    );

    this.root.setAttribute(
      "aria-hidden",
      "true"
    );

    this.knob.style.transform =
      "translate(-50%, -50%)";
  }

  updateFromEvent(event) {
    const rawX =
      event.clientX -
      this.origin.x;

    const rawY =
      event.clientY -
      this.origin.y;

    const rect =
      this.root.getBoundingClientRect();

    const maxRadius =
      Math.max(
        30,
        rect.width * 0.32
      );

    const length =
      Math.hypot(
        rawX,
        rawY
      );

    if (length < 2) {
      this.magnitude = 0;
      return;
    }

    const limitedLength =
      Math.min(
        length,
        maxRadius
      );

    const normalized =
      normalizeVector(
        rawX,
        rawY,
        this.direction.x,
        this.direction.y
      );

    this.direction =
      normalized;

    this.magnitude =
      clamp(
        length / maxRadius,
        0,
        1
      );

    const knobX =
      normalized.x *
      limitedLength;

    const knobY =
      normalized.y *
      limitedLength;

    this.knob.style.transform =
      `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
  }

  getDirection() {
    return this.magnitude > 0.08
      ? this.direction
      : null;
  }

  reset() {
    this.activePointerId = null;
    this.magnitude = 0;

    this.root.classList.remove(
      "joystick--visible",
      "joystick--active"
    );

    this.root.setAttribute(
      "aria-hidden",
      "true"
    );

    this.knob.style.transform =
      "translate(-50%, -50%)";
  }

  destroy() {
    this.activationSurface.removeEventListener(
      "pointerdown",
      this.handlePointerDown
    );

    this.activationSurface.removeEventListener(
      "pointermove",
      this.handlePointerMove
    );

    this.activationSurface.removeEventListener(
      "pointerup",
      this.handlePointerUp
    );

    this.activationSurface.removeEventListener(
      "pointercancel",
      this.handlePointerUp
    );

    this.activationSurface.removeEventListener(
      "lostpointercapture",
      this.handlePointerUp
    );
  }
}
