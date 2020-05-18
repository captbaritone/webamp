const stdPatched = require("./objectData/stdPatched");
const pldir = require("./objectData/pldir.json");
const config = require("./objectData/config.json");

const objects = { ...stdPatched, ...pldir, ...config };

// TODO: We could probably just fix the keys used in this file to already be normalized
// We might even want to normalize the to match the formatting we get out the file. That could
// avoid the awkward regex inside `getClass()`.
const normalizedObjects = {};
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

function getFormattedId(id) {
  // https://en.wikipedia.org/wiki/Universally_unique_identifier#Encoding
  const formattedId = id.replace(
    /(........)(....)(....)(..)(..)(..)(..)(..)(..)(..)(..)/,
    "$1$3$2$7$6$5$4$11$10$9$8"
  );
  return formattedId.toLowerCase();
}

function getClass(id) {
  return normalizedObjects[getFormattedId(id)];
}

function getObjectFunction(klass, functionName) {
  const method = klass.functions.find((func) => {
    // TODO: This could probably be normalized at load time, or evern sooner.
    return func.name.toLowerCase() === functionName.toLowerCase();
  });
  if (method != null) {
    return method;
  }
  if (klass.parentClass == null) {
    throw new Error(`Could not find method ${functionName} on ${klass.name}.`);
  }
  return getObjectFunction(klass.parentClass, functionName);
}

function getFunctionObject(klass, functionName) {
  const method = klass.functions.find((func) => {
    // TODO: This could probably be normalized at load time, or evern sooner.
    return func.name.toLowerCase() === functionName.toLowerCase();
  });
  if (method != null) {
    return klass;
  }
  if (klass.parentClass == null) {
    throw new Error(`Could not find method ${functionName} on ${klass.name}.`);
  }
  return getFunctionObject(klass.parentClass, functionName);
}

module.exports = {
  objects,
  getFormattedId,
  getClass,
  getObjectFunction,
  getFunctionObject,
};
