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
    "rulesdir/proper-maki-types": "warn",
  },
};
