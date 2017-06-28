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
          loader: "babel-loader",
          options: {
            presets: ["env"]
          }
        }
      }
    ],
    noParse: [/jszip\.js$/]
  },
  entry: ["./js/index.js"],
  output: {
    filename: "winamp.js",
    publicPath: "/built/",
    path: path.resolve(__dirname, "built")
  }
};
