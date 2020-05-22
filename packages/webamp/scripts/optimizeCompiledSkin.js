const postcss = require("postcss");
const optimize = require("./postcss-optimize-data-uri-pngs");
const fs = require("fs");
const path = require("path");

async function main() {
  const from = path.join(__dirname, "../css/base-skin.css");
  const to = path.join(__dirname, "../css/base-skin-optimized.css");

  const css = fs.readFileSync(from);
  const result = await postcss([optimize]).process(css, { from, to });
  fs.writeFileSync(to, result.css);
}

main();
