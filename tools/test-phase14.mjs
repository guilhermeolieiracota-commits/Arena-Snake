import assert from "node:assert/strict";
import { Snake } from "../js/entities/snake.js";
import {
  CollisionReason,
  CollisionSystem,
} from "../js/systems/collision-system.js";
import { PredationSystem } from "../js/systems/predation-system.js";
import { BALANCE_CONFIG } from "../js/config/balance-config.js";

class ParticleSystemStub {
  constructor() {
    this.events = [];
  }

  spawnCollection(event, options) {
    this.events.push({ event, options });
  }
}

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

// A borda deve repelir, não matar nem permitir que a cobra saia da arena.
const boundarySnake = createSnake({
  id: "boundary",
  x:
    BALANCE_CONFIG.worldRadius -
    BALANCE_CONFIG.boundaryHardPadding -
    BALANCE_CONFIG.snakeBaseRadius -
    1,
  y: 0,
  angle: 0,
  mass: 120,
  segmentCount: 30,
});

boundarySnake.update(0.5);

const maximumDistance =
  BALANCE_CONFIG.worldRadius -
  BALANCE_CONFIG.boundaryHardPadding -
  boundarySnake.radius;

assert.ok(
  Math.hypot(boundarySnake.x, boundarySnake.y) <=
    maximumDistance + 0.001,
  "A cobra precisa permanecer dentro da arena."
);
assert.equal(
  boundarySnake.isAlive,
  true,
  "Encostar na borda não pode matar a cobra."
);
assert.ok(
  Math.cos(boundarySnake.angle) < 0,
  "A direção deve ser refletida para dentro da arena."
);

const borderCollisionSystem = new CollisionSystem();
const borderResult = borderCollisionSystem.detect(
  [boundarySnake],
  0.016
);

assert.equal(
  borderResult.deaths.length,
  0,
  "A borda não pode gerar evento de morte."
);

// Uma cobra claramente maior deve consumir um segmento da menor.
const prey = createSnake({
  id: "prey",
  x: 0,
  y: 0,
  angle: 0,
  mass: 100,
  segmentCount: 26,
});

const preySegment = prey.getSegmentPositions()[6];

const predator = createSnake({
  id: "predator",
  x: preySegment.x,
  y: preySegment.y,
  angle: Math.PI / 2,
  mass: 260,
  segmentCount: 47,
  isPlayer: true,
});

const collisionSystem = new CollisionSystem();
const collisionResult = collisionSystem.detect(
  [predator, prey],
  0.21
);

assert.equal(
  collisionResult.deaths.length,
  0,
  "A cobra maior não deve morrer ao tocar o corpo da menor."
);
assert.equal(
  collisionResult.bites.length,
  1,
  "O contato deve gerar uma mordida por intervalo."
);
assert.equal(
  collisionResult.bites[0].reason,
  CollisionReason.PREDATION,
  "A colisão deve ser marcada como predação."
);

const predatorMassBefore = predator.mass;
const predatorTargetBefore = predator.targetSegmentCount;
const preyMassBefore = prey.mass;
const preySegmentsBefore = prey.segmentCount;
const particleSystem = new ParticleSystemStub();
const predationSystem = new PredationSystem();

const biteResults = predationSystem.process({
  events: collisionResult.bites,
  particleSystem,
});

assert.equal(biteResults.length, 1);
assert.equal(
  prey.segmentCount,
  preySegmentsBefore - 1,
  "A vítima deve perder exatamente um segmento por mordida."
);
assert.equal(
  prey.mass,
  preyMassBefore -
    BALANCE_CONFIG.predation.victimMassLossPerBite,
  "A vítima deve perder massa a cada segmento consumido."
);
assert.equal(
  predator.mass,
  predatorMassBefore +
    BALANCE_CONFIG.predation.predatorMassGainPerBite,
  "A cobra maior deve ganhar massa por segmento consumido."
);
assert.ok(
  predator.targetSegmentCount > predatorTargetBefore,
  "Cada mordida deve aumentar a meta de crescimento da cobra maior."
);
assert.equal(
  particleSystem.events.length,
  1,
  "A mordida deve produzir efeito visual."
);

// O cooldown impede múltiplas mordidas no mesmo instante.
const cooldownResult = collisionSystem.detect(
  [predator, prey],
  0.01
);
assert.equal(
  cooldownResult.bites.length,
  0,
  "O cooldown deve impedir consumo contínuo em todos os frames."
);

// Uma cobra menor ainda morre ao bater no corpo de uma maior.
const largePrey = createSnake({
  id: "large-prey",
  x: 0,
  y: 0,
  angle: 0,
  mass: 300,
  segmentCount: 52,
});

const largeSegment = largePrey.getSegmentPositions()[6];
const smallAttacker = createSnake({
  id: "small-attacker",
  x: largeSegment.x,
  y: largeSegment.y,
  angle: Math.PI / 2,
  mass: 90,
  segmentCount: 24,
});

const lethalCollisionSystem = new CollisionSystem();
const lethalResult = lethalCollisionSystem.detect(
  [smallAttacker, largePrey],
  0.21
);

assert.equal(lethalResult.bites.length, 0);
assert.equal(lethalResult.deaths.length, 1);
assert.equal(
  lethalResult.deaths[0].victim,
  smallAttacker,
  "A cobra menor deve morrer ao atacar o corpo da maior."
);
assert.equal(
  lethalResult.deaths[0].reason,
  CollisionReason.BODY
);

// A vítima pode ser consumida até o limite e então eliminada.
const minimumPrey = createSnake({
  id: "minimum-prey",
  x: 0,
  y: 0,
  mass: BALANCE_CONFIG.predation.minimumVictimMass,
  segmentCount:
    BALANCE_CONFIG.predation.minimumVictimSegments,
});
const minimumSegment = minimumPrey.getSegmentPositions()[4];
const finishingPredator = createSnake({
  id: "finishing-predator",
  x: minimumSegment.x,
  y: minimumSegment.y,
  angle: Math.PI / 2,
  mass: 300,
  segmentCount: 55,
});

const finishSystem = new CollisionSystem();
const finishResult = finishSystem.detect(
  [finishingPredator, minimumPrey],
  0.21
);

assert.equal(finishResult.bites.length, 0);
assert.equal(finishResult.deaths.length, 1);
assert.equal(
  finishResult.deaths[0].reason,
  CollisionReason.PREDATION,
  "Ao chegar ao tamanho mínimo, a próxima mordida deve finalizar a vítima."
);
assert.equal(
  finishResult.deaths[0].killer,
  finishingPredator
);

// As regras mobile devem estar limitadas a media queries.
const responsiveCss = await import("node:fs/promises").then(
  ({ readFile }) =>
    readFile(
      new URL("../css/responsive.css", import.meta.url),
      "utf8"
    )
);

assert.match(
  responsiveCss,
  /Fase 14 — correção mobile/
);
assert.match(
  responsiveCss,
  /@media \(max-width: 720px\)/
);
assert.match(
  responsiveCss,
  /body\.gameplay-active \.action-banner--update/
);

const mainSource = await import("node:fs/promises").then(
  ({ readFile }) =>
    readFile(
      new URL("../js/main.js", import.meta.url),
      "utf8"
    )
);

assert.match(mainSource, /const toastQueue = \[\]/);
assert.match(mainSource, /isZeroValueReward/);
assert.match(mainSource, /gameplay-active/);

console.log("Testes lógicos da Fase 14 aprovados.");
