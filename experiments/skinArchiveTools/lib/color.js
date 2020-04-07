const exec = require("child_process").exec;
const shellescape = require("shell-escape");

const getColor = (imgPath) => {
  return new Promise((resolve, reject) => {
    const excapedImgPath = shellescape([imgPath]);
    const command = `convert ${excapedImgPath} -scale 1x1\! -format '%[pixel:u]' info:-`;
    exec(command, (error, stdout) => {
      if (error !== null) {
        reject(error);
        return;
      }
      resolve(stdout.slice(1));
    });
  });
};

module.exports = { getColor };
