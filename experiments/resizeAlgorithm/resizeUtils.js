export function double(boxes) {
  const doubledBoxes = new Map();
  // Find the top/left most box
  // Update the width/height of the first box.
  // Find any boxes that are touching the bottom of that box
  // Move those boxes down
  // Find any boxes that are touching the right of that box
  // Move those boxes right
  // Repeat for boxes that are touching
  // Resize any remaining boxes
  for (const [key, box] of boxes) {
    const width = box.width * 2;
    const height = box.height * 2;
    const top = box.top * 2;
    doubledBoxes.set(key, { ...box, top, width, height });
  }
  return doubledBoxes;
}
