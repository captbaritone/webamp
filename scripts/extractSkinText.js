const path = require("path");
const fs = require("fs");
const md5File = require("md5-file");
var { exec } = require("child_process");

const METADATA_ROOT = path.join(__dirname, "../metadata/");

function getSkinMetadataPath(md5, key) {
  return path.join(METADATA_ROOT, md5, `${key}.json`);
}

function getSkinMetadata(md5, key) {
  const skinMetadataPath = getSkinMetadataPath(md5, key);
  return new Promise((resolve, reject) => {
    fs.readFile(skinMetadataPath, "utf8", (err, data) => {
      if (err != null) reject(err);
      resolve(data);
    });
  });
}

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

async function writeSkinMetadata(md5, key, data) {
  const skinMetadataPath = getSkinMetadataPath(md5, key);
  ensureDirectoryExistence(skinMetadataPath);
  return new Promise((resolve, reject) => {
    fs.writeFile(
      skinMetadataPath,
      JSON.stringify(data, null, 2),
      "utf8",
      err => {
        if (err != null) {
          reject(err);
        }
        resolve(skinMetadataPath);
      }
    );
  });
}

function getFileMd5(filePath) {
  return new Promise((resolve, reject) => {
    md5File(filePath, (err, hash) => {
      if (err) reject(err);

      resolve(hash);
    });
  });
}

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
  const md5 = await getFileMd5(skinPath);
  const skinMetadataPath = await writeSkinMetadata(md5, "extracted-data", data);
  console.log("Done", skinMetadataPath);
}

writeTextData(path.join(process.cwd(), process.argv[2]));
