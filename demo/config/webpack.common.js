const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");
const HtmlWebpackInlineSVGPlugin = require("html-webpack-inline-svg-plugin");

module.exports = {
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
          // We really only need this in prod. We could find a way to disable it in dev.
          {
            loader: "postcss-loader",
            options: {
              plugins: [
                require("cssnano"),
                require("../../scripts/postcss-optimize-data-uri-pngs"),
              ],
            },
          },
        ],
      },
      {
        test: /\.(js|ts|tsx)?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            envName: "production",
          },
        },
      },
      {
        test: /\.(wsz|mp3|png|ico|jpg|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              emitFile: true,
              name: "[path][name]-[hash].[ext]",
            },
          },
        ],
      },
    ],
    noParse: [/jszip\.js$/],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    // Automatically generates the manifest.json file inside the built
    // directory, and injects a tag into the gererated index.html file
    // it also, applies cache-busting for all the icons.
    new WebpackPwaManifest({
      name: "Webamp",
      short_name: "Webamp", // eslint-disable-line camelcase
      description: "Winamp 2.9 reimplemented in HTML5 and JavaScript",
      start_url: "./?utm_source=web_app_manifest", // eslint-disable-line camelcase
      scope: "./",
      display: "standalone",
      theme_color: "#4b4b4b", // eslint-disable-line camelcase
      background_color: "#ffffff", // eslint-disable-line camelcase
      icons: [
        {
          src: path.resolve("./demo/images/manifest/icon-192x192.png"),
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: path.resolve("./demo/images/manifest/icon-512x512.png"),
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: path.resolve("./demo/images/manifest/icon.svg"),
          sizes: "513x513",
          type: "image/svg+xml",
        },
      ].map(icon => ({
        ...icon,
        destination: path.join("images", "manifest"),
      })),
    }),
    new HtmlWebpackInlineSVGPlugin({ runPreEmit: true }),
  ],
  performance: {
    // We do some crazy shit okay! Don't judge!
    maxEntrypointSize: 7000000,
    maxAssetSize: 7000000,
  },
  entry: {
    webamp: ["./js/index.js"],
  },
  context: path.resolve(__dirname, "../"),
  output: {
    filename: "[name]-[hash].js",
    chunkFilename: "[name]-[hash].js",
    publicPath: "/",
    path: path.resolve(__dirname, "../built"),
  },
};
