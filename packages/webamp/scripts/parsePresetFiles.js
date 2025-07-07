import fs from "fs";
import path from "path";
import { parser } from "winamp-eqf";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const presetsPath = path.join(__dirname, "../presets/winamp.q1");
const content = fs.readFileSync(presetsPath);
const presetObjects = parser(content);

console.log(JSON.stringify(presetObjects, null, "  "));
