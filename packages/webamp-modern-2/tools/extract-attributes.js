#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const Utils = require("../src/utils");
const glob = require("glob");

function findWals(parentDir) {
  return new Promise((resolve, reject) => {
    glob("**/cPro2_Aluminum_1_1.wal", { cwd: parentDir }, (err, files) => {
      if (err) {
        return reject(err);
      }
      resolve(files.map((filePath) => path.join(parentDir, filePath)));
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

async function getAttributeDataFromWal(absolutePath) {
  const buffer = fs.readFileSync(absolutePath);
  const zip = await JSZip.loadAsync(buffer);
  const skinXml = await Utils.readXml(zip, "skin.xml");
  if (skinXml == null) {
    return [];
  }
  const rawXmlTree = await Utils.inlineIncludes(skinXml, zip);

  const nodeTypes = [];
  Utils.mapTreeBreadth(rawXmlTree, (node) => {
    if (node.type === "element") {
      nodeTypes.push({
        name: node.name.toLowerCase(),
        attributes:
          node.attributes == null
            ? []
            : Object.keys(node.attributes).map((attr) => attr.toLowerCase()),
      });
    }
    return node;
  });
  return nodeTypes;
}

async function main(parentDir) {
  const errors = [];
  const paths = await findWals(parentDir);
  const attributeData = [];

  // Originally we moved to doing one skin at a time because we thougth it was
  // causing memory issues, now we know it's not, but it's still faster to do
  // one at a time for some reason.  ¯\_(ツ)_/¯
  for (const walPath of paths) {
    try {
      console.error(`Working on ${walPath}`);
      attributeData.push(...(await getAttributeDataFromWal(walPath)));
    } catch (e) {
      const errorLine = e.toString().split("\n")[0];
      errors.push({ [errorLine]: 1 });
      // TODO: Investigate these.
      console.error(`Error getting call data from ${walPath}`, e);
    }
  }

  const summary = attributeData.reduce((sum, attrs) => {
    if (sum[attrs.name] == null) {
      sum[attrs.name] = {
        count: 0,
        attributes: {},
      };
    }
    sum[attrs.name].count++;
    const nodeAttrs = sum[attrs.name].attributes;
    attrs.attributes.forEach((attr) => {
      if (nodeAttrs[attr] == null) {
        nodeAttrs[attr] = 1;
      } else {
        nodeAttrs[attr]++;
      }
    });
    return sum;
  }, {});

  if (errors.length) {
    console.error(JSON.stringify(errors.reduce(sumCountObjects, {}), null, 2));
  }
  console.log(JSON.stringify(summary, null, 2));
}

main("/Volumes/Mobile Backup/skins/skins/random/Winamp Skins/Skins/");
