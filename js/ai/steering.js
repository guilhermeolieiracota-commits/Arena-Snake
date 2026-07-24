import { normalizeVector } from "../utils/math.js";

export function vectorToward(fromX, fromY, toX, toY) {
  return normalizeVector(toX - fromX, toY - fromY, 0, 0);
}

export function rotateVector(vector, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return {
    x: vector.x * cosine - vector.y * sine,
    y: vector.x * sine + vector.y * cosine,
  };
}

export function combineWeighted(vectors, fallback) {
  let x = 0;
  let y = 0;

  for (const entry of vectors) {
    if (!entry?.vector || !Number.isFinite(entry.weight)) {
      continue;
    }

    x += entry.vector.x * entry.weight;
    y += entry.vector.y * entry.weight;
  }

  return normalizeVector(
    x,
    y,
    fallback?.x ?? 1,
    fallback?.y ?? 0
  );
}
