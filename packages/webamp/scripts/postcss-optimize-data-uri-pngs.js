const postcss = require("postcss");
const dataUriToBuffer = require("data-uri-to-buffer");
const imagemin = require("imagemin");
const imageminOptipng = require("imagemin-optipng");
const { ImagePool } = require("@squoosh/lib");

const DATA_URL_REGEX = new RegExp(/url\((data:image\/png;base64,.+)\)/gi);
const DATA_URL_PROPS_REGEX = /^(background(?:-image)?)|(content)|(cursor)/;

async function optimizeDataUri(imagePool, dataUri) {
  const buffer = dataUriToBuffer(dataUri);
  const optimized = await imagemin.buffer(buffer, {
    use: [imageminOptipng()],
  });
  try {
    const image = imagePool.ingestImage(optimized);
    await image.decoded;
    const encodeOptions = {
      webp: {
        lossless: true,
        method: 6,
        quality: 100,
      },
    };
    await image.encode(encodeOptions);
    const rawEncodedImage = (await image.encodedWith.webp).binary;
    const b = new Buffer(rawEncodedImage);
    return `data:image/webp;base64,${b.toString("base64")}`;
  } catch (e) {
    console.error("e", e);
  }
  return `data:image/png;base64,${optimized.toString("base64")}`;
}

module.exports = postcss.plugin("postcss-optimize-data-uri-pngs", () => {
  return async function (css) {
    const imagePool = new ImagePool();

    // walkDecls does not let us work async, so we collect the async work we
    // need to do here, and await it at the end
    const promisesFactories = [];
    css.walkDecls(DATA_URL_PROPS_REGEX, (decl) => {
      let matches;
      // WTF JavaScript. This is the worst API for iterating RegEx matches.
      while ((matches = DATA_URL_REGEX.exec(decl.value))) {
        const [, dataUri] = matches;
        promisesFactories.push(async () => {
          decl.value = decl.value.replace(
            dataUri,
            await optimizeDataUri(imagePool, dataUri)
          );
        });
      }
    });
    await Promise.all(promisesFactories.map((p) => p()));
    await imagePool.close();
  };
});
