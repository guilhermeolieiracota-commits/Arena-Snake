const number = (value) =>
  Math.max(0, Number(value) || 0);

const sessionValue = (context, key) =>
  number(context.session?.[key]);

const statsValue = (context, key) =>
  number(context.stats?.[key]);

const bestRank = (context) => {
  const sessionRank = Number(
    context.session?.rank
  );

  const savedRank = Number(
    context.stats?.bestRank
  );

  const ranks = [
    sessionRank,
    savedRank,
  ].filter(
    (rank) =>
      Number.isFinite(rank) &&
      rank > 0
  );

  return ranks.length > 0
    ? Math.min(...ranks)
    : Infinity;
};

export const ACHIEVEMENTS = Object.freeze([
  Object.freeze({
    id: "first-match",
    icon: "🎮",
    name: "Primeira partida",
    description: "Conclua sua primeira partida.",
    goal: 1,
    progress: (context) =>
      statsValue(context, "gamesPlayed"),
  }),
  Object.freeze({
    id: "collector-25",
    icon: "✨",
    name: "Coletor iniciante",
    description: "Colete 25 partículas em uma partida.",
    goal: 25,
    progress: (context) =>
      sessionValue(context, "collected"),
  }),
  Object.freeze({
    id: "collector-250",
    icon: "🌟",
    name: "Ímã de energia",
    description: "Colete 250 partículas no total.",
    goal: 250,
    progress: (context) =>
      statsValue(context, "totalCollected"),
  }),
  Object.freeze({
    id: "score-100",
    icon: "💯",
    name: "Três dígitos",
    description: "Alcance 100 pontos em uma partida.",
    goal: 100,
    progress: (context) =>
      sessionValue(context, "score"),
  }),
  Object.freeze({
    id: "score-500",
    icon: "🚀",
    name: "Pontuação explosiva",
    description: "Alcance 500 pontos em uma partida.",
    goal: 500,
    progress: (context) =>
      sessionValue(context, "score"),
  }),
  Object.freeze({
    id: "mass-250",
    icon: "🐍",
    name: "Cobra crescente",
    description: "Alcance 250 de massa.",
    goal: 250,
    progress: (context) =>
      Math.max(
        sessionValue(context, "mass"),
        sessionValue(context, "maximumMass")
      ),
  }),
  Object.freeze({
    id: "mass-600",
    icon: "🐉",
    name: "Gigante da arena",
    description: "Alcance 600 de massa.",
    goal: 600,
    progress: (context) =>
      Math.max(
        sessionValue(context, "mass"),
        sessionValue(context, "maximumMass")
      ),
  }),
  Object.freeze({
    id: "first-elimination",
    icon: "💥",
    name: "Primeira eliminação",
    description: "Elimine uma cobra adversária.",
    goal: 1,
    progress: (context) =>
      Math.max(
        sessionValue(context, "eliminations"),
        statsValue(
          context,
          "totalEliminations"
        )
      ),
  }),
  Object.freeze({
    id: "hunter-10",
    icon: "🎯",
    name: "Caçador",
    description: "Some 10 eliminações.",
    goal: 10,
    progress: (context) =>
      statsValue(
        context,
        "totalEliminations"
      ),
  }),
  Object.freeze({
    id: "top-3",
    icon: "🥉",
    name: "Entre os melhores",
    description: "Termine uma partida no Top 3.",
    goal: 3,
    progress: (context) => {
      const rank = bestRank(context);

      return Number.isFinite(rank)
        ? Math.max(0, 4 - rank)
        : 0;
    },
    isUnlocked: (context) =>
      bestRank(context) <= 3,
  }),
  Object.freeze({
    id: "champion",
    icon: "🏆",
    name: "Campeão da arena",
    description: "Termine uma partida em primeiro lugar.",
    goal: 1,
    progress: (context) =>
      bestRank(context) === 1 ? 1 : 0,
    isUnlocked: (context) =>
      bestRank(context) === 1,
  }),
  Object.freeze({
    id: "survivor-60",
    icon: "⏱️",
    name: "Sobrevivente",
    description: "Sobreviva por 60 segundos.",
    goal: 60,
    progress: (context) =>
      Math.max(
        sessionValue(
          context,
          "elapsedTime"
        ),
        statsValue(
          context,
          "longestSurvivalSeconds"
        )
      ),
  }),
  Object.freeze({
    id: "veteran-10",
    icon: "🛡️",
    name: "Veterano",
    description: "Conclua 10 partidas.",
    goal: 10,
    progress: (context) =>
      statsValue(context, "gamesPlayed"),
  }),
]);

export const ACHIEVEMENT_MAP =
  Object.freeze(
    Object.fromEntries(
      ACHIEVEMENTS.map(
        (achievement) => [
          achievement.id,
          achievement,
        ]
      )
    )
  );

export function getAchievementProgress(
  achievement,
  context
) {
  return Math.max(
    0,
    Number(
      achievement.progress?.(context)
    ) || 0
  );
}

export function isAchievementUnlocked(
  achievement,
  context
) {
  if (achievement.isUnlocked) {
    return achievement.isUnlocked(
      context
    );
  }

  return (
    getAchievementProgress(
      achievement,
      context
    ) >= achievement.goal
  );
}
