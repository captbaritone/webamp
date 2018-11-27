const skins = require("../src/skins.json");

const indexes = [];

Object.entries(skins).forEach(([hash, { fileName }]) => {
  indexes.push({ objectID: hash, fileName });
});

console.log(JSON.stringify(indexes, null, 2));
