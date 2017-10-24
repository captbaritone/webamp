const path = require("path");
const webpack = require("webpack");

module.exports = {
  resolve: {
    extensions: [".js"]
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
      SENTRY_DSN: JSON.stringify(
        "https://5d5bf17b1bed4afc9103b5a09634775e@sentry.io/146969"
      )
    })
  ],
  entry: {
    winamp: ["./js/index.js"],
    skinExplorer: "./js/skinExplorer.js"
  },
  output: {
    filename: "[name].js",
    publicPath: "/built/",
    path: path.resolve(__dirname, "built")
  }
};
