export const MAX_PROFILE_LEVEL = 50;

export const PROFILE_TITLES = Object.freeze([
  Object.freeze({
    id: "novato",
    name: "Novato da Arena",
    description: "Título inicial.",
    unlockLevel: 1,
  }),
  Object.freeze({
    id: "explorador",
    name: "Explorador Neon",
    description: "Alcance o nível 3.",
    unlockLevel: 3,
  }),
  Object.freeze({
    id: "coletor",
    name: "Mestre Coletor",
    description: "Alcance o nível 5.",
    unlockLevel: 5,
  }),
  Object.freeze({
    id: "cacador",
    name: "Caçador de Caudas",
    description: "Alcance o nível 8.",
    unlockLevel: 8,
  }),
  Object.freeze({
    id: "veterano",
    name: "Veterano da Arena",
    description: "Alcance o nível 12.",
    unlockLevel: 12,
  }),
  Object.freeze({
    id: "elite",
    name: "Elite Neon",
    description: "Alcance o nível 18.",
    unlockLevel: 18,
  }),
  Object.freeze({
    id: "lenda",
    name: "Lenda Serpentina",
    description: "Alcance o nível 25.",
    unlockLevel: 25,
  }),
  Object.freeze({
    id: "campeao-semanal",
    name: "Campeão Semanal",
    description: "Complete um evento semanal.",
    special: true,
  }),
  Object.freeze({
    id: "guardiao-temporada",
    name: "Guardião da Temporada",
    description: "Alcance o nível 10 de uma temporada.",
    special: true,
  }),
  Object.freeze({
    id: "mestre-temporada",
    name: "Mestre da Temporada",
    description: "Conclua os 20 níveis de uma temporada.",
    special: true,
  }),
]);

export const PROFILE_TITLE_MAP = Object.freeze(
  Object.fromEntries(
    PROFILE_TITLES.map((title) => [title.id, title])
  )
);

export function getXpForNextLevel(level) {
  const safeLevel = Math.max(1, Math.min(MAX_PROFILE_LEVEL, Math.round(level)));
  return Math.round(
    105 +
      (safeLevel - 1) * 48 +
      Math.pow(safeLevel - 1, 1.32) * 13
  );
}

export function getTotalXpForLevel(level) {
  const targetLevel = Math.max(
    1,
    Math.min(MAX_PROFILE_LEVEL, Math.round(level))
  );

  let total = 0;

  for (let current = 1; current < targetLevel; current += 1) {
    total += getXpForNextLevel(current);
  }

  return total;
}

export function getLevelFromTotalXp(totalXp) {
  const safeXp = Math.max(0, Number(totalXp) || 0);
  let level = 1;
  let consumed = 0;

  while (level < MAX_PROFILE_LEVEL) {
    const needed = getXpForNextLevel(level);

    if (consumed + needed > safeXp) {
      break;
    }

    consumed += needed;
    level += 1;
  }

  return {
    level,
    currentLevelXp: safeXp - consumed,
    nextLevelXp:
      level >= MAX_PROFILE_LEVEL
        ? 0
        : getXpForNextLevel(level),
    levelStartXp: consumed,
  };
}

export function getLevelReward(level) {
  const safeLevel = Math.max(2, Math.round(level));
  const coins =
    safeLevel % 10 === 0
      ? 320
      : safeLevel % 5 === 0
        ? 190
        : 65 + safeLevel * 6;

  return {
    level: safeLevel,
    coins,
  };
}

export function calculateMatchXp(result) {
  const score = Math.max(0, Number(result.score) || 0);
  const collected = Math.max(0, Number(result.collected) || 0);
  const eliminations = Math.max(0, Number(result.eliminations) || 0);
  const elapsedTime = Math.max(0, Number(result.elapsedTime) || 0);
  const rank = Number(result.rank);

  let rankBonus = 0;

  if (rank === 1) {
    rankBonus = 120;
  } else if (rank > 0 && rank <= 3) {
    rankBonus = 85;
  } else if (rank > 0 && rank <= 5) {
    rankBonus = 50;
  } else if (rank > 0 && rank <= 10) {
    rankBonus = 25;
  }

  return Math.min(
    650,
    Math.round(
      24 +
        score * 0.11 +
        collected * 0.16 +
        eliminations * 42 +
        elapsedTime * 0.9 +
        rankBonus
    )
  );
}
