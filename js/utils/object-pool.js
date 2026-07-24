export class ObjectPool {
  constructor(factory, resetter = null) {
    if (typeof factory !== "function") {
      throw new TypeError("ObjectPool precisa de uma função factory.");
    }

    this.factory = factory;
    this.resetter = resetter;
    this.available = [];
    this.createdCount = 0;
  }

  acquire() {
    if (this.available.length > 0) {
      return this.available.pop();
    }

    this.createdCount += 1;
    return this.factory();
  }

  release(item) {
    if (!item) {
      return;
    }

    this.resetter?.(item);
    this.available.push(item);
  }

  prewarm(count) {
    const safeCount = Math.max(0, Math.floor(count));

    for (let index = 0; index < safeCount; index += 1) {
      this.release(this.factory());
      this.createdCount += 1;
    }
  }

  getAvailableCount() {
    return this.available.length;
  }

  getCreatedCount() {
    return this.createdCount;
  }

  clear() {
    this.available.length = 0;
    this.createdCount = 0;
  }
}
