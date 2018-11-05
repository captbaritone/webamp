// Adapted from https://github.com/morganherlocker/cubic-spline

export default function spline(xs, ys) {
  let ks = xs.map(() => {
    return 0;
  });
  ks = getNaturalKs(xs, ys, ks);
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

function getNaturalKs(xs, ys, ks) {
  const n = xs.length - 1;
  const A = zerosMat(n + 1, n + 2);

  for (
    let i = 1;
    i < n;
    i++ // rows
  ) {
    A[i][i - 1] = 1 / (xs[i] - xs[i - 1]);
    A[i][i] = 2 * (1 / (xs[i] - xs[i - 1]) + 1 / (xs[i + 1] - xs[i]));
    A[i][i + 1] = 1 / (xs[i + 1] - xs[i]);
    A[i][n + 1] =
      3 *
      ((ys[i] - ys[i - 1]) / ((xs[i] - xs[i - 1]) * (xs[i] - xs[i - 1])) +
        (ys[i + 1] - ys[i]) / ((xs[i + 1] - xs[i]) * (xs[i + 1] - xs[i])));
  }

  A[0][0] = 2 / (xs[1] - xs[0]);
  A[0][1] = 1 / (xs[1] - xs[0]);
  A[0][n + 1] = (3 * (ys[1] - ys[0])) / ((xs[1] - xs[0]) * (xs[1] - xs[0]));

  A[n][n - 1] = 1 / (xs[n] - xs[n - 1]);
  A[n][n] = 2 / (xs[n] - xs[n - 1]);
  A[n][n + 1] =
    (3 * (ys[n] - ys[n - 1])) / ((xs[n] - xs[n - 1]) * (xs[n] - xs[n - 1]));

  return solve(A, ks);
}

function solve(A, ks) {
  const m = A.length;
  for (
    let k = 0;
    k < m;
    k++ // column
  ) {
    // pivot for column
    let iMax = 0;
    let vali = Number.NEGATIVE_INFINITY;
    for (let i = k; i < m; i++)
      if (A[i][k] > vali) {
        iMax = i;
        vali = A[i][k];
      }
    swapRows(A, k, iMax);

    // for all rows below pivot
    for (let i = k + 1; i < m; i++) {
      for (let j = k + 1; j < m + 1; j++)
        A[i][j] = A[i][j] - A[k][j] * (A[i][k] / A[k][k]);
      A[i][k] = 0;
    }
  }
  for (
    let i = m - 1;
    i >= 0;
    i-- // rows = columns
  ) {
    const v = A[i][m] / A[i][i];
    ks[i] = v;
    for (
      let j = i - 1;
      j >= 0;
      j-- // rows
    ) {
      A[j][m] -= A[j][i] * v;
      A[j][i] = 0;
    }
  }
  return ks;
}

function zerosMat(r, c) {
  const A = [];
  for (let i = 0; i < r; i++) {
    A.push([]);
    for (let j = 0; j < c; j++) A[i].push(0);
  }
  return A;
}

function swapRows(m, k, l) {
  const p = m[k];
  m[k] = m[l];
  m[l] = p;
}
