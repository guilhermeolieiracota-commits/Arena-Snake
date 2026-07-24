const SEASON_EPOCH = new Date("2026-01-01T12:00:00");
export const SEASON_LENGTH_DAYS = 28;
export const SEASON_MAX_LEVEL = 20;
export const SEASON_POINTS_PER_LEVEL = 260;

const SEASON_THEMES = Object.freeze([
  Object.freeze({
    name: "Ascensão Neon",
    icon: "⚡",
    primary: "#52f2b2",
    secondary: "#55d9ff",
  }),
  Object.freeze({
    name: "Horizonte Solar",
    icon: "☀️",
    primary: "#ffd966",
    secondary: "#ff8f65",
  }),
  Object.freeze({
    name: "Nébula Real",
    icon: "🌌",
    primary: "#a77bff",
    secondary: "#ff7bd4",
  }),
  Object.freeze({
    name: "Maré Cyber",
    icon: "🌊",
    primary: "#4d78ff",
    secondary: "#82e6ff",
  }),
]);

const DAY_MS = 86_400_000;

export function getSeasonInfo(date = new Date()) {
  const localNoon = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12
  );

  const elapsedDays = Math.max(
    0,
    Math.floor(
      (localNoon.getTime() - SEASON_EPOCH.getTime()) /
        DAY_MS
    )
  );

  const index = Math.floor(
    elapsedDays / SEASON_LENGTH_DAYS
  );

  const start = new Date(
    SEASON_EPOCH.getTime() +
      index * SEASON_LENGTH_DAYS * DAY_MS
  );

  const end = new Date(
    start.getTime() +
      SEASON_LENGTH_DAYS * DAY_MS
  );

  const theme =
    SEASON_THEMES[index % SEASON_THEMES.length];

  const seasonNumber = index + 1;

  return {
    key: `season-${seasonNumber}`,
    number: seasonNumber,
    name: `${theme.name} ${seasonNumber}`,
    icon: theme.icon,
    primary: theme.primary,
    secondary: theme.secondary,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    daysRemaining: Math.max(
      0,
      Math.ceil(
        (end.getTime() - date.getTime()) /
          DAY_MS
      )
    ),
  };
}

export function getSeasonLevel(points) {
  return Math.min(
    SEASON_MAX_LEVEL,
    Math.floor(
      Math.max(0, Number(points) || 0) /
        SEASON_POINTS_PER_LEVEL
    ) + 1
  );
}

export function getSeasonLevelProgress(points) {
  const safePoints = Math.max(0, Number(points) || 0);
  const level = getSeasonLevel(safePoints);

  if (level >= SEASON_MAX_LEVEL) {
    return {
      level,
      current: SEASON_POINTS_PER_LEVEL,
      needed: SEASON_POINTS_PER_LEVEL,
      ratio: 1,
    };
  }

  const current =
    safePoints % SEASON_POINTS_PER_LEVEL;

  return {
    level,
    current,
    needed: SEASON_POINTS_PER_LEVEL,
    ratio: current / SEASON_POINTS_PER_LEVEL,
  };
}

export function getSeasonReward(level) {
  const safeLevel = Math.max(1, Math.min(SEASON_MAX_LEVEL, level));

  return {
    level: safeLevel,
    coins:
      safeLevel % 5 === 0
        ? 180 + safeLevel * 7
        : 45 + safeLevel * 4,
    profileXp:
      safeLevel % 4 === 0
        ? 120
        : 55,
    titleId:
      safeLevel === 10
        ? "guardiao-temporada"
        : safeLevel === 20
          ? "mestre-temporada"
          : null,
  };
}

export function calculateSeasonPoints(result) {
  const score = Math.max(0, Number(result.score) || 0);
  const eliminations = Math.max(0, Number(result.eliminations) || 0);
  const elapsedTime = Math.max(0, Number(result.elapsedTime) || 0);
  const rank = Number(result.rank);

  let rankBonus = 0;

  if (rank === 1) {
    rankBonus = 80;
  } else if (rank > 0 && rank <= 3) {
    rankBonus = 55;
  } else if (rank > 0 && rank <= 5) {
    rankBonus = 30;
  }

  return Math.min(
    360,
    Math.round(
      28 +
        score * 0.07 +
        eliminations * 30 +
        elapsedTime * 0.48 +
        rankBonus
    )
  );
}
