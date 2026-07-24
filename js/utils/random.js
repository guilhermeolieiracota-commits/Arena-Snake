export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function randomInteger(min, maxInclusive) {
  return Math.floor(randomBetween(min, maxInclusive + 1));
}

export function randomItem(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return undefined;
  }

  return items[Math.floor(Math.random() * items.length)];
}

export function randomPointInCircle(radius, centerX = 0, centerY = 0) {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.sqrt(Math.random()) * radius;

  return {
    x: centerX + Math.cos(angle) * distance,
    y: centerY + Math.sin(angle) * distance,
  };
}

export function randomPointNearCircle(
  centerX,
  centerY,
  radius,
  maximumWorldRadius
) {
  const point = randomPointInCircle(radius, centerX, centerY);
  const distanceFromWorldCenter = Math.hypot(point.x, point.y);

  if (distanceFromWorldCenter <= maximumWorldRadius) {
    return point;
  }

  const scale = maximumWorldRadius / Math.max(distanceFromWorldCenter, 1);

  return {
    x: point.x * scale,
    y: point.y * scale,
  };
}
