const objectData = require("../objectData/stdPatched");

const makiObjectNames = new Set(
  Object.values(objectData).map((obj) => obj.name)
);

const BASE_OBJECT = "@{00000000-0000-0000-0000-000000000000}@";

function mapType(makiType) {
  switch (makiType) {
    case "Object":
      return "IMakiObject";
    case "Map":
      return "IMakiMap";
  }
  if (makiObjectNames.has(makiType)) {
    return `I${makiType}`;
  }

  const lowerCaseType = makiType.toLowerCase();
  switch (lowerCaseType) {
    case "":
      return "void";
    case "string":
      return "string";
    case "int":
    case "float":
    case "double":
      return "number";
    case "boolean":
      return "boolean";
    case "any":
      return "any";
  }

  throw new Error(`Unhandled Maki type "${makiType}"`);
}

function argumentTypeForParameter(param) {
  const [type, name] = param;
  return `${name}: ${mapType(type)}`;
}

function methodTypeForFunction(func) {
  const args = func.parameters.map(argumentTypeForParameter).join(", ");
  return `${func.name.toLowerCase()}(${args}): ${mapType(func.result)};`;
}

function interfaceForObject(object) {
  const methods = object.functions.map(methodTypeForFunction);
  let ext = "";
  if (object.parent && object.parent !== BASE_OBJECT) {
    const parentType = mapType(object.parent);
    ext = ` extends ${parentType}`;
  }
  return `export interface ${mapType(object.name)}${ext} {
${methods.map((method) => `  ${method}`).join("\n")}
}`;
}

const interfaceFile = Object.values(objectData)
  .map(interfaceForObject)
  .join("\n\n");

console.log(interfaceFile);
