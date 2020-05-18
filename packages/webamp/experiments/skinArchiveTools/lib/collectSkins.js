const childProcess = require("child_process");
const Bluebird = require("bluebird");
const Filehound = require("filehound");

function md5File(filePath) {
  return new Promise((resolve, reject) => {
    childProcess.execFile(`md5`, ["-q", filePath], (err, stdout) => {
      if (err) {
        // node couldn't execute the command
        reject(err);
      }

      resolve(stdout.trimRight());
    });
  });
}

module.exports = async function collectSkins({ inputDir, cache }) {
  console.log("Searching for files in", inputDir);
  const paths = new Set();
  Object.values(cache).forEach((skin) => {
    skin.filePaths.forEach((filePath) => {
      paths.add(filePath);
    });
  });
  const files = await Filehound.create()
    .ext(["zip", "wsz", "wal"])
    .paths(inputDir)
    .find();

  console.log(`Found ${files.length} potential files`);

  let i = 0;
  const interval = setInterval(() => {
    console.log(`Checked ${i} files...`);
  }, 10000);
  await Bluebird.map(
    files,
    async (filePath) => {
      if (paths.has(filePath)) {
        return;
      }
      i++;
      const md5 = await md5File(filePath);
      if (cache[md5]) {
        const filePathsSet = new Set(cache[md5].filePaths);
        filePathsSet.add(filePath);
        cache[md5].filePaths = Array.from(filePathsSet);
      } else {
        cache[md5] = {
          md5,
          filePaths: [filePath],
        };
      }
    },
    { concurrency: 10 }
  );
  clearInterval(interval);
  return cache;
};
