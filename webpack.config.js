const path = require("path");

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
        test: /\.png$/i,
        use: {
          loader: "url-loader",
          options: {
            limit: 100000
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader"
        }
      }
    ],
    noParse: [/jszip\.js$/]
  },
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
