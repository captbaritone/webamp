// Adapted from https://github.com/morganherlocker/cubic-spline

export default function spline(xs, ys) {
  const ks = getNaturalKs(xs, ys);
  const maxX = xs[xs.length - 1];
  const allYs = [];
  let i = 1;
  for (let x = 0; x <= maxX; x++) {
    while (xs[i] < x) i++;
    const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
    const a = ks[i - 1] * (xs[i] - xs[i - 1]) - (ys[i] - ys[i - 1]);
    const b = -ks[i] * (xs[i] - xs[i - 1]) + (ys[i] - ys[i - 1]);
    const q =
      (1 - t) * ys[i - 1] + t * ys[i] + t * (1 - t) * (a * (1 - t) + b * t);
    allYs.push(q);
  }
  return allYs;
}

function getNaturalKs(xs, ys) {
  const ks = xs.map(() => 0);
  const n = xs.length - 1;
  const matrix = zerosMatrix(n + 1, n + 2);

  for (
    let i = 1;
    i < n;
    i++ // rows
  ) {
    matrix[i][i - 1] = 1 / (xs[i] - xs[i - 1]);
    matrix[i][i] = 2 * (1 / (xs[i] - xs[i - 1]) + 1 / (xs[i + 1] - xs[i]));
    matrix[i][i + 1] = 1 / (xs[i + 1] - xs[i]);
    matrix[i][n + 1] =
      3 *
      ((ys[i] - ys[i - 1]) / ((xs[i] - xs[i - 1]) * (xs[i] - xs[i - 1])) +
        (ys[i + 1] - ys[i]) / ((xs[i + 1] - xs[i]) * (xs[i + 1] - xs[i])));
  }

  matrix[0][0] = 2 / (xs[1] - xs[0]);
  matrix[0][1] = 1 / (xs[1] - xs[0]);
  matrix[0][n + 1] =
    (3 * (ys[1] - ys[0])) / ((xs[1] - xs[0]) * (xs[1] - xs[0]));

  matrix[n][n - 1] = 1 / (xs[n] - xs[n - 1]);
  matrix[n][n] = 2 / (xs[n] - xs[n - 1]);
  matrix[n][n + 1] =
    (3 * (ys[n] - ys[n - 1])) / ((xs[n] - xs[n - 1]) * (xs[n] - xs[n - 1]));

  return solve(matrix, ks);
}

function solve(matrix, ks) {
  const m = matrix.length;
  // column
  for (let k = 0; k < m; k++) {
    // pivot for column
    let iMax = 0;
    let vali = Number.NEGATIVE_INFINITY;
    for (let i = k; i < m; i++)
      if (matrix[i][k] > vali) {
        iMax = i;
        vali = matrix[i][k];
      }
    swapRows(matrix, k, iMax);

    // for all rows below pivot
    for (let i = k + 1; i < m; i++) {
      for (let j = k + 1; j < m + 1; j++)
        matrix[i][j] =
          matrix[i][j] - matrix[k][j] * (matrix[i][k] / matrix[k][k]);
      matrix[i][k] = 0;
    }
  }
  // rows = columns
  for (let i = m - 1; i >= 0; i--) {
    const v = matrix[i][m] / matrix[i][i];
    ks[i] = v;
    // rows
    for (let j = i - 1; j >= 0; j--) {
      matrix[j][m] -= matrix[j][i] * v;
      matrix[j][i] = 0;
    }
  }
  return ks;
}

function zerosMatrix(rows, columns) {
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    matrix.push([]);
    for (let j = 0; j < columns; j++) {
      matrix[i].push(0);
    }
  }
  return matrix;
}

function swapRows(m, k, l) {
  const p = m[k];
  m[k] = m[l];
  m[l] = p;
}
