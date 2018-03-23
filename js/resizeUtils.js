export function getPositionDiff(graph, sizeDiff) {
  const newGraph = {};
  const positionDiff = {};
  for (const key of Object.keys(graph)) {
    newGraph[key] = { above: [], left: [] };
    positionDiff[key] = { x: 0, y: 0 };
  }

  // Construct an inverted graph
  for (const [key, neighbors] of Object.entries(graph)) {
    const { below, right } = neighbors;
    if (right != null) {
      newGraph[right].left.push(key);
    }
    if (below != null) {
      newGraph[below].above.push(key);
    }
  }

  function walkRight(key) {
    const node = newGraph[key];
    const nodeSizeDiff = sizeDiff[key];
    node.left.forEach(left => {
      positionDiff[left].x += nodeSizeDiff.width + positionDiff[key].x;
      walkRight(left);
    });
  }

  function walkDown(key) {
    const node = newGraph[key];
    const nodeSizeDiff = sizeDiff[key];
    node.above.forEach(above => {
      positionDiff[above].y += nodeSizeDiff.height + positionDiff[key].y;
      walkDown(above);
    });
  }

  // Find disconnected nodes, and walk
  for (const [key, neighbors] of Object.entries(graph)) {
    if (neighbors.below == null) {
      walkDown(key);
    }
    if (neighbors.right == null) {
      walkRight(key);
    }
  }

  return positionDiff;
}

export function generateGraph(windows) {
  const bottoms = {};
  const rights = {};
  for (const w of windows) {
    const bottom = w.y + w.height;
    if (bottoms[bottom]) {
      bottoms[bottom].push(w);
    } else {
      bottoms[bottom] = [w];
    }

    const right = w.x + w.width;
    if (rights[right]) {
      rights[right].push(w);
    } else {
      rights[right] = [w];
    }
  }

  const graph = {};
  for (const w of windows) {
    const edges = {};
    const top = w.y;
    const left = w.x;

    const tops = bottoms[top];
    const lefts = rights[left];
    if (tops) {
      for (const below of tops) {
        const isToTheLeft = below.x + below.width < w.x;
        const isToTheRight = below.x > w.x + w.width;

        const overlapsInX = !(isToTheLeft || isToTheRight);
        if (overlapsInX) {
          edges.below = below.key;
          break;
        }
      }
    }
    if (lefts) {
      for (const right of lefts) {
        const isAbove = right.y + right.height < w.y;
        const isBelow = right.y > w.y + w.height;
        const overlapsInY = !(isAbove || isBelow);
        if (overlapsInY) {
          edges.right = right.key;
          break;
        }
      }
    }

    graph[w.key] = edges;
  }
  return graph;
}
