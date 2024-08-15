const path = require("path");
const rulesDirPlugin = require("eslint-plugin-rulesdir");
rulesDirPlugin.RULES_DIR = path.join(__dirname, "tools/eslint-rules/dist");

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "rulesdir"],
  extends: [],
  rules: {
    eqeqeq: "off",
    // Seems to be incompatible with eslint-typescript
    // https://github.com/typescript-eslint/typescript-eslint/issues/2486
    // "rulesdir/proper-maki-types": "warn",
  },
};
