const fs = require("fs");
const path = require("path");
const { parser } = require("winamp-eqf");

const presetsPath = path.join(__dirname, "../presets/winamp.q1");
const content = fs.readFileSync(presetsPath);
const presetObjects = parser(content);

console.log(JSON.stringify(presetObjects, null, "  "));
