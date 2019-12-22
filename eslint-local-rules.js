const makiClassRule = require("./modern/eslint/maki-class");
const makiMissingMethods = require("./modern/eslint/maki-missing-methods");
const makiMethodTypes = require("./modern/eslint/maki-method-types");

module.exports = {
  "maki-class": makiClassRule,
  "maki-missing-methods": makiMissingMethods,
  "maki-method-types": makiMethodTypes,
};
