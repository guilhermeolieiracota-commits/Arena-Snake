export const PLAYER_SKINS = Object.freeze([
  Object.freeze({
    id: "neon-mint",
    name: "Menta Neon",
    description: "A identidade clássica do Snake Arena.",
    primaryColor: "#52f2b2",
    secondaryColor: "#55d9ff",
    skinPattern: "alternating",
    eyeStyle: "round",
    price: 0,
    starter: true,
    rarity: "Comum",
  }),
  Object.freeze({
    id: "ocean",
    name: "Oceano",
    description: "Azul elétrico e ciano luminoso.",
    primaryColor: "#4d78ff",
    secondaryColor: "#55d9ff",
    skinPattern: "waves",
    eyeStyle: "round",
    price: 0,
    starter: true,
    rarity: "Comum",
  }),
  Object.freeze({
    id: "solar",
    name: "Solar",
    description: "Dourado intenso com detalhes quentes.",
    primaryColor: "#ffd966",
    secondaryColor: "#ff8f65",
    skinPattern: "waves",
    eyeStyle: "focused",
    price: 280,
    starter: false,
    rarity: "Rara",
  }),
  Object.freeze({
    id: "jade",
    name: "Jade",
    description: "Verde forte com aparência sólida.",
    primaryColor: "#7cf05f",
    secondaryColor: "#52f2b2",
    skinPattern: "solid",
    eyeStyle: "focused",
    price: 340,
    starter: false,
    rarity: "Rara",
  }),
  Object.freeze({
    id: "nebula",
    name: "Nébula",
    description: "Roxo espacial com brilho rosado.",
    primaryColor: "#a77bff",
    secondaryColor: "#ff7bd4",
    skinPattern: "stripes",
    eyeStyle: "wide",
    price: 430,
    starter: false,
    rarity: "Épica",
  }),
  Object.freeze({
    id: "magma",
    name: "Magma",
    description: "Vermelho vivo com energia laranja.",
    primaryColor: "#ff657a",
    secondaryColor: "#ff9f43",
    skinPattern: "stripes",
    eyeStyle: "focused",
    price: 520,
    starter: false,
    rarity: "Épica",
  }),
  Object.freeze({
    id: "cyber",
    name: "Cyber",
    description: "Ciano e violeta em alto contraste.",
    primaryColor: "#82e6ff",
    secondaryColor: "#8e6dff",
    skinPattern: "alternating",
    eyeStyle: "wide",
    price: 650,
    starter: false,
    rarity: "Lendária",
  }),
  Object.freeze({
    id: "royal",
    name: "Royal",
    description: "Roxo profundo com acabamento dourado.",
    primaryColor: "#7f5cff",
    secondaryColor: "#ffd966",
    skinPattern: "waves",
    eyeStyle: "focused",
    price: 820,
    starter: false,
    rarity: "Lendária",
  }),
]);

export const DEFAULT_SKIN_ID = PLAYER_SKINS[0].id;

export function getSkinById(skinId) {
  return (
    PLAYER_SKINS.find((skin) => skin.id === skinId) ??
    PLAYER_SKINS[0]
  );
}

export function isValidSkinId(skinId) {
  return PLAYER_SKINS.some((skin) => skin.id === skinId);
}

export function getStarterSkinIds() {
  return PLAYER_SKINS
    .filter((skin) => skin.starter)
    .map((skin) => skin.id);
}
