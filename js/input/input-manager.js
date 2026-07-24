import { normalizeVector } from "../utils/math.js";
import { KeyboardInput } from "./keyboard-input.js";
import { VirtualJoystick } from "./virtual-joystick.js";

export class InputManager {
  constructor({
    canvas,
    joystickRoot,
    joystickKnob,
    boostButton,
  }) {
    this.canvas = canvas;
    this.boostButton = boostButton;

    this.pointerDirection = { x: 1, y: 0 };
    this.lastDirection = { x: 1, y: 0 };
    this.activePointerId = null;
    this.boostPointerId = null;
    this.mobileBoostPointerId = null;
    this.pointerBoostPressed = false;
    this.mobileBoostPressed = false;

    this.enabled = false;
    this.boostAvailable = true;
    this.controlMode = "follow";
    this.lastSource = "mouse";

    this.keyboard = new KeyboardInput();
    this.joystick = new VirtualJoystick(
      joystickRoot,
      joystickKnob
    );

    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleBoostPointerDown =
      this.handleBoostPointerDown.bind(this);
    this.handleBoostPointerUp =
      this.handleBoostPointerUp.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);
  }

  initialize() {
    this.keyboard.initialize();
    this.joystick.initialize();

    this.canvas.addEventListener(
      "pointermove",
      this.handlePointerMove
    );
    this.canvas.addEventListener(
      "pointerdown",
      this.handlePointerDown
    );
    this.canvas.addEventListener(
      "pointerup",
      this.handlePointerUp
    );
    this.canvas.addEventListener(
      "pointercancel",
      this.handlePointerUp
    );
    this.canvas.addEventListener(
      "lostpointercapture",
      this.handlePointerUp
    );
    this.canvas.addEventListener(
      "contextmenu",
      this.handleContextMenu
    );

    this.boostButton.addEventListener(
      "pointerdown",
      this.handleBoostPointerDown
    );
    this.boostButton.addEventListener(
      "pointerup",
      this.handleBoostPointerUp
    );
    this.boostButton.addEventListener(
      "pointercancel",
      this.handleBoostPointerUp
    );
    this.boostButton.addEventListener(
      "lostpointercapture",
      this.handleBoostPointerUp
    );

    window.addEventListener("blur", this.handleWindowBlur);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.keyboard.setEnabled(enabled);

    if (!enabled) {
      this.clearBoostState();
    }

    this.updateTouchControlsVisibility();
  }

  setControlMode(mode) {
    this.controlMode =
      mode === "joystick" ? "joystick" : "follow";
    this.updateTouchControlsVisibility();
  }

  setBoostAvailable(available) {
    this.boostAvailable = Boolean(available);
    this.boostButton.classList.toggle(
      "boost-button--blocked",
      !this.boostAvailable
    );

    if (!this.boostAvailable) {
      this.clearBoostState();
    }
  }

  updateTouchControlsVisibility() {
    const touchCapable =
      window.matchMedia?.("(pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0;

    this.joystick.setEnabled(
      this.enabled &&
        this.controlMode === "joystick" &&
        touchCapable
    );

    const showBoost = this.enabled && touchCapable;

    this.boostButton.classList.toggle(
      "boost-button--visible",
      showBoost
    );
    this.boostButton.setAttribute(
      "aria-hidden",
      String(!showBoost)
    );
  }

  reset() {
    this.pointerDirection = { x: 1, y: 0 };
    this.lastDirection = { x: 1, y: 0 };
    this.activePointerId = null;
    this.lastSource = "mouse";
    this.joystick.reset();
    this.clearBoostState();
  }

  handlePointerDown(event) {
    if (!this.enabled) {
      return;
    }

    const isMouse = event.pointerType === "mouse";

    if (isMouse && event.button === 0) {
      this.pointerBoostPressed = true;
      this.boostPointerId = event.pointerId;
    }

    if (
      this.controlMode === "joystick" &&
      !isMouse
    ) {
      return;
    }

    this.activePointerId = event.pointerId;
    this.canvas.setPointerCapture?.(event.pointerId);
    this.updateDirectionFromPointer(event);
  }

  handlePointerMove(event) {
    if (!this.enabled) {
      return;
    }

    const isMouse = event.pointerType === "mouse";
    const isActiveTouch =
      this.controlMode === "follow" &&
      this.activePointerId === event.pointerId;

    if (isMouse || isActiveTouch) {
      this.updateDirectionFromPointer(event);
    }
  }

  handlePointerUp(event) {
    if (this.activePointerId === event.pointerId) {
      this.activePointerId = null;
    }

    if (this.boostPointerId === event.pointerId) {
      this.pointerBoostPressed = false;
      this.boostPointerId = null;
    }
  }

  handleBoostPointerDown(event) {
    if (!this.enabled || !this.boostAvailable) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.mobileBoostPointerId = event.pointerId;
    this.mobileBoostPressed = true;
    this.boostButton.classList.add(
      "boost-button--pressed"
    );
    this.boostButton.setPointerCapture?.(event.pointerId);
  }

  handleBoostPointerUp(event) {
    if (
      this.mobileBoostPointerId !== null &&
      event.pointerId !== this.mobileBoostPointerId
    ) {
      return;
    }

    this.mobileBoostPointerId = null;
    this.mobileBoostPressed = false;
    this.boostButton.classList.remove(
      "boost-button--pressed"
    );
  }

  handleWindowBlur() {
    this.clearBoostState();
  }

  clearBoostState() {
    this.boostPointerId = null;
    this.mobileBoostPointerId = null;
    this.pointerBoostPressed = false;
    this.mobileBoostPressed = false;
    this.boostButton.classList.remove(
      "boost-button--pressed"
    );
  }

  handleContextMenu(event) {
    if (this.enabled) {
      event.preventDefault();
    }
  }

  updateDirectionFromPointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x =
      event.clientX - (rect.left + rect.width / 2);
    const y =
      event.clientY - (rect.top + rect.height / 2);
    const length = Math.hypot(x, y);

    if (length < 10) {
      return;
    }

    this.pointerDirection = normalizeVector(x, y);
    this.lastDirection = this.pointerDirection;
    this.lastSource =
      event.pointerType === "mouse" ? "mouse" : "toque";
  }

  getDirection() {
    const keyboardDirection =
      this.keyboard.getDirection();

    if (keyboardDirection) {
      this.lastDirection = keyboardDirection;
      this.lastSource = "teclado";
      return keyboardDirection;
    }

    const joystickDirection =
      this.joystick.getDirection();

    if (joystickDirection) {
      this.lastDirection = joystickDirection;
      this.lastSource = "joystick";
      return joystickDirection;
    }

    return this.lastDirection;
  }

  isBoostPressed() {
    if (!this.enabled || !this.boostAvailable) {
      return false;
    }

    return (
      this.keyboard.isBoostPressed() ||
      this.pointerBoostPressed ||
      this.mobileBoostPressed
    );
  }

  getLastSource() {
    return this.lastSource;
  }

  destroy() {
    this.keyboard.destroy();
    this.joystick.destroy();

    this.canvas.removeEventListener(
      "pointermove",
      this.handlePointerMove
    );
    this.canvas.removeEventListener(
      "pointerdown",
      this.handlePointerDown
    );
    this.canvas.removeEventListener(
      "pointerup",
      this.handlePointerUp
    );
    this.canvas.removeEventListener(
      "pointercancel",
      this.handlePointerUp
    );
    this.canvas.removeEventListener(
      "lostpointercapture",
      this.handlePointerUp
    );
    this.canvas.removeEventListener(
      "contextmenu",
      this.handleContextMenu
    );

    this.boostButton.removeEventListener(
      "pointerdown",
      this.handleBoostPointerDown
    );
    this.boostButton.removeEventListener(
      "pointerup",
      this.handleBoostPointerUp
    );
    this.boostButton.removeEventListener(
      "pointercancel",
      this.handleBoostPointerUp
    );
    this.boostButton.removeEventListener(
      "lostpointercapture",
      this.handleBoostPointerUp
    );

    window.removeEventListener(
      "blur",
      this.handleWindowBlur
    );
  }
}
