export const CLOUD_CONFIG = Object.freeze({
  enabled: true,
  projectUrl: "https://jetmkzwgbirqlqfahzgr.supabase.co",
  publishableKey: "sb_publishable_wwcQd-gWh98EYFSmIBts8A_4r7SRPVK",
  autoSyncAfterMatch: true,
  leaderboardLimit: 100,
  communityProfileLimit: 100,
  globalFeedLimit: 30,
});

export function normalizeProjectUrl(value) {
  return String(value ?? "")
    .trim()
    .replace(/\/+$/, "");
}

export function isCloudConfigured(
  config = CLOUD_CONFIG
) {
  const url = normalizeProjectUrl(
    config.projectUrl
  );

  const key = String(
    config.publishableKey ?? ""
  ).trim();

  return Boolean(
    config.enabled &&
      /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(
        url
      ) &&
      key.length >= 20 &&
      !key.includes("COLE_AQUI")
  );
}
