import stdPatched from "./objectData/stdPatched";
import pldir from "./objectData/pldir.json";
import config from "./objectData/config.json";
import { DataType } from "./v";
import { assert } from "../utils";

type MethodDefinition = {
  name: string;
  result: string;
  parameters: string[][];
};

type ObjectDefinition = {
  parent: string;
  name: string;
  functions: MethodDefinition[];
  parentClass?: ObjectDefinition;
};

const objects: { [key: string]: ObjectDefinition } = {
  ...stdPatched,
  ...pldir,
  ...config,
};

export function getClass(id: string): ObjectDefinition {
  return normalizedObjects[getFormattedId(id)];
}

export function getReturnType(classId: string, methodName: string): DataType {
  const method = getMethod(classId, methodName);
  const upper = method.result.toUpperCase();
  switch (upper) {
    case "INT":
    case "DOUBLE":
    case "STRING":
    case "FLOAT":
    case "BOOLEAN":
      return upper as any;
    case "":
      return "NULL" as any;
    default:
      return "OBJECT" as any;
  }
}

export function getMethod(
  classId: string,
  methodName: string
): MethodDefinition {
  const klass = getClass(classId);
  assert(klass != null, `Could not find class matching id: ${classId}`);
  return getObjectFunction(klass, methodName);
}

// TODO: We could probably just fix the keys used in this file to already be normalized
// We might even want to normalize the to match the formatting we get out the file. That could
// avoid the awkward regex inside `getClass()`.
export const normalizedObjects: { [key: string]: ObjectDefinition } = {};
Object.keys(objects).forEach((key) => {
  normalizedObjects[key.toLowerCase()] = objects[key];
});

const objectsByName = {};
Object.values(objects).forEach((object) => {
  objectsByName[object.name] = object;
});

Object.values(normalizedObjects).forEach((object) => {
  const parentClass = objectsByName[object.parent];
  if (parentClass == null) {
    if (object.parent === "@{00000000-0000-0000-0000-000000000000}@") {
    } else {
      throw new Error(`Could not find parent class named ${object.parent}`);
    }
  }
  object.parentClass = parentClass;
});

export function getFormattedId(id: string): string {
  // https://en.wikipedia.org/wiki/Universally_unique_identifier#Encoding
  const formattedId = id.replace(
    /(........)(....)(....)(..)(..)(..)(..)(..)(..)(..)(..)/,
    "$1$3$2$7$6$5$4$11$10$9$8"
  );
  return formattedId.toLowerCase();
}

function getObjectFunction(
  klass: ObjectDefinition,
  functionName: string
): MethodDefinition {
  const lowerName = functionName.toLowerCase();
  const method = klass.functions.find((func) => {
    // TODO: This could probably be normalized at load time, or evern sooner.
    return func.name.toLowerCase() === lowerName;
  });
  if (method != null) {
    return method;
  }
  if (klass.parentClass == null) {
    throw new Error(`Could not find method ${functionName} on ${klass.name}.`);
  }
  return getObjectFunction(klass.parentClass, functionName);
}
