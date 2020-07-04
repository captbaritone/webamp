const makiClassRule = require("./eslint/maki-class");
const makiMissingMethods = require("./eslint/maki-missing-methods");
const makiMethodTypes = require("./eslint/maki-method-types");

module.exports = {
  "maki-class": makiClassRule,
  "maki-missing-methods": makiMissingMethods,
  "maki-method-types": makiMethodTypes,
};
