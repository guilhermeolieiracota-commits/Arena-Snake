export const INITIAL_RATING = 1000;

export const LEAGUES = Object.freeze([
  Object.freeze({
    id: "bronze",
    name: "Bronze",
    icon: "🥉",
    minimum: 0,
    color: "#c98752",
  }),
  Object.freeze({
    id: "silver",
    name: "Prata",
    icon: "🥈",
    minimum: 1150,
    color: "#cbd5e1",
  }),
  Object.freeze({
    id: "gold",
    name: "Ouro",
    icon: "🥇",
    minimum: 1450,
    color: "#ffd966",
  }),
  Object.freeze({
    id: "platinum",
    name: "Platina",
    icon: "💠",
    minimum: 1800,
    color: "#7ee7e7",
  }),
  Object.freeze({
    id: "diamond",
    name: "Diamante",
    icon: "💎",
    minimum: 2200,
    color: "#82b8ff",
  }),
  Object.freeze({
    id: "master",
    name: "Mestre",
    icon: "👑",
    minimum: 2700,
    color: "#d58cff",
  }),
]);

export const LEAGUE_MAP = Object.freeze(
  Object.fromEntries(
    LEAGUES.map((league) => [
      league.id,
      league,
    ])
  )
);

export function getLeagueByRating(rating) {
  const safeRating = Math.max(
    0,
    Math.round(Number(rating) || 0)
  );

  let selected = LEAGUES[0];

  for (const league of LEAGUES) {
    if (safeRating >= league.minimum) {
      selected = league;
    }
  }

  return selected;
}

export function getLeagueProgress(rating) {
  const safeRating = Math.max(
    0,
    Math.round(Number(rating) || 0)
  );

  const league = getLeagueByRating(
    safeRating
  );

  const index = LEAGUES.findIndex(
    (entry) => entry.id === league.id
  );

  const nextLeague =
    LEAGUES[index + 1] ?? null;

  if (!nextLeague) {
    return {
      league,
      nextLeague: null,
      current: safeRating - league.minimum,
      needed: 0,
      ratio: 1,
    };
  }

  const needed =
    nextLeague.minimum -
    league.minimum;

  const current =
    safeRating -
    league.minimum;

  return {
    league,
    nextLeague,
    current,
    needed,
    ratio: Math.min(
      1,
      current / Math.max(1, needed)
    ),
  };
}

export function calculateRatingDelta(result) {
  const rank = Math.max(
    1,
    Math.round(Number(result.rank) || 1)
  );

  const total = Math.max(
    2,
    Math.round(
      Number(result.totalCompetitors) || 15
    )
  );

  const placementRatio =
    (total - rank) /
    Math.max(1, total - 1);

  const eliminations = Math.max(
    0,
    Number(result.eliminations) || 0
  );

  const score = Math.max(
    0,
    Number(result.score) || 0
  );

  const survival = Math.max(
    0,
    Number(result.elapsedTime) || 0
  );

  const raw =
    (placementRatio - 0.5) * 72 +
    eliminations * 6 +
    Math.min(14, score * 0.025) +
    Math.min(8, survival / 24);

  return Math.max(
    -38,
    Math.min(
      62,
      Math.round(raw)
    )
  );
}

export function getPlacementMedal(result) {
  const rank = Number(result.rank);

  if (rank === 1) {
    return {
      id: "champion",
      icon: "🏆",
      name: "Campeão",
    };
  }

  if (rank === 2) {
    return {
      id: "silver",
      icon: "🥈",
      name: "Vice-campeão",
    };
  }

  if (rank === 3) {
    return {
      id: "bronze",
      icon: "🥉",
      name: "Terceiro lugar",
    };
  }

  if (rank > 0 && rank <= 5) {
    return {
      id: "top5",
      icon: "🏅",
      name: "Top 5",
    };
  }

  if (
    Number(result.eliminations) >= 3
  ) {
    return {
      id: "hunter",
      icon: "🎯",
      name: "Caçador",
    };
  }

  if (
    Number(result.elapsedTime) >= 90
  ) {
    return {
      id: "survivor",
      icon: "🛡️",
      name: "Sobrevivente",
    };
  }

  return {
    id: "participant",
    icon: "🎮",
    name: "Competidor",
  };
}
