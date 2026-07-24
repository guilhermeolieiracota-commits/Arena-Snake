import {
  getLeagueByRating,
} from "../competitive/league-config.js";

export function renderCompetitive({
  elements,
  competitive,
  bestRuns,
}) {
  elements.competitiveLeagueIcon.textContent =
    competitive.league.icon;

  elements.competitiveLeagueName.textContent =
    competitive.league.name;

  elements.competitiveRatingValue.textContent =
    String(
      Math.round(
        competitive.rating
      )
    );

  elements.competitivePeakValue.textContent =
    String(
      Math.round(
        competitive.peakRating
      )
    );

  elements.competitiveProgressFill.style.width =
    `${Math.round(
      competitive.ratio * 100
    )}%`;

  elements.competitiveProgressValue.textContent =
    competitive.nextLeague
      ? `${Math.round(
          competitive.current
        )}/${competitive.needed} para ${competitive.nextLeague.name}`
      : "Liga máxima alcançada";

  elements.competitiveMatchesValue.textContent =
    String(
      competitive.matches
    );

  elements.competitiveWinsValue.textContent =
    String(
      competitive.wins
    );

  elements.competitiveTop3Value.textContent =
    String(
      competitive.top3
    );

  elements.competitiveAverageRankValue.textContent =
    competitive.matches > 0
      ? competitive.averageRank.toFixed(
          1
        )
      : "—";

  elements.competitiveBestRunsList.replaceChildren();

  if (
    bestRuns.length === 0
  ) {
    const empty =
      document.createElement(
        "li"
      );

    empty.className =
      "competitive-empty";

    empty.textContent =
      "Conclua uma partida para entrar no ranking local.";

    elements.competitiveBestRunsList.append(
      empty
    );

    return;
  }

  bestRuns.forEach(
    (run, index) => {
      const item =
        document.createElement(
          "li"
        );

      item.className =
        "competitive-run";

      const position =
        document.createElement(
          "span"
        );

      position.className =
        "competitive-run__position";

      position.textContent =
        String(index + 1);

      const medal =
        document.createElement(
          "span"
        );

      medal.textContent =
        run.medalIcon;

      const details =
        document.createElement(
          "div"
        );

      const title =
        document.createElement(
          "strong"
        );

      title.textContent =
        `${Math.round(
          run.score
        )} pontos • #${
          run.rank ?? "—"
        }`;

      const meta =
        document.createElement(
          "small"
        );

      const league =
        getLeagueByRating(
          run.ratingAfter
        );

      meta.textContent =
        `${league.icon} ${league.name} • ${new Date(
          run.playedAt
        ).toLocaleDateString(
          "pt-BR"
        )}`;

      details.append(
        title,
        meta
      );

      item.append(
        position,
        medal,
        details
      );

      elements.competitiveBestRunsList.append(
        item
      );
    }
  );
}
