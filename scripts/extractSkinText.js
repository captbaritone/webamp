const path = require("path");
const fs = require("fs");
const Bluebird = require("bluebird");
var { exec } = require("child_process");
const Utils = require("./utils");

const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
const extract = value => (value && value.match(reg)) || [];

async function extractTextData(path) {
  const ignoreFiles = [
    "genex.txt",
    "genexinfo.txt",
    "gen_gslyrics.txt",
    "region.txt",
    "pledit.txt",
    "viscolor.txt",
    "winampmb.txt",
    "gen_ex help.txt",
    "mbinner.txt"
    // Skinning Updates.txt ?
  ];

  const ignoreArgs = ignoreFiles
    .map(file => `-x "**/${file}" ${file}`)
    .join(" ");

  // Change -p to -c to get context of which file is missing
  const debug = false;
  const listFlag = debug ? "-c" : "-p";

  // TODO: Escape path
  const cmd = `unzip ${listFlag} -C "${path}" "file_id.diz" "*.txt" ${ignoreArgs}`;

  const raw = await new Promise((resolve, reject) => {
    exec(cmd, function(error, stdout, stderr) {
      if (error != null) {
        // reject(error);
        // return;
      }
      resolve(stdout);
    });
  });

  return { raw, emails: extract(raw) };
}

async function writeTextData(skinPath, md5) {
  try {
    const data = await extractTextData(skinPath);
    const skinMetadataPath = await Utils.writeSkinMetadata(
      md5,
      "extracted-data",
      data
    );
    console.log("Done", skinMetadataPath);
  } catch (e) {
    console.error(e);
  }
}

function main() {
  const dir = process.argv[2];
  console.log("Reading dir");
  const files = fs.readdirSync(dir);
  console.log(`Found ${files.length} files`);
  return Bluebird.map(
    files,
    file => {
      const filePath = path.join(dir, file);
      const md5 = path.basename(file, ".wsz");
      return writeTextData(filePath, md5);
    },
    { concurrency: 10 }
  );
}

main();
