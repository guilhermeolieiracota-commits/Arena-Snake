const sessionNumber = (context, key) =>
  Math.max(0, Number(context.session?.[key]) || 0);

export const DAILY_CHALLENGE_CATALOG = Object.freeze([
  Object.freeze({
    id: "play-match",
    category: "match",
    icon: "🎮",
    title: "Entre na arena",
    description: "Conclua uma partida.",
    goal: 1,
    reward: 45,
    progress: (context) =>
      sessionNumber(context, "matchesCompleted"),
  }),
  Object.freeze({
    id: "collect-60",
    category: "collect",
    icon: "✨",
    title: "Coleta rápida",
    description: "Colete 60 partículas.",
    goal: 60,
    reward: 60,
    progress: (context) =>
      sessionNumber(context, "collected"),
  }),
  Object.freeze({
    id: "collect-140",
    category: "collect",
    icon: "🌟",
    title: "Campo magnético",
    description: "Colete 140 partículas.",
    goal: 140,
    reward: 95,
    progress: (context) =>
      sessionNumber(context, "collected"),
  }),
  Object.freeze({
    id: "score-120",
    category: "score",
    icon: "💯",
    title: "Pontuação crescente",
    description: "Alcance 120 pontos.",
    goal: 120,
    reward: 70,
    progress: (context) =>
      sessionNumber(context, "score"),
  }),
  Object.freeze({
    id: "score-300",
    category: "score",
    icon: "🚀",
    title: "Pontuação de elite",
    description: "Alcance 300 pontos.",
    goal: 300,
    reward: 120,
    progress: (context) =>
      sessionNumber(context, "score"),
  }),
  Object.freeze({
    id: "mass-220",
    category: "mass",
    icon: "🐍",
    title: "Crescimento constante",
    description: "Alcance 220 de massa.",
    goal: 220,
    reward: 75,
    progress: (context) =>
      Math.max(
        sessionNumber(context, "mass"),
        sessionNumber(context, "maximumMass")
      ),
  }),
  Object.freeze({
    id: "mass-420",
    category: "mass",
    icon: "🐉",
    title: "Dominador gigante",
    description: "Alcance 420 de massa.",
    goal: 420,
    reward: 135,
    progress: (context) =>
      Math.max(
        sessionNumber(context, "mass"),
        sessionNumber(context, "maximumMass")
      ),
  }),
  Object.freeze({
    id: "survive-45",
    category: "survive",
    icon: "⏱️",
    title: "Resista à pressão",
    description: "Sobreviva por 45 segundos.",
    goal: 45,
    reward: 70,
    progress: (context) =>
      sessionNumber(context, "elapsedTime"),
  }),
  Object.freeze({
    id: "survive-90",
    category: "survive",
    icon: "🛡️",
    title: "Sobrevivente avançado",
    description: "Sobreviva por 90 segundos.",
    goal: 90,
    reward: 125,
    progress: (context) =>
      sessionNumber(context, "elapsedTime"),
  }),
  Object.freeze({
    id: "eliminate-1",
    category: "eliminate",
    icon: "💥",
    title: "Primeiro impacto",
    description: "Faça uma eliminação.",
    goal: 1,
    reward: 90,
    progress: (context) =>
      sessionNumber(context, "eliminations"),
  }),
  Object.freeze({
    id: "eliminate-3",
    category: "eliminate",
    icon: "🎯",
    title: "Caçada tripla",
    description: "Faça três eliminações.",
    goal: 3,
    reward: 160,
    progress: (context) =>
      sessionNumber(context, "eliminations"),
  }),
  Object.freeze({
    id: "top-5",
    category: "rank",
    icon: "🏅",
    title: "Entre no Top 5",
    description: "Termine uma partida entre os cinco melhores.",
    goal: 1,
    reward: 130,
    progress: (context) => {
      const rank = Number(context.session?.rank);
      return Number.isFinite(rank) && rank > 0 && rank <= 5 ? 1 : 0;
    },
  }),
]);

export const DAILY_CHALLENGE_MAP = Object.freeze(
  Object.fromEntries(
    DAILY_CHALLENGE_CATALOG.map((challenge) => [
      challenge.id,
      challenge,
    ])
  )
);

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createDailyChallengeIds(dateKey) {
  const random = seededRandom(hashString(`snake-arena:${dateKey}`));

  const groupMap = new Map();

  for (const challenge of DAILY_CHALLENGE_CATALOG) {
    const group = groupMap.get(challenge.category) ?? [];
    group.push(challenge);
    groupMap.set(challenge.category, group);
  }

  const selected = [];
  const availableGroups = Array.from(groupMap.values());

  while (
    selected.length < 3 &&
    availableGroups.length > 0
  ) {
    const groupIndex = Math.floor(
      random() * availableGroups.length
    );

    const group = availableGroups.splice(
      groupIndex,
      1
    )[0];

    const challenge = group[
      Math.floor(random() * group.length)
    ];

    selected.push(challenge.id);
  }

  return selected;
}
