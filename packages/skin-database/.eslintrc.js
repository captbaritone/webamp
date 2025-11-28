module.exports = {
  extends: ["plugin:@typescript-eslint/recommended"],
  rules: {
    // Disable rules that conflict with the project's style
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-require-imports": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-namespace": "off",
    // Override the base no-shadow rule since it conflicts with TypeScript
    "no-shadow": "off",
    // camelcase has too many violations (333) to fix now
    camelcase: "off",
  },
  ignorePatterns: ["dist/**"],
};
