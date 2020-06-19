const DENSITY = 2;
const SCALE = 2;

function start() {
  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);
  // const pixel = ctx.getImageData(0, 0, 1, 1);
  // pixel.data[3] = 255;
  // pixel.data[0] = pixel.data[1] = pixel.data[2] = 0;

  const game = life(Math.floor(canvas.width / SCALE), Math.floor(canvas.height / SCALE));

  draw([null, game.map()], ctx);
  // requestAnimationFrame and tick
  // and paint.
  // Tick in a webworker then paint in req anim frame?
  const frame = () => {
    draw(game.tick(), ctx)
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function draw(maps, ctx) {
  const toDraw = diff(maps[0], maps[1]);

  // Set pixel color based on directions!
  toDraw.forEach(directions => {
    if (directions[0]) {
      ctx.fillStyle = 'black';
      // pixel.data[0] = pixel.data[1] = pixel.data[2] = 0;
    } else {
      ctx.fillStyle = 'white';
      // pixel.data[0] = pixel.data[1] = pixel.data[2] = 255;
    }
    ctx.fillRect(directions[2], directions[1], 1, 1);
    // ctx.putImageData(pixel, directions[2], directions[1]);
  });
}

function diff(newMap, oldMap) {
  const ret = [];

  if (newMap == null) {
    oldMap.forEach((cell, i, j) => {
      if (cell) {
        ret.push([cell, i, j]);
      }
    });

    return ret;
  }

  newMap.forWith(oldMap, (newCell, oldCell, i, j) => {
    if (newCell != oldCell) {
      ret.push([newCell, i, j])
    }
  });

  return ret;
}

function life(width, height) {
  let map = seed(lifeMap(createMatrix(height, width)));

  return {
    tick: () => {
      oldMap = map;
      map = map.map(rules);
      return [map, oldMap];
    },
    map: () => map,
  };
}

function lifeMap(matrix) {
  return {
    matrix: matrix,
    map(fn) {
      const copy = createMatrix(matrix.rows, matrix.cols);
      for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.cols; ++j) {
          copy[i][j] = fn(matrix[i][j], getNeighbors(matrix, i, j));
        }
      }

      return lifeMap(copy);
    },

    forEach(fn) {
      for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.cols; ++j) {
          fn(matrix[i][j], i, j);
        }
      }
    },

    forWith(other, fn) {
      for (let i = 0; i < matrix.rows; ++i) {
        for (let j = 0; j < matrix.cols; ++j) {
          fn(matrix[i][j], other.matrix[i][j], i, j);
        }
      }
    }
  };
}

function rules(cell, neighbors) {
  const liveNeighbors = neighbors.reduce(
    (liveNeighbors, neighbor) => neighbor ? liveNeighbors + 1 : liveNeighbors,
    0
  );
  if (cell) {
    // apply death rules
    if (liveNeighbors < 2 || liveNeighbors > 3) {
      return false;
    }
    return cell;
  }

  // apply life rules
  if (liveNeighbors === 3) {
    return true;
  }
  return cell;
}

function seed(x) {
  return x.map(() => Math.random() * DENSITY < 1)
}

function getNeighbors(matrix, i, j) {
  return [
    /*north:*/ matrix[wrapIndex(i, -1, matrix.rows)][j],
    /*south:*/ matrix[wrapIndex(i, 1, matrix.rows)][j],
    /*east:*/ matrix[i][wrapIndex(j, -1, matrix.cols)],
    /*west:*/ matrix[i][wrapIndex(j, 1, matrix.cols)],

    /*northEast:*/ matrix[wrapIndex(i, -1, matrix.rows)][wrapIndex(j, -1, matrix.cols)],
    /*northWest:*/ matrix[wrapIndex(i, 1, matrix.rows)][wrapIndex(j, 1, matrix.cols)],

    /*southEast:*/ matrix[wrapIndex(i, 1, matrix.rows)][wrapIndex(j, -1, matrix.cols)],
    /*southWest:*/ matrix[wrapIndex(i, 1, matrix.rows)][wrapIndex(j, 1, matrix.cols)],
  ];
}

function assert(condition) {
  if (!condition) {
    throw new Error('Condition not me');
  }
}

function wrapIndex(index, additive, length) {
  const ret = (index + additive) % length;
  return ret < 0 ? length + ret : ret;
}

function createMatrix(rows, cols, fill) {
  const matrix = [];
  for (let i = 0; i < rows; ++i) {
    const row = [];
    matrix.push(row);
    for (let j = 0; j < cols; ++j) {
      row.push(fill && fill(i, j) || false);
    }
  }

  matrix.rows = rows;
  matrix.cols = cols;
  return matrix;
}

function test() {
  testWrapIndex();
  testGetNeighbors();
}

function testGetNeighbors() {
  const matrix = createMatrix(10, 10, (i, j) => [i,j]);

  console.log(getNeighbors(matrix, 0, 0));
}

function testWrapIndex() {
  let index = wrapIndex(0, 0, 1);
  assert(index === 0);

  index = wrapIndex(0, 1, 1);
  assert(index === 0);

  index = wrapIndex(0, -1, 1);
  assert(index === 0);

  index = wrapIndex(4, 1, 5);
  assert(index === 0);

  index = wrapIndex(0, -1, 5);
  assert(index === 4);

  index = wrapIndex(2, 1, 5);
  assert(index === 3);

  index = wrapIndex(2, -1, 5);
  assert(index === 1);
}

// test();
start();
