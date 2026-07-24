function formatTime(
  seconds
) {
  const safe =
    Math.max(
      0,
      Math.floor(
        Number(seconds) || 0
      )
    );

  const minutes =
    Math.floor(
      safe / 60
    );

  const remaining =
    safe % 60;

  return `${minutes}:${String(
    remaining
  ).padStart(2, "0")}`;
}

export function renderMatchHistory({
  elements,
  matches,
  getLeague,
  onShare,
}) {
  elements.historyCountValue.textContent =
    `${matches.length}/50`;

  elements.matchHistoryList.replaceChildren();

  if (
    matches.length === 0
  ) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "history-empty";

    empty.textContent =
      "O histórico será preenchido quando você concluir uma partida.";

    elements.matchHistoryList.append(
      empty
    );

    return;
  }

  for (const match of matches) {
    const card =
      document.createElement(
        "article"
      );

    card.className =
      "history-card";

    const heading =
      document.createElement(
        "div"
      );

    heading.className =
      "history-card__heading";

    const title =
      document.createElement(
        "strong"
      );

    title.textContent =
      `${match.medalIcon} ${match.medalName}`;

    const date =
      document.createElement(
        "small"
      );

    date.textContent =
      new Date(
        match.playedAt
      ).toLocaleString(
        "pt-BR"
      );

    heading.append(
      title,
      date
    );

    const stats =
      document.createElement(
        "div"
      );

    stats.className =
      "history-card__stats";

    const fields = [
      [
        "Pontuação",
        Math.round(
          match.score
        ),
      ],
      [
        "Posição",
        match.rank
          ? `#${match.rank}/${match.totalCompetitors}`
          : "—",
      ],
      [
        "Massa",
        Math.round(
          match.maximumMass
        ),
      ],
      [
        "Eliminações",
        match.eliminations,
      ],
      [
        "Tempo",
        formatTime(
          match.elapsedTime
        ),
      ],
      [
        "Rating",
        `${
          match.ratingDelta >= 0
            ? "+"
            : ""
        }${match.ratingDelta}`,
      ],
    ];

    for (
      const [label, value]
      of fields
    ) {
      const field =
        document.createElement(
          "div"
        );

      const fieldLabel =
        document.createElement(
          "span"
        );

      fieldLabel.textContent =
        label;

      const fieldValue =
        document.createElement(
          "strong"
        );

      fieldValue.textContent =
        String(value);

      field.append(
        fieldLabel,
        fieldValue
      );

      stats.append(field);
    }

    const footer =
      document.createElement(
        "div"
      );

    footer.className =
      "history-card__footer";

    const league =
      getLeague(
        match.ratingAfter
      );

    const rewards =
      document.createElement(
        "span"
      );

    rewards.textContent =
      `${league.icon} ${league.name} • 🪙 ${match.coinsEarned} • ⭐ ${match.xpEarned} • 🌀 ${match.seasonPointsEarned}`;

    const share =
      document.createElement(
        "button"
      );

    share.type = "button";
    share.textContent =
      "Compartilhar";

    share.addEventListener(
      "click",
      () => onShare(match)
    );

    footer.append(
      rewards,
      share
    );

    card.append(
      heading,
      stats,
      footer
    );

    elements.matchHistoryList.append(
      card
    );
  }
}
