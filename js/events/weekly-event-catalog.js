const WEEK_MS = 7 * 86_400_000;

const EVENT_TEMPLATES = Object.freeze([
  Object.freeze({
    id: "energy-festival",
    icon: "✨",
    name: "Festival da Energia",
    description: "Colete energia e aumente sua pontuação durante a semana.",
    objectives: Object.freeze([
      Object.freeze({
        id: "collected",
        label: "Partículas coletadas",
        goal: 650,
        rewardCoins: 90,
        rewardXp: 90,
      }),
      Object.freeze({
        id: "score",
        label: "Pontuação acumulada",
        goal: 1800,
        rewardCoins: 110,
        rewardXp: 110,
      }),
      Object.freeze({
        id: "matches",
        label: "Partidas concluídas",
        goal: 5,
        rewardCoins: 80,
        rewardXp: 80,
      }),
    ]),
  }),
  Object.freeze({
    id: "hunter-week",
    icon: "🎯",
    name: "Semana da Caçada",
    description: "Elimine adversários e dispute as primeiras posições.",
    objectives: Object.freeze([
      Object.freeze({
        id: "eliminations",
        label: "Eliminações",
        goal: 9,
        rewardCoins: 140,
        rewardXp: 135,
      }),
      Object.freeze({
        id: "top5",
        label: "Resultados no Top 5",
        goal: 3,
        rewardCoins: 120,
        rewardXp: 110,
      }),
      Object.freeze({
        id: "matches",
        label: "Partidas concluídas",
        goal: 6,
        rewardCoins: 90,
        rewardXp: 85,
      }),
    ]),
  }),
  Object.freeze({
    id: "survival-marathon",
    icon: "🛡️",
    name: "Maratona da Arena",
    description: "Sobreviva, cresça e permaneça ativo por várias partidas.",
    objectives: Object.freeze([
      Object.freeze({
        id: "survival",
        label: "Segundos sobrevividos",
        goal: 600,
        rewardCoins: 120,
        rewardXp: 120,
      }),
      Object.freeze({
        id: "mass",
        label: "Massa acumulada",
        goal: 1500,
        rewardCoins: 115,
        rewardXp: 105,
      }),
      Object.freeze({
        id: "collected",
        label: "Partículas coletadas",
        goal: 500,
        rewardCoins: 100,
        rewardXp: 95,
      }),
    ]),
  }),
  Object.freeze({
    id: "neon-ascent",
    icon: "⚡",
    name: "Ascensão Neon",
    description: "Some desempenho completo para dominar o placar semanal.",
    objectives: Object.freeze([
      Object.freeze({
        id: "score",
        label: "Pontuação acumulada",
        goal: 2400,
        rewardCoins: 135,
        rewardXp: 125,
      }),
      Object.freeze({
        id: "eliminations",
        label: "Eliminações",
        goal: 6,
        rewardCoins: 120,
        rewardXp: 120,
      }),
      Object.freeze({
        id: "survival",
        label: "Segundos sobrevividos",
        goal: 420,
        rewardCoins: 100,
        rewardXp: 100,
      }),
    ]),
  }),
]);

function getMonday(date) {
  const value = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12
  );

  const day = value.getDay();
  const difference = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + difference);
  return value;
}

function hash(value) {
  let result = 0;

  for (const character of value) {
    result = Math.imul(31, result) + character.charCodeAt(0);
    result |= 0;
  }

  return Math.abs(result);
}

export function getWeeklyEventInfo(date = new Date()) {
  const start = getMonday(date);
  const end = new Date(start.getTime() + WEEK_MS);
  const yearStart = new Date(start.getFullYear(), 0, 1, 12);
  const weekNumber = Math.ceil(
    ((start.getTime() - yearStart.getTime()) / 86_400_000 +
      yearStart.getDay() +
      1) /
      7
  );

  const key = `${start.getFullYear()}-W${String(
    weekNumber
  ).padStart(2, "0")}`;

  const template =
    EVENT_TEMPLATES[hash(key) % EVENT_TEMPLATES.length];

  return {
    key,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    daysRemaining: Math.max(
      0,
      Math.ceil((end.getTime() - date.getTime()) / 86_400_000)
    ),
    ...template,
  };
}

export const WEEKLY_COMPLETION_REWARD = Object.freeze({
  coins: 320,
  profileXp: 280,
  seasonPoints: 220,
  titleId: "campeao-semanal",
});
