const fs = require("fs");
const postcss = require("postcss");

const css = fs.readFileSync("./css/base-skin.css", "utf8");
// This seems to timeout a lot in CI
it.skip("does something", async () => {
  const { default: plugin } = await import(
    "./postcss-optimize-data-uri-pngs.mjs"
  );
  const result = await postcss([plugin({})]).process(css);
  expect(result.css.length).toBeLessThan(css.length);
});
