export class Particle {
  constructor() {
    this.active = false;
    this.activeIndex = -1;
    this.x = 0;
    this.y = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.life = 0;
    this.maximumLife = 1;
    this.size = 1;
    this.color = "#ffffff";
    this.drag = 0.92;
  }

  reset({
    x,
    y,
    velocityX,
    velocityY,
    life,
    size,
    color,
    drag = 0.92,
  }) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.life = life;
    this.maximumLife = life;
    this.size = size;
    this.color = color;
    this.drag = drag;
  }

  update(delta) {
    this.life -= delta;

    if (this.life <= 0) {
      this.active = false;
      return;
    }

    const frameDrag = Math.pow(this.drag, delta * 60);
    this.velocityX *= frameDrag;
    this.velocityY *= frameDrag;
    this.x += this.velocityX * delta;
    this.y += this.velocityY * delta;
  }

  getProgress() {
    return Math.max(0, this.life / Math.max(this.maximumLife, 0.0001));
  }

  deactivate() {
    this.active = false;
    this.activeIndex = -1;
  }
}
