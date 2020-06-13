const tf = require("@tensorflow/tfjs-node");
const nsfw = require("nsfwjs");
const fs = require("fs");
const path = require("path");

const modelPromise = nsfw.load();

async function fn() {
  const model = await modelPromise; // To load a local model, nsfw.load('file://./path/to/model/')
  const screenshots = fs.readdirSync(skinsDir);
  for (const file of screenshots) {
    if (!file.endsWith(".png")) {
      continue;
    }
    const skinPath = path.join(skinsDir, file);
    const buffer = fs.readFileSync(skinPath);
    // Image must be in tf.tensor3d format
    // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
    const image = await tf.node.decodeImage(buffer, 3);
    const predictions = await model.classify(image);
    const obj = {};
    predictions.forEach((prediction) => {
      obj[prediction.className] = prediction.probability;
    });
    const [hash] = file.split(".");
    console.log(
      [
        hash,
        obj.Neutral.toFixed(8),
        obj.Drawing.toFixed(8),
        obj.Hentai.toFixed(8),
        obj.Porn.toFixed(8),
        obj.Sexy.toFixed(8),
      ].join(" ")
    );
  }
}
fn();
