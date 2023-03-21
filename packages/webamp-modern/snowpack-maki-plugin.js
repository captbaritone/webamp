const fs = require("fs");
const path = require("path");
const execa = require("execa");
// const npmRunPath = require('npm-run-path');
// const findUp = require('find-up');
var isWin = process.platform === "win32";
console.log("IS WINDOWS:", isWin);

const MC = "resources/maki_compiler/v1.2.0 (Winamp 5.66)/mc.exe"; //.split('/')

// const IMPORT_REGEX = /\@(use|import|forward)\s*['"](.*?)['"]/g;
const COMPILED = /\s+was\s+compiled\s+to\s+/;

const compile = async (filePath) => {
  console.log("compiling ", filePath);
  const execaOptions = {};
  const start = isWin ? MC : "wine";
  const args = isWin ? [] : [MC];
  args.push(filePath);
  // const { stdout, stderr } = await execa('echo', ['unicorn'], execaOptions);
  const { stdout, stderr } = await execa(start, args, execaOptions);
  // Handle the output.
  if (stderr) throw new Error(stderr);
  // if (stdout) return stdout;
  if (stdout && COMPILED.test(stdout)) {
    const src = getFileName(filePath + "aki");
    const dst = filePath + "aki";
    const callback = (err) => {
      if (err) throw err;
      console.log("Successfully compiled:", src);
    };
    fs.rename(src, dst, callback);
  }
};
function getFileName(str) {
  return str.split("\\").pop().split("/").pop();
}
function move(oldPath, newPath, callback) {
  fs.rename(oldPath, newPath, function (err) {
    if (err) {
      if (err.code === "EXDEV") {
        copy();
      } else {
        callback(err);
      }
      return;
    }
    callback();
  });

  function copy() {
    var readStream = fs.createReadStream(oldPath);
    var writeStream = fs.createWriteStream(newPath);

    readStream.on("error", callback);
    writeStream.on("error", callback);

    readStream.on("close", function () {
      fs.unlink(oldPath, callback);
    });

    readStream.pipe(writeStream);
  }
}

module.exports = function sassPlugin(
  snowpackConfig,
  { native, compilerOptions = {} } = {}
) {
  const { root } = snowpackConfig || {};

  return {
    name: "plugin-maki",
    // resolve: {
    //     input: ['.m', '.mi'],
    //     output: ['.maki'],
    // },
    onChange({ filePath }) {
      // console.log('snowpack-maki plugin changes: onChange:', filePath);
      if (filePath.endsWith(".m")) {
        // do something when a JavaScript file changes
        // console.log('CHANGED COY:', filePath)
        compile(filePath);
      }
      return;
    },

    /** Load the Sass file and compile it to CSS. */
    // async load({ filePath, isDev }) {
    //     const fileExt = path.extname(filePath);
    //     console.log('fileExt:', fileExt);
    //     return;

    //     // --load-path
    //     for (const dir of loadPaths) {
    //         args.push(`--load-path=${dir}`); // load user-specified loadPaths first
    //     }
    //     for (const dir of DEFAULT_LOAD_PATHS) {
    //         if (!loadPaths.has(dir)) {
    //             args.push(`--load-path=${dir}`); // then add default loadPaths (only if different)
    //         }
    //     }

    //     // Build the file.
    //     const execaOptions = {
    //         input: contents,
    //         // Adds the PATH param to the command so it can find local sass
    //         env: native ? undefined : npmRunPath.env(),
    //         extendEnv: native ? true : false,
    //     };

    //     // If not using native them specify the project root so execa finds the right sass binary.
    //     if (!native && root) {
    //         // Prefer the node_modules/.bin
    //         execaOptions.preferLocal = true;

    //         // Specifies the local directory (which contains a .bin with sass)
    //         execaOptions.localDir = root;
    //     }

    //     const { stdout, stderr } = await execa('sass', args, execaOptions);
    //     // Handle the output.
    //     if (stderr) throw new Error(stderr);
    //     if (stdout) return stdout;
    // },
  };
};
