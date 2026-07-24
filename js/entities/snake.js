import { BALANCE_CONFIG } from "../config/balance-config.js";
import {
  clamp,
  distance,
  exponentialSmoothing,
  moveAngleTowards,
} from "../utils/math.js";

let nextSnakeId = 1;

export class Snake {
  constructor({
    id = null,
    name = "Cobra",
    x = 0,
    y = 0,
    angle = 0,
    segmentCount = BALANCE_CONFIG.initialSegments,
    mass = BALANCE_CONFIG.initialPlayerMass,
    primaryColor = "#52f2b2",
    secondaryColor = "#55d9ff",
    skinPattern = "alternating",
    eyeStyle = "round",
    isPlayer = false,
  } = {}) {
    this.id = id ?? `snake-${nextSnakeId++}`;
    this.name = name;
    this.isPlayer = isPlayer;
    this.isBot = !isPlayer;

    this.x = x;
    this.y = y;
    this.angle = angle;
    this.targetAngle = angle;

    this.baseSpeed = BALANCE_CONFIG.normalSpeed;
    this.speed = this.baseSpeed;
    this.boostIntensity = 0;

    this.baseRadius = BALANCE_CONFIG.snakeBaseRadius;
    this.radius = this.baseRadius;
    this.targetRadius = this.baseRadius;

    this.segmentSpacing = BALANCE_CONFIG.segmentSpacing;
    this.pathSampleSpacing = BALANCE_CONFIG.pathSampleSpacing;
    this.segmentCount = segmentCount;
    this.targetSegmentCount = segmentCount;
    this.segmentGrowthAccumulator = 0;

    this.initialMass = BALANCE_CONFIG.initialPlayerMass;
    this.mass = mass;
    this.score = 0;
    this.collectedCount = 0;
    this.eliminations = 0;
    this.maximumMass = mass;

    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;
    this.skinPattern = skinPattern;
    this.eyeStyle = eyeStyle;
    this.profileId = null;
    this.profileLabel = "";

    this.spawnProtectionRemaining = isPlayer
      ? BALANCE_CONFIG.spawnProtection.playerSeconds
      : BALANCE_CONFIG.spawnProtection.botSeconds;

    this.pathHistory = [];
    this.segmentPositions = [];
    this.isAlive = true;

    this.resetPath();
    this.recalculateGrowthTargets();
  }

  setTargetDirection(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }

    if (Math.abs(x) < 0.0001 && Math.abs(y) < 0.0001) {
      return;
    }

