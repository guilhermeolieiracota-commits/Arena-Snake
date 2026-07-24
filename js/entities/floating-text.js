export class FloatingText {
  constructor() {
    this.active = false;
    this.activeIndex = -1;
    this.x = 0;
    this.y = 0;
    this.text = "";
    this.color = "#ffffff";
    this.life = 0;
    this.maximumLife = 1;
    this.velocityY = -38;
  }

  reset({ x, y, text, color, life = 0.75 }) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = life;
    this.maximumLife = life;
    this.velocityY = -38;
  }

  update(delta) {
    this.life -= delta;
    this.y += this.velocityY * delta;
    this.velocityY *= Math.pow(0.95, delta * 60);

    if (this.life <= 0) {
      this.active = false;
    }
  }

  getProgress() {
    return Math.max(0, this.life / Math.max(this.maximumLife, 0.0001));
  }

  deactivate() {
    this.active = false;
    this.activeIndex = -1;
  }
}
