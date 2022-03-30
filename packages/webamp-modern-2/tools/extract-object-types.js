var parser = require("./parse-mi");
var path = require("path");
var fs = require("fs");

const compilers = path.join(__dirname, "../resources/maki_compiler/");

const lib566 = path.join(compilers, "v1.2.0 (Winamp 5.66)/lib/");

const files = {
  pldir: path.join(lib566, "pldir.mi"),
  config: path.join(lib566, "config.mi"),
  std: path.join(lib566, "std.mi"),
  winampconfig: path.join(lib566, "winampconfig.mi"),
  application: path.join(lib566, "application.mi"),
};

Object.keys(files).forEach((name) => {
  const sourcePath = files[name];
  const types = parser.parseFile(sourcePath);
  const destinationPath = path.join(__dirname, `../src/maki/objectData/${name}.json`);

  fs.writeFileSync(destinationPath, JSON.stringify(types, null, 2));
});
