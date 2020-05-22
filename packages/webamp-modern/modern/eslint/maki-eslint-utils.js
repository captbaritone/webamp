const { objects } = require("../src/maki-interpreter/objects");

const classNameMappings = {
  Object: "MakiObject",
  Map: "MakiMap",
  "@{00000000-0000-0000-0000-000000000000}@": null,
};

function normalizeClassName(className) {
  const normalized = classNameMappings[className];
  return normalized === undefined ? className : normalized;
}

const objectsByName = {};
for (const value of Object.values(objects)) {
  objectsByName[normalizeClassName(value.name)] = value;
}

function getMakiObjectfromClassDeclarationNode(node) {
  const className = node.id.name;
  return objectsByName[className];
}

module.exports = {
  getMakiObjectfromClassDeclarationNode,
  normalizeClassName,
};
