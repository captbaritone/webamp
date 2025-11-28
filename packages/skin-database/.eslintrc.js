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
    // Relax rules for this project's existing style
    camelcase: "off",
    "dot-notation": "off",
    eqeqeq: "off",
    "no-undef-init": "off",
    "no-return-await": "off",
    "prefer-arrow-callback": "off",
    "no-div-regex": "off",
    "guard-for-in": "off",
    "prefer-template": "off",
    "no-else-return": "off",
    "prefer-const": "off",
    "new-cap": "off",
  },
  ignorePatterns: ["dist/**"],
};
