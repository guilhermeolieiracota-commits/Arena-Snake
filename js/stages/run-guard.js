const ACTIVE_RUN_KEY =
  "snake_arena_active_run_v16";

export class RunGuard {
  constructor(storage = window.localStorage) {
    this.storage = storage;
  }

  markActive({ stage }) {
    try {
      this.storage.setItem(
        ACTIVE_RUN_KEY,
        JSON.stringify({
          stage: Math.max(
            1,
            Math.round(
              Number(stage) || 1
            )
          ),
          startedAt:
            new Date().toISOString(),
        })
      );
    } catch {
      // O jogo continua mesmo sem armazenamento disponível.
    }
  }

  clear() {
    try {
      this.storage.removeItem(
        ACTIVE_RUN_KEY
      );
    } catch {
      // Sem ação necessária.
    }
  }

  consumeInterruptedRun() {
    try {
      const raw = this.storage.getItem(
        ACTIVE_RUN_KEY
      );

      if (!raw) {
        return null;
      }

      this.storage.removeItem(
        ACTIVE_RUN_KEY
      );

      const parsed = JSON.parse(raw);

      return {
        stage: Math.max(
          1,
          Math.round(
            Number(parsed?.stage) || 1
          )
        ),
        startedAt:
          typeof parsed?.startedAt ===
          "string"
            ? parsed.startedAt
            : null,
      };
    } catch {
      return null;
    }
  }
}
