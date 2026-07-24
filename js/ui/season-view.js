export function renderSeason({
  elements,
  season,
}) {
  elements.seasonNameValue.textContent =
    `${season.icon} ${season.name}`;

  elements.seasonDaysValue.textContent =
    `${season.daysRemaining} dias`;

  elements.seasonLevelValue.textContent =
    `${season.level}/${season.maxLevel}`;

  elements.seasonPointsValue.textContent =
    `${Math.round(season.current)}/${season.needed}`;

  elements.seasonProgressFill.style.width =
    `${Math.round(season.ratio * 100)}%`;

  elements.seasonTrack.style.setProperty(
    "--season-primary",
    season.primary
  );

  elements.seasonTrack.style.setProperty(
    "--season-secondary",
    season.secondary
  );

  elements.seasonRewardsGrid.replaceChildren();

  for (const reward of season.rewards) {
    const card = document.createElement("article");
    card.className = "season-reward-card";

    card.classList.toggle(
      "season-reward-card--claimed",
      reward.claimed
    );

    card.classList.toggle(
      "season-reward-card--reached",
      reward.reached
    );

    const level = document.createElement("span");
    level.className = "season-reward-card__level";
    level.textContent = `Nível ${reward.level}`;

    const rewards = document.createElement("strong");
    const pieces = [
      `🪙 ${reward.coins}`,
      `⭐ ${reward.profileXp} XP`,
    ];

    if (reward.titleId) {
      pieces.push("🏷️ Título");
    }

    rewards.textContent = pieces.join(" • ");

    const status = document.createElement("small");
    status.textContent = reward.claimed
      ? "Recebido"
      : reward.reached
        ? "Liberando..."
        : "Bloqueado";

    card.append(level, rewards, status);
    elements.seasonRewardsGrid.append(card);
  }
}
