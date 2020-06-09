const tf = require("@tensorflow/tfjs-node");
const nsfw = require("nsfwjs");
const fs = require("fs");
const path = require("path");
const files = [
  "/Users/jordaneldredge/Downloads/nsfw-detection-test/b905cb364791fe989e811492e84c5c2a.png",
  "/Users/jordaneldredge/Downloads/nsfw-detection-test/6d77accd3add234e8e4dca93fc102ea8.png",
  "/Users/jordaneldredge/Downloads/nsfw-detection-test/820beeda9c199fdac42e4071de8b3331.png",
  "/Users/jordaneldredge/Downloads/nsfw-detection-test/4d1248a2629a17591008cbb9f1e7ac20.png",
  "/Users/jordaneldredge/Downloads/nsfw-detection-test/3e83cd504a101c513ea9cf8b0606fd3d.png",
  "/Users/jordaneldredge/Downloads/nsfw-detection-test/746ddb3108f11a80f96b4cd9e27e53ee.png",
  "/Users/jordaneldredge/Downloads/nsfw-detection-test/71124781f08ff3d4069de62450c90283.png",
];

const skinsDir = "/Volumes/Mobile Backup/skins/md5Screenshots";

async function fn() {
  const model = await nsfw.load(); // To load a local model, nsfw.load('file://./path/to/model/')
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
