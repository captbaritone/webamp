const path = require("path");
var { exec } = require("child_process");
const Utils = require("./utils");

async function extractTextData(path) {
  const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
  const extract = value => (value && value.match(reg)) || [];

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
        //reject(error);
        //return;
      }
      resolve(stdout);
    });
  });

  return { raw, emails: extract(raw) };
}

async function writeTextData(skinPath) {
  const data = await extractTextData(skinPath);
  const md5 = await Utils.getFileMd5(skinPath);
  const skinMetadataPath = await Utils.writeSkinMetadata(
    md5,
    "extracted-data",
    data
  );
  console.log("Done", skinMetadataPath);
}

writeTextData(path.join(process.cwd(), process.argv[2]));
