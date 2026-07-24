export function renderProfile({
  elements,
  progression,
  settings,
  stats,
  economy,
  skin,
  playerMeta,
  onTitleChange,
}) {
  elements.profileNicknameValue.textContent =
    settings.nickname;

  elements.profileTitleValue.textContent =
    progression.selectedTitle.name;

  elements.profileLevelValue.textContent =
    String(progression.level);

  elements.profileXpValue.textContent =
    progression.level >= progression.maxLevel
      ? "Nível máximo"
      : `${Math.round(progression.currentLevelXp)}/${progression.nextLevelXp} XP`;

  const ratio =
    progression.level >= progression.maxLevel
      ? 1
      : progression.currentLevelXp /
        Math.max(1, progression.nextLevelXp);

  elements.profileXpFill.style.width =
    `${Math.round(Math.min(1, ratio) * 100)}%`;

  elements.profileCoinsValue.textContent =
    String(Math.round(economy.coins));

  elements.profileGamesValue.textContent =
    String(Math.round(stats.gamesPlayed));

  elements.profileBestScoreValue.textContent =
    String(Math.round(stats.bestScore));

  elements.profileEliminationsValue.textContent =
    String(Math.round(stats.totalEliminations));

  elements.profilePlayerIdValue.textContent =
    playerMeta.playerId;

  elements.profileStreakValue.textContent =
    String(playerMeta.currentStreak);

  elements.profileSkinPreview.style.setProperty(
    "--profile-primary",
    skin.primaryColor
  );

  elements.profileSkinPreview.style.setProperty(
    "--profile-secondary",
    skin.secondaryColor
  );

  elements.profileTitleSelect.replaceChildren();

  for (const title of progression.unlockedTitles) {
    const option = document.createElement("option");
    option.value = title.id;
    option.textContent = title.name;
    option.selected =
      title.id === progression.selectedTitleId;
    elements.profileTitleSelect.append(option);
  }

  elements.profileTitleSelect.onchange = () => {
    onTitleChange?.(
      elements.profileTitleSelect.value
    );
  };

  elements.profileHistoryList.replaceChildren();

  const history =
    progression.recentXp.slice(0, 8);

  if (history.length === 0) {
    const empty = document.createElement("li");
    empty.textContent =
      "Jogue uma partida para começar seu histórico de XP.";
    elements.profileHistoryList.append(empty);
    return;
  }

  for (const entry of history) {
    const item = document.createElement("li");

    const label = document.createElement("span");
    label.textContent =
      entry.label || "Recompensa de XP";

    const value = document.createElement("strong");
    value.textContent = `+${entry.amount} XP`;

    item.append(label, value);
    elements.profileHistoryList.append(item);
  }
}
