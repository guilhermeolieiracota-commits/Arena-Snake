import assert from "node:assert/strict";
import { Snake } from "../js/entities/snake.js";
import { BALANCE_CONFIG } from "../js/config/balance-config.js";
import {
  CollisionReason,
  CollisionSystem,
} from "../js/systems/collision-system.js";

const createSnake = ({
  id,
  x,
  y,
  angle = 0,
  mass,
  segmentCount,
  isPlayer = false,
}) => {
  const snake = new Snake({
    id,
    x,
    y,
    angle,
    mass,
    segmentCount,
    isPlayer,
  });

  snake.setSpawnProtection(0);
  snake.segmentCount = segmentCount;
  snake.targetSegmentCount = segmentCount;
  snake.resetPath();
  return snake;
};

assert.equal(
  BALANCE_CONFIG.collision
    .rivalDiesOnPlayerBody,
  true,
  "A regra de proteção do corpo do jogador deve estar ativada."
);

const player = createSnake({
  id: "player",
  x: 0,
  y: 0,
  angle: 0,
  mass: 100,
  segmentCount: 28,
  isPlayer: true,
});

const targetSegment =
  player.getSegmentPositions()[10];

const largerRival = createSnake({
  id: "larger-rival",
  x: targetSegment.x,
  y: targetSegment.y,
  angle: Math.PI / 2,
  mass: 520,
  segmentCount: 72,
});

const collisionSystem =
  new CollisionSystem();

const result = collisionSystem.detect(
  [player, largerRival],
  0.25
);

assert.equal(
  result.bites.length,
  0,
  "A rival não pode devorar o corpo do jogador."
);

assert.equal(
  result.deaths.length,
  1,
  "A colisão deve eliminar somente a cobra rival."
);

assert.equal(
  result.deaths[0].victim,
  largerRival,
  "A rival deve morrer ao bater no corpo do jogador."
);

assert.equal(
  result.deaths[0].killer,
  player,
  "A eliminação deve ser atribuída ao jogador."
);

assert.equal(
  result.deaths[0].reason,
  CollisionReason.BODY,
  "A causa deve continuar registrada como colisão de corpo."
);

assert.equal(
  result.deaths[0].awardElimination,
  true,
  "O jogador deve receber a eliminação."
);

assert.equal(
  player.isAlive,
  true,
  "O jogador deve continuar vivo."
);

// A regra não altera a colisão inversa: o jogador ainda usa as regras normais
// quando acerta o corpo de uma rival.
const largeBot = createSnake({
  id: "large-bot",
  x: 0,
  y: 0,
  angle: 0,
  mass: 480,
  segmentCount: 70,
});

const largeBotSegment =
  largeBot.getSegmentPositions()[10];

const smallPlayer = createSnake({
  id: "small-player",
  x: largeBotSegment.x,
  y: largeBotSegment.y,
  angle: Math.PI / 2,
  mass: 90,
  segmentCount: 24,
  isPlayer: true,
});

const inverseSystem =
  new CollisionSystem();

const inverseResult = inverseSystem.detect(
  [smallPlayer, largeBot],
  0.25
);

assert.equal(
  inverseResult.deaths.length,
  1,
  "A colisão inversa deve manter as regras anteriores."
);

assert.equal(
  inverseResult.deaths[0].victim,
  smallPlayer,
  "O jogador menor ainda morre ao bater no corpo de uma rival maior."
);

console.log(
  "Testes da regra rival contra corpo do jogador 15.2 aprovados."
);
