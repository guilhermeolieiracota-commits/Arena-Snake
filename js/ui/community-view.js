import {
  getLeagueByRating,
} from "../competitive/league-config.js";
import {
  getSkinById,
} from "../skins/skin-catalog.js";
import {
  PROFILE_TITLE_MAP,
} from "../progression/progression-config.js";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? "—"
    : date.toLocaleString(
        "pt-BR"
      );
}

function formatDuration(seconds) {
  const safe = Math.max(
    0,
    Math.round(
      Number(seconds) || 0
    )
  );

  const minutes = Math.floor(
    safe / 60
  );

  return `${minutes}:${String(
    safe % 60
  ).padStart(2, "0")}`;
}

export function filterLeaderboard(
  rows,
  {
    search = "",
    league = "all",
    sort = "rating",
  } = {}
) {
  const term = String(search)
    .trim()
    .toLocaleLowerCase(
      "pt-BR"
    );

  const filtered = (
    Array.isArray(rows)
      ? rows
      : []
  ).filter((row) => {
    const matchesSearch =
      !term ||
      row.nickname
        .toLocaleLowerCase(
          "pt-BR"
        )
        .includes(term) ||
      row.playerId
        .toLocaleLowerCase(
          "pt-BR"
        )
        .includes(term);

    const matchesLeague =
      league === "all" ||
      getLeagueByRating(
        row.rating
      ).id === league;

    return (
      matchesSearch &&
      matchesLeague
    );
  });

  const comparators = {
    rating: (
      first,
      second
    ) =>
      second.rating -
        first.rating ||
      second.bestScore -
        first.bestScore,

    score: (
      first,
      second
    ) =>
      second.bestScore -
        first.bestScore ||
      second.rating -
        first.rating,

    wins: (
      first,
      second
    ) =>
      second.wins -
        first.wins ||
      second.rating -
        first.rating,

    level: (
      first,
      second
    ) =>
      second.profileLevel -
        first.profileLevel ||
      second.rating -
        first.rating,
  };

  return filtered.sort(
    comparators[sort] ??
      comparators.rating
  );
}

export function renderCommunityProfile({
  elements,
  profile,
  matches = [],
}) {
  elements.communityProfilePanel.hidden =
    !profile;

  if (!profile) {
    return;
  }

  const league =
    getLeagueByRating(
      profile.rating
    );

  const skin =
    getSkinById(
      profile.skinId
    );

  const title =
    PROFILE_TITLE_MAP[
      profile.titleId
    ];

  elements.communityProfileAvatar.style.setProperty(
    "--community-primary",
    skin.primaryColor
  );

  elements.communityProfileAvatar.style.setProperty(
    "--community-secondary",
    skin.secondaryColor
  );

  elements.communityProfileName.textContent =
    profile.nickname;

  elements.communityProfileTagline.textContent =
    profile.tagline ||
    "Jogador da comunidade Snake Arena.";

  elements.communityProfileId.textContent =
    profile.playerId;

  elements.communityProfileLeague.textContent =
    `${league.icon} ${league.name} • ${Math.round(
      profile.rating
    )} RP`;

  elements.communityProfileTitle.textContent =
    title?.name ??
    "Novato da Arena";

  elements.communityProfileLevel.textContent =
    String(
      profile.profileLevel
    );

  elements.communityProfileGames.textContent =
    String(
      profile.totalGames
    );

  elements.communityProfileEliminations.textContent =
    String(
      profile.totalEliminations
    );

  elements.communityProfileBestScore.textContent =
    String(
      Math.round(
        profile.bestScore
      )
    );

  elements.communityProfileWins.textContent =
    String(profile.wins);

  elements.communityProfileStreak.textContent =
    String(
      profile.currentStreak
    );

  elements.communityProfileUpdated.textContent =
    formatDate(
      profile.updatedAt
    );

  elements.communityProfileMatches.replaceChildren();

  if (matches.length === 0) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "community-empty";

    empty.textContent =
      "Este perfil ainda não possui partidas públicas recentes.";

    elements.communityProfileMatches.append(
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
      "community-match-card";

    const heading =
      document.createElement(
        "div"
      );

    const medal =
      document.createElement(
        "strong"
      );

    medal.textContent =
      `${match.medalIcon} ${match.medalName}`;

    const date =
      document.createElement(
        "small"
      );

    date.textContent =
      formatDate(
        match.playedAt
      );

    heading.append(
      medal,
      date
    );

    const stats =
      document.createElement(
        "p"
      );

    stats.textContent =
      `${Math.round(
        match.score
      )} pts • #${match.rank}/${match.totalCompetitors} • ${match.eliminations} eliminações • ${formatDuration(
        match.elapsedTime
      )}`;

    card.append(
      heading,
      stats
    );

    elements.communityProfileMatches.append(
      card
    );
  }
}

export function renderGlobalFeed({
  container,
  matches,
  onOpenProfile,
}) {
  container.replaceChildren();

  if (!matches?.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "community-empty";

    empty.textContent =
      "As partidas públicas aparecerão depois que os jogadores atualizarem para a Fase 13.";

    container.append(empty);
    return;
  }

  for (const match of matches) {
    const card =
      document.createElement(
        "article"
      );

    card.className =
      "global-feed-card";

    const identity =
      document.createElement(
        "button"
      );

    identity.type = "button";
    identity.className =
      "global-feed-card__identity";

    identity.textContent =
      `${match.medalIcon} ${match.nickname}`;

    identity.addEventListener(
      "click",
      () =>
        onOpenProfile?.(
          match.playerId
        )
    );

    const stats =
      document.createElement(
        "span"
      );

    stats.textContent =
      `${Math.round(
        match.score
      )} pts • #${match.rank}/${match.totalCompetitors} • ${match.eliminations} eliminações`;

    const date =
      document.createElement(
        "small"
      );

    date.textContent =
      formatDate(
        match.playedAt
      );

    card.append(
      identity,
      stats,
      date
    );

    container.append(card);
  }
}

export function renderCloudDiagnostics({
  container,
  diagnostics,
}) {
  container.replaceChildren();

  if (!diagnostics?.checks?.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "community-empty";

    empty.textContent =
      "Execute o diagnóstico para verificar autenticação, banco e tabelas.";

    container.append(empty);
    return;
  }

  for (const check of diagnostics.checks) {
    const row =
      document.createElement(
        "div"
      );

    row.className =
      "cloud-diagnostic-row";

    row.dataset.state =
      check.state;

    const icon =
      document.createElement(
        "span"
      );

    icon.textContent =
      check.state === "success"
        ? "✅"
        : "⚠️";

    const detail =
      document.createElement(
        "div"
      );

    const label =
      document.createElement(
        "strong"
      );

    label.textContent =
      check.label;

    const message =
      document.createElement(
        "small"
      );

    message.textContent =
      `${check.detail} • ${check.durationMs} ms`;

    detail.append(
      label,
      message
    );

    row.append(
      icon,
      detail
    );

    container.append(row);
  }
}
