import { Snake } from "./snake.js";
import { getSkinById } from "../skins/skin-catalog.js";

export class PlayerSnake extends Snake {
  constructor(options = {}) {
    const skin = getSkinById(options.skinId);

    super({
      id: "player",
      name: options.name ?? "Jogador",
      x: options.x ?? 0,
      y: options.y ?? 0,
      angle: options.angle ?? 0,
      primaryColor: skin.primaryColor,
      secondaryColor: skin.secondaryColor,
      skinPattern: skin.skinPattern,
      eyeStyle: skin.eyeStyle,
      isPlayer: true,
    });

    this.skinId = skin.id;
  }

  applySkin(skinId) {
    const skin = getSkinById(skinId);

    this.skinId = skin.id;
    this.primaryColor = skin.primaryColor;
    this.secondaryColor = skin.secondaryColor;
    this.skinPattern = skin.skinPattern;
    this.eyeStyle = skin.eyeStyle;

    return skin;
  }

  updateFromDirection(delta, direction) {
    this.setTargetDirection(direction.x, direction.y);
    this.update(delta);
  }
}
