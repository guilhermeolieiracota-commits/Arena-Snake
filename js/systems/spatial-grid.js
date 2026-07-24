export class SpatialGrid {
  constructor(cellSize) {
    if (!Number.isFinite(cellSize) || cellSize <= 0) {
      throw new RangeError("O tamanho da célula deve ser maior que zero.");
    }

    this.cellSize = cellSize;
    this.cells = new Map();
    this.entityKeys = new Map();
  }

  getCellCoordinates(x, y) {
    return {
      column: Math.floor(x / this.cellSize),
      row: Math.floor(y / this.cellSize),
    };
  }

  getKeyFromCoordinates(column, row) {
    return `${column},${row}`;
  }

  getKey(x, y) {
    const { column, row } = this.getCellCoordinates(x, y);
    return this.getKeyFromCoordinates(column, row);
  }

  insert(entity) {
    const key = this.getKey(entity.x, entity.y);
    let bucket = this.cells.get(key);

    if (!bucket) {
      bucket = new Set();
      this.cells.set(key, bucket);
    }

    bucket.add(entity);
    this.entityKeys.set(entity, key);
  }

  update(entity) {
    const previousKey = this.entityKeys.get(entity);
    const nextKey = this.getKey(entity.x, entity.y);

    if (previousKey === nextKey) {
      return;
    }

    this.remove(entity);
    this.insert(entity);
  }

  remove(entity) {
    const key = this.entityKeys.get(entity);

    if (!key) {
      return;
    }

    const bucket = this.cells.get(key);

    if (bucket) {
      bucket.delete(entity);

      if (bucket.size === 0) {
        this.cells.delete(key);
      }
    }

    this.entityKeys.delete(entity);
  }

  queryCircle(x, y, radius) {
    const minimum = this.getCellCoordinates(x - radius, y - radius);
    const maximum = this.getCellCoordinates(x + radius, y + radius);
    const results = [];

    for (
      let column = minimum.column;
      column <= maximum.column;
      column += 1
    ) {
      for (let row = minimum.row; row <= maximum.row; row += 1) {
        const key = this.getKeyFromCoordinates(column, row);
        const bucket = this.cells.get(key);

        if (!bucket) {
          continue;
        }

        for (const entity of bucket) {
          results.push(entity);
        }
      }
    }

    return results;
  }

  clear() {
    this.cells.clear();
    this.entityKeys.clear();
  }

  getCellCount() {
    return this.cells.size;
  }
}
