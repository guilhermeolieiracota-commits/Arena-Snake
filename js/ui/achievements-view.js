export function renderAchievementsGrid(
  container,
  entries
) {
  container.replaceChildren();

  for (const achievement of entries) {
    const card =
      document.createElement("article");

    card.className =
      "achievement-card";

    card.classList.toggle(
      "achievement-card--unlocked",
      achievement.unlocked
    );

    const icon =
      document.createElement("span");

    icon.className =
      "achievement-card__icon";

    icon.textContent =
      achievement.icon;

    const content =
      document.createElement("div");

    const name =
      document.createElement("strong");

    name.textContent =
      achievement.name;

    const description =
      document.createElement("p");

    description.textContent =
      achievement.description;

    const progress =
      document.createElement("div");

    progress.className =
      "achievement-progress";

    const progressFill =
      document.createElement("span");

    const ratio = Math.min(
      1,
      achievement.progress /
        Math.max(
          achievement.goal,
          1
        )
    );

    progressFill.style.width =
      `${Math.round(ratio * 100)}%`;

    progress.append(progressFill);

    const status =
      document.createElement("small");

    status.textContent =
      achievement.unlocked
        ? "Conquistada"
        : `${Math.min(
            Math.round(
              achievement.progress
            ),
            achievement.goal
          )}/${achievement.goal}`;

    content.append(
      name,
      description,
      progress,
      status
    );

    card.append(icon, content);
    container.append(card);
  }
}
