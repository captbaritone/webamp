#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const JSZip = require("jszip");
const glob = require("glob");

function findWals(parentDir) {
  return new Promise((resolve, reject) => {
    // options is optional
    glob("**/*.wal", { cwd: parentDir }, (err, files) => {
      if (err) {
        return reject(err);
      }
      resolve(files);
    });
  });
}

async function main(skinPath) {
  // Find all the .wal files in the path recursively
  const wals = await findWals(skinPath);
  const zips = await Promise.all(
    wals.map(async (skin) => {
      const walPath = path.join(skinPath, skin);

      const buffer = fs.readFileSync(walPath);
      const zip = await JSZip.loadAsync(buffer);
      const makis = await Promise.all(
        zip.file(/\.maki$/i).map(async (file) => {
          return {
            name: file.name,
            buffer: await file.async("nodebuffer"),
          };
        })
      );
      return {
        path: walPath,
        makis,
      };
    })
  );
  console.log(zips);
  // For each skin
  //  extract it
  //  find all `.maki` files
  //  get its md5
  //
  //  create a directory for its
  // For each sk
}

main("/Volumes/Mobile Backup/skins/skins/dump/Compact-Utility");
