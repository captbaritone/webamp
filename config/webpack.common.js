const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");
const HtmlWebpackInlineSVGPlugin = require("html-webpack-inline-svg-plugin");
const webpack = require("webpack");

module.exports = {
  resolve: {
    extensions: [".js"]
  },
  node: {
    fs: "empty", // Ignore fs in music-metadata
    // Consider suggesting jsmediatags use: https://github.com/feross/is-buffer
    // Cuts 22k
    Buffer: false
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(wsz|mp3|png|ico|jpg|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              emitFile: true,
              name: "[path][name]-[hash].[ext]"
            }
          }
        ]
      }
    ],
    noParse: [/jszip\.js$/]
  },
  plugins: [
    new webpack.IgnorePlugin(/fs/, /file-type/), // Ignore fs in music-metadata
    new HtmlWebpackPlugin({
      template: "./index.html"
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
          src: path.resolve("./images/manifest/icon-192x192.png"),
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: path.resolve("./images/manifest/icon-512x512.png"),
          sizes: "512x512",
          type: "image/png"
        },
        {
          src: path.resolve("./images/manifest/icon.svg"),
          sizes: "513x513",
          type: "image/svg+xml"
        }
      ].map(icon => ({ ...icon, destination: path.join("images", "manifest") }))
    }),
    new HtmlWebpackInlineSVGPlugin({ runPreEmit: true })
  ],
  entry: {
    webamp: ["./js/index.js"]
  },
  output: {
    filename: "[name]-[hash].js",
    chunkFilename: "[name]-[hash].js",
    publicPath: "/",
    path: path.resolve(__dirname, "../built")
  }
};
