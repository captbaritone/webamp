const rulesDirPlugin = require("eslint-plugin-rulesdir");
rulesDirPlugin.RULES_DIR = "packages/webamp-modern-2/tools/eslint-rules/dist";

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
