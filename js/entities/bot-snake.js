import { Snake } from "./snake.js";

export class BotSnake extends Snake {
  constructor(options) {
    super({ ...options, isPlayer: false });
    this.profileId = options.profileId;
    this.profileLabel = options.profileLabel;
  }

  updateFromDecision(delta, direction) {
    this.setTargetDirection(direction.x, direction.y);
    this.update(delta);
  }
}
