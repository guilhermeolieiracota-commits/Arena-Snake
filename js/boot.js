const BOOT_FIX_VERSION = "14-2";
const BOOT_MARKER_KEY = "snake_arena_boot_fix";

const loadingScreen = document.querySelector("#loadingScreen");
const loadingMessage = document.querySelector("#loadingMessage");

function setLoadingMessage(message) {
  if (loadingMessage) {
    loadingMessage.textContent = message;
  }
}

function getApplicationBasePath() {
  const path = new URL("../", import.meta.url).pathname;
  return path.endsWith("/") ? path : `${path}/`;
}

async function removeOldApplicationCache() {
  setLoadingMessage("Atualizando arquivos do jogo...");

  const basePath = getApplicationBasePath();

  if ("serviceWorker" in navigator) {
    const registrations =
      await navigator.serviceWorker.getRegistrations();

    await Promise.all(
      registrations
        .filter((registration) => {
          try {
            return new URL(registration.scope).pathname.startsWith(basePath);
          } catch {
            return false;
          }
        })
        .map((registration) => registration.unregister())
    );
  }

  if ("caches" in window) {
    const cacheNames = await caches.keys();

    await Promise.all(
      cacheNames
        .filter((cacheName) =>
          cacheName.startsWith("snake-arena-")
        )
        .map((cacheName) => caches.delete(cacheName))
    );
  }
}

function readBootMarker() {
  try {
    return localStorage.getItem(BOOT_MARKER_KEY);
  } catch {
    return null;
  }
}

function writeBootMarker() {
  try {
    localStorage.setItem(
      BOOT_MARKER_KEY,
      BOOT_FIX_VERSION
    );
  } catch {
    // O parâmetro na URL também impede um ciclo em navegadores restritivos.
  }
}

function showBootFailure(error) {
  console.error("Falha ao iniciar Snake Arena:", error);

  if (!loadingScreen) {
    return;
  }

  loadingScreen.hidden = false;
  loadingScreen.classList.remove("loading-screen--hidden");
  loadingScreen.classList.add("loading-screen--error");

  const title = loadingScreen.querySelector("strong");

  if (title) {
    title.textContent = "Não foi possível iniciar";
  }

  const message =
    error?.message ||
    "O navegador interrompeu o carregamento do jogo.";

  setLoadingMessage(message);

  let action = loadingScreen.querySelector("[data-boot-retry]");

  if (!action) {
    action = document.createElement("button");
    action.type = "button";
    action.dataset.bootRetry = "true";
    action.className = "button button--primary loading-screen__retry";
    action.textContent = "Limpar cache e tentar novamente";

    action.addEventListener("click", async () => {
      action.disabled = true;
      action.textContent = "Limpando...";

      try {
        localStorage.removeItem(BOOT_MARKER_KEY);
      } catch {
        // Continua mesmo sem acesso ao armazenamento.
      }

      try {
        await removeOldApplicationCache();
      } finally {
        const url = new URL(window.location.href);
        url.searchParams.set("bootFix", BOOT_FIX_VERSION);
        url.searchParams.set("retry", Date.now().toString());
        window.location.replace(url.toString());
      }
    });

    loadingScreen.append(action);
  }
}

window.addEventListener("error", (event) => {
  if (event.error) {
    showBootFailure(event.error);
  }
});

window.addEventListener("unhandledrejection", (event) => {
  showBootFailure(event.reason);
});

async function start() {
  const url = new URL(window.location.href);
  const urlMarker = url.searchParams.get("bootFix");
  const storedMarker = readBootMarker();

  if (
    storedMarker !== BOOT_FIX_VERSION &&
    urlMarker !== BOOT_FIX_VERSION
  ) {
    await removeOldApplicationCache();
    writeBootMarker();

    url.searchParams.set("bootFix", BOOT_FIX_VERSION);
    window.location.replace(url.toString());
    return;
  }

  writeBootMarker();
  setLoadingMessage("Preparando a arena...");

  await import(`./main.js?build=${BOOT_FIX_VERSION}`);
}

start().catch(showBootFailure);
