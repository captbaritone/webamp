#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const parse = require("../parser").default;
const JSZip = require("jszip");
const { getClass, getFunctionObject } = require("../objects");
const glob = require("glob");

const CALL_OPCODES = new Set([24, 112]);

function findWals(parentDir) {
  return new Promise((resolve, reject) => {
    glob("**/*.wal", { cwd: parentDir }, (err, files) => {
      if (err) {
        return reject(err);
      }
      resolve(files.map(filePath => path.join(parentDir, filePath)));
    });
  });
}

function sumCountObjects(obj1, obj2) {
  return Object.keys(obj2).reduce((summaryObj, key) => {
    if (summaryObj[key] == null) {
      summaryObj[key] = obj2[key];
    } else {
      summaryObj[key] += obj2[key];
    }
    return summaryObj;
  }, Object.assign({}, obj1));
}

async function getCallCountsFromWal(absolutePath) {
  const buffer = fs.readFileSync(absolutePath);
  const zip = await JSZip.loadAsync(buffer);
  const files = zip.file(/\.maki$/);
  const buffers = await Promise.all(
    files.map(file => file.async("nodebuffer"))
  );
  return buffers.map(getCallCountsFromMaki).reduce(sumCountObjects, {});
}

function getCallCountsFromMaki(buffer) {
  const maki = parse(buffer);
  return maki.commands
    .filter(command => CALL_OPCODES.has(command.opcode))
    .map(command => {
      const method = maki.methods[command.arg];
      const classId = maki.classes[method.typeOffset];
      const klass = getClass(classId);
      if (klass == null) {
        throw new Error(`Unknown class ID: ${classId}`);
      }
      const parentClass = getFunctionObject(klass, method.name);
      return `${parentClass.name}.${method.name.toLowerCase()}`;
    })
    .map(methodName => ({ [methodName]: 1 }))
    .reduce(sumCountObjects, {});
}

function setObjectValuesToOne(obj) {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] != null) {
      newObj[key] = 1;
    }
  });

  return newObj;
}

async function main(parentDir) {
  const paths = await findWals(parentDir);
  const callCounts = await Promise.all(
    // This script runs out of memory, so we'll limit skins until we
    // improve the script to be less dumb.
    paths.slice(0, 500).map(async walPath => {
      try {
        return await getCallCountsFromWal(walPath);
      } catch (e) {
        // TODO: Investigate these.
        return {};
      }
    })
  );
  const totalCalls = callCounts.reduce(sumCountObjects);
  const foundInSkins = callCounts
    .map(setObjectValuesToOne)
    .reduce(sumCountObjects);

  const result = { totalCalls, foundInSkins };
  console.log(JSON.stringify(result, null, 2));
}

main("/Volumes/Mobile Backup/skins/skins/");