    this.targetAngle = Math.atan2(y, x);
  }

  setBoostIntensity(intensity) {
    this.boostIntensity = clamp(Number(intensity) || 0, 0, 1);
  }

  setSpawnProtection(seconds) {
    this.spawnProtectionRemaining = Math.max(0, Number(seconds) || 0);
  }

  isProtected() {
    return this.spawnProtectionRemaining > 0;
  }

  addElimination() {
    this.eliminations += 1;
  }

  update(delta) {
    if (!this.isAlive) {
      return;
    }

    this.spawnProtectionRemaining = Math.max(
      0,
      this.spawnProtectionRemaining - delta
    );

    this.updateGrowth(delta);
    this.updateRadiusAndSpeed(delta);

    const turnReduction = 1 - this.boostIntensity * 0.10;
    const maxTurn =
      BALANCE_CONFIG.maxTurnRate *
      turnReduction *
      delta;

    this.angle = moveAngleTowards(
      this.angle,
      this.targetAngle,
      maxTurn
    );

    const previousX = this.x;
    const previousY = this.y;

    this.x += Math.cos(this.angle) * this.speed * delta;
    this.y += Math.sin(this.angle) * this.speed * delta;

    this.resolveArenaBoundary();

    this.samplePath(previousX, previousY, this.x, this.y);
    this.trimPath();
    this.rebuildSegmentPositions();
  }

  addFood({ scoreValue, massValue }) {
    this.score += Math.max(0, Number(scoreValue) || 0);
    this.mass += Math.max(0, Number(massValue) || 0);
    this.maximumMass = Math.max(this.maximumMass, this.mass);
    this.collectedCount += 1;
    this.recalculateGrowthTargets();
  }

  addPredationSegment({ scoreValue, massValue }) {
    this.score += Math.max(0, Number(scoreValue) || 0);
    this.mass += Math.max(0, Number(massValue) || 0);
    this.maximumMass = Math.max(this.maximumMass, this.mass);
    this.recalculateGrowthTargets();
  }

  canLosePredationSegment() {
    return (
      this.segmentCount >
        BALANCE_CONFIG.predation.minimumVictimSegments &&
      this.mass >
        BALANCE_CONFIG.predation.minimumVictimMass
    );
  }

  consumePredationSegment() {
    if (!this.canLosePredationSegment()) {
      return null;
    }

    const removedPosition =
      this.segmentPositions.at(-1) ?? {
        x: this.x,
        y: this.y,
      };

    this.mass = Math.max(
      BALANCE_CONFIG.predation.minimumVictimMass,
      this.mass -
        BALANCE_CONFIG.predation.victimMassLossPerBite
    );

    this.segmentCount = Math.max(
      BALANCE_CONFIG.predation.minimumVictimSegments,
      this.segmentCount - 1
    );

    this.recalculateGrowthTargets();
    this.targetSegmentCount = Math.min(
      this.targetSegmentCount,
      this.segmentCount
    );

    this.trimPath();
    this.rebuildSegmentPositions();

    return {
      x: removedPosition.x,
      y: removedPosition.y,
      radius: Math.max(3.5, this.radius * 0.72),
      color: this.primaryColor,
      secondaryColor: this.secondaryColor,
    };
  }

  removeMass(amount) {
    const safeAmount = Math.max(0, Number(amount) || 0);
    this.mass = Math.max(1, this.mass - safeAmount);
    this.recalculateGrowthTargets();
  }

  recalculateGrowthTargets() {
    const massDifference =
      this.mass - BALANCE_CONFIG.initialPlayerMass;

    if (massDifference >= 0) {
      this.targetSegmentCount =
        BALANCE_CONFIG.initialSegments +
        Math.floor(
          massDifference /
            BALANCE_CONFIG.massPerSegment
        );
    } else {
      this.targetSegmentCount = Math.max(
        BALANCE_CONFIG.predation.minimumVictimSegments,
        BALANCE_CONFIG.initialSegments -
          Math.ceil(
            Math.abs(massDifference) /
              BALANCE_CONFIG.predation
                .victimMassLossPerBite
          )
      );
    }

    const gainedMass = Math.max(0, massDifference);

    const radiusProgress = clamp(
      gainedMass /
        Math.max(
          BALANCE_CONFIG.massForMaximumRadius -
            BALANCE_CONFIG.initialPlayerMass,
          1
        ),
      0,
      1
    );

    if (massDifference < 0) {
      const depletionProgress = clamp(
        Math.abs(massDifference) /
          Math.max(
            BALANCE_CONFIG.initialPlayerMass -
              BALANCE_CONFIG.predation.minimumVictimMass,
            1
          ),
        0,
        1
      );

      this.targetRadius =
        BALANCE_CONFIG.snakeBaseRadius *
        (1 -
          depletionProgress *
            (1 -
              BALANCE_CONFIG.predation
                .minimumVictimRadiusFactor));
    } else {
      this.targetRadius =
        BALANCE_CONFIG.snakeBaseRadius +
        (BALANCE_CONFIG.snakeMaximumRadius -
          BALANCE_CONFIG.snakeBaseRadius) *
          Math.sqrt(radiusProgress);
    }
  }

  updateGrowth(delta) {
    if (this.segmentCount === this.targetSegmentCount) {
      this.segmentGrowthAccumulator = 0;
      return;
    }

    const growing = this.targetSegmentCount > this.segmentCount;
    const rate = growing
      ? BALANCE_CONFIG.segmentGrowthPerSecond
      : BALANCE_CONFIG.segmentShrinkPerSecond;

    this.segmentGrowthAccumulator += rate * delta;

    while (
      this.segmentGrowthAccumulator >= 1 &&
      this.segmentCount !== this.targetSegmentCount
    ) {
      this.segmentCount += growing ? 1 : -1;
      this.segmentGrowthAccumulator -= 1;
    }
  }

  updateRadiusAndSpeed(delta) {
    this.radius = exponentialSmoothing(
      this.radius,
      this.targetRadius,
      3.8,
      delta
    );

    const sizeProgress = clamp(
      (this.mass - BALANCE_CONFIG.initialPlayerMass) /
        Math.max(
          BALANCE_CONFIG.massForMaximumRadius -
            BALANCE_CONFIG.initialPlayerMass,
          1
        ),
      0,
      1
    );

    const sizeSpeedFactor =
      1 -
      sizeProgress *
        (1 - BALANCE_CONFIG.minimumLargeSnakeSpeedFactor);

    const boostSpeedFactor =
      1 +
      (BALANCE_CONFIG.boost.speedMultiplier - 1) *
        this.boostIntensity;

    const targetSpeed =
      this.baseSpeed *
      sizeSpeedFactor *
      boostSpeedFactor;

    this.speed = exponentialSmoothing(
      this.speed,
      targetSpeed,
      this.boostIntensity > 0.05 ? 8.5 : 4.5,
      delta
    );
  }

  resolveArenaBoundary() {
    const maximumDistance = Math.max(
      1,
      BALANCE_CONFIG.worldRadius -
        BALANCE_CONFIG.boundaryHardPadding -
        this.radius
    );

    const distanceFromCenter = Math.hypot(
      this.x,
      this.y
    );

    if (
      !Number.isFinite(distanceFromCenter) ||
      distanceFromCenter <= maximumDistance
    ) {
      return false;
    }

    const normalX = this.x / distanceFromCenter;
    const normalY = this.y / distanceFromCenter;

    this.x = normalX * maximumDistance;
    this.y = normalY * maximumDistance;

    const velocityX = Math.cos(this.angle);
    const velocityY = Math.sin(this.angle);
    const outwardSpeed =
      velocityX * normalX +
      velocityY * normalY;

    let reflectedX = velocityX;
    let reflectedY = velocityY;

    if (outwardSpeed > 0) {
      reflectedX =
        velocityX -
        2 * outwardSpeed * normalX;
      reflectedY =
        velocityY -
        2 * outwardSpeed * normalY;
    }

    reflectedX -= normalX * 0.22;
    reflectedY -= normalY * 0.22;

    const reflectedLength = Math.hypot(
      reflectedX,
      reflectedY
    );

    if (reflectedLength > 0.0001) {
      this.angle = Math.atan2(
        reflectedY,
        reflectedX
      );
      this.targetAngle = this.angle;
    } else {
      this.angle = Math.atan2(
        -normalY,
        -normalX
      );
      this.targetAngle = this.angle;
    }

    return true;
  }

  reset({
    x = 0,
    y = 0,
    angle = 0,
    mass = BALANCE_CONFIG.initialPlayerMass,
  } = {}) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.targetAngle = angle;

    this.mass = mass;
    this.initialMass = BALANCE_CONFIG.initialPlayerMass;
    this.score = 0;
    this.collectedCount = 0;
    this.eliminations = 0;
    this.maximumMass = mass;
    this.boostIntensity = 0;

    this.segmentCount = BALANCE_CONFIG.initialSegments;
    this.targetSegmentCount = BALANCE_CONFIG.initialSegments;
    this.segmentGrowthAccumulator = 0;

    this.radius = BALANCE_CONFIG.snakeBaseRadius;
    this.targetRadius = BALANCE_CONFIG.snakeBaseRadius;
    this.speed = this.baseSpeed;
    this.isAlive = true;

    this.spawnProtectionRemaining = this.isPlayer
      ? BALANCE_CONFIG.spawnProtection.playerSeconds
      : BALANCE_CONFIG.spawnProtection.botSeconds;

    this.recalculateGrowthTargets();
    this.resetPath();
  }

  resetPath() {
    this.pathHistory.length = 0;

    const requiredLength =
      Math.max(this.segmentCount, this.targetSegmentCount) *
        this.segmentSpacing +
      this.segmentSpacing * 6;

    const sampleCount = Math.ceil(
      requiredLength / this.pathSampleSpacing
    );

    for (let index = 1; index <= sampleCount; index += 1) {
      const offset = index * this.pathSampleSpacing;

      this.pathHistory.push({
        x: this.x - Math.cos(this.angle) * offset,
        y: this.y - Math.sin(this.angle) * offset,
      });
    }

    this.rebuildSegmentPositions();
  }

  samplePath(previousX, previousY, currentX, currentY) {
    let anchorX = this.pathHistory[0]?.x ?? previousX;
    let anchorY = this.pathHistory[0]?.y ?? previousY;
    let remainingDistance = distance(
      anchorX,
      anchorY,
      currentX,
      currentY
    );

    while (remainingDistance >= this.pathSampleSpacing) {
      const ratio = this.pathSampleSpacing / remainingDistance;
      const sampleX = anchorX + (currentX - anchorX) * ratio;
      const sampleY = anchorY + (currentY - anchorY) * ratio;

      this.pathHistory.unshift({ x: sampleX, y: sampleY });
      anchorX = sampleX;
      anchorY = sampleY;

      remainingDistance = distance(
        anchorX,
        anchorY,
        currentX,
        currentY
      );
    }
  }

  trimPath() {
    const requiredDistance =
      Math.max(this.segmentCount, this.targetSegmentCount) *
        this.segmentSpacing +
      this.segmentSpacing * 10;

    const maximumPoints =
      Math.ceil(requiredDistance / this.pathSampleSpacing) + 4;

    if (this.pathHistory.length > maximumPoints) {
      this.pathHistory.length = maximumPoints;
    }
  }

  rebuildSegmentPositions() {
    const positions = [{ x: this.x, y: this.y }];

    if (this.segmentCount <= 1) {
      this.segmentPositions = positions;
      return;
    }

    const path = [
      { x: this.x, y: this.y },
      ...this.pathHistory,
    ];

    let accumulatedDistance = 0;
    let targetDistance = this.segmentSpacing;
    let pathIndex = 1;

    while (
      positions.length < this.segmentCount &&
      pathIndex < path.length
    ) {
      const previous = path[pathIndex - 1];
      const current = path[pathIndex];

      const sectionLength = distance(
        previous.x,
        previous.y,
        current.x,
        current.y
      );

      if (sectionLength <= 0.0001) {
        pathIndex += 1;
        continue;
      }

      if (
        accumulatedDistance + sectionLength >=
        targetDistance
      ) {
        const distanceIntoSection =
          targetDistance - accumulatedDistance;

        const ratio = distanceIntoSection / sectionLength;

        positions.push({
          x:
            previous.x +
            (current.x - previous.x) * ratio,
          y:
            previous.y +
            (current.y - previous.y) * ratio,
        });

        targetDistance += this.segmentSpacing;
      } else {
        accumulatedDistance += sectionLength;
        pathIndex += 1;
      }
    }

    while (positions.length < this.segmentCount) {
      const fallback = positions.at(-1) ?? {
        x: this.x,
        y: this.y,
      };

      positions.push({ ...fallback });
    }

    this.segmentPositions = positions;
  }

  getSegmentPositions() {
    return this.segmentPositions;
  }

  getPathSampleCount() {
    return this.pathHistory.length;
  }
}
