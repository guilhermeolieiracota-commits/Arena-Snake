export function renderDailyChallenges(
  container,
  entries
) {
  container.replaceChildren();

  for (const challenge of entries) {
    const card = document.createElement("article");
    card.className = "daily-card";
    card.classList.toggle(
      "daily-card--completed",
      challenge.completed
    );

    const icon = document.createElement("span");
    icon.className = "daily-card__icon";
    icon.textContent = challenge.icon;

    const body = document.createElement("div");

    const heading = document.createElement("div");
    heading.className = "daily-card__heading";

    const title = document.createElement("strong");
    title.textContent = challenge.title;

    const reward = document.createElement("span");
    reward.className = "coin-reward";
    reward.textContent = `🪙 ${challenge.reward}`;

    heading.append(title, reward);

    const description = document.createElement("p");
    description.textContent = challenge.description;

    const progress = document.createElement("div");
    progress.className = "daily-progress";

    const fill = document.createElement("span");
    const ratio = Math.min(
      1,
      challenge.progress / Math.max(challenge.goal, 1)
    );
    fill.style.width = `${Math.round(ratio * 100)}%`;
    progress.append(fill);

    const status = document.createElement("small");
    status.textContent = challenge.completed
      ? "Concluído e recompensado"
      : `${Math.min(
          Math.round(challenge.progress),
          challenge.goal
        )}/${challenge.goal}`;

    body.append(
      heading,
      description,
      progress,
      status
    );

    card.append(icon, body);
    container.append(card);
  }
}
