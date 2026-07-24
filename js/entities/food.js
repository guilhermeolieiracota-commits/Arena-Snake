export const FoodType = Object.freeze({
  COMMON: "COMMON",
  SPECIAL: "SPECIAL",
  BOOST_DROP: "BOOST_DROP",
  REMAINS: "REMAINS",
});

export class Food {
  constructor() {
    this.active = false;
    this.activeIndex = -1;
    this.x = 0;
    this.y = 0;
    this.radius = 4;
    this.scoreValue = 1;
    this.massValue = 1;
    this.type = FoodType.COMMON;
    this.color = "#52f2b2";
    this.secondaryColor = "#55d9ff";
    this.phase = 0;
    this.rotation = 0;
    this.replaceOnCollect = true;
    this.isNatural = true;
    this.spawnOrder = 0;
  }

  reset({
    x,
    y,
    radius,
    scoreValue,
    massValue,
    type,
    color,
    secondaryColor,
    phase,
    replaceOnCollect = true,
    isNatural = true,
    spawnOrder = 0,
  }) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.scoreValue = scoreValue;
    this.massValue = massValue;
    this.type = type;
    this.color = color;
    this.secondaryColor = secondaryColor;
    this.phase = phase;
    this.rotation = phase;
    this.replaceOnCollect = replaceOnCollect;
    this.isNatural = isNatural;
    this.spawnOrder = spawnOrder;
  }

  moveToward(targetX, targetY, delta, speed) {
    const differenceX = targetX - this.x;
    const differenceY = targetY - this.y;
    const distance = Math.hypot(differenceX, differenceY);

    if (distance <= 0.0001) {
      return;
    }

    const movement = Math.min(distance, speed * delta);
    this.x += (differenceX / distance) * movement;
    this.y += (differenceY / distance) * movement;
    this.rotation += delta * 5;
  }

  deactivate() {
    this.active = false;
    this.activeIndex = -1;
    this.isNatural = false;
    this.replaceOnCollect = false;
    this.spawnOrder = 0;
  }
}
