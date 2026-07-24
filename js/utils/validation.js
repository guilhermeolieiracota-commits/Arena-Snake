export function sanitizeNickname(value) {
  const cleanValue = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16);

  return cleanValue || "Jogador";
}

export function sanitizeChoice(value, allowedValues, fallback) {
  return allowedValues.includes(value) ? value : fallback;
}
