export function formatDuration(seconds) {
  const safeSeconds = Math.max(
    0,
    Math.floor(Number(seconds) || 0)
  );

  const hours = Math.floor(
    safeSeconds / 3600
  );

  const minutes = Math.floor(
    (safeSeconds % 3600) / 60
  );

  const remainingSeconds =
    safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
}

export function renderStatsGrid(
  container,
  stats,
  numberFormatter
) {
  const items = [
    ["Partidas", stats.gamesPlayed],
    ["Mortes", stats.deaths],
    ["Melhor pontuação", stats.bestScore],
    ["Maior massa", stats.bestMass],
    [
      "Melhor posição",
      stats.bestRank
        ? `#${stats.bestRank}`
        : "—",
    ],
    [
      "Recorde de eliminações",
      stats.bestEliminations,
    ],
    [
      "Eliminações totais",
      stats.totalEliminations,
    ],
    [
      "Partículas coletadas",
      stats.totalCollected,
    ],
    [
      "Maior sobrevivência",
      formatDuration(
        stats.longestSurvivalSeconds
      ),
    ],
    [
      "Tempo total",
      formatDuration(
        stats.totalPlaySeconds
      ),
    ],
  ];

  container.replaceChildren();

  for (const [label, value] of items) {
    const card =
      document.createElement("div");

    card.className =
      "stats-card";

    const labelElement =
      document.createElement("span");

    labelElement.textContent = label;

    const valueElement =
      document.createElement("strong");

    valueElement.textContent =
      typeof value === "number"
        ? numberFormatter.format(value)
        : value;

    card.append(
      labelElement,
      valueElement
    );

    container.append(card);
  }
}
