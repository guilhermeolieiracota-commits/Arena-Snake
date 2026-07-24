export function renderWeeklyEvent({
  elements,
  weeklyEvent,
}) {
  elements.weeklyEventNameValue.textContent =
    `${weeklyEvent.icon} ${weeklyEvent.name}`;

  elements.weeklyEventDescription.textContent =
    weeklyEvent.description;

  elements.weeklyDaysValue.textContent =
    `${weeklyEvent.daysRemaining} dias restantes`;

  elements.weeklyCompletedValue.textContent =
    `${weeklyEvent.completedCount}/${weeklyEvent.objectives.length}`;

  elements.weeklyObjectivesGrid.replaceChildren();

  for (const objective of weeklyEvent.objectives) {
    const card = document.createElement("article");
    card.className = "weekly-objective-card";

    card.classList.toggle(
      "weekly-objective-card--completed",
      objective.completed
    );

    const heading = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = objective.label;

    const reward = document.createElement("span");
    reward.textContent =
      `🪙 ${objective.rewardCoins} • ⭐ ${objective.rewardXp}`;

    heading.append(title, reward);

    const progress = document.createElement("div");
    progress.className = "weekly-objective-progress";

    const fill = document.createElement("span");
    fill.style.width =
      `${Math.round(
        Math.min(
          1,
          objective.progress /
            Math.max(1, objective.goal)
        ) * 100
      )}%`;

    progress.append(fill);

    const status = document.createElement("small");
    status.textContent = objective.completed
      ? "Objetivo concluído"
      : `${Math.round(objective.progress)}/${objective.goal}`;

    card.append(heading, progress, status);
    elements.weeklyObjectivesGrid.append(card);
  }

  const reward = weeklyEvent.completionReward;

  elements.weeklyBonusValue.textContent =
    `🪙 ${reward.coins} • ⭐ ${reward.profileXp} XP • 🌀 ${reward.seasonPoints} pontos • 🏷️ Título`;

  elements.weeklyBonusCard.classList.toggle(
    "weekly-bonus-card--claimed",
    weeklyEvent.completionRewardClaimed
  );

  elements.weeklyBonusStatus.textContent =
    weeklyEvent.completionRewardClaimed
      ? "Recompensa semanal recebida"
      : "Complete os três objetivos";
}
