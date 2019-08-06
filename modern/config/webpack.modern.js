const path = require("path");
module.exports = {
  devtool: "source-map",
  mode: "development",
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
        test: /\.(wsz|mp3|wal)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              emitFile: true,
            },
          },
        ],
      },
    ],
    noParse: [/jszip\.js$/],
  },
  devServer: {
    contentBase: path.join(__dirname, "../"),
    historyApiFallback: true,
  },
  entry: {
    modern: ["./modern/src/index.js"],
  },
};
