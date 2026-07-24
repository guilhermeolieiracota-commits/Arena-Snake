export class PwaManager {
  constructor({
    onInstallAvailabilityChange,
    onUpdateAvailable,
    onNetworkChange,
    onInstalled,
  } = {}) {
    this.onInstallAvailabilityChange =
      onInstallAvailabilityChange;
    this.onUpdateAvailable =
      onUpdateAvailable;
    this.onNetworkChange =
      onNetworkChange;
    this.onInstalled = onInstalled;

    this.registration = null;
    this.installPromptEvent = null;
    this.refreshing = false;

    this.handleBeforeInstallPrompt =
      this.handleBeforeInstallPrompt.bind(
        this
      );

    this.handleAppInstalled =
      this.handleAppInstalled.bind(this);

    this.handleOnlineChange =
      this.handleOnlineChange.bind(this);

    this.handleControllerChange =
      this.handleControllerChange.bind(
        this
      );
  }

  async initialize() {
    window.addEventListener(
      "beforeinstallprompt",
      this.handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      this.handleAppInstalled
    );

    window.addEventListener(
      "online",
      this.handleOnlineChange
    );

    window.addEventListener(
      "offline",
      this.handleOnlineChange
    );

    navigator.serviceWorker?.addEventListener(
      "controllerchange",
      this.handleControllerChange
    );

    this.handleOnlineChange();

    if (
      !("serviceWorker" in navigator) ||
      !window.isSecureContext
    ) {
      return null;
    }

    try {
      this.registration =
        await navigator.serviceWorker.register(
          "./service-worker.js",
          {
            scope: "./",
            updateViaCache: "none",
          }
        );

      this.watchRegistration(
        this.registration
      );

      await this.registration.update();

      return this.registration;
    } catch (error) {
      console.warn(
        "Service Worker não registrado:",
        error
      );

      return null;
    }
  }

  watchRegistration(registration) {
    if (
      registration.waiting &&
      navigator.serviceWorker.controller
    ) {
      this.onUpdateAvailable?.();
    }

    registration.addEventListener(
      "updatefound",
      () => {
        const worker =
          registration.installing;

        if (!worker) {
          return;
        }

        worker.addEventListener(
          "statechange",
          () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker
                .controller
            ) {
              this.onUpdateAvailable?.();
            }
          }
        );
      }
    );
  }

  handleBeforeInstallPrompt(event) {
    event.preventDefault();
    this.installPromptEvent = event;

    this.onInstallAvailabilityChange?.(
      true
    );
  }

  handleAppInstalled() {
    this.installPromptEvent = null;

    this.onInstallAvailabilityChange?.(
      false
    );

    this.onInstalled?.();
  }

  handleOnlineChange() {
    this.onNetworkChange?.(
      navigator.onLine
    );
  }

  handleControllerChange() {
    if (this.refreshing) {
      return;
    }

    this.refreshing = true;
    window.location.reload();
  }

  async install() {
    if (!this.installPromptEvent) {
      return {
        available: false,
        accepted: false,
      };
    }

    const prompt =
      this.installPromptEvent;

    this.installPromptEvent = null;

    await prompt.prompt();

    const choice =
      await prompt.userChoice;

    const accepted =
      choice.outcome === "accepted";

    this.onInstallAvailabilityChange?.(
      false
    );

    return {
      available: true,
      accepted,
    };
  }

  applyUpdate() {
    const waitingWorker =
      this.registration?.waiting;

    if (!waitingWorker) {
      return false;
    }

    waitingWorker.postMessage({
      type: "SKIP_WAITING",
    });

    return true;
  }

  isStandalone() {
    return (
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      window.navigator.standalone === true
    );
  }

  destroy() {
    window.removeEventListener(
      "beforeinstallprompt",
      this.handleBeforeInstallPrompt
    );

    window.removeEventListener(
      "appinstalled",
      this.handleAppInstalled
    );

    window.removeEventListener(
      "online",
      this.handleOnlineChange
    );

    window.removeEventListener(
      "offline",
      this.handleOnlineChange
    );

    navigator.serviceWorker?.removeEventListener(
      "controllerchange",
      this.handleControllerChange
    );
  }
}
