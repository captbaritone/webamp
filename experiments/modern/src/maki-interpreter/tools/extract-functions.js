const fs = require("fs");
const { parse } = require("../");
const JSZip = require("jszip");

async function getFunctionNames(absolutePath) {
  const buffer = fs.readFileSync(absolutePath);
  const zip = await JSZip.loadAsync(buffer);
  const files = zip.file(/\.maki$/);
  const buffers = await Promise.all(
    files.map(file => file.async("nodebuffer"))
  );
  const functionNames = buffers.reduce((_functionNames, buf) => {
    const maki = parse(buf);
    maki.functionNames.forEach(func => {
      const className = maki.types[func.classType];
      _functionNames.add(`${className}::${func.name}`);
    });
    return _functionNames;
  }, new Set());
  return functionNames;
}

async function main(paths) {
  const results = await Promise.all(
    paths.map(async path => {
      const functionNames = await getFunctionNames(path);
      return { path, functionNames };
    })
  );
  const functionCounts = {};
  results.forEach(skin => {
    skin.functionNames.forEach(name => {
      const originalCount = functionCounts[name];
      functionCounts[name] = (originalCount || 0) + 1;
    });
  });
  console.log({
    totalFunctionCount: Object.keys(functionCounts).length
    // functionCounts
  });
}

const paths = [
  "/Volumes/Mobile Backup/skins/skins/dump/Stylish/micro/micro.wal",
  "/Volumes/Mobile Backup/skins/skins/random/Winamp Skins/Skins/WTF/Almin_Agic_Skin.wal"
];

main(paths);
