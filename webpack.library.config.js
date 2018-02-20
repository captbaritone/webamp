const path = require("path");
const webpack = require("webpack");

module.exports = {
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
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      include: /\.min\.js$/
    })
  ],
  entry: {
    bundle: "./js/winamp.js",
    "bundle.min": "./js/winamp.js"
  },
  output: {
    path: path.resolve(__dirname, "built"),
    filename: "[name].js",
    library: "winamp2js",
    libraryTarget: "umd"
  }
};
