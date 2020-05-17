const { exec } = require("child_process");

const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi;
const extract = (value) => (value && value.match(reg)) || [];

async function extractTextData(skinPath) {
  const ignoreFiles = [
    "genex.txt",
    "genexinfo.txt",
    "gen_gslyrics.txt",
    "region.txt",
    "pledit.txt",
    "viscolor.txt",
    "winampmb.txt",
    "gen_ex help.txt",
    "mbinner.txt",
    // Skinning Updates.txt ?
  ];

  const ignoreArgs = ignoreFiles
    .map((file) => `-x "**/${file}" ${file}`)
    .join(" ");

  // Change -p to -c to get context of which file is missing
  const debug = false;
  const listFlag = debug ? "-c" : "-p";

  // TODO: Escape path
  const cmd = `unzip ${listFlag} -C "${skinPath}" "file_id.diz" "*.txt" ${ignoreArgs}`;

  const raw = await new Promise((resolve) => {
    exec(cmd, (error, stdout) => {
      if (error != null) {
        // reject(error);
        // return;
      }
      resolve(stdout);
    });
  });

  return { raw, emails: extract(raw) };
}

module.exports = {
  extractTextData,
};
