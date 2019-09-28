import { parseFile } from "./parse-mi";
import path from "path";
import fs from "fs";

const compilers = path.join(__dirname, "../../../resources/maki_compiler/");

const lib30full = path.join(compilers, "v1.1.1.b3 (Winamp 3.0 full)/Lib/");
const libUnknown = path.join(compilers, "Unknown (Winamp 5.03)/lib/");
const lib502 = path.join(compilers, "v1.1.13 (Winamp 5.02)/lib/");

const files = {
  pldir: path.join(lib30full, "pldir.mi"),
  config: path.join(libUnknown, "config.mi"),
  std: path.join(lib502, "std.mi"),
};

Object.keys(files).forEach(name => {
  const sourcePath = files[name];
  const types = parseFile(sourcePath);
  const destinationPath = path.join(__dirname, `../objectData/${name}.json`);

  fs.writeFileSync(destinationPath, JSON.stringify(types, null, 2));
});
