const path = require("path");
const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  node: {
    // Consider suggesting jsmediatags use: https://github.com/feross/is-buffer
    // Cuts 22k
    Buffer: false,
    fs: "empty"
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
          loader: "babel-loader",
          options: {
            forceEnv: "library"
          }
        }
      },
      {
        test: /\.(wsz|mp3)$/,
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
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new UglifyJsPlugin({
      include: /\.min\.js$/,
      parallel: true,
      uglifyOptions: {
        compress: {
          // Workaround: https://github.com/mishoo/UglifyJS2/issues/2842
          inline: false
        }
      }
    })
  ],
  entry: {
    bundle: "./js/webamp.js",
    "bundle.min": "./js/webamp.js",
    "lazy-bundle": "./js/webampLazy.js",
    "lazy-bundle.min": "./js/webampLazy.js"
  },
  output: {
    path: path.resolve(__dirname, "../built"),
    filename: "webamp.[name].js",
    library: "Webamp",
    libraryTarget: "umd"
  }
};
