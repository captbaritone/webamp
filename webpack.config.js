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
        use: "url-loader?limit=100000"
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: "babel-loader" // 'babel-loader' is also a legal name to reference
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
